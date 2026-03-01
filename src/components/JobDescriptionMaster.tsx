import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, Grid3X3, List, LayoutDashboard, HelpCircle, 
  Upload, PlusCircle, Search, ChevronRight, ChevronDown, 
  Edit, Trash2, X, UploadCloud, Printer, Check, Save
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import Papa from 'papaparse';
import BaseModal from './BaseModal';

// --- Types ---
interface SubTask {
  topic: string;
  desc: string;
  authority: string; // O, C, D, A, -
}

interface Responsibility {
  function: string;
  percent: number;
  expanded: boolean;
  subTasks: SubTask[];
}

interface JobDescription {
  code: string;
  title: string;
  titleTH: string;
  dept: string;
  reportTo: string;
  level: string;
  updated: string;
  status: 'Active' | 'Draft';
  purpose: string;
  gender: string;
  ageMin: number | null;
  ageMax: number | null;
  eduLevel: string;
  eduMajor: string;
  expYears: number;
  expField: string;
  hardSkills: string;
  responsibilities: Responsibility[];
}

// --- Mock Data ---
const MOCK_JD_LIST: JobDescription[] = [
  { 
    code: 'JD-HR-001', title: 'HR Manager', titleTH: 'ผู้จัดการฝ่ายบุคคล', dept: 'HRD', level: 'Manager', updated: '2024-01-15', status: 'Active',
    purpose: 'Oversee HR strategies.', gender: 'Any', ageMin: 35, ageMax: 50, eduLevel: "Master's Degree", eduMajor: 'HRM', expYears: 10, expField: 'HR Management', hardSkills: 'Labor Law, KPI Design',
    reportTo: 'Director',
    responsibilities: [
      { 
        function: 'Recruitment & Selection', percent: 20, expanded: true,
        subTasks: [
          { topic: 'Manpower Planning', desc: 'Approve annual budget', authority: 'A' },
          { topic: 'Interviewing', desc: 'Final interview', authority: 'D' }
        ]
      },
      { 
        function: 'Payroll Management', percent: 20, expanded: false,
        subTasks: [
          { topic: 'Payroll Processing', desc: 'Final approval', authority: 'A' },
          { topic: 'Salary Structure Review', desc: 'Annual benchmark', authority: 'D' }
        ]
      }
    ]
  },
  { 
    code: 'JD-HR-002', title: 'Recruitment Officer', titleTH: 'เจ้าหน้าที่สรรหา', dept: 'HRD', level: 'Officer', updated: '2024-01-16', status: 'Active',
    purpose: 'Execute hiring process.', gender: 'Any', ageMin: 22, ageMax: 30, eduLevel: "Bachelor's Degree", eduMajor: 'Psychology', expYears: 1, expField: 'Recruitment', hardSkills: 'Interviewing, Sourcing',
    reportTo: 'HR Manager',
    responsibilities: [
      { 
        function: 'Recruitment & Selection', percent: 80, expanded: true,
        subTasks: [
          { topic: 'Job Posting', desc: 'Advertise vacancies', authority: 'O' },
          { topic: 'Interviewing', desc: 'Screen and select candidates', authority: 'O' },
          { topic: 'Onboarding', desc: 'Orientation for new hires', authority: 'O' }
        ]
      }
    ]
  },
  { 
    code: 'JD-IT-001', title: 'IT Manager', titleTH: 'ผู้จัดการไอที', dept: 'ITS', level: 'Manager', updated: '2024-01-10', status: 'Active',
    purpose: 'Manage IT infrastructure.', gender: 'Any', ageMin: 30, ageMax: 45, eduLevel: "Bachelor's Degree", eduMajor: 'Computer Science', expYears: 7, expField: 'IT Management', hardSkills: 'Network Security, Cloud Computing',
    reportTo: 'Director',
    responsibilities: [
      { function: 'Infrastructure', percent: 40, expanded: true, subTasks: [{ topic: 'Network Security', desc: 'Approve policies', authority: 'A' }] }
    ]
  }
];

