import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Users, LayoutDashboard, Plus, Settings2, UserCog, 
  Image, Save, ChevronDown, ShoppingCart, Package, Truck, 
  ClipboardList, Factory, ShieldCheck, Wallet, Coins, FileJson, 
  Database, CalendarDays, Settings, Ban, Eye, Edit, CheckSquare, Award
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Types ---
interface PermissionLevel {
  level: number;
  label: string;
  icon: any;
  color: string;
  bg: string;
}

interface User {
  id: number;
  name: string;
  position: string;
  email: string;
  avatar: string;
  isDev?: boolean;
}

interface Module {
  id: string;
  label: string;
  icon: any;
  subItems?: { id: string; label: string }[];
}

// --- Constants ---
const THEME = {
  bgMain: '#F2F0EB',
  red: '#D91604',
  orange: '#D95032',
  gold: '#B8AB89', // Beige/Gold
  teal: '#5A94A7',
  blue: '#879DB5',
  sidebar: '#3F4859',
  text: '#3F4859',
};

const SYSTEM_MODULES: Module[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  {
    id: 'hrm', label: 'HR MANAGEMENT', icon: Users,
    subItems: [
      { id: 'employee_directory', label: 'EMPLOYEE DIRECTORY' },
      { id: 'payroll', label: 'PAYROLL & COMPENSATION' },
      { id: 'time_attendance', label: 'TIME & ATTENDANCE' },
      { id: 'leave_management', label: 'LEAVE MANAGEMENT' },
      { id: 'benefits', label: 'BENEFITS & WELFARE' },
      { id: 'resignation_turnover', label: 'RESIGNATION & TURNOVER' },
      { id: 'disciplinary', label: 'DISCIPLINARY ACTIONS' },
    ]
  },
  {
    id: 'hrd', label: 'HR DEVELOPMENT', icon: Award,
    subItems: [
      { id: 'ojt_training', label: 'OJT TRAINING' },
      { id: 'orientation', label: 'ORIENTATION TRAINING' },
      { id: 'training_plan', label: 'TRAINING PLANNING' },
      { id: 'skill_matrix', label: 'SKILL MATRIX' },
      { id: 'performance_hrd', label: 'PERFORMANCE' },
      { id: 'career_path', label: 'CAREER PATH' },
      { id: 'succession', label: 'SUCCESSION PLAN' },
    ]
  },
  {
    id: 'recruitment', label: 'RECRUITMENT', icon: UserCog,
    subItems: [
      { id: 'manpower_request', label: 'MANPOWER REQUEST' },
      { id: 'job_vacancies', label: 'JOB VACANCIES' },
      { id: 'recruitment_jd', label: 'JOB DESCRIPTION' },
      { id: 'candidate_tracking', label: 'CANDIDATE TRACKING' },
      { id: 'interview_schedule', label: 'INTERVIEW SCHEDULE' },
      { id: 'onboarding', label: 'ONBOARDING' },
    ]
  },
  {
    id: 'labor_relations', label: 'LABOR RELATIONS', icon: ShieldCheck,
    subItems: [
      { id: 'disciplinary_law', label: 'DISCIPLINARY & LABOR LAW' },
      { id: 'company_regulations', label: 'COMPANY REGULATIONS' },
      { id: 'investigation_process', label: 'INVESTIGATION & PUNISHMENT' },
      { id: 'union_grievance', label: 'UNION & GRIEVANCES' },
      { id: 'employee_engagement', label: 'ENGAGEMENT & RELATIONSHIP' },
      { id: 'sports_social', label: 'SPORTS & SOCIAL EVENTS' },
      { id: 'internal_pr', label: 'INTERNAL PR & NEWS' },
      { id: 'external_activities', label: 'EXTERNAL ACTIVITIES' },
    ]
  },
  {
    id: 'analytics', label: 'HR ANALYTICS', icon: ShoppingCart, // Reusing icon for now
    subItems: [
      { id: 'workforce_report', label: 'WORKFORCE REPORT' },
      { id: 'turnover_analysis', label: 'TURNOVER ANALYSIS' },
      { id: 'budget_tracking', label: 'HR BUDGET TRACKING' },
    ]
  },
  {
    id: 'master', label: 'DATA MASTER', icon: Database,
    subItems: [
      { id: 'org_structure', label: 'ORG STRUCTURE' },
      { id: 'position_master', label: 'POSITION MASTER' },
      { id: 'master_jd', label: 'JOB DESCRIPTION' },
      { id: 'branch_master', label: 'BRANCH MASTER' },
    ]
  },
  { id: 'hr_calendar', label: 'HR CALENDAR', icon: CalendarDays },
  {
    id: 'setting', label: 'SETTING', icon: Settings,
    subItems: [
      { id: 'user_permission', label: 'USER PERMISSIONS' },
      { id: 'system_config', label: 'SYSTEM CONFIG' }
    ]
  }
];

