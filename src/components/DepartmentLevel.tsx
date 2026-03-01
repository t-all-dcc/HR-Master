import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Building2, Layers, ArrowRightCircle, HelpCircle, 
  PlusCircle, CornerDownRight, Edit, Trash2, X, BookOpen
} from 'lucide-react';
import Swal from 'sweetalert2';
import BaseModal from './BaseModal';

// --- Types ---
type UnitType = 'Division' | 'Department' | 'Section';

interface OrgUnit {
  id: number;
  type: UnitType;
  parentId: number | null;
  code: string;
  name: string;
}

interface JobLevel {
  id: number;
  value: number;
  name: string;
  desc: string;
}

// --- Mock Data ---
const DEFAULT_ORG_UNITS: OrgUnit[] = [
  // --- DIVISIONS ---
  { id: 1, type: 'Division', parentId: null, code: 'ADM', name: 'Administration Division' },
  { id: 2, type: 'Division', parentId: null, code: 'OPS', name: 'Operations Division' },

  // --- DEPARTMENTS under ADMINISTRATION (ADM) ---
  { id: 11, type: 'Department', parentId: 1, code: 'HRD', name: 'Human Resources' },
  { id: 12, type: 'Department', parentId: 1, code: 'FNA', name: 'Finance & Accounting' },
  { id: 13, type: 'Department', parentId: 1, code: 'ITS', name: 'Information Technology' },
  { id: 14, type: 'Department', parentId: 1, code: 'PUR', name: 'Purchasing Dept' },

  // Sections under HRD
  { id: 111, type: 'Section', parentId: 11, code: 'REC', name: 'Recruitment' },
  { id: 112, type: 'Section', parentId: 11, code: 'PAY', name: 'Payroll & Benefits' },
  { id: 113, type: 'Section', parentId: 11, code: 'ERL', name: 'Employee Relations' },

  // Sections under FNA
  { id: 121, type: 'Section', parentId: 12, code: 'ACC', name: 'Accounting' },
  { id: 122, type: 'Section', parentId: 12, code: 'FIN', name: 'Finance & Treasury' },

  // Sections under ITS
  { id: 131, type: 'Section', parentId: 13, code: 'INF', name: 'IT Infrastructure' },
  { id: 132, type: 'Section', parentId: 13, code: 'DEV', name: 'Software Development' },

  // Sections under PUR
  { id: 141, type: 'Section', parentId: 14, code: 'SRC', name: 'Sourcing' },
  { id: 142, type: 'Section', parentId: 14, code: 'PRC', name: 'Procurement' },

  // --- DEPARTMENTS under OPERATIONS (OPS) ---
  { id: 21, type: 'Department', parentId: 2, code: 'PRD', name: 'Production Dept' },
  { id: 22, type: 'Department', parentId: 2, code: 'QAD', name: 'Quality Assurance' },
  { id: 23, type: 'Department', parentId: 2, code: 'ENG', name: 'Engineering & Maint.' },
  { id: 24, type: 'Department', parentId: 2, code: 'LOG', name: 'Warehouse & Logistics' },

  // Sections under PRD
  { id: 211, type: 'Section', parentId: 21, code: 'PRE', name: 'Pre-Processing' },
  { id: 212, type: 'Section', parentId: 21, code: 'PRO', name: 'Processing Line' },
  { id: 213, type: 'Section', parentId: 21, code: 'PKG', name: 'Packaging' },

  // Sections under QAD
  { id: 221, type: 'Section', parentId: 22, code: 'LAB', name: 'QA Laboratory' },
  { id: 222, type: 'Section', parentId: 22, code: 'QCS', name: 'QC Line Inspection' },

  // Sections under ENG
  { id: 231, type: 'Section', parentId: 23, code: 'MNT', name: 'Maintenance' },
  { id: 232, type: 'Section', parentId: 23, code: 'UTL', name: 'Utilities' },

  // Sections under LOG
  { id: 241, type: 'Section', parentId: 24, code: 'WHS', name: 'Warehouse' },
  { id: 242, type: 'Section', parentId: 24, code: 'SHP', name: 'Shipping' }
];