const JobDescriptionMaster = () => {
  const [currentView, setCurrentView] = useState<'smart_jd' | 'list' | 'dashboard'>('list');
  const [showGuide, setShowGuide] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('HRD');
  const [jdList, setJdList] = useState<JobDescription[]>(MOCK_JD_LIST);
  
  // Form State
  const [form, setForm] = useState<JobDescription>({
    code: '', title: '', titleTH: '', dept: '', reportTo: '', level: 'Officer', updated: '', status: 'Draft', purpose: '', 
    responsibilities: [], 
    eduLevel: "Bachelor's Degree", eduMajor: '', expYears: 0, expField: '', gender: 'Any', ageMin: null, ageMax: null, hardSkills: ''
  });

  // Refs for Charts
  const statusChartRef = useRef<HTMLCanvasElement>(null);
  const activityChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  // --- Computed ---
  const availableDepts = useMemo(() => [...new Set(jdList.map(j => j.dept))], [jdList]);
  
  const filteredJDList = useMemo(() => {
    return jdList.filter(jd => 
      (jd.title.toLowerCase().includes(searchQuery.toLowerCase()) || jd.code.toLowerCase().includes(searchQuery.toLowerCase())) && 
      (!filterDept || jd.dept === filterDept)
    );
  }, [jdList, searchQuery, filterDept]);

  const totalTasks = useMemo(() => jdList.reduce((acc, jd) => acc + (jd.responsibilities ? jd.responsibilities.length : 0), 0), [jdList]);

  // Matrix Logic
  const currentMatrix = useMemo(() => {
    const deptJDs = jdList.filter(j => j.dept === selectedDept);
    const levelOrder: Record<string, number> = { 'Director': 1, 'Manager': 2, 'Supervisor': 3, 'Senior': 4, 'Officer': 5 };
    const positions = deptJDs.sort((a,b) => (levelOrder[a.level] || 99) - (levelOrder[b.level] || 99))
                               .map(j => ({ title: j.title, titleTH: j.titleTH }));

    // Group by Function -> SubTopic
    const funcMap: Record<string, any> = {}; 
    deptJDs.forEach(jd => {
      if(jd.responsibilities) {
        jd.responsibilities.forEach(resp => {
          const fName = resp.function || 'General';
          if(!funcMap[fName]) funcMap[fName] = { name: fName, subTasks: {} };
          
          if(resp.subTasks) {
            resp.subTasks.forEach(sub => {
              const tKey = sub.topic;
              if(!funcMap[fName].subTasks[tKey]) {
                funcMap[fName].subTasks[tKey] = { subTopic: tKey, desc: sub.desc || '', roleMap: {} };
              }
              funcMap[fName].subTasks[tKey].roleMap[jd.title] = sub.authority;
            });
          }
        });
      }
    });

    const groups = Object.values(funcMap).map(f => {
      const tasks = Object.values(f.subTasks).map((t: any) => {
        const authorities = positions.map(pos => t.roleMap[pos.title] || '-');
        return { subTopic: t.subTopic, desc: t.desc, authorities: authorities };
      });
      return { name: f.name, expanded: true, tasks: tasks };
    });

    return { positions, groups };
  }, [jdList, selectedDept]);

  // --- Actions ---
  const getRoleClass = (role: string) => { 
    switch(role) { 
      case 'O': return 'bg-blue-100 text-blue-700 border-blue-200'; 
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200'; 
      case 'D': return 'bg-red-100 text-red-700 border-red-200'; 
      case 'A': return 'bg-green-100 text-green-700 border-green-200'; 
      default: return 'text-gray-300'; 
    } 
  };

  const openJDCreator = (jd: JobDescription | null = null) => {
    if (jd) { 
      setIsEditing(true); 
      setForm(JSON.parse(JSON.stringify(jd))); 
    } else { 
      setIsEditing(false); 
      setForm({
        code: `JD-NEW-${Math.floor(Math.random()*1000)}`, title: '', titleTH: '', dept: '', reportTo: '', level: 'Officer', updated: '', status: 'Draft', purpose: '', 
        responsibilities: [{ function: 'Key Function 1', percent: 0, expanded: true, subTasks: [{topic:'', desc:'', authority:'-'}] }],
        eduLevel: "Bachelor's Degree", eduMajor: '', expYears: 0, expField: '', gender: 'Any', ageMin: null, ageMax: null, hardSkills: ''
      }); 
    }
    setShowModal(true); 
    setActiveTab(0);
  };

  const saveJD = () => {
    if (!form.title) return Swal.fire('Error', 'Job Title required', 'error');
    const today = new Date().toISOString().split('T')[0];
    
    if (isEditing) { 
      const idx = jdList.findIndex(j => j.code === form.code); 
      const newList = [...jdList];
      newList[idx] = { ...form, updated: today };
      setJdList(newList);
    } else { 
      setJdList([{ ...form, updated: today, status: 'Draft' }, ...jdList]); 
    }
    setShowModal(false); 
    Swal.fire('Saved', 'Success', 'success');
  };

  const viewPDF = (jd: JobDescription) => { 
    setSelectedJD(jd); 
    setShowPdfModal(true); 
  };

  // CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const f = e.target.files?.[0]; 
    if(f) Papa.parse(f, { header: true, skipEmptyLines: true, complete: (res) => setPreviewData(res.data) }); 
  };
  
  const processImport = () => { 
    // Simplified import logic
    const newJDs = previewData.map((row: any) => ({
      code: row.code || `IMP-${Math.random().toString(36).substr(2, 5)}`,
      title: row.title_en || 'Imported Position',
      titleTH: row.title_th || '',
      dept: row.dept || 'General',
      level: row.level || 'Officer',
      updated: new Date().toISOString().split('T')[0],
      status: 'Draft' as const,
      purpose: '', gender: row.gender || 'Any', ageMin: row.age_min, ageMax: row.age_max,
      eduLevel: row.education || '', eduMajor: '', expYears: row.experience || 0, expField: '', hardSkills: '',
      responsibilities: [], reportTo: ''
    }));
    setJdList([...jdList, ...newJDs]); 
    setShowImportModal(false); 
    setPreviewData([]);
    Swal.fire('Imported', `${newJDs.length} positions added.`, 'success');
  };

  // --- Charts ---
  useEffect(() => {
    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    if (currentView === 'dashboard') {
      if (statusChartRef.current) {
        const ctx = statusChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'doughnut',
            data: { labels: ['Active', 'Draft'], datasets: [{ data: [38, 4], backgroundColor: ['#4F868C', '#F2B705'] }] },
            options: { responsive: true, maintainAspectRatio: false }
          }));
        }
      }
      if (activityChartRef.current) {
        const ctx = activityChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Aug','Sep','Oct'], datasets: [{ label: 'Updates', data: [5,8,12], backgroundColor: '#186B8C' }] },
            options: { responsive: true, maintainAspectRatio: false }
          }));
        }
      }
    }
  }, [currentView]);

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">JD MASTER</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Job Description Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
              <button onClick={() => setCurrentView('smart_jd')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'smart_jd' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <Grid3X3 className="w-4 h-4" /> SMART JD
              </button>
              <button onClick={() => setCurrentView('list')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'list' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <List className="w-4 h-4" /> JD REPOSITORY
              </button>
              <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'dashboard' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <LayoutDashboard className="w-4 h-4" /> ANALYTICS
              </button>
            </div>
            <button onClick={() => setShowGuide(true)} className="w-8 h-8 rounded-full bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-colors" title="User Guide">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW: SMART JD */}
        {currentView === 'smart_jd' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-6">
              <div><h2 class="text-2xl font-bold text-sidebarBg">Functional Responsibility Matrix</h2><p className="text-sm text-brandMuted">Auto-generated from JD Repository (Hierarchical View)</p></div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
                <span className="text-xs font-bold text-brandDeepBlue px-2">Department:</span>
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-bgPage border-none text-sm font-bold text-sidebarBg rounded-lg py-2 px-4 focus:ring-0 cursor-pointer outline-none">
                  {availableDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex gap-4 text-xs justify-end">
                <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full text-center leading-6 text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">O</span> <span>Operate</span></div>
                <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full text-center leading-6 text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">C</span> <span>Check</span></div>
                <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full text-center leading-6 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">D</span> <span>Decide</span></div>
                <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full text-center leading-6 text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">A</span> <span>Approve</span></div>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left w-1/4 sticky top-0 bg-[#F2F0E4] z-10 border-b-2 border-brandTeal/20 shadow-sm p-4 text-xs font-bold uppercase">Key Function & Sub-Tasks</th>
                      {currentMatrix.positions.map(pos => (
                        <th key={pos.title} className="sticky top-0 bg-[#F2F0E4] z-10 border-b-2 border-brandTeal/20 shadow-sm text-center p-4 text-xs font-bold uppercase border-l border-gray-200">
                          <div className="flex flex-col"><span>{pos.title}</span><span className="text-[9px] text-gray-500 font-normal">{pos.titleTH}</span></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentMatrix.groups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="font-bold text-brandDeepBlue py-3 px-4 text-sm flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-brandTeal" />
                            {group.name}
                            <span className="text-[10px] text-gray-500 font-normal ml-auto">{group.tasks.length} Tasks</span>
                          </td>
                          {currentMatrix.positions.map(pos => <td key={pos.title} className="bg-gray-100 border-l border-gray-200"></td>)}
                        </tr>
                        {group.tasks.map((task: any, tIdx: number) => (
                          <tr key={tIdx} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                            <td className="pl-10 py-3 pr-4 font-medium text-brandDeepBlue border-r border-gray-200">
                              <div className="text-xs font-bold">{task.subTopic}</div>
                              <div className="text-[10px] text-gray-400 font-normal truncate max-w-xs">{task.desc}</div>
                            </td>
                            {task.authorities.map((auth: string, cIdx: number) => (
                              <td key={cIdx} className="text-center py-3 border-r border-gray-200">
                                {auth !== '-' ? (
                                  <span className={`inline-block w-6 h-6 leading-6 text-center rounded-full text-[10px] font-bold ${getRoleClass(auth)}`}>{auth}</span>
                                ) : <span className="text-gray-200">-</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {currentMatrix.groups.length === 0 && (
                      <tr><td colSpan={currentMatrix.positions.length + 1} className="text-center py-8 text-gray-400">No responsibilities defined for this department.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: LIST */}
        {currentView === 'list' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold text-sidebarBg">JD Repository</h2><p className="text-sm text-brandMuted">Total {jdList.length} active positions</p></div>
              <div className="flex gap-2">
                <button onClick={() => { setPreviewData([]); setShowImportModal(true); }} className="px-5 py-2.5 bg-white text-brandDeepBlue border border-brandDeepBlue/20 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2"><Upload className="w-4 h-4" /> UPLOAD</button>
                <button onClick={() => openJDCreator()} className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue flex items-center gap-2"><PlusCircle className="w-4 h-4" /> CREATE NEW JD</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col">
              <div className="p-4 border-b border-gray-100 flex gap-4">
                <div className="relative w-64"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search position..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brandTeal" /></div>
                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"><option value="">All Departments</option>{availableDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}</select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Code</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Position Title (EN/TH)</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Dept</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Level</th><th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th><th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredJDList.map(jd => (
                      <tr key={jd.code} className="hover:bg-brandTeal/5 transition-colors">
                        <td className="p-4 text-xs font-mono font-bold text-brandDeepBlue">{jd.code}</td>
                        <td className="p-4"><div className="font-bold text-sidebarBg text-sm">{jd.title}</div><div className="text-xs text-gray-500 font-sans">{jd.titleTH}</div></td>
                        <td className="p-4 text-sm text-gray-600">{jd.dept}</td><td className="p-4 text-sm text-gray-600">{jd.level}</td>
                        <td className="p-4 text-center"><span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${jd.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{jd.status}</span></td>
                        <td className="p-4 text-center"><div className="flex items-center justify-center gap-2"><button onClick={() => viewPDF(jd)} className="text-gray-400 hover:text-brandRed" title="View PDF"><FileText className="w-4 h-4" /></button><button onClick={() => openJDCreator(jd)} className="text-gray-400 hover:text-brandBlue" title="Edit"><Edit className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-6"><h2 className="text-2xl font-bold text-sidebarBg">Analytics</h2><p className="text-sm text-brandMuted">Overview</p></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white"><p className="text-xs text-brandMuted font-bold uppercase">Total Positions</p><h3 className="text-3xl font-bold text-brandDeepBlue mt-1">{jdList.length}</h3></div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white"><p className="text-xs text-brandMuted font-bold uppercase">Departments</p><h3 className="text-3xl font-bold text-brandTeal mt-1">{availableDepts.length}</h3></div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white"><p className="text-xs text-brandMuted font-bold uppercase">Tasks</p><h3 className="text-3xl font-bold text-brandOrange mt-1">{totalTasks}</h3></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white flex flex-col"><h4 className="text-sm font-bold text-sidebarBg mb-4">Status</h4><div className="flex-1 relative"><canvas ref={statusChartRef}></canvas></div></div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white flex flex-col"><h4 className="text-sm font-bold text-sidebarBg mb-4">Activity</h4><div className="flex-1 relative"><canvas ref={activityChartRef}></canvas></div></div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <BaseModal isOpen={showModal} onClose={() => setShowModal(false)} title={`${isEditing ? 'Edit' : 'Create'} JD`} icon={FileText} size="xl">
        <div className="flex flex-col h-full">
          <div className="px-6 py-2 border-b border-gray-100 flex gap-2 bg-gray-50">
            <button onClick={() => setActiveTab(0)} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${activeTab === 0 ? 'bg-white text-brandTeal border-t-2 border-brandTeal shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>1. Info</button>
            <button onClick={() => setActiveTab(1)} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${activeTab === 1 ? 'bg-white text-brandTeal border-t-2 border-brandTeal shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>2. Duties</button>
            <button onClick={() => setActiveTab(3)} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${activeTab === 3 ? 'bg-white text-brandTeal border-t-2 border-brandTeal shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>4. Spec</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
            {activeTab === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Code</label><input type="text" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} className="w-full bg-yellow-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Title (EN)</label><input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Title (TH)</label><input type="text" value={form.titleTH} onChange={(e) => setForm({...form, titleTH: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Dept</label><input type="text" value={form.dept} onChange={(e) => setForm({...form, dept: e.target.value})} list="dept-list" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /><datalist id="dept-list"><option value="HRD" /><option value="ITS" /></datalist></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Level</label><select value={form.level} onChange={(e) => setForm({...form, level: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"><option>Officer</option><option>Senior</option><option>Supervisor</option><option>Manager</option><option>Director</option></select></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reports To</label><input type="text" value={form.reportTo} onChange={(e) => setForm({...form, reportTo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
                </div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Job Purpose</label><textarea value={form.purpose} onChange={(e) => setForm({...form, purpose: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"></textarea></div>
              </div>
            )}
            {activeTab === 1 && (
              <div className="space-y-4">
                <div className="flex justify-end"><button onClick={() => setForm({...form, responsibilities: [...form.responsibilities, { function: '', percent: 0, expanded: true, subTasks: [{topic:'', desc:'', authority:'-'}] }]})} className="text-xs font-bold text-brandDeepBlue hover:underline flex items-center gap-1"><PlusCircle className="w-3 h-3" /> Add Key Function</button></div>
                {form.responsibilities.map((func, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <input type="text" value={func.function} onChange={(e) => { const newResp = [...form.responsibilities]; newResp[idx].function = e.target.value; setForm({...form, responsibilities: newResp}); }} className="font-bold text-sm text-brandDeepBlue w-1/2 border-b border-transparent bg-transparent focus:border-brandTeal outline-none" placeholder="Key Function Name (e.g. Recruitment)" />
                      <div className="flex items-center gap-2">
                        <input type="number" value={func.percent} onChange={(e) => { const newResp = [...form.responsibilities]; newResp[idx].percent = parseInt(e.target.value); setForm({...form, responsibilities: newResp}); }} className="w-12 text-right text-xs border rounded p-1" placeholder="%" />
                        <button onClick={() => { const newResp = [...form.responsibilities]; newResp[idx].expanded = !newResp[idx].expanded; setForm({...form, responsibilities: newResp}); }} className="text-gray-400"><ChevronDown className={`w-4 h-4 transition ${func.expanded ? 'rotate-180' : ''}`} /></button>
                        <button onClick={() => { const newResp = [...form.responsibilities]; newResp.splice(idx, 1); setForm({...form, responsibilities: newResp}); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {func.expanded && (
                      <div className="pl-4 mt-2 border-l-2 border-gray-200 space-y-2">
                        {func.subTasks.map((sub, sIdx) => (
                          <div key={sIdx} className="flex gap-2 items-start">
                            <div className="flex-1 grid grid-cols-1 gap-1">
                              <input type="text" value={sub.topic} onChange={(e) => { const newResp = [...form.responsibilities]; newResp[idx].subTasks[sIdx].topic = e.target.value; setForm({...form, responsibilities: newResp}); }} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none focus:border-brandTeal" placeholder="Sub-task Name" />
                              <textarea value={sub.desc} onChange={(e) => { const newResp = [...form.responsibilities]; newResp[idx].subTasks[sIdx].desc = e.target.value; setForm({...form, responsibilities: newResp}); }} rows={1} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-brandTeal" placeholder="Description"></textarea>
                            </div>
                            <div className="w-20">
                              <select value={sub.authority} onChange={(e) => { const newResp = [...form.responsibilities]; newResp[idx].subTasks[sIdx].authority = e.target.value; setForm({...form, responsibilities: newResp}); }} className={`w-full border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none ${getRoleClass(sub.authority)}`}>
                                <option value="-">-</option><option value="O">O</option><option value="C">C</option><option value="D">D</option><option value="A">A</option>
                              </select>
                            </div>
                            <button onClick={() => { const newResp = [...form.responsibilities]; newResp[idx].subTasks.splice(sIdx, 1); setForm({...form, responsibilities: newResp}); }} className="text-gray-300 hover:text-red-500 mt-1"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                        <button onClick={() => { const newResp = [...form.responsibilities]; newResp[idx].subTasks.push({topic:'', desc:'', authority:'-'}); setForm({...form, responsibilities: newResp}); }} className="text-[10px] font-bold text-brandTeal mt-2 flex items-center gap-1"><PlusCircle className="w-3 h-3" /> Add Sub-task</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeTab === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gender</label><select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"><option value="Any">Any</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Age</label><div className="flex gap-2"><input type="number" value={form.ageMin || ''} onChange={(e) => setForm({...form, ageMin: parseInt(e.target.value)})} className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /><input type="number" value={form.ageMax || ''} onChange={(e) => setForm({...form, ageMax: parseInt(e.target.value)})} className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Education</label><select value={form.eduLevel} onChange={(e) => setForm({...form, eduLevel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"><option>Bachelor's Degree</option><option>Master's Degree</option></select></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Major</label><input type="text" value={form.eduMajor} onChange={(e) => setForm({...form, eduMajor: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
                </div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Experience</label><div className="flex gap-4 items-center"><input type="number" value={form.expYears} onChange={(e) => setForm({...form, expYears: parseInt(e.target.value)})} className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /><span className="text-sm">years in</span><input type="text" value={form.expField} onChange={(e) => setForm({...form, expField: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div></div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tech Skills</label><textarea value={form.hardSkills} onChange={(e) => setForm({...form, hardSkills: e.target.value})} rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"></textarea></div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button onClick={() => setShowModal(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-all">Cancel</button>
            <button onClick={saveJD} className="px-8 py-2 bg-brandGold text-sidebarBg text-xs font-bold rounded-lg shadow hover:bg-yellow-400 transition-all flex items-center gap-2"><Save className="w-4 h-4" /> SAVE</button>
          </div>
        </div>
      </BaseModal>

      <BaseModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Job Descriptions" icon={UploadCloud} size="lg">
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <h4 className="text-xs font-bold text-blue-800 mb-2">CSV Guide</h4>
            <div className="flex flex-wrap gap-2 text-[10px] text-blue-600 font-mono"><span>code</span>, <span>title_en</span>, <span>dept</span>, <span>gender</span>, <span>age_min</span>, <span>education</span></div>
          </div>
          {!previewData.length ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 cursor-pointer relative">
              <input type="file" onChange={handleFileUpload} accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-3"><UploadCloud className="w-6 h-6 text-gray-400" /><p className="text-sm font-bold text-gray-700">Upload CSV</p></div>
            </div>
          ) : (
            <div className="overflow-auto max-h-60 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-100"><tr><th className="p-2 text-xs">Code</th><th className="p-2 text-xs">Title</th><th className="p-2 text-xs">Gen/Age</th><th className="p-2 text-xs">Edu</th></tr></thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="p-2 text-xs font-bold">{row.code}</td><td className="p-2 text-xs">{row.title_en}</td><td className="p-2 text-xs text-center">{row.gender}/{row.age_min}</td><td className="p-2 text-xs truncate max-w-[100px]">{row.education}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={processImport} disabled={!previewData.length} className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">Confirm</button>
        </div>
      </BaseModal>

      <BaseModal isOpen={showPdfModal} onClose={() => setShowPdfModal(false)} title="JD Preview" icon={FileText} size="xl">
        {selectedJD && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-100 flex justify-center">
              <div id="print-pdf-area" className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-[20mm] text-gray-800 font-serif relative">
                <div className="border-b-2 border-brandDeepBlue pb-4 mb-6 flex justify-between items-end">
                  <div><h1 className="text-3xl font-bold text-sidebarBg">JOB DESCRIPTION</h1><p className="text-sm text-gray-500">HR MASTER • COMPANY LIMITED</p></div>
                  <div className="text-right"><span className="bg-brandGold text-white px-3 py-1 text-xs font-bold rounded uppercase">{selectedJD.status}</span><p className="text-[10px] text-gray-400 mt-1">Updated: {selectedJD.updated}</p></div>
                </div>
                <table className="w-full text-sm mb-6 border border-gray-200">
                  <tr className="border-b border-gray-200"><td className="bg-gray-50 font-bold p-2 w-1/4 border-r border-gray-200">Job Title:</td><td className="p-2 w-1/4 border-r border-gray-200 font-bold text-brandDeepBlue">{selectedJD.title}</td><td className="bg-gray-50 font-bold p-2 w-1/4 border-r border-gray-200">Job Code:</td><td className="p-2 w-1/4 font-mono">{selectedJD.code}</td></tr>
                  <tr className="border-b border-gray-200"><td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Department:</td><td className="p-2 border-r border-gray-200">{selectedJD.dept}</td><td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Reports To:</td><td className="p-2">{selectedJD.reportTo}</td></tr>
                  <tr><td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Job Level:</td><td className="p-2 border-r border-gray-200">{selectedJD.level}</td><td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Location:</td><td className="p-2">Headquarters</td></tr>
                </table>
                <div className="mb-6"><h3 className="font-bold text-brandDeepBlue border-b border-brandGold mb-2 pb-1 text-sm uppercase">1. Job Purpose</h3><p className="text-sm text-gray-700 text-justify">{selectedJD.purpose}</p></div>
                <div className="mb-6">
                  <h3 className="font-bold text-brandDeepBlue border-b border-brandGold mb-2 pb-1 text-sm uppercase">2. Key Responsibilities</h3>
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <tr className="bg-gray-50"><th className="border border-gray-200 p-2 text-left w-1/4">Key Task</th><th className="border border-gray-200 p-2 text-left">Description</th><th className="border border-gray-200 p-2 w-16 text-center">Auth</th></tr>
                    {selectedJD.responsibilities.map((func, i) => (
                      <React.Fragment key={i}>
                        <tr><td colSpan={3} className="border border-gray-200 p-2 font-bold bg-gray-50">{func.function}</td></tr>
                        {func.subTasks.map((sub, j) => (
                          <tr key={j}><td className="border border-gray-200 p-2 pl-6">{sub.topic}</td><td className="border border-gray-200 p-2">{sub.desc}</td><td className="border border-gray-200 p-2 text-center">{sub.authority}</td></tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </table>
                </div>
                <div className="mb-6">
                  <h3 className="font-bold text-brandDeepBlue border-b border-brandGold mb-2 pb-1 text-sm uppercase">4. Job Qualifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4"><div className="bg-gray-50 p-2 rounded"><span className="font-bold block text-gray-500 text-xs uppercase">Gender</span>{selectedJD.gender}</div><div className="bg-gray-50 p-2 rounded"><span className="font-bold block text-gray-500 text-xs uppercase">Age</span>{selectedJD.ageMin} - {selectedJD.ageMax} Years</div></div>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1"><li><span className="font-bold">Education:</span> {selectedJD.eduLevel} in {selectedJD.eduMajor}</li><li><span className="font-bold">Experience:</span> {selectedJD.expYears} years in {selectedJD.expField}</li><li><span className="font-bold">Technical Skills:</span> {selectedJD.hardSkills}</li></ul>
                </div>
                <div className="mt-12 flex justify-between pt-8 border-t border-gray-300"><div className="text-center w-40"><div className="h-10 border-b border-black mb-2"></div><p className="text-xs">Prepared By (HR)</p></div><div className="text-center w-40"><div className="h-10 border-b border-black mb-2"></div><p className="text-xs">Approved By (Dept. Head)</p></div></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowPdfModal(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Close</button>
              <button onClick={() => window.print()} className="px-8 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue flex items-center gap-2"><Printer className="w-4 h-4" /> Print JD</button>
            </div>
          </div>
        )}
      </BaseModal>

    </div>
  );
};

export default JobDescriptionMaster;
