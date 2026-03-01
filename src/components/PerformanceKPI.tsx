import React, { useState, useMemo, useEffect } from 'react';
import { 
  Target, LayoutDashboard, Crosshair, Users, GitMerge, Library, HelpCircle, BarChart2, CheckCircle, AlertTriangle, AlertOctagon, Plus, RefreshCw, Trash2, Search, PlusCircle, Eye, X, TrendingUp, Bell 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface Goal { id: number; type: 'KPI' | 'OKR'; code: string; title: string; weight: number; progress: number; lastUpdated: string; keyResults: KeyResult[]; }
interface KeyResult { title: string; target: number; current: number; unit: string; }
interface TeamMember { id: number; name: string; position: string; goalCount: number; progress: number; avatar: string; }
interface KPI { id: number; category: string; name: string; desc: string; unit: string; }

// --- Mock Data ---
const MOCK_GOALS: Goal[] = [
  { id: 1, type: 'KPI', code: 'KPI-001', title: 'Achieve Sales Target Q1', weight: 40, progress: 80, lastUpdated: '2026-02-15', keyResults: [ { title: 'Sales Volume', target: 5000000, current: 4000000, unit: 'THB' } ] },
  { id: 2, type: 'OKR', code: 'OKR-01', title: 'Improve Customer Satisfaction', weight: 30, progress: 60, lastUpdated: '2026-02-10', keyResults: [ { title: 'NPS Score', target: 70, current: 42, unit: 'Score' }, { title: 'Response Time', target: 2, current: 1.5, unit: 'Hrs' } ] },
  { id: 3, type: 'KPI', code: 'KPI-003', title: 'Team Training Compliance', weight: 30, progress: 20, lastUpdated: '2026-01-20', keyResults: [ { title: 'Training Hours', target: 40, current: 8, unit: 'Hrs' } ] }
];
const MOCK_TEAM_DATA: TeamMember[] = [
  { id: 1, name: 'Alice Smith', position: 'Developer', goalCount: 4, progress: 85, avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 2, name: 'John Doe', position: 'Sales Rep', goalCount: 3, progress: 45, avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 3, name: 'Bob Jones', position: 'HR Officer', goalCount: 5, progress: 72, avatar: 'https://i.pravatar.cc/150?img=60' },
];
const MOCK_KPI_LIBRARY: KPI[] = [
  { id: 1, category: 'Sales', name: 'Sales Revenue', desc: 'Total income from sales', unit: 'Currency' },
  { id: 2, category: 'HR', name: 'Turnover Rate', desc: 'Percentage of employees leaving', unit: '%' },
  { id: 3, category: 'Marketing', name: 'Lead Generation', desc: 'Number of new leads', unit: 'Count' },
  { id: 4, category: 'Production', name: 'Defect Rate', desc: 'Percentage of defective products', unit: '%' },
];

const PerformanceKPI = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'my_goals' | 'team_goals' | 'alignment' | 'library'>('dashboard');
  const [userRole, setUserRole] = useState('Manager');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const [myGoals, setMyGoals] = useState<Goal[]>(MOCK_GOALS);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<{ type: 'KPI' | 'OKR'; title: string; weight: number; keyResults: KeyResult[] }>({ 
    type: 'KPI', title: '', weight: 0, keyResults: [] 
  });

  // --- Computed ---
  const overallProgress = useMemo(() => {
    const totalWeight = myGoals.reduce((acc, g) => acc + g.weight, 0);
    const weightedProgress = myGoals.reduce((acc, g) => acc + (g.progress * g.weight), 0);
    return totalWeight === 0 ? 0 : Math.round(weightedProgress / totalWeight);
  }, [myGoals]);

  // --- Actions ---
  const getProgressColor = (progress: number, isText = false) => {
    if (progress >= 70) return isText ? 'text-green-600' : 'bg-green-500';
    if (progress >= 40) return isText ? 'text-yellow-600' : 'bg-yellow-500';
    return isText ? 'text-red-600' : 'bg-red-500';
  };

  const openGoalModal = () => {
    setForm({ type: 'KPI', title: '', weight: 0, keyResults: [{title:'', target:0, current:0, unit:''}] });
    setShowGoalModal(true);
  };

  const addKeyResult = () => setForm(prev => ({ ...prev, keyResults: [...prev.keyResults, {title:'', target:0, current:0, unit:''}] }));
  
  const removeKeyResult = (idx: number) => {
    const newKRs = [...form.keyResults];
    newKRs.splice(idx, 1);
    setForm(prev => ({ ...prev, keyResults: newKRs }));
  };

  const saveGoal = () => {
    const newGoal: Goal = {
      ...form,
      id: Date.now(),
      code: `NEW-${Math.floor(Math.random()*100)}`,
      progress: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setMyGoals([...myGoals, newGoal]);
    setShowGoalModal(false);
    Swal.fire('Saved', 'New goal added.', 'success');
  };

  const openCheckInModal = (goal: Goal) => {
    setSelectedGoal(JSON.parse(JSON.stringify(goal)));
    setShowCheckInModal(true);
  };

  const saveCheckIn = () => {
    if (selectedGoal) {
      const idx = myGoals.findIndex(g => g.id === selectedGoal.id);
      if(idx !== -1) {
        const updatedGoals = [...myGoals];
        updatedGoals[idx] = selectedGoal;
        
        // Recalc progress
        let totalP = 0;
        selectedGoal.keyResults.forEach(kr => {
           totalP += (kr.current / kr.target) * 100;
        });
        updatedGoals[idx].progress = Math.round(totalP / selectedGoal.keyResults.length);
        
        setMyGoals(updatedGoals);
      }
      setShowCheckInModal(false);
      Swal.fire('Updated', 'Progress updated.', 'success');
    }
  };

  // --- Charts ---
  useEffect(() => {
    if (currentView === 'dashboard') {
      const pCtx = document.getElementById('progressChart') as HTMLCanvasElement;
      const aCtx = document.getElementById('alignmentChart') as HTMLCanvasElement;

      let chart1: Chart | null = null;
      let chart2: Chart | null = null;

      if(pCtx) {
        chart1 = new Chart(pCtx, {
          type: 'bar',
          data: {
            labels: ['On Track', 'At Risk', 'Behind'],
            datasets: [{ label: 'Goals', data: [5, 2, 1], backgroundColor: ['#10B981', '#F59E0B', '#EF4444'] }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
      if(aCtx) {
        chart2 = new Chart(aCtx, {
          type: 'doughnut',
          data: {
            labels: ['Aligned', 'Not Aligned'],
            datasets: [{ data: [85, 15], backgroundColor: ['#16778C', '#E5E7EB'] }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      return () => {
        if (chart1) chart1.destroy();
        if (chart2) chart2.destroy();
      };
    }
  }, [currentView]);

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandTeal text-brandGold shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">KPI & OKR SETTING</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Goal Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold">Role:</span>
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
              <option value="HR">HR Admin</option>
            </select>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'dashboard' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> DASHBOARD
          </button>
          <button onClick={() => setCurrentView('my_goals')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'my_goals' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <Crosshair className="w-4 h-4" /> MY GOALS
          </button>
          {userRole !== 'Employee' && (
            <button onClick={() => setCurrentView('team_goals')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'team_goals' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
              <Users className="w-4 h-4" /> TEAM GOALS
            </button>
          )}
          <button onClick={() => setCurrentView('alignment')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'alignment' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <GitMerge className="w-4 h-4" /> ALIGNMENT
          </button>
          <button onClick={() => setCurrentView('library')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'library' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <Library className="w-4 h-4" /> LIBRARY
          </button>
          
          <button onClick={() => setShowGuide(true)} className="ml-auto my-auto w-8 h-8 rounded-full bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Performance Overview</h2>
              <div className="text-xs text-gray-500 font-bold bg-white px-3 py-1 rounded shadow-sm">Period: Q1 2026</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Stats Cards */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-brandTeal">
                  <BarChart2 size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">Overall Progress</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-brandTeal">{overallProgress}%</h4>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 max-w-[80%]">
                      <div className="bg-brandTeal h-1.5 rounded-full" style={{width: `${overallProgress}%`}}></div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-brandTeal/10">
                    <BarChart2 className="w-6 h-6 text-brandTeal" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-brandBlue">
                  <Target size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">Total Goals</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-sidebarBg">{myGoals.length}</h4>
                    </div>
                    <p className="text-[10px] text-brandBlue font-medium mt-2 flex items-center gap-1 truncate">
                      KPIs & OKRs Combined
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-brandBlue/10">
                    <Target className="w-6 h-6 text-brandBlue" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-green-500">
                  <CheckCircle size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">On Track</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-green-600">{myGoals.filter(g => g.progress >= 70).length}</h4>
                    </div>
                    <p className="text-[10px] text-green-500 font-medium mt-2 flex items-center gap-1 truncate">
                      <TrendingUp size={12} /> Goals Achieving
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-green-50">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
                <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0 text-red-500">
                  <AlertOctagon size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">At Risk</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate text-red-600">{myGoals.filter(g => g.progress < 40).length}</h4>
                    </div>
                    <p className="text-[10px] text-red-500 font-medium mt-2 flex items-center gap-1 truncate">
                      <AlertTriangle size={12} /> Need Attention
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 backdrop-blur-md bg-red-50">
                    <AlertOctagon className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Goal Progress Distribution</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="progressChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Department Alignment</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="alignmentChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MY GOALS */}
        {currentView === 'my_goals' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">My Goals (Q1 2026)</h2>
              <button onClick={openGoalModal} className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow hover:bg-brandBlue flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Goal
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {myGoals.map(goal => (
                <div key={goal.id} className={`border rounded-xl p-4 bg-white transition-all hover:shadow-md hover:border-brandTeal relative ${goal.type === 'KPI' ? 'border-l-4 border-l-brandBlue' : 'border-l-4 border-l-brandOrange'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${goal.type === 'KPI' ? 'bg-brandBlue' : 'bg-brandOrange'}`}>{goal.type}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{goal.code}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openCheckInModal(goal)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 font-bold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Check-in
                      </button>
                      <button className="text-gray-300 hover:text-brandRed"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-sidebarBg mb-2">{goal.title}</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-3">
                    {goal.keyResults.map((kr, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs text-gray-600 font-medium">{kr.title}</span>
                          <span className="text-xs font-bold text-brandDeepBlue">{kr.current} / {kr.target} {kr.unit}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${getProgressColor((kr.current/kr.target)*100)}`} style={{ width: `${Math.min((kr.current/kr.target)*100, 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Weight: {goal.weight}%</span>
                      <span className={`font-bold ${getProgressColor(goal.progress, true)}`}>{goal.progress}% Achieved</span>
                    </div>
                    <span className="text-gray-400">Updated: {goal.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: TEAM GOALS */}
        {currentView === 'team_goals' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Team Goal Tracking</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total Goals</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Avg Progress</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_TEAM_DATA.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src={member.avatar} className="w-full h-full object-cover" alt={member.name} /></div>
                        <div>
                          <p className="font-bold text-sm text-sidebarBg">{member.name}</p>
                          <p className="text-[10px] text-gray-400">{member.position}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{member.goalCount} Goals</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full"><div className={`h-1.5 rounded-full ${getProgressColor(member.progress)}`} style={{width: `${member.progress}%`}}></div></div>
                          <span className="text-xs font-bold">{member.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getProgressColor(member.progress)}`}>{member.progress >= 70 ? 'On Track' : 'At Risk'}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-gray-400 hover:text-brandBlue"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: ALIGNMENT */}
        {currentView === 'alignment' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Goal Alignment Map</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white p-8 overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Corp Level */}
                <div className="flex justify-center mb-8 relative z-10">
                  <div className="bg-brandDeepBlue text-white p-4 rounded-xl shadow-lg w-96 text-center border-l-4 border-brandGold">
                    <h4 className="font-bold text-sm">CORPORATE GOAL</h4>
                    <p className="text-xs mt-1 opacity-90">Achieve 20% Revenue Growth (Year 2026)</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="h-8 w-px bg-gray-300 mx-auto -mt-8 mb-0 relative z-0"></div>
                <div className="h-px w-2/3 bg-gray-300 mx-auto mb-8 relative z-0">
                  <div className="absolute left-0 top-0 w-px h-8 bg-gray-300"></div>
                  <div className="absolute right-0 top-0 w-px h-8 bg-gray-300"></div>
                </div>

                {/* Dept Level */}
                <div className="flex justify-between gap-8 mb-8">
                  <div className="bg-white border border-brandTeal p-4 rounded-xl shadow w-80 relative">
                    <h4 className="font-bold text-sm text-brandTeal">SALES DEPT</h4>
                    <p className="text-xs text-gray-600 mt-1">Achieve 50M THB Sales Target</p>
                    <div className="absolute left-1/2 bottom-[-2rem] w-px h-8 bg-gray-300"></div>
                  </div>
                  <div className="bg-white border border-brandBlue p-4 rounded-xl shadow w-80 relative">
                    <h4 className="font-bold text-sm text-brandBlue">MARKETING DEPT</h4>
                    <p className="text-xs text-gray-600 mt-1">Generate 5,000 Qualified Leads</p>
                    <div className="absolute left-1/2 bottom-[-2rem] w-px h-8 bg-gray-300"></div>
                  </div>
                </div>

                {/* Individual Level */}
                <div className="flex justify-between gap-8">
                  <div className="w-80 space-y-2">
                    <div className="bg-gray-50 border-l-2 border-brandTeal p-2 rounded text-xs text-gray-600">
                      <span className="font-bold block">Somchai (Mgr):</span> Manage Key Accounts (20M)
                    </div>
                    <div className="bg-gray-50 border-l-2 border-brandTeal p-2 rounded text-xs text-gray-600">
                      <span className="font-bold block">John (Rep):</span> New Customer Acquisition (5M)
                    </div>
                  </div>
                  <div className="w-80 space-y-2">
                    <div className="bg-gray-50 border-l-2 border-brandBlue p-2 rounded text-xs text-gray-600">
                      <span className="font-bold block">Alice (Mgr):</span> Launch 2 Campaigns
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* VIEW 5: LIBRARY */}
        {currentView === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">KPI Library</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search KPIs..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-brandTeal" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_KPI_LIBRARY.map(kpi => (
                <div key={kpi.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-brandGold cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{kpi.category}</span>
                    <button className="text-brandTeal opacity-0 group-hover:opacity-100 transition-opacity"><PlusCircle className="w-5 h-5" /></button>
                  </div>
                  <h4 className="font-bold text-sm text-sidebarBg">{kpi.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{kpi.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-2">Unit: {kpi.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: GOAL SETTING */}
      <BaseModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Set Goal" icon={Target} size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'KPI' | 'OKR'})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
                <option value="KPI">KPI</option>
                <option value="OKR">OKR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (%)</label>
              <input type="number" value={form.weight} onChange={e => setForm({...form, weight: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Objective / Goal Title</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="e.g. Increase Sales Volume" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-0">Key Results / Measures</label>
              <button onClick={addKeyResult} className="text-[10px] text-brandTeal font-bold hover:underline">+ Add</button>
            </div>
            {form.keyResults.map((kr, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                <div className="flex gap-2 mb-2">
                  <input type="text" value={kr.title} onChange={e => { const newKRs = [...form.keyResults]; newKRs[idx].title = e.target.value; setForm({...form, keyResults: newKRs}); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brandTeal" placeholder="Measure description" />
                  <button onClick={() => removeKeyResult(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={kr.target} onChange={e => { const newKRs = [...form.keyResults]; newKRs[idx].target = parseInt(e.target.value); setForm({...form, keyResults: newKRs}); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brandTeal" placeholder="Target" />
                  <input type="text" value={kr.unit} onChange={e => { const newKRs = [...form.keyResults]; newKRs[idx].unit = e.target.value; setForm({...form, keyResults: newKRs}); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brandTeal" placeholder="Unit (e.g. THB)" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowGoalModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={saveGoal} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue">Save Goal</button>
        </div>
      </BaseModal>

      {/* MODAL: CHECK-IN */}
      <BaseModal isOpen={showCheckInModal} onClose={() => setShowCheckInModal(false)} title="Check-in Update" icon={RefreshCw} size="lg">
        <div className="p-6">
          <h4 className="text-sm font-bold text-brandDeepBlue mb-4">{selectedGoal?.title}</h4>
          <div className="space-y-4">
            {selectedGoal?.keyResults.map((kr, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold text-gray-600">{kr.title}</span>
                  <span className="text-gray-400">Target: {kr.target} {kr.unit}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" value={kr.current} max={kr.target} onChange={e => { const updated = {...selectedGoal}; updated.keyResults[idx].current = parseInt(e.target.value); setSelectedGoal(updated); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brandTeal" />
                  <input type="number" value={kr.current} onChange={e => { const updated = {...selectedGoal}; updated.keyResults[idx].current = parseInt(e.target.value); setSelectedGoal(updated); }} className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right font-bold text-brandTeal outline-none" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comment / Obstacles</label>
              <textarea className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" rows={2} placeholder="Any issues?"></textarea>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={saveCheckIn} className="px-6 py-2 bg-brandGold text-sidebarBg text-xs font-bold rounded-lg shadow hover:bg-yellow-400">Update Progress</button>
        </div>
      </BaseModal>

      {/* GUIDE SLIDE-OVER */}
      {showGuide && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-sidebarBg text-white">
              <h3 className="font-bold flex items-center gap-2 text-lg m-0 border-0"><HelpCircle className="w-5 h-5 text-brandGold" /> คู่มือการใช้งาน</h3>
              <button onClick={() => setShowGuide(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
              <p className="text-sm font-semibold text-brandTeal mb-4">ระบบบริหารผลการปฏิบัติงาน (KPI & OKR)</p>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">1. การตั้งเป้าหมาย (Setting Goals)</h3>
                <p className="text-sm text-gray-600 mb-2">กำหนดเป้าหมายทั้งแบบ KPI และ OKR</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li><strong>KPI:</strong> ตัวชี้วัดผลงานหลัก (เช่น ยอดขาย, ความพึงพอใจลูกค้า) เน้นมาตรฐาน</li>
                  <li><strong>OKR:</strong> วัตถุประสงค์และผลลัพธ์หลัก (Objective & Key Results) เน้นการเติบโตแบบก้าวกระโดด</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">2. การอัปเดตความคืบหน้า (Check-in)</h3>
                <p className="text-sm text-gray-600 mb-2">กดปุ่ม <strong>Check-in</strong> ที่การ์ดเป้าหมายเพื่อ:</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>กรอกผลงานปัจจุบัน (Current Value)</li>
                  <li>ระบบจะคำนวณ % Progress ให้อัตโนมัติ</li>
                  <li>บันทึกปัญหาหรืออุปสรรค (Obstacles)</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">3. การเชื่อมโยงเป้าหมาย (Alignment)</h3>
                <p className="text-sm text-gray-600 mb-2">ในหน้า <strong>ALIGNMENT</strong> คุณสามารถดูความเชื่อมโยงของเป้าหมายจากระดับองค์กร (Corporate) ลงมาสู่ระดับแผนก (Department) และระดับบุคคล (Individual)</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PerformanceKPI;
