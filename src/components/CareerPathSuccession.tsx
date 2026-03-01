import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, GitBranch, Map, Crown, FileCheck2, LayoutDashboard, HelpCircle, 
  ArrowUpRight, Star, AlertTriangle, CheckCircle2, Check, Loader, Lock, Plus, X, Edit
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface Talent {
  id: number;
  name: string;
  position: string;
  dept: string;
  avatar: string;
  perf: string;
  pot: string;
  readiness: string;
  box: number;
}

interface CriticalRole {
  id: number;
  position: string;
  dept: string;
  holder: string;
  holderImg: string;
  impact: string;
  hasSuccessor: boolean;
  successorCount: number;
}

// --- Mock Data ---
const MOCK_CRITICAL_ROLES: CriticalRole[] = [
  { id: 1, position: 'Sales Director', dept: 'Sales', holder: 'Somchai J.', holderImg: 'https://i.pravatar.cc/150?img=12', impact: 'High', hasSuccessor: true, successorCount: 2 },
  { id: 2, position: 'HR Director', dept: 'HR', holder: 'Sarah Connor', holderImg: 'https://i.pravatar.cc/150?img=5', impact: 'High', hasSuccessor: false, successorCount: 0 },
  { id: 3, position: 'IT Director', dept: 'IT', holder: 'Ken Tech', holderImg: 'https://i.pravatar.cc/150?img=3', impact: 'Medium', hasSuccessor: true, successorCount: 1 },
];

const MOCK_TALENTS: Talent[] = [
  { id: 101, name: 'David K.', position: 'Sales Mgr', dept: 'Sales', avatar: 'https://i.pravatar.cc/150?img=33', perf: 'High', pot: 'High', readiness: 'Ready Now', box: 3 },
  { id: 102, name: 'Alice S.', position: 'Dev Mgr', dept: 'IT', avatar: 'https://i.pravatar.cc/150?img=9', perf: 'High', pot: 'Medium', readiness: '1-2 Years', box: 6 },
  { id: 103, name: 'Bob B.', position: 'HR Sup', dept: 'HR', avatar: 'https://i.pravatar.cc/150?img=60', perf: 'Medium', pot: 'Medium', readiness: '3-5 Years', box: 5 },
  { id: 104, name: 'Mary M.', position: 'Acc Mgr', dept: 'Finance', avatar: 'https://i.pravatar.cc/150?img=20', perf: 'High', pot: 'Low', readiness: 'Not Ready', box: 9 },
  { id: 105, name: 'John J.', position: 'Engineer', dept: 'Prod', avatar: 'https://i.pravatar.cc/150?img=8', perf: 'Medium', pot: 'High', readiness: '1-2 Years', box: 2 },
];

