import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Grid3X3, 
  List, 
  LayoutDashboard, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  PlusCircle, 
  Trash2, 
  X, 
  Upload, 
  Search, 
  Edit, 
  Printer, 
  UploadCloud,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import Swal from 'sweetalert2';
import Papa from 'papaparse';
import { Chart } from 'chart.js/auto';
import { exportToGoogleSheets } from '../utils/sheetHelper';
import BaseModal from './BaseModal';

// --- Types ---
interface SubTask {
  topic: string;
  desc: string;
  authority: 'O' | 'C' | 'D' | 'A' | '-';
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
  level: string;
  reportTo: string;
  purpose: string;
  responsibilities: Responsibility[];
  gender: string;
  ageMin: number | null;
  ageMax: number | null;
  eduLevel: string;
  eduMajor: string;
  expYears: number;
  expField: string;
  hardSkills: string;
  updated?: string;
  status?: string;
}

// --- Mock Data ---
const MOCK_JD_LIST: JobDescription[] = [
  { 
      code: 'JD-HR-001', title: 'HR Manager', titleTH: 'ผู้จัดการฝ่ายบุคคล', dept: 'HRD', level: 'Manager', reportTo: 'CEO', updated: '2024-01-15', status: 'Active',
      purpose: 'Oversee HR strategies.', gender: 'Any', ageMin: 35, ageMax: 50, eduLevel: "Master's Degree", eduMajor: 'HRM', expYears: 10, expField: 'HR Management', hardSkills: 'Strategic Planning, Labor Law',
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
      code: 'JD-HR-002', title: 'Recruitment Officer', titleTH: 'เจ้าหน้าที่สรรหา', dept: 'HRD', level: 'Officer', reportTo: 'Recruitment Supervisor', updated: '2024-01-16', status: 'Active',
      purpose: 'Execute hiring process.', gender: 'Any', ageMin: 22, ageMax: 30, eduLevel: "Bachelor's Degree", eduMajor: 'Psychology', expYears: 1, expField: 'Recruitment', hardSkills: 'Interviewing, Sourcing',
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
    code: 'JD-IT-001', title: 'IT Manager', titleTH: 'ผู้จัดการไอที', dept: 'ITS', level: 'Manager', reportTo: 'CEO', updated: '2024-01-20', status: 'Active',
    purpose: 'Manage IT infrastructure.', gender: 'Any', ageMin: 30, ageMax: 45, eduLevel: "Bachelor's Degree", eduMajor: 'Computer Science', expYears: 8, expField: 'IT', hardSkills: 'Network Security, Cloud Computing',
    responsibilities: [
        { function: 'Infrastructure', percent: 40, expanded: true, subTasks: [{ topic: 'Network Security', desc: 'Approve policies', authority: 'A' }] }
    ]
  }
];