const PERMISSION_LEVELS: PermissionLevel[] = [
  { level: 0, label: 'No Access', icon: Ban, color: '#94A3B8', bg: '#F1F5F9' },
  { level: 1, label: 'Viewer', icon: Eye, color: THEME.blue, bg: '#E0F2F1' },
  { level: 2, label: 'Editor', icon: Edit, color: THEME.orange, bg: '#FFF3E0' },
  { level: 3, label: 'Verifier', icon: CheckSquare, color: THEME.teal, bg: '#E0F7FA' },
  { level: 4, label: 'Approver', icon: Award, color: THEME.red, bg: '#FFEBEE' },
];

const MOCK_USERS: User[] = [
  { id: 1, name: 'Somchai Jaidee', position: 'HR Manager', email: 'somchai@hrmaster.com', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Suda Rakdee', position: 'Recruitment Lead', email: 'suda@hrmaster.com', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'Wichai Mechanic', position: 'Training Officer', email: 'wichai@hrmaster.com', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Emily Chen', position: 'Payroll Specialist', email: 'emily@hrmaster.com', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 5, name: 'Admin System', position: 'System Admin', email: 'admin@hrmaster.com', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 998, name: 'T-DCC Developer', position: 'Lead Developer', email: 'tallintelligence.dcc@gmail.com', avatar: 'https://drive.google.com/thumbnail?id=1Z_fRbN9S4aA7OkHb3mlim_t60wIT4huY&sz=w400', isDev: true },
  { id: 999, name: 'T-HO Developer', position: 'Senior Developer', email: 'tallintelligence.ho@gmail.com', avatar: 'https://drive.google.com/thumbnail?id=1H_HIcz3rovDJJBszvPSUoMh2rDayOnmQ&sz=w400', isDev: true }
];

