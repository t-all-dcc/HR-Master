import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Award, 
  BarChart2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  UserCheck,
  GitBranch,
  Layers,
  Star,
  HelpCircle,
  X,
  Bell
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Mock Data ---
const MOCK_CRITICAL_ROLES = [
  { id: 1, title: 'Chief Executive Officer', incumbent: 'Robert Fox', risk: 'Low', successors: 2, readiness: 'High' },
  { id: 2, title: 'CTO', incumbent: 'Jenny Wilson', risk: 'Medium', successors: 1, readiness: 'Medium' },
  { id: 3, title: 'VP of Sales', incumbent: 'Guy Hawkins', risk: 'High', successors: 0, readiness: 'Low' },
  { id: 4, title: 'Head of Product', incumbent: 'Courtney Henry', risk: 'Low', successors: 3, readiness: 'High' },
];

const MOCK_TALENT_POOL = [
  { id: 1, name: 'Esther Howard', position: 'Senior PM', potential: 'High', performance: 'High', readiness: 'Ready Now' },
  { id: 2, name: 'Cameron Williamson', position: 'Lead Dev', potential: 'High', performance: 'Medium', readiness: '1-2 Years' },
  { id: 3, name: 'Brooklyn Simmons', position: 'Sales Manager', potential: 'Medium', performance: 'High', readiness: 'Ready Now' },
  { id: 4, name: 'Leslie Alexander', position: 'Marketing Lead', potential: 'High', performance: 'High', readiness: '3-5 Years' },
];