const DEFAULT_LEVELS: JobLevel[] = [
  { id: 1, value: 1, name: 'Executive (L1)', desc: 'Top Management (CEO, MD)' },
  { id: 2, value: 2, name: 'Division Head (L2)', desc: 'Executive Management (C-Level, VP, GM)' },
  { id: 3, value: 3, name: 'Department Head (L3)', desc: 'Senior Management (Director, Manager)' },
  { id: 4, value: 4, name: 'Section Head (L4)', desc: 'Middle Management (Asst. Mgr, Superintendent)' },
  { id: 5, value: 5, name: 'Supervisor (L5)', desc: 'Frontline Management (Supervisor, Foreman)' },
  { id: 6, value: 6, name: 'Leader (L6)', desc: 'Team Leader / Senior Staff' },
  { id: 7, value: 7, name: 'Officer / Specialist / Operator (L7)', desc: 'Professional Staff / Skilled Operator' },
  { id: 8, value: 8, name: 'Worker (L8)', desc: 'General Worker (Non-skill)' }
];

const DepartmentLevel = () => {
  const [currentView, setCurrentView] = useState<'structure' | 'levels'>('structure');
  const [showGuide, setShowGuide] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Data State
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [levels, setLevels] = useState<JobLevel[]>([]);

  // Forms
  const [orgForm, setOrgForm] = useState<Partial<OrgUnit>>({ type: 'Division', parentId: null, code: '', name: '' });
  const [lvlForm, setLvlForm] = useState<Partial<JobLevel>>({ value: 0, name: '', desc: '' });

  // --- Initialization ---
  useEffect(() => {
    const storedOrg = localStorage.getItem('HR_MASTER_DEPT');
    const storedLvls = localStorage.getItem('HR_MASTER_LEVEL');

    if (storedOrg) {
      setOrgUnits(JSON.parse(storedOrg));
    } else {
      setOrgUnits(DEFAULT_ORG_UNITS);
      localStorage.setItem('HR_MASTER_DEPT', JSON.stringify(DEFAULT_ORG_UNITS));
    }

    if (storedLvls) {
      setLevels(JSON.parse(storedLvls));
    } else {
      setLevels(DEFAULT_LEVELS);
      localStorage.setItem('HR_MASTER_LEVEL', JSON.stringify(DEFAULT_LEVELS));
    }
  }, []);

  const saveData = () => {
    localStorage.setItem('HR_MASTER_DEPT', JSON.stringify(orgUnits));
    localStorage.setItem('HR_MASTER_LEVEL', JSON.stringify(levels));
  };

  const resetToDefault = () => {
    if(window.confirm('Reset all data to default factory structure? This will clear current changes.')) {
      setOrgUnits(DEFAULT_ORG_UNITS);
      setLevels(DEFAULT_LEVELS);
      localStorage.setItem('HR_MASTER_DEPT', JSON.stringify(DEFAULT_ORG_UNITS));
      localStorage.setItem('HR_MASTER_LEVEL', JSON.stringify(DEFAULT_LEVELS));
    }
  };

  // --- Computed ---
  const sortedOrgUnits = useMemo(() => {
    const result: (OrgUnit & { depth: number })[] = [];
    const map = new Map<number, OrgUnit & { children: any[] }>();
    
    orgUnits.forEach(u => map.set(u.id, { ...u, children: [] }));
    
    const roots: any[] = [];
    orgUnits.forEach(u => {
      const node = map.get(u.id);
      if (u.parentId) {
        const parent = map.get(u.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });

    const traverse = (node: any, depth = 0) => {
      node.depth = depth;
      result.push(node);
      node.children.sort((a: any, b: any) => a.code.localeCompare(b.code));
      node.children.forEach((child: any) => traverse(child, depth + 1));
    };

    roots.sort((a, b) => a.code.localeCompare(b.code));
    roots.forEach(root => traverse(root));
    return result;
  }, [orgUnits]);

  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.value - b.value), [levels]);

  // --- Helpers ---
  const getTypeBadgeClass = (type: UnitType) => {
    if (type === 'Division') return 'bg-brandDeepBlue text-white';
    if (type === 'Department') return 'bg-brandTeal text-white';
    return 'bg-brandMuted text-white';
  };

  const getParentType = (currentType: UnitType): UnitType | 'None' => {
    if (currentType === 'Department') return 'Division';
    if (currentType === 'Section') return 'Department';
    return 'None';
  };

  const getPotentialParents = (currentType: UnitType) => {
    const targetType = getParentType(currentType);
    return orgUnits.filter(u => u.type === targetType).sort((a,b) => a.code.localeCompare(b.code));
  };

  const getUnitCode = (id: number) => orgUnits.find(x => x.id === id)?.code || '???';
  const getUnitName = (id: number) => orgUnits.find(x => x.id === id)?.name || 'Unknown';

  const suggestCode = (name: string) => {
    if (isEditing || !name) return;
    let cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setOrgForm(prev => ({ ...prev, code: cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X') }));
  };

  // --- Actions ---
  const openOrgModal = (unit?: OrgUnit) => {
    if (unit) { 
      setIsEditing(true); 
      setOrgForm({ ...unit }); 
    } else { 
      setIsEditing(false); 
      setOrgForm({ id: Date.now(), type: 'Division', parentId: null, code: '', name: '' }); 
    }
    setShowOrgModal(true);
  };

  const saveOrgUnit = () => {
    if (!orgForm.name) return Swal.fire('Error', 'Name required', 'error');
    if (orgForm.code?.length !== 3) return Swal.fire('Error', 'Code must be 3 characters', 'error');
    
    if (isEditing) {
      setOrgUnits(prev => prev.map(u => u.id === orgForm.id ? { ...orgForm } as OrgUnit : u));
    } else {
      if (orgUnits.some(u => u.code === orgForm.code)) return Swal.fire('Error', 'Duplicate Code', 'error');
      setOrgUnits(prev => [...prev, { ...orgForm } as OrgUnit]);
    }
    saveData();
    setShowOrgModal(false);
    Swal.fire('Saved', 'Unit saved', 'success');
  };

  const deleteUnit = (id: number) => {
    if (orgUnits.some(u => u.parentId === id)) return Swal.fire('Cannot Delete', 'Has child units.', 'error');
    Swal.fire({ title: 'Delete Unit?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes' }).then((result) => {
      if (result.isConfirmed) {
        setOrgUnits(prev => prev.filter(u => u.id !== id));
        saveData();
      }
    });
  };

  const openLevelModal = (lvl?: JobLevel) => {
    if (lvl) {
      setIsEditing(true);
      setLvlForm({ ...lvl });
    } else {
      setIsEditing(false);
      setLvlForm({ id: Date.now(), value: levels.length + 1, name: '', desc: '' });
    }
    setShowLevelModal(true);
  };

  const saveLevel = () => {
    if (!lvlForm.name) return Swal.fire('Error', 'Name required', 'error');
    if (isEditing) {
      setLevels(prev => prev.map(l => l.id === lvlForm.id ? { ...lvlForm } as JobLevel : l));
    } else {
      setLevels(prev => [...prev, { ...lvlForm } as JobLevel]);
    }
    saveData();
    setShowLevelModal(false);
    Swal.fire('Saved', 'Level saved', 'success');
  };

  const deleteLevel = (id: number) => {
    Swal.fire({ title: 'Delete Level?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes' }).then((result) => {
      if (result.isConfirmed) {
        setLevels(prev => prev.filter(l => l.id !== id));
        saveData();
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-4 flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md border-b border-brandTeal/10 shrink-0 z-20 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-brandRed to-sidebarBg text-white shadow-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebarBg tracking-tight">ORG MASTER CONFIG</h1>
            <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Structure & Levels</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          <div className="flex bg-white border border-gray-100 p-1 rounded-lg shadow-sm overflow-x-auto">
            <button onClick={() => setCurrentView('structure')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'structure' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
              <Building2 className="w-4 h-4" /> STRUCTURE
            </button>
            <button onClick={() => setCurrentView('levels')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'levels' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
              <Layers className="w-4 h-4" /> LEVELS
            </button>
          </div>
          <button onClick={() => setShowGuide(true)} className="w-8 h-8 rounded-full bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW: ORG STRUCTURE */}
        {currentView === 'structure' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-sidebarBg">Organization Structure</h2>
                <p className="text-sm text-brandMuted">Factory Model: Division &gt; Department &gt; Section</p>
              </div>
              <div className="flex gap-2">
                <button onClick={resetToDefault} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-300 transition-all">
                  Reset Default
                </button>
                <button onClick={() => openOrgModal()} className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> ADD UNIT
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-bold text-gray-500 uppercase w-32 text-xs">Code (3-Char)</th>
                      <th className="p-4 font-bold text-gray-500 uppercase w-32 text-xs">Type</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-xs">Unit Name</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-xs">Parent Unit</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-center w-24 text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedOrgUnits.map(unit => (
                      <tr key={unit.id} className="hover:bg-brandTeal/5 transition-colors group">
                        <td className="p-4 font-mono font-bold text-brandDeepBlue text-xs">{unit.code}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${getTypeBadgeClass(unit.type)}`}>{unit.type}</span>
                        </td>
                        <td className="p-4 font-bold text-sidebarBg text-sm">
                          <div style={{ paddingLeft: `${unit.depth * 20}px` }} className="flex items-center gap-2">
                            {unit.depth > 0 && <CornerDownRight className="w-4 h-4 text-gray-300" />}
                            {unit.name}
                          </div>
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {unit.parentId ? (
                            <span className="flex items-center gap-1">
                              <span className="font-mono font-bold text-gray-400">{getUnitCode(unit.parentId)}</span>
                              {getUnitName(unit.parentId)}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic">- Root -</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openOrgModal(unit)} className="text-gray-400 hover:text-brandBlue"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteUnit(unit.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orgUnits.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 italic">No organization units defined.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: JOB LEVELS */}
        {currentView === 'levels' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-sidebarBg">Job Level Matrix</h2>
                <p className="text-sm text-brandMuted">Define standardized hierarchy levels.</p>
              </div>
              <button onClick={() => openLevelModal()} className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> ADD LEVEL
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-bold text-gray-500 uppercase text-center w-24 text-xs">Level No.</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-xs">Level Name</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-xs">Description</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-center w-24 text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedLevels.map(lvl => (
                      <tr key={lvl.id} className="hover:bg-brandTeal/5 transition-colors">
                        <td className="p-4 text-center">
                          <div className="w-8 h-8 rounded-lg bg-sidebarBg text-brandGold flex items-center justify-center font-bold text-sm shadow mx-auto">
                            {lvl.value}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-sidebarBg text-sm">{lvl.name}</td>
                        <td className="p-4 text-sm text-gray-600">{lvl.desc}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openLevelModal(lvl)} className="text-gray-400 hover:text-brandBlue"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteLevel(lvl.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      </main>

      {/* ORG UNIT MODAL */}
      <BaseModal isOpen={showOrgModal} onClose={() => setShowOrgModal(false)} title={isEditing ? 'Edit Organization Unit' : 'Add Organization Unit'} icon={Building2} size="md">
        <div className="p-6 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['Division', 'Department', 'Section'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setOrgForm(prev => ({ ...prev, type: type as UnitType }))}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors ${orgForm.type === type ? 'bg-brandDeepBlue text-white border-brandDeepBlue' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            {orgForm.type !== 'Division' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Unit ({getParentType(orgForm.type as UnitType)})</label>
                <select 
                  value={orgForm.parentId || ''} 
                  onChange={(e) => setOrgForm(prev => ({ ...prev, parentId: Number(e.target.value) }))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"
                >
                  <option value="">Select Parent...</option>
                  {getPotentialParents(orgForm.type as UnitType).map(parent => (
                    <option key={parent.id} value={parent.id}>{parent.code} : {parent.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code (3-Char)</label>
                <input 
                  type="text" 
                  value={orgForm.code} 
                  onChange={(e) => setOrgForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal font-mono text-center uppercase" 
                  placeholder="MKT" 
                  maxLength={3} 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Name</label>
                <input 
                  type="text" 
                  value={orgForm.name} 
                  onChange={(e) => {
                    setOrgForm(prev => ({ ...prev, name: e.target.value }));
                    suggestCode(e.target.value);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" 
                  placeholder="e.g. Marketing" 
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowOrgModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={saveOrgUnit} className="px-6 py-2 bg-brandDeepBlue text-white text-sm font-bold rounded-lg shadow hover:bg-brandBlue">Save Unit</button>
        </div>
      </BaseModal>

      {/* LEVEL MODAL */}
      <BaseModal isOpen={showLevelModal} onClose={() => setShowLevelModal(false)} title={isEditing ? 'Edit Level' : 'Add Level'} icon={Layers} size="sm">
        <div className="p-6 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level Value (1 = Highest)</label>
              <input 
                type="number" 
                value={lvlForm.value} 
                onChange={(e) => setLvlForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" 
                placeholder="e.g. 1" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level Name</label>
              <input 
                type="text" 
                value={lvlForm.name} 
                onChange={(e) => setLvlForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" 
                placeholder="e.g. C-Level" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
              <input 
                type="text" 
                value={lvlForm.desc} 
                onChange={(e) => setLvlForm(prev => ({ ...prev, desc: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" 
                placeholder="Optional description" 
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowLevelModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={saveLevel} className="px-6 py-2 bg-brandDeepBlue text-white text-sm font-bold rounded-lg shadow">Save</button>
        </div>
      </BaseModal>

      {/* Guide Slide-Over */}
      {showGuide && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-sidebarBg text-white">
              <h3 className="font-bold flex items-center gap-2 text-lg m-0 border-0"><BookOpen className="w-5 h-5 text-brandGold" /> คู่มือการใช้งาน</h3>
              <button onClick={() => setShowGuide(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-600">
              <p className="font-semibold text-brandTeal">หน้านี้ใช้สำหรับกำหนดโครงสร้างพื้นฐานขององค์กร</p>
              
              <h3 className="font-bold text-gray-800 border-b pb-1">1. โครงสร้างองค์กร (Structure)</h3>
              <p>ระบบใช้โครงสร้างแบบ Factory Model แบ่งเป็น 3 ระดับ:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Division (ฝ่าย):</strong> หน่วยงานระดับสูงสุด (Code เช่น ADM, OPS)</li>
                <li><strong>Department (แผนก):</strong> หน่วยงานย่อยภายใต้ Division (เช่น HRD, PRD)</li>
                <li><strong>Section (ส่วน):</strong> หน่วยงานปฏิบัติการย่อย (เช่น REC, MCH)</li>
              </ul>
              <p className="mt-2"><strong>การเพิ่มหน่วยงาน:</strong> กดปุ่ม <strong>+ ADD UNIT</strong> แล้วเลือกประเภทหน่วยงาน ระบบจะแนะนำรหัส (Code) 3 ตัวอักษรให้อัตโนมัติเมื่อพิมพ์ชื่อ</p>
              
              <h3 className="font-bold text-gray-800 border-b pb-1 mt-4">2. ระดับงาน (Job Levels)</h3>
              <p>กำหนดระดับการบังคับบัญชาเพื่อใช้จัดผังองค์กร ค่ามาตรฐานประกอบด้วย:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>L1-L4:</strong> ระดับบริหาร (Executive - Section Head)</li>
                <li><strong>L5:</strong> หัวหน้างาน (Supervisor)</li>
                <li><strong>L6:</strong> หัวหน้าชุด (Leader)</li>
                <li><strong>L7:</strong> เจ้าหน้าที่/วิศวกร (Officer/Specialist)</li>
                <li><strong>L8:</strong> พนักงานปฏิบัติการ (Worker)</li>
              </ul>
              
              <h3 className="font-bold text-gray-800 border-b pb-1 mt-4">3. การรีเซ็ตข้อมูล (Reset)</h3>
              <p>หากต้องการกลับไปใช้ข้อมูลตัวอย่าง ให้กดปุ่ม <strong>Reset Default</strong> ระบบจะล้างข้อมูลทั้งหมดแล้วโหลด Mock Data สำหรับโรงงานอาหารให้ใหม่</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentLevel;
