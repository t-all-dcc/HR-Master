import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  List, 
  Users, 
  GitFork, 
  ExternalLink, 
  HelpCircle, 
  Upload, 
  PlusCircle, 
  Search, 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  Edit,
  BookOpen
} from 'lucide-react';
import BaseModal from '../components/BaseModal';
import Swal from 'sweetalert2';
import Papa from 'papaparse';
import { exportToGoogleSheets } from '../utils/sheetHelper';

// --- Types ---
interface Position {
  id: number;
  code: string;
  title: string;
  titleTh: string;
  dept: string;
  parentId: number | null;
  level: number;
  current: number;
  plan: number;
  salary: number;
  tempP?: string; // For import linking
}

interface Department {
  id: number;
  code: string;
  name: string;
}

interface Level {
  id: number;
  value: number;
  name: string;
}

// --- Mock Data ---
const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, code: 'ADM', name: 'Admin' },
  { id: 2, code: 'OPS', name: 'Operations' },
  { id: 3, code: 'HRD', name: 'Human Resources' },
  { id: 4, code: 'FNA', name: 'Finance' },
  { id: 5, code: 'PRD', name: 'Production' },
  { id: 6, code: 'QAD', name: 'Quality' },
];

const MOCK_LEVELS: Level[] = [
  { id: 1, value: 1, name: 'Executive' },
  { id: 2, value: 2, name: 'General Manager' },
  { id: 3, value: 3, name: 'Department Manager' },
  { id: 4, value: 4, name: 'Assistant Manager' },
  { id: 5, value: 5, name: 'Supervisor' },
  { id: 6, value: 6, name: 'Senior Officer' },
  { id: 7, value: 7, name: 'Officer' },
  { id: 8, value: 8, name: 'Staff' },
];

const DEFAULT_POSITIONS: Position[] = [
  { id: 1, code: 'MD-01', title: 'Managing Director', titleTh: 'กรรมการผู้จัดการ', dept: 'ADM', parentId: null, level: 1, current: 1, plan: 1, salary: 0 },
  { id: 2, code: 'GM-ADM', title: 'GM Admin', titleTh: 'ผู้จัดการทั่วไปสายบริหาร', dept: 'ADM', parentId: 1, level: 2, current: 1, plan: 1, salary: 0 },
  { id: 3, code: 'GM-OPS', title: 'GM Operations', titleTh: 'ผู้จัดการทั่วไปสายโรงงาน', dept: 'OPS', parentId: 1, level: 2, current: 1, plan: 1, salary: 0 },
  { id: 4, code: 'HR-DIR', title: 'HR Director', titleTh: 'ผู้อำนวยการฝ่ายบุคคล', dept: 'HRD', parentId: 2, level: 3, current: 1, plan: 1, salary: 0 },
  { id: 5, code: 'FIN-MGR', title: 'Finance Manager', titleTh: 'ผู้จัดการการเงิน', dept: 'FNA', parentId: 2, level: 3, current: 1, plan: 1, salary: 0 },
  { id: 6, code: 'PLT-MGR', title: 'Plant Manager', titleTh: 'ผู้จัดการโรงงาน', dept: 'PRD', parentId: 3, level: 3, current: 1, plan: 1, salary: 0 },
  { id: 7, code: 'QA-MGR', title: 'QA Manager', titleTh: 'ผู้จัดการประกันคุณภาพ', dept: 'QAD', parentId: 3, level: 3, current: 1, plan: 1, salary: 0 },
  { id: 8, code: 'REC-SUP', title: 'Recruitment Sup', titleTh: 'หัวหน้างานสรรหา', dept: 'HRD', parentId: 4, level: 5, current: 1, plan: 1, salary: 0 },
  { id: 9, code: 'REC-OFF', title: 'Recruitment Officer', titleTh: 'เจ้าหน้าที่สรรหา', dept: 'HRD', parentId: 8, level: 7, current: 2, plan: 3, salary: 0 },
  { id: 10, code: 'PRD-SUP', title: 'Production Supervisor', titleTh: 'หัวหน้าแผนกผลิต', dept: 'PRD', parentId: 6, level: 5, current: 2, plan: 2, salary: 0 },
  { id: 11, code: 'LN-LDR', title: 'Line Leader', titleTh: 'หัวหน้าไลน์', dept: 'PRD', parentId: 10, level: 6, current: 4, plan: 4, salary: 0 },
  { id: 12, code: 'OPR', title: 'Machine Operator', titleTh: 'พนักงานคุมเครื่อง', dept: 'PRD', parentId: 11, level: 7, current: 10, plan: 10, salary: 0 },
  { id: 13, code: 'WRK', title: 'Production Worker', titleTh: 'พนักงานฝ่ายผลิต', dept: 'PRD', parentId: 11, level: 8, current: 50, plan: 60, salary: 0 }
];