const CareerPathSuccession = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'framework' | 'my_path' | 'succession' | 'idp'>('dashboard');
  const [userRole, setUserRole] = useState('HR');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState({ title: '' });
  const [selectedDept, setSelectedDept] = useState('Sales');
  
  // Refs for Charts
  const readinessChartRef = useRef<HTMLCanvasElement>(null);
  const hiringChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  // --- Actions ---
  const requestTraining = () => {
    Swal.fire({
      title: 'Request Training?',
      text: 'Add "Strategic Leadership" to your IDP and request approval?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#186B8C',
      confirmButtonText: 'Yes, Enroll'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success', 'Added to your IDP. Pending Manager Approval.', 'success');
      }
    });
  };

  const showRoleDetails = (roleTitle: string) => {
    setSelectedRole({ title: roleTitle });
    setShowRoleModal(true);
  };

  const openSuccessorModal = () => {
    Swal.fire('Succession Plan', 'Feature to nominate a successor for a key position.', 'info');
  };

  // --- Charts ---
  useEffect(() => {
    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    if (currentView === 'dashboard') {
      if (readinessChartRef.current) {
        const ctx = readinessChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Ready Now', 'Ready in 1-2 Yrs', 'Ready in 3-5 Yrs', 'Not Ready'],
              datasets: [{ data: [15, 30, 25, 30], backgroundColor: ['#10B981', '#F2B705', '#16778C', '#EF4444'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          }));
        }
      }
      if (hiringChartRef.current) {
        const ctx = hiringChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              datasets: [
                { label: 'Internal Promote', data: [5, 8, 4, 6], backgroundColor: '#186B8C' },
                { label: 'External Hire', data: [2, 3, 5, 2], backgroundColor: '#D95032' }
              ]
            },
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
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandBlue text-brandGold shadow-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">CAREER PATH</h1>
              <p className="text-brandBlue text-[10px] font-bold uppercase tracking-widest">Growth & Succession Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-bold uppercase">View As:</span>
            <select value={userRole} onChange={(e) => { setUserRole(e.target.value); setCurrentView('dashboard'); }} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none">
              <option value="HR">HR Admin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee (Self)</option>
            </select>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'dashboard' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
            <LayoutDashboard className="w-4 h-4" /> DASHBOARD
          </button>
          {userRole !== 'Employee' && (
            <button onClick={() => setCurrentView('framework')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'framework' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
              <GitBranch className="w-4 h-4" /> CAREER MAP
            </button>
          )}
          <button onClick={() => setCurrentView('my_path')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'my_path' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
            <Map className="w-4 h-4" /> MY JOURNEY
          </button>
          {userRole !== 'Employee' && (
            <button onClick={() => setCurrentView('succession')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'succession' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
              <Crown className="w-4 h-4" /> SUCCESSION (9-BOX)
            </button>
          )}
          <button onClick={() => setCurrentView('idp')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'idp' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
            <FileCheck2 className="w-4 h-4" /> IDP PLAN
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-sidebarBg">Talent Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Promotion Rate</p>
                  <h4 className="text-3xl font-bold text-brandTeal mt-1">12.5%</h4>
                  <p className="text-[10px] text-green-500 mt-2 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +2% YTD</p>
                </div>
                <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-brandTeal/10 transform rotate-12" />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">High Potentials</p>
                  <h4 className="text-3xl font-bold text-brandGold mt-1">24</h4>
                  <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brandGold"></span> Identified in 9-Box</p>
                </div>
                <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-brandGold/10 transform rotate-12" />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Succession Risk</p>
                  <h4 className="text-3xl font-bold text-brandRed mt-1">3 Roles</h4>
                  <p className="text-[10px] text-red-500 mt-2">Critical roles with no successor</p>
                </div>
                <AlertTriangle className="absolute -right-4 -bottom-4 w-24 h-24 text-brandRed/10 transform rotate-12" />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IDP Completion</p>
                  <h4 className="text-3xl font-bold text-brandBlue mt-1">78%</h4>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-2 max-w-[80%]"><div className="bg-brandBlue h-1 rounded-full" style={{ width: '78%' }}></div></div>
                </div>
                <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 text-brandBlue/10 transform rotate-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Talent Readiness Distribution</h4>
                <div className="h-64 relative w-full">
                  <canvas ref={readinessChartRef}></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Internal vs External Hires</h4>
                <div className="h-64 relative w-full">
                  <canvas ref={hiringChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CAREER MAP */}
        {currentView === 'framework' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Organization Career Map</h2>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-3 py-2 outline-none">
                <option value="Sales">Sales Dept</option>
                <option value="IT">IT Dept</option>
              </select>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft border border-white overflow-x-auto">
              <div className="flex flex-col items-center gap-8 min-w-[800px]">
                {/* Level 5 */}
                <div className="w-full grid grid-cols-1 place-items-center">
                  <div onClick={() => showRoleDetails('Director')} className="p-4 bg-brandDeepBlue text-white rounded-xl shadow-lg w-64 text-center cursor-pointer hover:scale-105 transition-transform">
                    <h4 className="font-bold text-lg">Director</h4>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest">Strategic Leader</p>
                  </div>
                </div>
                <div className="h-8 w-0.5 bg-gray-300"></div>

                {/* Level 4 */}
                <div className="w-full grid grid-cols-2 gap-20 place-items-center">
                  <div onClick={() => showRoleDetails('Sr. Manager')} className="p-4 bg-white border-2 border-brandBlue text-brandDeepBlue rounded-xl shadow w-56 text-center cursor-pointer hover:border-brandGold">
                    <h4 className="font-bold">Sr. Manager</h4>
                    <p className="text-[10px] text-gray-400">Business Unit Lead</p>
                  </div>
                </div>
                
                {/* Level 3 */}
                <div className="w-full grid grid-cols-3 gap-8 place-items-center relative">
                  <div className="absolute top-[-1rem] left-1/2 -translate-x-1/2 w-2/3 h-4 border-t-2 border-l-2 border-r-2 border-gray-300 rounded-t-xl"></div>
                  <div onClick={() => showRoleDetails('Manager')} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-48 text-center cursor-pointer hover:border-brandTeal">
                    <h4 className="font-bold text-sidebarBg">Manager</h4>
                    <p className="text-[10px] text-gray-400">Team Lead</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-48 text-center cursor-pointer hover:border-brandTeal">
                    <h4 className="font-bold text-sidebarBg">Specialist</h4>
                    <p className="text-[10px] text-gray-400">Individual Contributor</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-48 text-center cursor-pointer hover:border-brandTeal">
                    <h4 className="font-bold text-sidebarBg">Project Mgr</h4>
                    <p className="text-[10px] text-gray-400">Project Lead</p>
                  </div>
                </div>

                {/* Level 2 */}
                <div className="w-full grid grid-cols-3 gap-8 place-items-center relative">
                  <div className="col-span-3 h-8 w-0.5 bg-gray-300 absolute -top-8"></div>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-48 text-center cursor-pointer hover:border-brandTeal">
                    <h4 className="font-bold text-sidebarBg">Supervisor / Senior</h4>
                    <p className="text-[10px] text-gray-400">Operational Lead</p>
                  </div>
                </div>

                {/* Level 1 */}
                <div className="w-full grid grid-cols-3 gap-8 place-items-center relative">
                  <div className="col-span-3 h-8 w-0.5 bg-gray-300 absolute -top-8"></div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm w-48 text-center cursor-pointer hover:border-brandTeal">
                    <h4 className="font-bold text-sidebarBg">Officer</h4>
                    <p className="text-[10px] text-gray-400">Execution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: MY JOURNEY */}
        {currentView === 'my_path' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">My Career Journey</h2>
              {userRole !== 'Employee' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Viewing:</span>
                  <select className="bg-white border rounded px-2 py-1 text-xs"><option>Somchai (Self)</option><option>John Doe</option></select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-white">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://i.pravatar.cc/150?img=12" className="w-16 h-16 rounded-full border-4 border-brandTeal" alt="Profile" />
                  <div>
                    <h3 className="text-lg font-bold text-sidebarBg">Somchai Jaidee</h3>
                    <p className="text-brandTeal font-bold text-xs uppercase">Current: Sales Manager</p>
                    <p className="text-xs text-gray-400">Tenure: 3 Years</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-gray-600">Performance (Avg 3Y)</span>
                      <span className="font-bold text-brandGold">4.2/5.0</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brandGold h-2 rounded-full" style={{ width: '84%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-gray-600">Competency Fit</span>
                      <span className="font-bold text-brandBlue">85%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brandBlue h-2 rounded-full" style={{ width: '85%' }}></div></div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400 mb-2">Next Potential Role</p>
                  <h4 className="text-xl font-bold text-brandDeepBlue">Sales Director</h4>
                  <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">Readiness: 1-2 Years</span>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-6">Roadmap to Sales Director</h4>
                <div className="relative pl-4 space-y-6 border-l-2 border-gray-200 ml-2">
                  <div className="relative pl-6">
                    <div className="absolute -left-[21px] top-0 w-8 h-8 rounded-full bg-brandTeal border-4 border-white flex items-center justify-center text-white shadow-sm"><Check className="w-4 h-4" /></div>
                    <h5 className="text-sm font-bold text-gray-700">Experience &gt; 5 Years</h5>
                    <p className="text-xs text-green-600">Completed (6 Years)</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[21px] top-0 w-8 h-8 rounded-full bg-brandTeal border-4 border-white flex items-center justify-center text-white shadow-sm"><Check className="w-4 h-4" /></div>
                    <h5 className="text-sm font-bold text-gray-700">Performance Grade A</h5>
                    <p className="text-xs text-green-600">Achieved in 2024</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[21px] top-0 w-8 h-8 rounded-full bg-brandGold border-4 border-white flex items-center justify-center text-sidebarBg shadow-sm"><Loader className="w-4 h-4 animate-spin" /></div>
                    <h5 className="text-sm font-bold text-sidebarBg flex items-center gap-2">Strategic Leadership Training <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded">GAP</span></h5>
                    <p className="text-xs text-gray-500 mb-2">Required Course for Director level.</p>
                    <button onClick={requestTraining} className="px-3 py-1 bg-brandBlue text-white text-xs rounded hover:bg-blue-800">Enroll Course</button>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[21px] top-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 shadow-sm"><Lock className="w-4 h-4" /></div>
                    <h5 className="text-sm font-bold text-gray-400">English Proficiency (TOEIC &gt; 800)</h5>
                    <p className="text-xs text-gray-400">Current: 750</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SUCCESSION */}
        {currentView === 'succession' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">9-Box Grid (Succession Planning)</h2>
              <div className="flex gap-2 items-center">
                <span className="text-xs font-bold text-gray-400">Department:</span>
                <select className="bg-white border border-gray-200 text-xs font-bold rounded px-2 py-1"><option>Sales</option><option>IT</option></select>
                <button onClick={openSuccessorModal} className="px-4 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue">+ Plan Successor</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-white overflow-x-auto">
              <div className="grid grid-cols-[50px_1fr_1fr_1fr] grid-rows-[1fr_1fr_1fr_50px] gap-1 h-[500px] min-w-[800px]">
                <div className="row-span-3 flex items-center justify-center writing-mode-vertical rotate-180 text-xs font-bold text-gray-500 tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>POTENTIAL</div>
                
                {/* Row 1 */}
                <div className="bg-yellow-50 border border-yellow-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-400 opacity-50">High Pot / Low Perf</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=3" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="John" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-400 opacity-50">High Pot / Med Perf</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=5" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Mary" />
                    <img src="https://i.pravatar.cc/150?img=8" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Ken" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-green-600 opacity-80">★ STAR (High/High)</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=12" className="w-8 h-8 rounded-full border-2 border-brandGold shadow-sm" title="Somchai" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="bg-red-50 border border-red-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-400 opacity-50">Med Pot / Low Perf</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=15" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Peter" />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-400 opacity-50">Med Pot / Med Perf</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=20" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Ann" />
                    <img src="https://i.pravatar.cc/150?img=21" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Boy" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-400 opacity-50">Med Pot / High Perf</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=32" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Suda" />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="bg-red-50 border border-red-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-red-400 opacity-50">Risk (Low/Low)</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=44" className="w-8 h-8 rounded-full border-2 border-white shadow-sm grayscale" title="Tom" />
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-400 opacity-50">Low Pot / Med Perf</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=51" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Jane" />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-2 relative hover:shadow-inner transition-all">
                  <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-400 opacity-50">Low Pot / High Perf</span>
                  <div className="flex flex-wrap gap-1 mt-4">
                    <img src="https://i.pravatar.cc/150?img=60" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Max" />
                  </div>
                </div>

                {/* X-Axis Labels */}
                <div></div>
                <div className="text-center text-xs font-bold text-gray-500 tracking-widest pt-2">LOW</div>
                <div className="text-center text-xs font-bold text-gray-500 tracking-widest pt-2">MEDIUM</div>
                <div className="text-center text-xs font-bold text-gray-500 tracking-widest pt-2">HIGH (PERFORMANCE)</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: IDP */}
        {currentView === 'idp' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Individual Development Plan (IDP)</h2>
              <button className="px-4 py-2 bg-brandTeal text-white rounded-lg text-xs font-bold shadow flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Goal
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Development Goal</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Timeline</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-sidebarBg text-sm">Improve Strategic Thinking</td>
                    <td className="p-4 text-xs text-gray-500">Competency</td>
                    <td className="p-4 text-xs text-gray-500">Training / Mentoring</td>
                    <td className="p-4 text-center text-xs text-gray-500">Q1-Q2 2026</td>
                    <td className="p-4 text-center"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">In Progress</span></td>
                    <td className="p-4 text-center text-gray-400"><Edit className="w-4 h-4 mx-auto cursor-pointer hover:text-brandBlue" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-sidebarBg text-sm">Lead a Cross-functional Project</td>
                    <td className="p-4 text-xs text-gray-500">Experience</td>
                    <td className="p-4 text-xs text-gray-500">Assignment</td>
                    <td className="p-4 text-center text-xs text-gray-500">Q3 2026</td>
                    <td className="p-4 text-center"><span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">Planned</span></td>
                    <td className="p-4 text-center text-gray-400"><Edit className="w-4 h-4 mx-auto cursor-pointer hover:text-brandBlue" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Role Detail Modal */}
      <BaseModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={selectedRole.title} icon={HelpCircle} size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 mb-4">Requirements to step into this role.</p>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Experience</h4>
            <p className="text-sm text-gray-700">Minimum 5 years in management.</p>
          </div>
          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
            <h4 className="text-xs font-bold text-teal-800 uppercase mb-1">Competencies</h4>
            <ul className="text-sm text-gray-700 list-disc pl-4">
              <li>Strategic Vision (Level 4)</li>
              <li>Change Management (Level 3)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-1">Mandatory Training</h4>
            <p className="text-sm text-gray-700">Leadership Development Program (LDP)</p>
          </div>
        </div>
      </BaseModal>

    </div>
  );
};

export default CareerPathSuccession;
