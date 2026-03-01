import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, TrendingUp, Users, Search, Filter, 
  ChevronDown, ChevronRight, Star, AlertCircle, Download,
  CheckCircle2, XCircle, Calendar, FileText, Award
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface KPI {
  id: string;
  name: string;
  weight: number;
  target: number;
  actual: number;
  score: number;
  unit: string;
}

interface Evaluation {
  id: string;
  empId: string;
  empName: string;
  position: string;
  dept: string;
  avatar: string;
  period: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Completed';
  kpis: KPI[];
  competencyScore: number; // 0-100
  finalScore: number; // 0-100
  grade: string;
}

// --- Mock Data ---
const MOCK_EVALUATIONS: Evaluation[] = [
  {
    id: 'EV001', empId: 'E001', empName: 'Somchai J.', position: 'Sales Manager', dept: 'Sales', avatar: 'https://i.pravatar.cc/150?img=12',
    period: '2023-Q4', status: 'Completed',
    kpis: [
      { id: 'K01', name: 'Sales Revenue', weight: 40, target: 1000000, actual: 1200000, score: 48, unit: 'THB' },
      { id: 'K02', name: 'New Clients', weight: 30, target: 10, actual: 8, score: 24, unit: 'Clients' },
      { id: 'K03', name: 'Team Retention', weight: 30, target: 90, actual: 95, score: 30, unit: '%' },
    ],
    competencyScore: 85, finalScore: 92, grade: 'A'
  },
  {
    id: 'EV002', empId: 'E002', empName: 'Alice S.', position: 'Developer', dept: 'IT', avatar: 'https://i.pravatar.cc/150?img=5',
    period: '2023-Q4', status: 'Submitted',
    kpis: [
      { id: 'K01', name: 'Project Delivery', weight: 50, target: 100, actual: 90, score: 45, unit: '%' },
      { id: 'K02', name: 'Code Quality', weight: 30, target: 95, actual: 98, score: 30, unit: '%' },
      { id: 'K03', name: 'Bug Fixes', weight: 20, target: 50, actual: 45, score: 18, unit: 'Tickets' },
    ],
    competencyScore: 78, finalScore: 85, grade: 'B+'
  },
  {
    id: 'EV003', empId: 'E003', empName: 'Bob B.', position: 'HR Officer', dept: 'HR', avatar: 'https://i.pravatar.cc/150?img=3',
    period: '2023-Q4', status: 'Draft',
    kpis: [
      { id: 'K01', name: 'Recruitment Time', weight: 40, target: 30, actual: 35, score: 30, unit: 'Days' },
      { id: 'K02', name: 'Training Hours', weight: 30, target: 20, actual: 15, score: 20, unit: 'Hours' },
      { id: 'K03', name: 'Employee Satisfaction', weight: 30, target: 80, actual: 85, score: 30, unit: '%' },
    ],
    competencyScore: 0, finalScore: 0, grade: '-'
  },
];

