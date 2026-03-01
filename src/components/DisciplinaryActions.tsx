import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, FolderOpen, Archive, Gavel, FileWarning, Clock, UserX, 
  AlertCircle, Search, Edit3, Eye, Printer, Save, X, PlusCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
type RoleType = 'HR' | 'Manager' | 'Staff';
type SeverityType = 'Minor' | 'Major' | 'Critical';
type StatusType = 'New' | 'Investigation' | 'Pending Approval' | 'Closed';

interface Employee {
  id: string;
  name: string;
  dept: string;
  avatar: string;
  managerId: string;
}

interface Case {
  id: string;
  employeeId: string;
  name: string;
  dept: string;
  type: string;
  date: string;
  severity: SeverityType;
  status: StatusType;
  penalty: string;
  description: string;
  investigation?: string;
  avatar: string;
}

// --- Mock Data ---
const MOCK_EMPLOYEES: Employee[] = [
  { id: 'EMP001', name: 'Somchai Jaidee', dept: 'Sales', avatar: 'https://i.pravatar.cc/150?img=12', managerId: 'EMP004' },
  { id: 'EMP002', name: 'Alice Smith', dept: 'IT', avatar: 'https://i.pravatar.cc/150?img=9', managerId: 'EMP001' },
  { id: 'EMP003', name: 'John Doe', dept: 'Production', avatar: 'https://i.pravatar.cc/150?img=3', managerId: 'EMP001' },
  { id: 'EMP004', name: 'Mary Jane', dept: 'HR', avatar: 'https://i.pravatar.cc/150?img=5', managerId: '' }
];

const MOCK_CASES: Case[] = [
  { id: 'CASE-24001', employeeId: 'EMP003', name: 'John Doe', dept: 'Production', type: 'Late Arrival / Absenteeism', date: '2024-01-10', severity: 'Minor', status: 'Closed', penalty: 'Verbal Warning', description: 'Late more than 30 mins 3 times this week.', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 'CASE-24002', employeeId: 'EMP001', name: 'Somchai Jaidee', dept: 'Sales', type: 'Misconduct / Policy Violation', date: '2024-01-20', severity: 'Major', status: 'Investigation', penalty: '', description: 'Argument with client.', avatar: 'https://i.pravatar.cc/150?img=12' },
];