const PositionMaster = () => {
  const [currentView, setCurrentView] = useState<'positions' | 'manpower'>('positions');
  const [positions, setPositions] = useState<Position[]>(DEFAULT_POSITIONS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [form, setForm] = useState<Partial<Position>>({});
  const [parentSearch, setParentSearch] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);

  // --- Computed ---
  const filteredPositions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return positions.filter(p => 
      p.title.toLowerCase().includes(query) || 
      (p.titleTh && p.titleTh.includes(query)) || 
      p.code.toLowerCase().includes(query)
    );
  }, [positions, searchQuery]);

  const filteredParentOptions = useMemo(() => {
    const query = parentSearch.toLowerCase();
    return positions
      .filter(p => p.id !== form.id)
      .filter(p => !query || p.title.toLowerCase().includes(query) || (p.titleTh && p.titleTh.includes(query)) || p.code.toLowerCase().includes(query))
      .sort((a, b) => (a.title > b.title ? 1 : -1));
  }, [positions, form.id, parentSearch]);

  const totalGapCost = useMemo(() => 
    positions.reduce((acc, pos) => acc + (Math.max(0, pos.plan - pos.current) * pos.salary), 0), 
  [positions]);

  const vacancyRate = useMemo(() => {
    const plan = positions.reduce((acc, pos) => acc + pos.plan, 0);
    const cur = positions.reduce((acc, pos) => acc + pos.current, 0);
    return plan ? Math.round(((plan - cur) / plan) * 100) : 0;
  }, [positions]);

  // --- Helpers ---
  const getParent = (id: number | null) => positions.find(p => p.id === id);

  // --- Actions ---
  const openModal = (pos?: Position) => {
    setParentSearch('');
    setForm(pos ? { ...pos } : { id: Date.now(), level: 4, current: 0, plan: 0, salary: 0 });
    setIsEditing(!!pos);
    setShowModal(true);
  };

  const savePosition = () => {
    if (!form.title) {
      Swal.fire('Error', 'Title required', 'error');
      return;
    }
    
    if (isEditing) {
      setPositions(prev => prev.map(p => p.id === form.id ? { ...form } as Position : p));
    } else {
      setPositions(prev => [...prev, { ...form } as Position]);
    }
    
    setShowModal(false);
    Swal.fire('Saved', 'Success', 'success');
  };

  const resetToDefault = () => {
    setPositions(DEFAULT_POSITIONS);
    Swal.fire('Reset', 'Data reset to default mock data.', 'success');
  };

  // --- Import Logic ---
  const handleCSVUpload = (files: File[]) => {
    const file = files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: h => h.toLowerCase().replace(/[\s_]+/g, ''),
        complete: (res) => {
          const parsed = res.data.map((r: any) => ({
            code: r.code||'', title: r.title||r.titleen||'', titleTh: r.titleth||'', dept: r.dept||'', level: parseInt(r.level)||4,
            current_hc: parseInt(r.currenthc)||0, plan_hc: parseInt(r.planhc)||0, salary: parseInt(r.salary)||0, reports_to_code: r.reportstocode
          })).filter((r: any) => r.code && r.title);
          setPreviewData(parsed);
        }
      });
    }
  };

  const processImport = () => {
    const codeMap = new Map(); 
    positions.forEach(p => codeMap.set(p.code.toLowerCase(), p.id));
    
    const newPos: Position[] = [];
    const updatedPositions = [...positions];

    previewData.forEach(r => {
      const existId = codeMap.get(r.code.toLowerCase());
      const obj: any = { 
        id: existId || Date.now() + Math.random(), 
        code: r.code, 
        title: r.title, 
        titleTh: r.titleTh, 
        dept: r.dept, 
        level: r.level, 
        current: r.current_hc, 
        plan: r.plan_hc, 
        salary: r.salary, 
        parentId: null, 
        tempP: r.reports_to_code 
      };

      if (existId) {
        const idx = updatedPositions.findIndex(p => p.id === existId);
        updatedPositions[idx] = { ...updatedPositions[idx], ...obj };
      } else {
        newPos.push(obj);
      }
    });

    const finalPositions = [...updatedPositions, ...newPos];
    
    // Relink parents
    const fullMap = new Map(); 
    finalPositions.forEach(p => fullMap.set(p.code.toLowerCase(), p.id));
    
    finalPositions.forEach(p => { 
      if (p.tempP) { 
        const pid = fullMap.get(p.tempP.toLowerCase()); 
        if (pid) p.parentId = pid; 
        delete p.tempP; 
      }
    });

    setPositions(finalPositions);
    setShowImportModal(false);
    setPreviewData([]);
    Swal.fire('Success', 'Imported successfully', 'success');
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex flex-col md:flex-row justify-between items-center shrink-0 z-20 gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
                <Database className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">POSITION MASTER</h1>
                <p className="text-brandTeal text-xs font-bold uppercase tracking-widest">Data Management</p>
            </div>
        </div>
        
        <nav className="flex items-center gap-4">
            <div className="flex bg-white border border-gray-100 p-1 rounded-lg shadow-sm">
                <button 
                    onClick={() => setCurrentView('positions')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'positions' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <List className="w-4 h-4" /> POSITIONS
                </button>
                <button 
                    onClick={() => setCurrentView('manpower')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'manpower' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Users className="w-4 h-4" /> MANPOWER
                </button>
            </div>
            <button 
                onClick={() => setShowGuide(true)} 
                className="w-8 h-8 rounded-full bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-colors" 
                title="User Guide"
            >
                <HelpCircle className="w-5 h-5" />
            </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage px-8 pb-8">
        
        {/* VIEW: POSITION MASTER */}
        {currentView === 'positions' && (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-sidebarBg">Position Repository</h2>
                        <p className="text-sm text-brandMuted">Define job titles and reporting lines.</p>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={() => exportToGoogleSheets(positions, 'PositionMaster')} className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-lg hover:bg-green-100 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Sync Sheets</button>
                         <button onClick={resetToDefault} className="px-3 py-2 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300">Reset Mock</button>
                         <button onClick={() => setShowImportModal(true)} className="px-5 py-2.5 bg-white text-brandDeepBlue border border-brandDeepBlue/20 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                            <Upload className="w-4 h-4" /> UPLOAD
                        </button>
                        <button onClick={() => openModal()} className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> ADD POSITION
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search positions..." 
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brandTeal"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-xs">Code</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-xs">Position Title (EN/TH)</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-xs">Department</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-xs">Reports To (EN/TH)</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-center text-xs">Level</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-center text-xs">Headcount</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-center text-xs">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPositions.map(pos => (
                                    <tr key={pos.id} className="hover:bg-brandTeal/5 transition-colors group">
                                        <td className="p-4 font-bold text-brandDeepBlue text-xs font-mono">{pos.code}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-sidebarBg text-sm">{pos.title}</div>
                                            <div className="text-xs text-gray-500 font-medium font-sans">{pos.titleTh || '-'}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200 font-bold">{pos.dept}</span>
                                        </td>
                                        <td className="p-4">
                                            {getParent(pos.parentId) ? (
                                                <>
                                                    <div className="text-sm text-gray-600 font-bold">{getParent(pos.parentId)?.title}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{getParent(pos.parentId)?.titleTh || '-'}</div>
                                                </>
                                            ) : (
                                                <div className="text-sm text-gray-400 italic font-mono">-</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center text-gray-500 font-mono font-bold text-xs">{pos.level}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${pos.current < pos.plan ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {pos.current} / {pos.plan}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => openModal(pos)} className="text-gray-400 hover:text-brandBlue"><Edit className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: MANPOWER PLANNING */}
        {currentView === 'manpower' && (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-sidebarBg">Manpower Planning</h2>
                        <p className="text-sm text-brandMuted">Headcount analysis and budget estimation.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="text-right">
                            <p class="text-[10px] text-gray-500 uppercase font-bold">Total Gap Cost</p>
                            <p className="text-lg font-bold text-brandRed">฿ {totalGapCost.toLocaleString()}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Vacancy Rate</p>
                            <p className="text-lg font-bold text-brandOrange">{vacancyRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-xs">Department</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-xs">Position (EN/TH)</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-center text-xs">Current</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-center text-brandBlue text-xs">Target (Plan)</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-center text-xs">Gap</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-right text-xs">Avg. Salary</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-right text-xs">Est. Cost (Gap)</th>
                                    <th className="p-4 font-bold text-gray-500 uppercase text-center text-xs">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {positions.map(pos => (
                                    <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-brandDeepBlue text-xs">{pos.dept}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-sidebarBg text-sm">{pos.title}</div>
                                            <div className="text-[10px] text-gray-500">{pos.titleTh}</div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-xs">{pos.current}</td>
                                        <td className="p-4 text-center font-bold text-brandBlue bg-blue-50/50 text-xs">{pos.plan}</td>
                                        <td className="p-4 text-center font-bold text-xs">
                                            <span className={pos.plan - pos.current > 0 ? 'text-red-500' : 'text-green-500'}>
                                                {pos.plan - pos.current > 0 ? '-' : '+'}{Math.abs(pos.plan - pos.current)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-500 text-xs">{pos.salary.toLocaleString()}</td>
                                        <td className="p-4 text-right font-bold text-gray-700 text-xs">
                                            {((Math.max(0, pos.plan - pos.current)) * pos.salary).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            {pos.current < pos.plan ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">Hiring</span>
                                            ) : pos.current > pos.plan ? (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">Over</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Full</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* ADD/EDIT MODAL */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Position' : 'Add Position'}
        icon={PlusCircle}
        size="md"
      >
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position Code</label>
                    <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none" placeholder="e.g. CEO-001" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                    <select value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none">
                        {MOCK_DEPARTMENTS.map(d => (
                            <option key={d.id} value={d.code}>{d.code} : {d.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position Title (EN)</label>
                    <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none" placeholder="e.g. HR Manager" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ชื่อตำแหน่ง (TH)</label>
                    <input type="text" value={form.titleTh} onChange={e => setForm({...form, titleTh: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none font-sans" placeholder="e.g. ผู้จัดการฝ่ายบุคคล" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reports To (Parent Position)</label>
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={parentSearch} onChange={e => setParentSearch(e.target.value)} placeholder="Filter parent by name or code..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brandTeal transition-colors" />
                </div>
                <select value={form.parentId || ''} onChange={e => setForm({...form, parentId: e.target.value ? Number(e.target.value) : null})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none">
                    <option value="">None (Top Level)</option>
                    {filteredParentOptions.map(p => (
                        <option key={p.id} value={p.id}>{p.code} : {p.title}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label>
                    <select value={form.level} onChange={e => setForm({...form, level: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none">
                        {MOCK_LEVELS.map(l => (
                            <option key={l.id} value={l.value}>{l.value} - {l.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current HC</label>
                    <input type="number" value={form.current} onChange={e => setForm({...form, current: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan HC</label>
                    <input type="number" value={form.plan} onChange={e => setForm({...form, plan: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Avg. Salary (Est.)</label>
                <input type="number" value={form.salary} onChange={e => setForm({...form, salary: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none" />
            </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={savePosition} className="px-6 py-2 bg-brandDeepBlue text-white text-sm font-bold rounded-lg shadow hover:bg-brandBlue">Save</button>
        </div>
      </BaseModal>

      {/* IMPORT MODAL */}
      <BaseModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Positions"
        icon={FileSpreadsheet}
        enableDragDrop={true}
        onDrop={handleCSVUpload}
      >
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600"><HelpCircle size={18} /></div>
                <div>
                    <h4 className="text-sm font-bold text-blue-800 uppercase mb-1">CSV Format Guide</h4>
                    <p className="text-xs text-blue-600 mb-2">Ensure your CSV file matches these headers:</p>
                    <div className="flex flex-wrap gap-2">
                        {['code', 'title_en', 'title_th', 'department', 'level', 'current_hc', 'plan_hc', 'reports_to_code'].map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white rounded border border-blue-200 text-[10px] font-mono text-blue-700">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {!previewData.length ? (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => document.getElementById('posCsvInput')?.click()}>
                    <input type="file" id="posCsvInput" accept=".csv" className="hidden" onChange={(e) => e.target.files && handleCSVUpload(Array.from(e.target.files))} />
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-brandTeal" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700">Click to Upload CSV</h4>
                    <p className="text-sm text-gray-500">or drag and drop file here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-brandDeepBlue">Preview ({previewData.length} records)</h4>
                        <button onClick={() => setPreviewData([])} className="text-xs text-red-500 hover:underline font-bold">Remove File</button>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Code</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Title</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Dept</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Parent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {previewData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 text-xs font-mono font-bold">{row.code}</td>
                                        <td className="p-3 text-xs">{row.title}</td>
                                        <td className="p-3 text-xs">{row.dept}</td>
                                        <td className="p-3 text-xs">{row.reports_to_code}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-500 text-xs font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={processImport} className="px-6 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow hover:bg-green-700">Confirm Import</button>
                    </div>
                </div>
            )}
        </div>
      </BaseModal>

      {/* GUIDE SLIDE-OVER */}
      {showGuide && (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="px-6 py-4 border-b bg-sidebarBg text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2 text-lg"><BookOpen className="w-5 h-5 text-brandGold" /> คู่มือการใช้งาน</h3>
                    <button onClick={() => setShowGuide(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
                    <div>
                        <h4 className="text-brandTeal font-bold text-lg mb-2">1. การเพิ่มตำแหน่ง (Add Position)</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                            <li><strong>Code:</strong> รหัสตำแหน่ง (เช่น CEO-001)</li>
                            <li><strong>Title:</strong> ชื่อตำแหน่งทั้งภาษาไทยและอังกฤษ</li>
                            <li><strong>Department:</strong> เลือกหน่วยงาน</li>
                            <li><strong>Reports To:</strong> เลือกหัวหน้างานโดยตรง (ค้นหาได้)</li>
                        </ul>
                    </div>
                    <div className="h-px bg-gray-100"></div>
                    <div>
                        <h4 className="text-brandTeal font-bold text-lg mb-2">2. การคำนวณ Manpower</h4>
                        <p className="text-sm text-gray-600 mb-2">ในแท็บ <strong>MANPOWER</strong> ระบบจะคำนวณ:</p>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                            <li><strong>Gap:</strong> ส่วนต่างระหว่าง Plan และ Current</li>
                            <li><strong>Est. Cost:</strong> งบประมาณที่ต้องใช้เพิ่ม (Gap * Salary)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default PositionMaster;