const PerformanceEvaluation = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'my_evaluation' | 'team_evaluation'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('2023-Q4');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [showEvalModal, setShowEvalModal] = useState(false);

  // --- Computed ---
  const filteredEvals = useMemo(() => {
    return MOCK_EVALUATIONS.filter(ev => 
      ev.period === selectedPeriod && 
      (ev.empName.toLowerCase().includes(searchQuery.toLowerCase()) || ev.dept.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [selectedPeriod, searchQuery]);

  const stats = useMemo(() => {
    const completed = filteredEvals.filter(e => e.status === 'Completed').length;
    const pending = filteredEvals.filter(e => e.status !== 'Completed').length;
    const avgScore = filteredEvals.reduce((acc, curr) => acc + curr.finalScore, 0) / (filteredEvals.length || 1);
    return { completed, pending, avgScore: avgScore.toFixed(1) };
  }, [filteredEvals]);

  // --- Actions ---
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Submitted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openEvaluation = (ev: Evaluation) => {
    setSelectedEval(ev);
    setShowEvalModal(true);
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandRed text-white shadow-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">PERFORMANCE</h1>
              <p className="text-brandRed text-[10px] font-bold uppercase tracking-widest">Evaluation & KPI Tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 focus:outline-none shadow-sm"
            >
              <option value="2023-Q4">Q4 2023</option>
              <option value="2023-Q3">Q3 2023</option>
              <option value="2023-Q2">Q2 2023</option>
              <option value="2023-Q1">Q1 2023</option>
            </select>
            <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
              <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'dashboard' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <BarChart2 className="w-4 h-4" /> DASHBOARD
              </button>
              <button onClick={() => setCurrentView('my_evaluation')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'my_evaluation' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <FileText className="w-4 h-4" /> MY EVALUATION
              </button>
              <button onClick={() => setCurrentView('team_evaluation')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'team_evaluation' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <Users className="w-4 h-4" /> TEAM REVIEW
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Completed Reviews</p>
                    <h3 className="text-3xl font-bold text-brandDeepBlue mt-1">{stats.completed}</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                </div>
                <div className="mt-4 w-full bg-gray-100 rounded-full h-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: `${(stats.completed / (stats.completed + stats.pending)) * 100}%` }}></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Pending Reviews</p>
                    <h3 className="text-3xl font-bold text-brandGold mt-1">{stats.pending}</h3>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><AlertCircle className="w-5 h-5" /></div>
                </div>
                <p className="text-xs text-gray-400 mt-4">Due in 5 days</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Avg. Score</p>
                    <h3 className="text-3xl font-bold text-brandRed mt-1">{stats.avgScore}%</h3>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg text-red-600"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <p className="text-xs text-gray-400 mt-4">Top Dept: Sales (92%)</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white p-6">
              <h3 className="text-lg font-bold text-sidebarBg mb-4">Department Performance</h3>
              <div className="h-64 flex items-end gap-4">
                {/* Mock Chart Bars */}
                <div className="flex-1 flex flex-col justify-end items-center gap-2">
                  <div className="w-full bg-brandBlue rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: '85%' }}></div>
                  <span className="text-xs font-bold text-gray-500">Sales</span>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center gap-2">
                  <div className="w-full bg-brandTeal rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: '70%' }}></div>
                  <span className="text-xs font-bold text-gray-500">IT</span>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center gap-2">
                  <div className="w-full bg-brandGold rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: '60%' }}></div>
                  <span className="text-xs font-bold text-gray-500">HR</span>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center gap-2">
                  <div className="w-full bg-brandRed rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: '75%' }}></div>
                  <span className="text-xs font-bold text-gray-500">Marketing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TEAM EVALUATION */}
        {currentView === 'team_evaluation' && (
          <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search employee..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brandTeal" 
                />
              </div>
              <button className="px-4 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Department</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">KPI Score</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Competency</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Final Grade</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEvals.map(ev => (
                    <tr key={ev.id} className="hover:bg-brandTeal/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={ev.avatar} alt={ev.empName} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="text-sm font-bold text-sidebarBg">{ev.empName}</div>
                            <div className="text-xs text-gray-500">{ev.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{ev.dept}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(ev.status)}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm font-bold text-gray-700">
                        {ev.kpis.reduce((acc, k) => acc + k.score, 0)}%
                      </td>
                      <td className="p-4 text-center text-sm font-bold text-gray-700">
                        {ev.competencyScore}%
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-lg font-bold ${getGradeColor(ev.grade)}`}>{ev.grade}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => openEvaluation(ev)} 
                          className="text-brandBlue hover:text-brandDeepBlue font-bold text-xs underline"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Evaluation Modal */}
      <BaseModal isOpen={showEvalModal} onClose={() => setShowEvalModal(false)} title="Performance Review" icon={FileText} size="xl">
        {selectedEval && (
          <div className="flex flex-col h-full bg-gray-50">
            {/* Modal Header */}
            <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={selectedEval.avatar} className="w-16 h-16 rounded-full border-4 border-gray-100" />
                <div>
                  <h2 className="text-xl font-bold text-sidebarBg">{selectedEval.empName}</h2>
                  <p className="text-sm text-gray-500">{selectedEval.position} • {selectedEval.dept}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-brandDeepBlue">{selectedEval.finalScore}</div>
                <div className={`text-sm font-bold ${getGradeColor(selectedEval.grade)}`}>Grade {selectedEval.grade}</div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* KPIs Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-sidebarBg text-sm uppercase">Key Performance Indicators (KPIs)</h3>
                  <span className="text-xs font-bold text-gray-500">Weight: 70%</span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase w-1/3">Indicator</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Weight</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Target</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Actual</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedEval.kpis.map(kpi => (
                      <tr key={kpi.id}>
                        <td className="p-4 text-sm font-bold text-gray-700">{kpi.name}</td>
                        <td className="p-4 text-center text-sm text-gray-500">{kpi.weight}%</td>
                        <td className="p-4 text-center text-sm text-gray-500">{kpi.target.toLocaleString()} {kpi.unit}</td>
                        <td className="p-4 text-center text-sm font-bold text-brandBlue">{kpi.actual.toLocaleString()} {kpi.unit}</td>
                        <td className="p-4 text-center text-sm font-bold text-green-600">{kpi.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Competency Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-sidebarBg text-sm uppercase">Core Competencies</h3>
                  <span className="text-xs font-bold text-gray-500">Weight: 30%</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-600">Leadership</span>
                      <span className="font-bold text-brandBlue">4/5</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brandBlue h-2 rounded-full" style={{ width: '80%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-600">Communication</span>
                      <span className="font-bold text-brandBlue">3.5/5</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brandBlue h-2 rounded-full" style={{ width: '70%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-600">Problem Solving</span>
                      <span className="font-bold text-brandBlue">4.5/5</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brandBlue h-2 rounded-full" style={{ width: '90%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-600">Teamwork</span>
                      <span className="font-bold text-brandBlue">5/5</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brandBlue h-2 rounded-full" style={{ width: '100%' }}></div></div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-sidebarBg text-sm uppercase mb-4">Manager Comments</h3>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm focus:outline-none focus:border-brandTeal" 
                  rows={4} 
                  placeholder="Enter feedback here..."
                  defaultValue="Somchai has performed exceptionally well this quarter, exceeding sales targets significantly. He demonstrates strong leadership within the team."
                ></textarea>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-white p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowEvalModal(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Close</button>
              <button className="px-6 py-2 bg-brandDeepBlue text-white text-sm font-bold rounded-lg shadow hover:bg-brandBlue">Approve & Sign</button>
            </div>
          </div>
        )}
      </BaseModal>

    </div>
  );
};

export default PerformanceEvaluation;