const JobDescription = () => {
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState<JobDescription>({
      code: '', title: '', titleTH: '', dept: '', reportTo: '', level: 'Officer', purpose: '', 
      responsibilities: [], 
      eduLevel: "Bachelor's Degree", eduMajor: '', expYears: 0, expField: '', gender: 'Any', ageMin: null, ageMax: null, hardSkills: ''
  });

  // --- Computed ---
  const availableDepts = useMemo(() => [...new Set(jdList.map(j => j.dept))], [jdList]);
  
  const filteredJDList = useMemo(() => {
      return jdList.filter(jd => 
          (jd.title.toLowerCase().includes(searchQuery.toLowerCase()) || jd.code.toLowerCase().includes(searchQuery.toLowerCase())) && 
          (!filterDept || jd.dept === filterDept)
      );
  }, [jdList, searchQuery, filterDept]);

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

      const groups = Object.values(funcMap).map((f: any) => {
          const tasks = Object.values(f.subTasks).map((t: any) => {
              const authorities = positions.map(pos => t.roleMap[pos.title] || '-');
              return { subTopic: t.subTopic, desc: t.desc, authorities: authorities };
          });
          return { name: f.name, expanded: expandedGroups[f.name] !== false, tasks: tasks };
      });

      return { positions: positions, groups: groups };
  }, [jdList, selectedDept, expandedGroups]);

  const totalTasks = useMemo(() => jdList.reduce((acc, jd) => acc + (jd.responsibilities ? jd.responsibilities.length : 0), 0), [jdList]);

  // --- Actions ---
  const getRoleClass = (role: string) => { 
      switch(role) { 
          case 'O': return 'bg-blue-100 text-blue-700 border border-blue-200'; 
          case 'C': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'; 
          case 'D': return 'bg-red-100 text-red-700 border border-red-200'; 
          case 'A': return 'bg-green-100 text-green-700 border border-green-200'; 
          default: return 'text-gray-300'; 
      } 
  };

  const toggleGroup = (groupName: string) => {
      setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const openJDCreator = (jd: JobDescription | null = null) => {
      if (jd) { 
          setIsEditing(true); 
          setForm(JSON.parse(JSON.stringify(jd))); 
      } else { 
          setIsEditing(false); 
          resetForm(); 
      }
      setShowModal(true); 
      setActiveTab(0);
  };

  const resetForm = () => {
      setForm({ 
          code: `JD-NEW-${Math.floor(Math.random()*1000)}`, 
          title: '', titleTH: '', dept: '', reportTo: '', level: 'Officer', purpose: '',
          responsibilities: [{ function: 'Key Function 1', percent: 0, expanded: true, subTasks: [{topic:'', desc:'', authority:'-'}] }],
          eduLevel: "Bachelor's Degree", eduMajor: '', expYears: 0, expField: '', gender: 'Any', ageMin: null, ageMax: null, hardSkills: ''
      });
  };

  const addKeyFunction = () => {
      setForm(prev => ({
          ...prev,
          responsibilities: [...prev.responsibilities, { function: '', percent: 0, expanded: true, subTasks: [{topic:'', desc:'', authority:'-'}] }]
      }));
  };

  const removeKeyFunction = (idx: number) => {
      setForm(prev => {
          const newResp = [...prev.responsibilities];
          newResp.splice(idx, 1);
          return { ...prev, responsibilities: newResp };
      });
  };

  const addSubTask = (funcIdx: number) => {
      setForm(prev => {
          const newResp = [...prev.responsibilities];
          newResp[funcIdx].subTasks.push({ topic: '', desc: '', authority: '-' });
          return { ...prev, responsibilities: newResp };
      });
  };

  const removeSubTask = (funcIdx: number, subIdx: number) => {
      setForm(prev => {
          const newResp = [...prev.responsibilities];
          newResp[funcIdx].subTasks.splice(subIdx, 1);
          return { ...prev, responsibilities: newResp };
      });
  };

  const saveJD = () => {
      if (!form.title) {
          Swal.fire('Error', 'Job Title required', 'error');
          return;
      }
      if (isEditing) { 
          setJdList(prev => prev.map(j => j.code === form.code ? { ...form, updated: new Date().toISOString().split('T')[0] } : j)); 
      } else { 
          setJdList(prev => [{ ...form, updated: new Date().toISOString().split('T')[0], status: 'Draft' }, ...prev]); 
      }
      setShowModal(false); 
      Swal.fire('Saved', 'Success', 'success');
  };

  const viewPDF = (jd: JobDescription) => { 
      setSelectedJD(jd); 
      setShowPdfModal(true); 
  };

  const printContent = () => {
      window.print();
  };

  // CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { 
      const f = e.target.files?.[0]; 
      if(f) {
          Papa.parse(f, { 
              header: true, 
              skipEmptyLines: true, 
              complete: (res) => setPreviewData(res.data) 
          }); 
      }
  };

  const processImport = () => { 
      // Simple mapping, in real app would need validation
      const newJDs = previewData.map((row: any) => ({
          code: row.code || `JD-${Date.now()}`,
          title: row.title_en || 'Untitled',
          titleTH: row.title_th || '',
          dept: row.dept || 'General',
          level: row.level || 'Officer',
          reportTo: row.reports_to || '',
          purpose: '',
          responsibilities: [],
          gender: row.gender || 'Any',
          ageMin: row.age_min,
          ageMax: row.age_max,
          eduLevel: row.education || "Bachelor's Degree",
          eduMajor: '',
          expYears: row.experience || 0,
          expField: '',
          hardSkills: '',
          status: 'Draft',
          updated: new Date().toISOString().split('T')[0]
      }));
      setJdList(prev => [...newJDs, ...prev]); 
      setShowImportModal(false); 
      setPreviewData([]);
  };

  // Charts
  useEffect(() => {
      if (currentView === 'dashboard') {
          const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement;
          const activityCtx = document.getElementById('activityChart') as HTMLCanvasElement;
          
          let statusChart: Chart | null = null;
          let activityChart: Chart | null = null;

          if (statusCtx) {
              statusChart = new Chart(statusCtx, { 
                  type: 'doughnut', 
                  data: { 
                      labels: ['Active', 'Draft'], 
                      datasets: [{ data: [38, 4], backgroundColor: ['#4F868C', '#F2B705'] }] 
                  } 
              });
          }
          if (activityCtx) {
              activityChart = new Chart(activityCtx, { 
                  type: 'bar', 
                  data: { 
                      labels: ['Aug','Sep','Oct'], 
                      datasets: [{ label: 'Updates', data: [5,8,12], backgroundColor: '#186B8C' }] 
                  } 
              });
          }

          return () => {
              statusChart?.destroy();
              activityChart?.destroy();
          };
      }
  }, [currentView]);

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
        {/* Header */}
        <header className="px-8 py-6 flex flex-col md:flex-row justify-between items-center shrink-0 z-20 gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">JD MASTER</h1>
                    <p className="text-brandTeal text-xs font-bold uppercase tracking-widest">Job Description Management</p>
                </div>
            </div>
            
            <nav className="flex items-center gap-3">
                <div className="flex bg-white border border-gray-100 p-1 rounded-lg shadow-sm">
                    <button 
                        onClick={() => setCurrentView('smart_jd')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'smart_jd' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Grid3X3 className="w-4 h-4" /> SMART JD
                    </button>
                    <button 
                        onClick={() => setCurrentView('list')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'list' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <List className="w-4 h-4" /> JD REPOSITORY
                    </button>
                    <button 
                        onClick={() => setCurrentView('dashboard')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'dashboard' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" /> ANALYTICS
                    </button>
                </div>
                <button 
                    onClick={() => setShowGuide(true)} 
                    className="w-10 h-10 rounded-xl bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-all shadow-sm border border-brandTeal/20" 
                    title="User Guide"
                >
                    <HelpCircle className="w-5 h-5" />
                </button>
            </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
            {/* VIEW: SMART JD */}
            {currentView === 'smart_jd' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-sidebarBg">Functional Responsibility Matrix</h2>
                            <p className="text-sm text-brandMuted mt-1">Auto-generated from JD Repository (Hierarchical View)</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => exportToGoogleSheets(currentMatrix.groups, 'SmartJD_Matrix')} 
                                className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold shadow-sm hover:bg-green-100 flex items-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" /> Sync Sheets
                            </button>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
                                <span className="text-xs font-bold text-brandDeepBlue px-2">Department:</span>
                                <select 
                                    value={selectedDept} 
                                    onChange={(e) => setSelectedDept(e.target.value)} 
                                    className="bg-bgPage border-none text-sm font-bold text-sidebarBg rounded-lg py-2 px-4 focus:ring-0 cursor-pointer outline-none"
                                >
                                    {availableDepts.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex gap-4 text-xs justify-end">
                            <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px] font-bold">O</span> <span>Operate</span></div>
                            <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center justify-center text-[10px] font-bold">C</span> <span>Check</span></div>
                            <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center text-[10px] font-bold">D</span> <span>Decide</span></div>
                            <div className="flex items-center gap-1"><span className="w-6 h-6 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center justify-center text-[10px] font-bold">A</span> <span>Approve</span></div>
                        </div>
                        <div className="overflow-auto p-6">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="text-left w-1/4 sticky top-0 bg-[#F2F0E4] z-10 border-b-2 border-brandTeal/20 shadow-sm p-4 text-xs font-bold text-gray-700 uppercase">Key Function & Sub-Tasks</th>
                                        {currentMatrix.positions.map(pos => (
                                            <th key={pos.title} className="sticky top-0 bg-[#F2F0E4] z-10 border-b-2 border-brandTeal/20 shadow-sm text-center p-4 min-w-[120px]">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-sidebarBg">{pos.title}</span>
                                                    <span className="text-[9px] text-gray-500 font-normal">{pos.titleTH}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentMatrix.groups.map((group, gIdx) => (
                                        <React.Fragment key={gIdx}>
                                            <tr className="bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => toggleGroup(group.name)}>
                                                <td className="font-bold text-brandDeepBlue py-3 px-4 text-sm flex items-center gap-2">
                                                    <ChevronRight className={`w-4 h-4 text-brandTeal transition-transform ${group.expanded ? 'rotate-90' : ''}`} />
                                                    {group.name}
                                                    <span className="text-[10px] text-gray-500 font-normal ml-auto bg-white px-2 py-0.5 rounded-full border border-gray-200">{group.tasks.length} Tasks</span>
                                                </td>
                                                {currentMatrix.positions.map((pos, i) => <td key={i} className="bg-gray-50"></td>)}
                                            </tr>
                                            {group.expanded && group.tasks.map((task: any, tIdx: number) => (
                                                <tr key={tIdx} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                                    <td className="pl-10 py-3 pr-4 font-medium text-brandDeepBlue border-r border-gray-100">
                                                        <div className="text-xs font-bold">{task.subTopic}</div>
                                                        <div className="text-[10px] text-gray-400 font-normal truncate max-w-xs">{task.desc}</div>
                                                    </td>
                                                    {task.authorities.map((auth: string, cIdx: number) => (
                                                        <td key={cIdx} className="text-center py-3 border-r border-gray-100 last:border-r-0">
                                                            {auth !== '-' ? (
                                                                <span className={`inline-block w-6 h-6 line-height-6 text-center rounded-full text-[10px] font-bold pt-1 ${getRoleClass(auth)}`}>{auth}</span>
                                                            ) : (
                                                                <span className="text-gray-200">-</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {currentMatrix.groups.length === 0 && (
                                        <tr>
                                            <td colSpan={currentMatrix.positions.length + 1} className="text-center py-8 text-gray-400 text-sm">No responsibilities defined for this department.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: LIST */}
            {currentView === 'list' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-sidebarBg">JD Repository</h2>
                            <p className="text-sm text-brandMuted mt-1">Total <span className="font-bold text-brandDeepBlue">{jdList.length}</span> active positions</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => exportToGoogleSheets(jdList, 'JD_Repository')} 
                                className="px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold shadow-sm hover:bg-green-100 flex items-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" /> Sync Sheets
                            </button>
                            <button 
                                onClick={() => setShowImportModal(true)} 
                                className="px-5 py-2.5 bg-white text-brandDeepBlue border border-brandDeepBlue/20 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> UPLOAD
                            </button>
                            <button 
                                onClick={() => openJDCreator()} 
                                className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" /> CREATE NEW JD
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search position..." 
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20"
                                />
                            </div>
                            <select 
                                value={filterDept} 
                                onChange={(e) => setFilterDept(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer"
                            >
                                <option value="">All Departments</option>
                                {availableDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Code</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Position Title (EN/TH)</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Dept</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Level</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredJDList.map(jd => (
                                        <tr key={jd.code} className="hover:bg-brandTeal/5 transition-colors">
                                            <td className="p-4 text-xs font-mono font-bold text-brandDeepBlue">{jd.code}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-sidebarBg text-sm">{jd.title}</div>
                                                <div className="text-xs text-gray-500 font-sans">{jd.titleTH}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{jd.dept}</td>
                                            <td className="p-4 text-sm text-gray-600">{jd.level}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${jd.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {jd.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => viewPDF(jd)} className="text-gray-400 hover:text-brandRed p-1 rounded hover:bg-red-50" title="View PDF"><FileText className="w-4 h-4" /></button>
                                                    <button onClick={() => openJDCreator(jd)} className="text-gray-400 hover:text-brandBlue p-1 rounded hover:bg-blue-50" title="Edit"><Edit className="w-4 h-4" /></button>
                                                </div>
                                            </td>
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-sidebarBg">Analytics</h2>
                        <p className="text-sm text-brandMuted mt-1">Overview of Job Descriptions</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                            <p className="text-xs text-brandMuted font-bold uppercase">Total Positions</p>
                            <h3 className="text-3xl font-bold text-brandDeepBlue mt-1">{jdList.length}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                            <p className="text-xs text-brandMuted font-bold uppercase">Departments</p>
                            <h3 className="text-3xl font-bold text-brandTeal mt-1">{availableDepts.length}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                            <p className="text-xs text-brandMuted font-bold uppercase">Tasks Defined</p>
                            <h3 className="text-3xl font-bold text-brandOrange mt-1">{totalTasks}</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col">
                            <h4 className="text-sm font-bold text-sidebarBg mb-4">JD Status Distribution</h4>
                            <div className="flex-1 relative">
                                <canvas id="statusChart"></canvas>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col">
                            <h4 className="text-sm font-bold text-sidebarBg mb-4">Recent Updates</h4>
                            <div className="flex-1 relative">
                                <canvas id="activityChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>

        {/* MODALS */}
        <BaseModal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit JD' : 'Create JD'} icon={FileText} size="xl">
            <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
                <button onClick={() => setActiveTab(0)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 0 ? 'bg-brandTeal text-white' : 'text-gray-500 hover:bg-gray-100'}`}>1. Info</button>
                <button onClick={() => setActiveTab(1)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 1 ? 'bg-brandTeal text-white' : 'text-gray-500 hover:bg-gray-100'}`}>2. Duties</button>
                <button onClick={() => setActiveTab(3)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 3 ? 'bg-brandTeal text-white' : 'text-gray-500 hover:bg-gray-100'}`}>3. Spec</button>
            </div>
            
            <div className="h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {/* Tab 1 */}
                {activeTab === 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code</label><input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full bg-yellow-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title (EN)</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title (TH)</label><input type="text" value={form.titleTH} onChange={e => setForm({...form, titleTH: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dept</label><input type="text" value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} list="dept-list" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /><datalist id="dept-list"><option value="HRD" /><option value="ITS" /></datalist></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label><select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>Officer</option><option>Senior</option><option>Supervisor</option><option>Manager</option><option>Director</option></select></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reports To</label><input type="text" value={form.reportTo} onChange={e => setForm({...form, reportTo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                        </div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Purpose</label><textarea value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                )}

                {/* Tab 2 */}
                {activeTab === 1 && (
                    <div className="space-y-4">
                        <div className="flex justify-end"><button onClick={addKeyFunction} className="text-xs font-bold text-brandDeepBlue hover:underline flex items-center gap-1"><PlusCircle className="w-3 h-3" /> Add Key Function</button></div>
                        {form.responsibilities.map((func, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <input type="text" value={func.function} onChange={e => { const newR = [...form.responsibilities]; newR[idx].function = e.target.value; setForm({...form, responsibilities: newR}); }} className="font-bold text-sm text-brandDeepBlue w-1/2 border-b border-transparent focus:border-brandTeal outline-none" placeholder="Key Function Name" />
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={func.percent} onChange={e => { const newR = [...form.responsibilities]; newR[idx].percent = parseInt(e.target.value); setForm({...form, responsibilities: newR}); }} className="w-12 text-right text-xs border rounded p-1" placeholder="%" />
                                        <button onClick={() => removeKeyFunction(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="pl-4 mt-2 border-l-2 border-gray-100 space-y-2">
                                    {func.subTasks.map((sub, sIdx) => (
                                        <div key={sIdx} className="flex gap-2 items-start">
                                            <div className="flex-1 grid grid-cols-1 gap-1">
                                                <input type="text" value={sub.topic} onChange={e => { const newR = [...form.responsibilities]; newR[idx].subTasks[sIdx].topic = e.target.value; setForm({...form, responsibilities: newR}); }} className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-bold" placeholder="Sub-task Name" />
                                                <textarea value={sub.desc} onChange={e => { const newR = [...form.responsibilities]; newR[idx].subTasks[sIdx].desc = e.target.value; setForm({...form, responsibilities: newR}); }} rows={1} className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Description" />
                                            </div>
                                            <div className="w-20">
                                                <select value={sub.authority} onChange={e => { const newR = [...form.responsibilities]; newR[idx].subTasks[sIdx].authority = e.target.value as any; setForm({...form, responsibilities: newR}); }} className={`w-full border border-gray-200 rounded px-2 py-1 text-xs font-bold ${getRoleClass(sub.authority)}`}>
                                                    <option value="-">-</option><option value="O">O</option><option value="C">C</option><option value="D">D</option><option value="A">A</option>
                                                </select>
                                            </div>
                                            <button onClick={() => removeSubTask(idx, sIdx)} className="text-gray-300 hover:text-red-500 mt-1"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addSubTask(idx)} className="text-[10px] font-bold text-brandTeal mt-2 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Sub-task</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab 3 */}
                {activeTab === 3 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="Any">Any</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age Range</label><div className="flex gap-2"><input type="number" value={form.ageMin || ''} onChange={e => setForm({...form, ageMin: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Min" /><input type="number" value={form.ageMax || ''} onChange={e => setForm({...form, ageMax: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Max" /></div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Education</label><select value={form.eduLevel} onChange={e => setForm({...form, eduLevel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>Bachelor's Degree</option><option>Master's Degree</option></select></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Major</label><input type="text" value={form.eduMajor} onChange={e => setForm({...form, eduMajor: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                        </div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience</label><div className="flex gap-2 items-center"><input type="number" value={form.expYears} onChange={e => setForm({...form, expYears: parseInt(e.target.value)})} className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /><span className="text-sm">years in</span><input type="text" value={form.expField} onChange={e => setForm({...form, expField: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tech Skills</label><textarea value={form.hardSkills} onChange={e => setForm({...form, hardSkills: e.target.value})} rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={saveJD} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue">Save</button>
            </div>
        </BaseModal>

        {/* PDF PREVIEW MODAL */}
        {showPdfModal && selectedJD && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-gray-100 w-full max-w-4xl h-[90vh] rounded-xl flex flex-col overflow-hidden">
                    <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
                        <h3 className="font-bold">JD Preview: {selectedJD.code}</h3>
                        <button onClick={() => setShowPdfModal(false)} className="hover:bg-white/10 p-1 rounded-full"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-200">
                        <div id="print-pdf-area" className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-lg text-gray-800 font-doc relative">
                            {/* Header */}
                            <div className="border-b-2 border-brandDeepBlue pb-4 mb-6 flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-bold text-sidebarBg">JOB DESCRIPTION</h1>
                                    <p className="text-sm text-gray-500">HR MASTER • COMPANY LIMITED</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-brandGold text-white px-3 py-1 text-xs font-bold rounded uppercase">{selectedJD.status}</span>
                                    <p className="text-[10px] text-gray-400 mt-1">Updated: {selectedJD.updated}</p>
                                </div>
                            </div>

                            {/* Job Info */}
                            <table className="w-full text-sm mb-6 border border-gray-200">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="bg-gray-50 font-bold p-2 w-1/4 border-r border-gray-200">Job Title:</td>
                                        <td className="p-2 w-1/4 border-r border-gray-200 font-bold text-brandDeepBlue">{selectedJD.title}</td>
                                        <td className="bg-gray-50 font-bold p-2 w-1/4 border-r border-gray-200">Job Code:</td>
                                        <td className="p-2 w-1/4 font-mono">{selectedJD.code}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Department:</td>
                                        <td className="p-2 border-r border-gray-200">{selectedJD.dept}</td>
                                        <td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Reports To:</td>
                                        <td className="p-2">{selectedJD.reportTo}</td>
                                    </tr>
                                    <tr>
                                        <td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Job Level:</td>
                                        <td className="p-2 border-r border-gray-200">{selectedJD.level}</td>
                                        <td className="bg-gray-50 font-bold p-2 border-r border-gray-200">Location:</td>
                                        <td className="p-2">Headquarters</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Purpose */}
                            <div className="mb-6">
                                <h3 className="font-bold text-brandDeepBlue border-b border-brandGold mb-2 pb-1 text-sm uppercase">1. Job Purpose</h3>
                                <p className="text-sm text-gray-700 text-justify">{selectedJD.purpose}</p>
                            </div>

                            {/* Responsibilities */}
                            <div className="mb-6">
                                <h3 className="font-bold text-brandDeepBlue border-b border-brandGold mb-2 pb-1 text-sm uppercase">2. Key Responsibilities</h3>
                                <table className="w-full text-sm border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-200 p-2 text-left w-1/4">Key Task</th>
                                            <th className="border border-gray-200 p-2 text-left">Description</th>
                                            <th className="border border-gray-200 p-2 w-16 text-center">Auth</th>
                                        </tr>
                                    </thead>
                                    {selectedJD.responsibilities.map((func, i) => (
                                        <tbody key={i}>
                                            <tr>
                                                <td colSpan={3} className="border border-gray-200 p-2 font-bold bg-gray-50 text-brandDeepBlue">{func.function} ({func.percent}%)</td>
                                            </tr>
                                            {func.subTasks.map((sub, j) => (
                                                <tr key={j}>
                                                    <td className="border border-gray-200 p-2 pl-6">{sub.topic}</td>
                                                    <td className="border border-gray-200 p-2">{sub.desc}</td>
                                                    <td className="border border-gray-200 p-2 text-center font-bold text-xs">{sub.authority}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    ))}
                                </table>
                            </div>

                            {/* Specs */}
                            <div className="mb-6">
                                <h3 className="font-bold text-brandDeepBlue border-b border-brandGold mb-2 pb-1 text-sm uppercase">4. Job Qualifications</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="font-bold block text-gray-500 text-xs uppercase">Gender</span>
                                        {selectedJD.gender}
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="font-bold block text-gray-500 text-xs uppercase">Age</span>
                                        {selectedJD.ageMin} - {selectedJD.ageMax} Years
                                    </div>
                                </div>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li><span className="font-bold">Education:</span> {selectedJD.eduLevel} in {selectedJD.eduMajor}</li>
                                    <li><span className="font-bold">Experience:</span> {selectedJD.expYears} years in {selectedJD.expField}</li>
                                    <li><span className="font-bold">Technical Skills:</span> <pre className="inline font-sans whitespace-pre-wrap text-xs">{selectedJD.hardSkills}</pre></li>
                                </ul>
                            </div>

                            {/* Approval */}
                            <div className="absolute bottom-20 left-20 right-20 flex justify-between pt-8 border-t border-gray-300">
                                <div className="text-center w-40">
                                    <div className="h-10"></div>
                                    <p className="border-t border-black text-xs pt-2">Prepared By (HR)</p>
                                </div>
                                <div className="text-center w-40">
                                    <div className="h-10"></div>
                                    <p className="border-t border-black text-xs pt-2">Approved By (Dept. Head)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                        <button onClick={printContent} className="px-6 py-2 bg-brandDeepBlue text-white font-bold rounded-lg shadow hover:bg-brandBlue flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
                        <button onClick={() => setShowPdfModal(false)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Close</button>
                    </div>
                </div>
            </div>
        )}

        {/* IMPORT MODAL */}
        <BaseModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Job Descriptions" icon={UploadCloud} size="lg">
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                    <h4 className="text-xs font-bold text-blue-800 mb-2">CSV Guide</h4>
                    <div className="flex flex-wrap gap-2 text-[10px] text-blue-600 font-mono">
                        <span>code</span>, <span>title_en</span>, <span>dept</span>, <span>gender</span>, <span>age_min</span>, <span>education</span>
                    </div>
                </div>
                
                {!previewData.length ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 cursor-pointer relative">
                        <input type="file" onChange={handleFileUpload} accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-3">
                            <UploadCloud className="w-8 h-8 text-gray-400" />
                            <p className="text-sm font-bold text-gray-700">Click or Drag CSV here</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-h-60 overflow-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-2 text-xs font-bold text-gray-500">Code</th>
                                    <th className="p-2 text-xs font-bold text-gray-500">Title</th>
                                    <th className="p-2 text-xs font-bold text-gray-500">Dept</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, idx) => (
                                    <tr key={idx} className="border-t border-gray-100">
                                        <td className="p-2 text-xs font-mono">{row.code}</td>
                                        <td className="p-2 text-xs">{row.title_en}</td>
                                        <td className="p-2 text-xs">{row.dept}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => { setPreviewData([]); setShowImportModal(false); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={processImport} disabled={!previewData.length} className="px-6 py-2 bg-green-600 text-white text-xs font-bold rounded-lg shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Confirm Import</button>
                </div>
            </div>
        </BaseModal>

        {/* Guide Slide-over */}
        {showGuide && (
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
                <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="px-6 py-4 border-b flex justify-between items-center bg-sidebarBg text-white">
                        <h3 className="font-bold flex items-center gap-2 text-lg m-0 border-0">
                            <HelpCircle className="w-5 h-5 text-brandGold" /> User Guide
                        </h3>
                        <button onClick={() => setShowGuide(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-600">
                        <div>
                            <h3 className="font-bold text-sidebarBg text-base mb-2 border-b pb-1">1. Smart Matrix</h3>
                            <p>Auto-generated responsibility matrix based on JD data. Shows who is Responsible (O), Checks (C), Decides (D), or Approves (A).</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-sidebarBg text-base mb-2 border-b pb-1">2. Creating JDs</h3>
                            <p>Use the "Create New JD" button. Fill in:</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li><strong>Info:</strong> Basic job details.</li>
                                <li><strong>Duties:</strong> Key functions and sub-tasks with authority levels.</li>
                                <li><strong>Spec:</strong> Requirements like education and skills.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-sidebarBg text-base mb-2 border-b pb-1">3. Export/Import</h3>
                            <p>You can sync data to Google Sheets (CSV) or upload existing JDs via CSV.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default JobDescription;