const SuccessionPlanning = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'org_chart' | 'talent_pool' | '9_box'>('dashboard');
  const [showAddSuccessorModal, setShowAddSuccessorModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // --- Actions ---
  const handleAddSuccessor = () => {
    setShowAddSuccessorModal(false);
    Swal.fire('Success', 'Successor added to the plan.', 'success');
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // --- Charts ---
  React.useEffect(() => {
    if (currentView === 'dashboard') {
      const ctx = document.getElementById('benchStrengthChart') as HTMLCanvasElement;
      let chart: Chart | null = null;

      if (ctx) {
        chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Ready Now', '1-2 Years', '3-5 Years'],
            datasets: [{
              label: 'Successors',
              data: [5, 12, 8],
              backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }

      return () => {
        if (chart) chart.destroy();
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
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">SUCCESSION PLANNING</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Talent Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><Bell className="w-5 h-5" /></button>
             <div className="w-8 h-8 rounded-full bg-brandTeal text-white flex items-center justify-center font-bold text-xs">HR</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'dashboard' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <BarChart2 className="w-4 h-4" /> DASHBOARD
          </button>
          <button onClick={() => setCurrentView('org_chart')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'org_chart' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <GitBranch className="w-4 h-4" /> SUCCESSION CHART
          </button>
          <button onClick={() => setCurrentView('talent_pool')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'talent_pool' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <Users className="w-4 h-4" /> TALENT POOL
          </button>
          <button onClick={() => setCurrentView('9_box')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === '9_box' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <Layers className="w-4 h-4" /> 9-BOX GRID
          </button>
          
          <button onClick={() => setShowGuide(true)} className="ml-auto my-auto w-8 h-8 rounded-full bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Critical Roles</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">12</h4>
                    <p className="text-xs text-red-500 mt-1 font-bold">2 At High Risk</p>
                  </div>
                  <div className="p-3 bg-brandTeal/10 rounded-xl text-brandTeal"><AlertCircle className="w-6 h-6" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Successor Coverage</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">85%</h4>
                    <p className="text-xs text-green-500 mt-1 font-bold">+5% vs last year</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl text-green-600"><CheckCircle className="w-6 h-6" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">High Potentials</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">28</h4>
                    <p className="text-xs text-blue-500 mt-1 font-bold">Identified</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Star className="w-6 h-6" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ready Now</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">5</h4>
                    <p className="text-xs text-brandGold mt-1 font-bold">Successors</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600"><Target className="w-6 h-6" /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Bench Strength (Readiness)</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="benchStrengthChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Critical Roles at Risk</h4>
                <div className="space-y-3">
                  {MOCK_CRITICAL_ROLES.filter(r => r.risk === 'High' || r.risk === 'Medium').map(role => (
                    <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-sidebarBg">{role.title}</p>
                        <p className="text-xs text-gray-500">Incumbent: {role.incumbent}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${getRiskColor(role.risk)}`}>{role.risk} Risk</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ORG CHART (Simplified List for now) */}
        {currentView === 'org_chart' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Succession Org Chart</h2>
              <button className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow hover:bg-brandBlue flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Critical Role
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_CRITICAL_ROLES.map(role => (
                <div key={role.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                   <div className={`absolute top-0 left-0 w-1 h-full ${role.risk === 'High' ? 'bg-red-500' : role.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                   <div className="pl-4">
                     <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-lg text-sidebarBg">{role.title}</h3>
                       <button className="text-gray-300 hover:text-brandTeal"><MoreVertical className="w-4 h-4" /></button>
                     </div>
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">IMG</div>
                       <div>
                         <p className="text-xs font-bold text-gray-700">{role.incumbent}</p>
                         <p className="text-[10px] text-gray-400">Current Incumbent</p>
                       </div>
                     </div>
                     
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Successors</p>
                       {role.successors > 0 ? (
                         <div className="space-y-2">
                           <div className="flex items-center justify-between text-xs">
                             <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-brandTeal text-white flex items-center justify-center text-[9px]">EH</div>
                               <span>Esther Howard</span>
                             </div>
                             <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold">Ready Now</span>
                           </div>
                         </div>
                       ) : (
                         <p className="text-xs text-red-500 italic flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No successors identified</p>
                       )}
                       <button onClick={() => setShowAddSuccessorModal(true)} className="w-full mt-3 py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-brandTeal hover:text-brandTeal transition-colors flex items-center justify-center gap-1">
                         <Plus className="w-3 h-3" /> Add Successor
                       </button>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: TALENT POOL */}
        {currentView === 'talent_pool' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Talent Pool</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search talent..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brandTeal" />
                </div>
                <button className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow hover:bg-brandBlue flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Add Talent
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Current Position</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Potential</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Performance</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Readiness</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_TALENT_POOL.map(talent => (
                    <tr key={talent.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-sm text-sidebarBg">{talent.name}</td>
                      <td className="p-4 text-sm text-gray-600">{talent.position}</td>
                      <td className="p-4"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{talent.potential}</span></td>
                      <td className="p-4"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">{talent.performance}</span></td>
                      <td className="p-4 text-sm text-gray-600">{talent.readiness}</td>
                      <td className="p-4 text-center">
                        <button className="text-gray-400 hover:text-brandBlue"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: 9-BOX GRID */}
        {currentView === '9_box' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">9-Box Grid Matrix</h2>
              <div className="flex gap-2">
                 <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> High Potential</span>
                 <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Moderate</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft border border-white relative">
              {/* Y-Axis Label */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-gray-400 uppercase tracking-widest">Potential</div>
              
              <div className="ml-8 mb-8 grid grid-cols-3 gap-4 h-[600px]">
                {/* Row 1: High Potential */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-yellow-400 uppercase">Rough Diamond</span>
                  <div className="mt-6 space-y-2">
                    {/* Avatars */}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-green-400 uppercase">Future Star</span>
                  <div className="mt-6 space-y-2">
                     <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
                        <div className="w-6 h-6 bg-gray-200 rounded-full text-[9px] flex items-center justify-center">CW</div>
                        <span className="text-xs font-bold">Cameron W.</span>
                     </div>
                  </div>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-green-600 uppercase">Star</span>
                  <div className="mt-6 space-y-2">
                     <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
                        <div className="w-6 h-6 bg-brandTeal text-white rounded-full text-[9px] flex items-center justify-center">EH</div>
                        <span className="text-xs font-bold">Esther H.</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
                        <div className="w-6 h-6 bg-brandBlue text-white rounded-full text-[9px] flex items-center justify-center">LA</div>
                        <span className="text-xs font-bold">Leslie A.</span>
                     </div>
                  </div>
                </div>

                {/* Row 2: Medium Potential */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-red-400 uppercase">Inconsistent</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-yellow-400 uppercase">Key Player</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-green-400 uppercase">High Performer</span>
                  <div className="mt-6 space-y-2">
                     <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
                        <div className="w-6 h-6 bg-gray-200 rounded-full text-[9px] flex items-center justify-center">BS</div>
                        <span className="text-xs font-bold">Brooklyn S.</span>
                     </div>
                  </div>
                </div>

                {/* Row 3: Low Potential */}
                <div className="bg-red-100 border border-red-300 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-red-600 uppercase">Risk</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-red-400 uppercase">Effective</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 relative hover:shadow-md transition-shadow">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-yellow-400 uppercase">Trusted Pro</span>
                </div>
              </div>

              {/* X-Axis Label */}
              <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Performance</div>
              <div className="flex justify-between px-12 text-[10px] text-gray-400 font-bold uppercase mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: ADD SUCCESSOR */}
      <BaseModal isOpen={showAddSuccessorModal} onClose={() => setShowAddSuccessorModal(false)} title="Add Successor" icon={UserCheck}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Employee</label>
            <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
              <option>Select...</option>
              <option>Esther Howard</option>
              <option>Cameron Williamson</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Readiness Level</label>
            <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
              <option>Ready Now</option>
              <option>Ready in 1-2 Years</option>
              <option>Ready in 3-5 Years</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Development Needs</label>
            <textarea className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" rows={3} placeholder="e.g. Leadership training, Job rotation..."></textarea>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowAddSuccessorModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAddSuccessor} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue">Add Successor</button>
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
              <p className="text-sm font-semibold text-brandTeal mb-4">ระบบวางแผนสืบทอดตำแหน่ง (Succession Planning)</p>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">1. ภาพรวม (Dashboard)</h3>
                <p className="text-sm text-gray-600 mb-2">ดูความพร้อมขององค์กรในการสืบทอดตำแหน่งสำคัญ (Bench Strength) และความเสี่ยงของตำแหน่งงานหลัก (Critical Roles)</p>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">2. ผังการสืบทอดตำแหน่ง (Succession Chart)</h3>
                <p className="text-sm text-gray-600 mb-2">แสดงตำแหน่งงานหลักและผู้สืบทอดที่ถูกวางตัวไว้ พร้อมระดับความพร้อม (Ready Now, 1-2 Years)</p>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">3. กลุ่มพนักงานศักยภาพสูง (Talent Pool)</h3>
                <p className="text-sm text-gray-600 mb-2">รายชื่อพนักงานที่มีศักยภาพสูง (High Potential) ที่ได้รับการคัดเลือกเข้าสู่ Talent Pool</p>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">4. 9-Box Grid</h3>
                <p className="text-sm text-gray-600 mb-2">เครื่องมือวิเคราะห์พนักงานโดยเปรียบเทียบระหว่าง ผลการปฏิบัติงาน (Performance) และ ศักยภาพ (Potential) เพื่อค้นหาดาวรุ่ง (Star) หรือผู้ที่ต้องพัฒนา</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuccessionPlanning;