const UserPermissions = () => {
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', position: '', email: '', avatar: '' });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Permissions State
  const [currentPermissions, setCurrentPermissions] = useState<Record<string, number[]>>({ 'dashboard': [1] });
  const [matrixPermissions, setMatrixPermissions] = useState<Record<number, Record<string, number[]>>>(() => {
    const initial: Record<number, Record<string, number[]>> = {};
    MOCK_USERS.forEach(user => {
      initial[user.id] = {};
      const defaultLevels = user.isDev ? [1, 2, 3, 4] : [1];
      SYSTEM_MODULES.forEach(mod => {
        initial[user.id][mod.id] = defaultLevels;
        if (mod.subItems) {
          mod.subItems.forEach(sub => initial[user.id][sub.id] = defaultLevels);
        }
      });
    });
    return initial;
  });

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      position: user.position,
      email: user.email,
      avatar: user.avatar
    });
    setSelectedUserId(user.id);
    const userPerms = matrixPermissions[user.id] || {};
    setCurrentPermissions(JSON.parse(JSON.stringify(userPerms)));
    setIsEditModalOpen(true);
  };

  const handleNewUser = () => {
    setFormData({ name: '', position: '', email: '', avatar: '' });
    setSelectedUserId(null);
    setCurrentPermissions({ 'dashboard': [1] });
    setIsEditModalOpen(true);
  };

  const handlePermissionChange = (menuId: string, level: number) => {
    setCurrentPermissions(prev => {
      const currentLevels = prev[menuId] || [];
      let newLevels;
      if (level === 0) {
        newLevels = [];
      } else {
        if (currentLevels.includes(level)) {
          newLevels = currentLevels.filter(l => l !== level);
        } else {
          newLevels = [...currentLevels, level].filter(l => l !== 0);
        }
      }
      return { ...prev, [menuId]: newLevels };
    });
  };

  const toggleExpand = (moduleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const getPermissionLevels = (menuId: string) => currentPermissions[menuId] || [];
  const getMatrixPermissionLevels = (userId: number, menuId: string) => matrixPermissions[userId]?.[menuId] || [];

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      Swal.fire('Error', 'Please fill in Name and Email', 'error');
      return;
    }
    const userId = selectedUserId || Date.now();
    setMatrixPermissions(prev => ({
      ...prev,
      [userId]: currentPermissions
    }));
    Swal.fire({
      title: 'Saved!',
      text: `Permissions updated for ${formData.name}`,
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    }).then(() => {
      setIsEditModalOpen(false);
    });
  };

  // --- Components ---
  const PermissionToggle: React.FC<{ currentLevels: number[], onChange: (lvl: number) => void }> = ({ currentLevels, onChange }) => (
    <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm gap-1" onClick={(e) => e.stopPropagation()}>
      {PERMISSION_LEVELS.map((p) => {
        const isActive = p.level === 0 
          ? (currentLevels.length === 0 || currentLevels.includes(0))
          : currentLevels.includes(p.level);

        return (
          <button
            key={p.level}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(p.level); }}
            className={`flex items-center justify-center w-7 h-7 rounded transition-all duration-200 relative group cursor-pointer
              ${isActive ? 'shadow-sm scale-105 z-10 ring-1 ring-black/5' : 'hover:bg-gray-50 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}
            `}
            style={{ backgroundColor: isActive ? p.bg : 'transparent' }}
            title={p.label}
            type="button"
          >
            <p.icon size={14} style={{ color: isActive ? p.color : '#64748B' }} />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative z-10 flex-grow p-6 w-full max-w-[1400px] mx-auto flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl text-[#B8AB89] shadow-lg bg-gradient-to-br from-sidebarBg to-brandTeal">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: THEME.sidebar }}>User Permissions</h1>
            <p className="text-xs font-medium uppercase tracking-widest mt-1" style={{ color: THEME.text }}>Access Control & Authorization</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-white/50 p-1 rounded-xl flex gap-1 shadow-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'list' ? 'text-white shadow-md' : 'hover:bg-white/50'}`}
            style={{ 
              backgroundColor: viewMode === 'list' ? THEME.sidebar : 'transparent',
              color: viewMode === 'list' ? THEME.gold : THEME.text
            }}
          >
            <Users size={14} /> User List
          </button>
          <button 
            onClick={() => setViewMode('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'matrix' ? 'text-white shadow-md' : 'hover:bg-white/50'}`}
            style={{ 
              backgroundColor: viewMode === 'matrix' ? THEME.sidebar : 'transparent',
              color: viewMode === 'matrix' ? THEME.gold : THEME.text
            }}
          >
            <LayoutDashboard size={14} /> Summary Matrix
          </button>
          <button 
            onClick={handleNewUser}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 ml-2"
            style={{ backgroundColor: THEME.gold }}
          >
            <Plus size={14} /> Add User
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white/70 backdrop-blur-md border border-white/50 p-0 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[11px] uppercase tracking-wider p-4 pl-6 font-bold bg-gray-50/95 border-b border-gray-200 sticky top-0 z-10" style={{ color: THEME.text }}>User</th>
                  <th className="text-[11px] uppercase tracking-wider p-4 font-bold bg-gray-50/95 border-b border-gray-200 sticky top-0 z-10" style={{ color: THEME.text }}>Position</th>
                  <th className="text-[11px] uppercase tracking-wider p-4 font-bold bg-gray-50/95 border-b border-gray-200 sticky top-0 z-10" style={{ color: THEME.text }}>Email</th>
                  <th className="text-[11px] uppercase tracking-wider p-4 text-center font-bold bg-gray-50/95 border-b border-gray-200 sticky top-0 z-10" style={{ color: THEME.text }}>Role Type</th>
                  <th className="text-[11px] uppercase tracking-wider p-4 text-center font-bold bg-gray-50/95 border-b border-gray-200 sticky top-0 z-10" style={{ color: THEME.text }}>Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200 object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='https://via.placeholder.com/150'}} />
                        <div>
                          <div className="font-bold" style={{ color: THEME.sidebar }}>{user.name}</div>
                          <div className="text-xs font-mono" style={{ color: THEME.text }}>ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium" style={{ color: THEME.sidebar }}>{user.position}</td>
                    <td className="p-4 font-mono text-xs">{user.email}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase`} style={{ 
                        backgroundColor: user.isDev ? `${THEME.gold}20` : '#F3F4F6',
                        color: user.isDev ? THEME.gold : '#6B7280'
                      }}>
                        {user.isDev ? 'Developer' : 'Standard User'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold transition-all shadow-sm hover:text-white"
                        style={{ color: THEME.sidebar }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = THEME.sidebar; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = THEME.sidebar; }}
                      >
                        <Settings2 size={14} /> Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white/70 backdrop-blur-md border border-white/50 p-0 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
          <div className="overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[11px] uppercase tracking-wider p-3 font-bold bg-gray-50/95 border-b border-gray-200 sticky top-0 left-0 z-20 min-w-[200px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]" style={{ color: THEME.text }}>Module / User</th>
                  {MOCK_USERS.map(user => (
                    <th key={user.id} className="text-[11px] uppercase tracking-wider p-3 text-center font-bold bg-gray-50/95 border-b border-gray-200 sticky top-0 z-10 min-w-[100px] hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleEditUser(user)} style={{ color: THEME.text }}>
                      <div className="flex flex-col items-center gap-2 group">
                        <img src={user.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold whitespace-nowrap group-hover:text-[#D4AF37]" style={{ color: THEME.sidebar }}>{user.name.split(' ')[0]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600">
                {SYSTEM_MODULES.map(module => {
                  const isExpanded = expandedModules[module.id];
                  const hasSub = module.subItems && module.subItems.length > 0;
                  return (
                    <React.Fragment key={module.id}>
                      <tr className="bg-gray-50/50 hover:bg-gray-100 transition-colors">
                        <td className="sticky left-0 z-10 bg-[#F9F8F4] p-3 font-bold border-b border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)] cursor-pointer select-none" style={{ color: THEME.sidebar }} onClick={(e) => hasSub && toggleExpand(module.id, e)}>
                          <div className="flex items-center gap-2">
                            <module.icon size={14} style={{ color: THEME.gold }} />
                            {module.label}
                            {hasSub && <ChevronDown size={12} className={`ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: THEME.text }} />}
                          </div>
                        </td>
                        {MOCK_USERS.map(user => {
                          const levels = getMatrixPermissionLevels(user.id, module.id);
                          return (
                            <td key={user.id} className="text-center border-b border-white p-2">
                              <div className="flex justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                                {levels.map(lvl => {
                                  const pInfo = PERMISSION_LEVELS.find(p => p.level === lvl);
                                  if(!pInfo) return null;
                                  return <div key={lvl} className="inline-flex items-center justify-center w-6 h-6 rounded shadow-sm" style={{ backgroundColor: pInfo.bg }} title={pInfo.label}><pInfo.icon size={12} style={{color: pInfo.color}} /></div>;
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      {hasSub && isExpanded && module.subItems?.map(sub => (
                        <tr key={sub.id} className="hover:bg-white transition-colors bg-white/50 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td className="sticky left-0 z-10 bg-white p-3 pl-10 border-b border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{sub.label}</td>
                          {MOCK_USERS.map(user => {
                            const levels = getMatrixPermissionLevels(user.id, sub.id);
                            return (
                              <td key={user.id} className="text-center border-b border-gray-100 p-2">
                                <div className="flex justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                                  {levels.map(lvl => {
                                    const pInfo = PERMISSION_LEVELS.find(p => p.level === lvl);
                                    if(!pInfo) return null;
                                    return <div key={lvl} className="inline-flex items-center justify-center w-6 h-6 rounded shadow-sm" style={{ backgroundColor: pInfo.bg }} title={pInfo.label}><pInfo.icon size={12} style={{color: pInfo.color}} /></div>;
                                  })}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) setIsEditModalOpen(false); }}>
          <div className="bg-[#F9F8F4] w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transform scale-100 transition-transform">
            <div className="flex h-full">
              {/* Left: User Form */}
              <div className="w-1/3 bg-white border-r border-gray-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                <h3 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 border-b border-gray-200 pb-2" style={{ color: THEME.sidebar }}>
                  <UserCog size={16} /> User Details
                </h3>
                
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                    {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='https://via.placeholder.com/150'}} /> : <Image size={32} className="text-gray-300" />}
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: THEME.text }}>Image URL</label>
                    <input type="text" name="avatar" value={formData.avatar} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-2 text-xs border border-transparent outline-none transition-all" style={{ borderColor: 'transparent' }} onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = 'transparent'} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: THEME.text }}>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-2 text-xs border border-transparent outline-none transition-all" style={{ borderColor: 'transparent' }} onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = 'transparent'} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: THEME.text }}>Position</label>
                    <input type="text" name="position" value={formData.position} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-2 text-xs border border-transparent outline-none transition-all" style={{ borderColor: 'transparent' }} onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = 'transparent'} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: THEME.text }}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-2 text-xs border border-transparent outline-none transition-all" style={{ borderColor: 'transparent' }} onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = 'transparent'} />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <button onClick={handleSave} className="w-full text-white py-3 rounded-xl text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg hover:brightness-110" style={{ backgroundColor: THEME.sidebar }}>
                    <Save size={16} /> Save Changes
                  </button>
                  <button onClick={() => setIsEditModalOpen(false)} className="w-full mt-2 text-gray-400 text-xs font-bold uppercase hover:text-red-500 transition-colors">Cancel</button>
                </div>
              </div>

              {/* Right: Permission Tree */}
              <div className="w-2/3 bg-[#F9F8F4] p-6 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4 shrink-0">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: THEME.sidebar }}>Access Rights</h3>
                    <p className="text-xs" style={{ color: THEME.text }}>Configure module permissions for this user.</p>
                  </div>
                  <div className="flex gap-2">
                    {PERMISSION_LEVELS.map(p => (
                      <div key={p.level} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded text-[10px] text-gray-500">
                        <p.icon size={10} style={{color: p.color}} /> {p.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
                  {SYSTEM_MODULES.map((module) => {
                    const isExpanded = expandedModules[module.id];
                    const hasSub = module.subItems && module.subItems.length > 0;
                    return (
                      <div key={module.id} className="bg-white rounded-xl border border-white p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-3 ${hasSub ? 'cursor-pointer select-none' : ''}`} onClick={(e) => hasSub && toggleExpand(module.id, e)}>
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${THEME.sidebar}0D`, color: THEME.sidebar }}><module.icon size={18} /></div>
                            <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-2" style={{ color: THEME.sidebar }}>
                              {module.label} {hasSub && <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: THEME.text }} />}
                            </span>
                          </div>
                          <PermissionToggle currentLevels={getPermissionLevels(module.id)} onChange={(lvl) => handlePermissionChange(module.id, lvl)} />
                        </div>
                        {hasSub && (
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-11 space-y-1 border-l border-gray-200 ml-4 py-1">
                              {module.subItems?.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between py-1.5 pl-4 pr-1 hover:bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: THEME.gold }}></div>
                                    <span className="text-xs font-medium text-gray-600">{sub.label}</span>
                                  </div>
                                  <div className="scale-90 origin-right"><PermissionToggle currentLevels={getPermissionLevels(sub.id)} onChange={(lvl) => handlePermissionChange(sub.id, lvl)} /></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserPermissions;