const DisciplinaryActions = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'cases' | 'archive'>('dashboard');
  const [roleSelection, setRoleSelection] = useState<RoleType>('HR');
  const [currentRole, setCurrentRole] = useState<RoleType>('HR');
  const [currentUserId, setCurrentUserId] = useState('EMP004');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Data
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [form, setForm] = useState<Partial<Case>>({
    id: '', employeeId: '', date: '', type: '', severity: 'Minor', description: '', investigation: '', status: 'New', penalty: ''
  });

  // --- Computed ---
  const currentUser = useMemo(() => MOCK_EMPLOYEES.find(e => e.id === currentUserId) || { name: 'Admin', dept: 'System' }, [currentUserId]);

  const filteredCases = useMemo(() => {
    let result = cases;

    if (['HR', 'Admin', 'Dev'].includes(currentRole)) {
      // See All
    } else if (currentRole === 'Manager') {
      // See Self AND Subordinates
      const subordinates = MOCK_EMPLOYEES.filter(e => e.managerId === currentUserId).map(e => e.id);
      const allowedIds = [currentUserId, ...subordinates];
      result = result.filter(c => allowedIds.includes(c.employeeId));
    } else {
      // Staff: See Self Only
      result = result.filter(c => c.employeeId === currentUserId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    }

    return result;
  }, [cases, currentRole, currentUserId, searchQuery]);

  const accessibleEmployees = useMemo(() => {
    if (['HR', 'Admin'].includes(currentRole)) return MOCK_EMPLOYEES;
    if (currentRole === 'Manager') {
      return MOCK_EMPLOYEES.filter(e => e.managerId === currentUserId || e.id === currentUserId);
    }
    return [];
  }, [currentRole, currentUserId]);

  const stats = useMemo(() => {
    const viewable = filteredCases;
    return {
      warnings: viewable.filter(c => c.penalty && c.penalty.includes('Warning')).length,
      late: viewable.filter(c => c.type.includes('Late')).length,
      terminations: viewable.filter(c => c.penalty === 'Termination').length,
      active: viewable.filter(c => c.status !== 'Closed').length
    };
  }, [filteredCases]);

  // --- Actions ---
  const switchRole = (role: RoleType) => {
    setCurrentRole(role);
    if (role === 'HR') setCurrentUserId('EMP004');
    else if (role === 'Manager') setCurrentUserId('EMP001');
    else if (role === 'Staff') setCurrentUserId('EMP003');
    setCurrentView('dashboard');
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({ 
      id: `CASE-${new Date().getFullYear()}${Math.floor(Math.random()*1000)}`, 
      employeeId: '', 
      date: new Date().toISOString().split('T')[0], 
      type: 'Late Arrival / Absenteeism', 
      severity: 'Minor', 
      description: '', 
      investigation: '', 
      status: 'New', 
      penalty: '' 
    });
    setShowModal(true);
  };

  const openCaseModal = (c: Case) => {
    setIsEditing(true);
    setForm({ ...c });
    setShowModal(true);
  };

  const saveCase = () => {
    if (!form.employeeId || !form.description) return Swal.fire('Error', 'Please fill required fields.', 'error');
    
    const emp = MOCK_EMPLOYEES.find(e => e.id === form.employeeId);
    if (!emp) return;

    const caseData = { ...form, name: emp.name, dept: emp.dept, avatar: emp.avatar } as Case;

    if (isEditing) {
      setCases(prev => prev.map(c => c.id === form.id ? caseData : c));
    } else {
      setCases(prev => [caseData, ...prev]);
    }
    setShowModal(false);
    Swal.fire('Saved', 'Disciplinary record updated.', 'success');
  };

  const printLetter = () => {
    window.print();
  };

  // --- Helpers ---
  const getSeverityClass = (sev: string) => {
    if (sev === 'Critical') return 'bg-red-100 text-red-700';
    if (sev === 'Major') return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusClass = (status: string) => {
    if (status === 'Closed') return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'Investigation') return 'bg-blue-100 text-blue-700 border border-blue-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  // --- Charts ---
  useEffect(() => {
    if (currentView === 'dashboard') {
      const typeCtx = document.getElementById('typeChart') as HTMLCanvasElement;
      const deptCtx = document.getElementById('deptChart') as HTMLCanvasElement;
      let typeChart: Chart | null = null;
      let deptChart: Chart | null = null;

      const viewableCases = filteredCases;
      const types: Record<string, number> = {};
      const depts: Record<string, number> = {};
      
      viewableCases.forEach(c => {
        types[c.type] = (types[c.type] || 0) + 1;
        depts[c.dept] = (depts[c.dept] || 0) + 1;
      });

      if (typeCtx) {
        typeChart = new Chart(typeCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(types),
            datasets: [{ data: Object.values(types), backgroundColor: ['#D95032', '#F2B705', '#186B8C', '#4F868C', '#D91604'] }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      if (deptCtx) {
        deptChart = new Chart(deptCtx, {
          type: 'bar',
          data: {
            labels: Object.keys(depts),
            datasets: [{ label: 'Cases', data: Object.values(depts), backgroundColor: '#186B8C' }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      return () => {
        if (typeChart) typeChart.destroy();
        if (deptChart) deptChart.destroy();
      };
    }
  }, [currentView, filteredCases]);

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandRed text-white shadow-lg">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">DISCIPLINARY ACTIONS</h1>
              <p className="text-brandRed text-[10px] font-bold uppercase tracking-widest">Violations & Penalties Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right mr-2 hidden md:block">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Viewing As</p>
              <p className="text-xs font-bold text-brandDeepBlue">{currentUser.name} ({currentRole})</p>
            </div>
            <select 
              value={roleSelection} 
              onChange={(e) => {
                setRoleSelection(e.target.value as RoleType);
                switchRole(e.target.value as RoleType);
              }} 
              className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="HR">HR Admin / DEV</option>
              <option value="Manager">Manager (Somchai)</option>
              <option value="Staff">Staff (John Doe)</option>
            </select>
            
            {['HR', 'Admin', 'Dev', 'Manager'].includes(currentRole) && (
              <button onClick={openCreateModal} className="px-4 py-2 bg-brandRed text-white rounded-lg text-xs font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2">
                <FileWarning className="w-4 h-4" /> REPORT VIOLATION
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50">
          <button onClick={() => setCurrentView('dashboard')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'dashboard' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> DASHBOARD
          </button>
          <button onClick={() => setCurrentView('cases')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'cases' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <FolderOpen className="w-4 h-4" /> CASE LIST
          </button>
          {['HR', 'Admin', 'Dev'].includes(currentRole) && (
            <button onClick={() => setCurrentView('archive')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'archive' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
              <Archive className="w-4 h-4" /> ARCHIVE
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-white p-6">
        
        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-brandRed">
                  <FolderOpen size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">Active Cases</p>
                    <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-sidebarBg">{stats.active}</h4>
                    <p className="text-[10px] text-red-500 font-medium mt-2 flex items-center gap-1 truncate">
                      <AlertCircle size={12} /> Require Action
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-brandRed/10">
                    <FolderOpen size={24} className="text-brandRed" />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-brandOrange">
                  <FileWarning size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">Warning Letters</p>
                    <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-sidebarBg">{stats.warnings}</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-2 flex items-center gap-1 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-brandOrange"></span> Issued this year
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-brandOrange/10">
                    <FileWarning size={24} className="text-brandOrange" />
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-brandGold">
                  <Clock size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">Late Arrivals</p>
                    <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-sidebarBg">{stats.late}</h4>
                    <p className="text-[10px] text-brandGold font-medium mt-2 flex items-center gap-1 truncate">
                      Top Violation Issue
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-brandGold/10">
                    <Clock size={24} className="text-brandGold" />
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-gray-800">
                  <UserX size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">Terminations</p>
                    <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-sidebarBg">{stats.terminations}</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-2 flex items-center gap-1 truncate">
                      Due to misconduct
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-gray-100">
                    <UserX size={24} className="text-gray-800" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Violations by Type</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="typeChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Cases by Department</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="deptChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CASE LIST */}
        {currentView === 'cases' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Active Cases</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-brandRed" 
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Case ID</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Violation Type</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Severity</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCases.map(c => (
                    <tr key={c.id} className="hover:bg-red-50/30 transition-colors cursor-pointer" onClick={() => openCaseModal(c)}>
                      <td className="p-4 text-xs font-mono font-bold text-brandDeepBlue">{c.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img src={c.avatar} className="w-full h-full object-cover" alt={c.name} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-sidebarBg">{c.name}</div>
                            <div className="text-[10px] text-gray-400">{c.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-medium">{c.type}</td>
                      <td className="p-4 text-xs text-gray-500">{c.date}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getSeverityClass(c.severity)}`}>{c.severity}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${getStatusClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-gray-400 hover:text-brandRed" title="View/Edit Case">
                          {['HR', 'Admin', 'Dev', 'Manager'].includes(currentRole) ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 italic">No cases found for your access level.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: ARCHIVE */}
        {currentView === 'archive' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Archive className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-bold">Closed Cases Archive</h3>
            <p className="text-sm">Historical records accessible by HR/Admin only.</p>
          </div>
        )}

      </main>

      {/* CREATE/EDIT CASE MODAL */}
      <BaseModal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? `Manage Case: ${form.id}` : 'Report New Violation'} icon={FileWarning} size="lg">
        <div className="p-6 bg-gray-50">
          {currentRole === 'Staff' ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="p-3 bg-red-50 border border-red-100 rounded text-red-800 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> You are viewing your disciplinary record.
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Incident</label>
                <p className="text-sm text-gray-800">{form.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label><p>{form.date}</p></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Penalty</label><p className="font-bold text-brandRed">{form.penalty || 'Pending'}</p></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Case Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Incident Information</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee</label>
                      <select 
                        value={form.employeeId} 
                        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed"
                        disabled={isEditing}
                      >
                        <option value="">Select Employee</option>
                        {accessibleEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Incident Date</label>
                      <input 
                        type="date" 
                        value={form.date} 
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Violation Type</label>
                      <select 
                        value={form.type} 
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed"
                      >
                        <option>Late Arrival / Absenteeism</option>
                        <option>Insubordination</option>
                        <option>Misconduct / Policy Violation</option>
                        <option>Performance Issues</option>
                        <option>Theft / Fraud</option>
                        <option>Harassment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity Level</label>
                      <select 
                        value={form.severity} 
                        onChange={(e) => setForm({ ...form, severity: e.target.value as SeverityType })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed"
                      >
                        <option value="Minor">Minor</option>
                        <option value="Major">Major</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description of Incident</label>
                    <textarea 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed" 
                      placeholder="Detail what happened..."
                    ></textarea>
                  </div>
                </div>

                {isEditing && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Investigation & Notes</h4>
                    <textarea 
                      value={form.investigation} 
                      onChange={(e) => setForm({ ...form, investigation: e.target.value })}
                      rows={4} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed mb-2" 
                      placeholder="HR investigation notes, employee statement..."
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Right: Action & Status */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Case Status</h4>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value as StatusType })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed mb-4 font-bold text-brandDeepBlue"
                  >
                    <option value="New">New</option>
                    <option value="Investigation">Under Investigation</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Closed">Closed</option>
                  </select>
                  
                  {isEditing && (
                    <div>
                      <label className="block text-xs font-bold text-red-600 uppercase mb-1">Disciplinary Action</label>
                      <select 
                        value={form.penalty} 
                        onChange={(e) => setForm({ ...form, penalty: e.target.value })}
                        className="w-full bg-gray-50 border border-red-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed mb-4"
                      >
                        <option value="">- Select Penalty -</option>
                        <option value="Verbal Warning">Verbal Warning</option>
                        <option value="Written Warning">Written Warning</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Termination">Termination</option>
                        <option value="No Action">No Action (Cleared)</option>
                      </select>
                      
                      {form.penalty && form.penalty !== 'No Action' && (
                        <button onClick={() => setShowLetterModal(true)} className="w-full py-2 bg-brandRed text-white text-xs font-bold rounded-lg shadow-md hover:bg-red-700 flex items-center justify-center gap-2">
                          <Printer className="w-4 h-4" /> Generate Warning Letter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {currentRole !== 'Staff' && (
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
            <button onClick={saveCase} className="px-8 py-2.5 bg-brandDeepBlue text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Case
            </button>
          </div>
        )}
      </BaseModal>

      {/* LETTER PREVIEW MODAL */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLetterModal(false)}></div>
          <div className="bg-gray-100 w-full h-full p-8 flex flex-col items-center overflow-auto relative z-10">
            <div className="flex justify-between w-full max-w-[210mm] mb-4 print:hidden">
              <h2 className="text-white font-bold text-lg">Document Preview</h2>
              <button onClick={() => setShowLetterModal(false)} className="text-white hover:text-red-300"><X className="w-6 h-6" /></button>
            </div>

            <div id="printable-letter" className="bg-white w-[210mm] min-h-[297mm] p-[25mm] mx-auto shadow-2xl relative text-gray-800 font-serif leading-relaxed">
              <div className="flex justify-between items-start mb-12">
                <h1 className="text-2xl font-bold text-black uppercase">
                  {form.penalty === 'Termination' ? 'Termination Letter' : 'Warning Letter'}
                </h1>
                <div className="text-right text-sm">
                  <p className="font-bold">HR MASTER CO., LTD.</p>
                  <p>123 Business Road, Bangkok</p>
                </div>
              </div>

              <div className="mb-8 text-sm">
                <p><strong>Date:</strong> {new Date().toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'})}</p>
                <p className="mt-2"><strong>To:</strong> {MOCK_EMPLOYEES.find(e => e.id === form.employeeId)?.name}</p>
                <p><strong>Department:</strong> {MOCK_EMPLOYEES.find(e => e.id === form.employeeId)?.dept}</p>
              </div>

              <div className="mb-6">
                <p className="mb-4"><strong>Subject: {form.penalty} - {form.type}</strong></p>
                <p className="mb-4 text-justify">
                  This letter serves as a formal {form.penalty?.toLowerCase()} regarding your conduct. On <strong>{form.date}</strong>, it was reported that you were involved in an incident of <strong>{form.type}</strong>.
                </p>
                <p className="mb-4 text-justify"><strong>Description of Incident:</strong><br/>{form.description}</p>
                {form.investigation && <p className="mb-4 text-justify"><strong>Investigation Findings:</strong><br/>{form.investigation}</p>}
                <p className="mb-4 text-justify">
                  This behavior is in violation of the company's code of conduct. We expect immediate and sustained improvement. Further violations may result in more severe disciplinary action, up to and including termination of employment.
                </p>
              </div>

              <div className="mt-16 flex justify-between">
                <div className="text-center">
                  <div className="border-b border-black w-48 mb-2"></div>
                  <p className="text-xs">HR Manager</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-black w-48 mb-2"></div>
                  <p className="text-xs">Employee Acknowledgement</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4 print:hidden">
              <button onClick={printLetter} className="px-8 py-3 bg-brandDeepBlue text-white font-bold rounded-lg shadow-lg hover:bg-brandBlue flex items-center gap-2">
                <Printer className="w-5 h-5" /> Print
              </button>
              <button onClick={() => setShowLetterModal(false)} className="px-8 py-3 bg-white text-gray-700 font-bold rounded-lg shadow hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DisciplinaryActions;
