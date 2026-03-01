import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart2, 
  FileMinus, 
  ListChecks, 
  MessageSquare, 
  User, 
  HelpCircle, 
  TrendingDown, 
  UserX, 
  Clock, 
  ArrowUp, 
  Search, 
  Settings, 
  Check, 
  Send, 
  X, 
  BookOpen,
  UserMinus
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface ResignationRequest {
  id: string;
  name: string;
  position: string;
  dept: string;
  requestDate: string;
  lastDay: string;
  reason: string;
  status: string;
  checklist: { label: string; checked: boolean }[];
  exitReason: string;
  reasonCategory: string;
}

// --- Mock Data ---
const MOCK_REQUESTS: ResignationRequest[] = [
  { 
    id: 'REQ-001', name: 'Alice Smith', position: 'Senior Dev', dept: 'IT', requestDate: '2026-02-01', lastDay: '2026-03-01', reason: 'Found new opportunity', status: 'Approved',
    checklist: [
      { label: 'Return Laptop & Peripherals', checked: true },
      { label: 'Return ID Card / Access Key', checked: false },
      { label: 'Revoke System Access', checked: false },
      { label: 'Exit Interview Completed', checked: false }
    ],
    exitReason: '', reasonCategory: ''
  },
  { 
    id: 'REQ-002', name: 'Bob Jones', position: 'Sales Rep', dept: 'Sales', requestDate: '2026-02-10', lastDay: '2026-03-10', reason: 'Personal reasons', status: 'Pending',
    checklist: [
      { label: 'Return Laptop & Peripherals', checked: false },
      { label: 'Return ID Card / Access Key', checked: false },
      { label: 'Revoke System Access', checked: false },
      { label: 'Exit Interview Completed', checked: false }
    ],
    exitReason: '', reasonCategory: ''
  }
];

const ResignationTurnover = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'requests' | 'offboarding' | 'exit_interview' | 'my_resignation'>('dashboard');
  const [userRole, setUserRole] = useState('HR');
  const [showModal, setShowModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<ResignationRequest[]>(MOCK_REQUESTS);
  
  // Selection
  const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<ResignationRequest | null>(null);

  // --- Computed ---
  const filteredRequests = useMemo(() => {
    if(!searchQuery) return requests;
    return requests.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [requests, searchQuery]);

  const activeRequests = useMemo(() => {
    return requests.filter(r => ['Approved', 'Clearing'].includes(r.status));
  }, [requests]);

  // --- Actions ---
  const openProcessModal = (req: ResignationRequest) => {
    setSelectedRequest(req);
    setShowModal(true);
  };

  const saveChanges = () => {
    if (selectedRequest) {
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? selectedRequest : r));
    }
    setShowModal(false);
    Swal.fire('Saved', 'Information updated successfully.', 'success');
  };

  const submitResignation = () => {
    Swal.fire({
      title: 'Confirm Submission?',
      text: 'This will notify your manager and HR.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D91604',
      confirmButtonText: 'Yes, Submit'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Submitted', 'Your resignation request has been sent.', 'success');
      }
    });
  };

  const toggleCheck = (req: ResignationRequest, idx: number) => {
    const updatedReq = { ...req };
    updatedReq.checklist[idx].checked = !updatedReq.checklist[idx].checked;
    setRequests(prev => prev.map(r => r.id === req.id ? updatedReq : r));
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Clearing': return 'bg-purple-100 text-purple-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  // --- Charts ---
  useEffect(() => {
    if (currentView === 'dashboard') {
      const reasonsCtx = document.getElementById('reasonsChart') as HTMLCanvasElement;
      const deptCtx = document.getElementById('deptChart') as HTMLCanvasElement;

      let chart1: Chart | null = null;
      let chart2: Chart | null = null;

      if (reasonsCtx) {
        chart1 = new Chart(reasonsCtx, {
          type: 'doughnut',
          data: {
            labels: ['Career Growth', 'Salary', 'Management', 'Personal'],
            datasets: [{ data: [40, 30, 10, 20], backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'] }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
      if (deptCtx) {
        chart2 = new Chart(deptCtx, {
          type: 'bar',
          data: {
            labels: ['Sales', 'IT', 'HR', 'Marketing'],
            datasets: [{ label: 'Turnover', data: [5, 8, 2, 4], backgroundColor: '#D91604', borderRadius: 4 }]
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
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandRed text-white shadow-lg">
              <UserMinus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">RESIGNATION & TURNOVER</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Offboarding Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold">Role:</span>
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
              <option value="HR">HR Admin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'dashboard' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <BarChart2 className="w-4 h-4" /> ANALYTICS
          </button>
          {userRole !== 'Employee' && (
            <>
              <button onClick={() => setCurrentView('requests')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'requests' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
                <FileMinus className="w-4 h-4" /> REQUESTS
              </button>
              <button onClick={() => setCurrentView('offboarding')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'offboarding' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
                <ListChecks className="w-4 h-4" /> OFFBOARDING
              </button>
              <button onClick={() => setCurrentView('exit_interview')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'exit_interview' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
                <MessageSquare className="w-4 h-4" /> EXIT INTERVIEW
              </button>
            </>
          )}
          {userRole === 'Employee' && (
            <button onClick={() => setCurrentView('my_resignation')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'my_resignation' ? 'border-brandRed text-brandRed bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
              <User className="w-4 h-4" /> MY RESIGNATION
            </button>
          )}
          
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
              <h2 className="text-2xl font-bold text-sidebarBg">Turnover Overview (YTD 2026)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-white relative overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="absolute right-[-1.5rem] bottom-[-1.5rem] opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all text-brandRed">
                  <TrendingDown size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Turnover Rate</p>
                    <h4 className="text-3xl font-extrabold text-brandRed mt-1">12.5%</h4>
                    <p className="text-[10px] text-red-500 mt-2 font-medium flex items-center gap-1"><ArrowUp className="w-3 h-3" /> +2% vs Last Year</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brandRed/10 text-brandRed flex items-center justify-center"><TrendingDown className="w-6 h-6" /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-soft border border-white relative overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="absolute right-[-1.5rem] bottom-[-1.5rem] opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all text-brandOrange">
                  <UserX size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Resignations</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-1">15</h4>
                    <p className="text-[10px] text-brandOrange mt-2 font-medium">Voluntary Exits</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brandOrange/10 text-brandOrange flex items-center justify-center"><UserX className="w-6 h-6" /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-soft border border-white relative overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="absolute right-[-1.5rem] bottom-[-1.5rem] opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all text-brandTeal">
                  <Clock size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Avg. Tenure</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-1">2.4 <span className="text-sm font-normal text-gray-400">Yrs</span></h4>
                    <p className="text-[10px] text-brandTeal mt-2 font-medium">Average Stay</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brandTeal/10 text-brandTeal flex items-center justify-center"><Clock className="w-6 h-6" /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-soft border border-white relative overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="absolute right-[-1.5rem] bottom-[-1.5rem] opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all text-brandGold">
                  <ListChecks size={100} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pending Offboarding</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-1">{activeRequests.length}</h4>
                    <p className="text-[10px] text-brandGold mt-2 font-medium">In Process</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brandGold/10 text-brandGold flex items-center justify-center"><ListChecks className="w-6 h-6" /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Reasons for Leaving</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="reasonsChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Turnover by Department</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="deptChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: REQUESTS */}
        {currentView === 'requests' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Resignation Requests</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-brandRed" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Request Date</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Last Working Day</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Reason</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">{req.name.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-sm text-sidebarBg">{req.name}</p>
                            <p className="text-[10px] text-gray-400">{req.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{req.requestDate}</td>
                      <td className="p-4 text-sm font-bold text-brandRed">{req.lastDay}</td>
                      <td className="p-4 text-sm text-gray-600 truncate max-w-xs">{req.reason}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusClass(req.status)}`}>{req.status}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => openProcessModal(req)} className="text-gray-400 hover:text-brandBlue"><Settings className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: OFFBOARDING */}
        {currentView === 'offboarding' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Offboarding Process</h2>
              <p className="text-sm text-brandMuted">Track asset returns and clearance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-brandRed transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-brandRed flex items-center justify-center font-bold">{req.name.charAt(0)}</div>
                      <div>
                        <h4 className="font-bold text-sidebarBg text-sm">{req.name}</h4>
                        <p className="text-[10px] text-gray-500">Last Day: {req.lastDay}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brandBlue">{Math.round((req.checklist.filter(c => c.checked).length / req.checklist.length) * 100)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                    {req.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div onClick={() => toggleCheck(req, idx)} className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all ${item.checked ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                          {item.checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => openProcessModal(req)} className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50">Manage Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: EXIT INTERVIEW */}
        {currentView === 'exit_interview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Exit Interview Records</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-brandDeepBlue mb-4">Interview Summary</h4>
                  <div className="space-y-4">
                    {activeRequests.map(req => (
                      <div key={req.id + '_int'} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInterview(req)}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-sm">{req.name}</span>
                          <span className="text-xs text-gray-400">{req.lastDay}</span>
                        </div>
                        <p className="text-xs text-gray-600 italic">"{req.exitReason || 'No interview recorded yet.'}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  {selectedInterview ? (
                    <div>
                      <h4 className="font-bold text-lg text-sidebarBg mb-2">{selectedInterview.name}</h4>
                      <p className="text-xs text-brandMuted mb-6">{selectedInterview.position} • {selectedInterview.dept}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Reason for Leaving</label>
                          <select value={selectedInterview.reasonCategory} onChange={(e) => { const updated = {...selectedInterview, reasonCategory: e.target.value}; setSelectedInterview(updated); setRequests(prev => prev.map(r => r.id === updated.id ? updated : r)); }} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
                            <option>Career Growth</option>
                            <option>Salary & Benefits</option>
                            <option>Management / Leadership</option>
                            <option>Work-Life Balance</option>
                            <option>Personal Reasons</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Feedback / Comments</label>
                          <textarea value={selectedInterview.exitReason} onChange={(e) => { const updated = {...selectedInterview, exitReason: e.target.value}; setSelectedInterview(updated); setRequests(prev => prev.map(r => r.id === updated.id ? updated : r)); }} rows={4} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Employee feedback..."></textarea>
                        </div>
                        <button onClick={() => Swal.fire('Saved', 'Interview recorded.', 'success')} className="px-6 py-2 bg-brandTeal text-white rounded-lg text-xs font-bold shadow hover:bg-teal-700">Save Interview</button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      Select an employee to view/edit interview.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: MY RESIGNATION */}
        {currentView === 'my_resignation' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-soft border border-white p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brandRed">
                  <FileMinus className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-sidebarBg">Submit Resignation</h2>
                <p className="text-sm text-gray-500">We are sorry to see you go. Please fill in the details below.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Working Day</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notice Period</label>
                    <input type="text" value="30 Days" readOnly className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason for Resignation</label>
                  <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandRed" rows={4} placeholder="Please share your reason..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attach Formal Letter (PDF)</label>
                  <input type="file" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex justify-center pt-4">
                  <button onClick={submitResignation} className="px-8 py-3 bg-brandRed text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Send className="w-4 h-4" /> Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PROCESS MODAL */}
      <BaseModal isOpen={showModal} onClose={() => setShowModal(false)} title="Manage Resignation" icon={Settings} size="lg">
        {selectedRequest && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{selectedRequest.name.charAt(0)}</div>
              <div>
                <h4 className="font-bold text-sidebarBg">{selectedRequest.name}</h4>
                <p className="text-xs text-gray-500">{selectedRequest.position}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select value={selectedRequest.status} onChange={(e) => setSelectedRequest({...selectedRequest, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved (Start Offboarding)</option>
                  <option value="Clearing">Clearing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Working Day</label>
                <input type="date" value={selectedRequest.lastDay} onChange={(e) => setSelectedRequest({...selectedRequest, lastDay: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" />
              </div>
              {selectedRequest.status !== 'Pending' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Offboarding Checklist</label>
                  <div className="bg-white rounded-lg border border-gray-200 p-2 space-y-1">
                    {selectedRequest.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs p-2 hover:bg-gray-50 rounded">
                        <input type="checkbox" checked={item.checked} onChange={() => { const updated = {...selectedRequest}; updated.checklist[idx].checked = !updated.checklist[idx].checked; setSelectedRequest(updated); }} className="accent-brandRed w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Close</button>
          <button onClick={saveChanges} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue">Save Changes</button>
        </div>
      </BaseModal>

      {/* GUIDE SLIDE-OVER */}
      {showGuide && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-sidebarBg text-white">
              <h3 className="font-bold flex items-center gap-2 text-lg m-0 border-0"><BookOpen className="w-5 h-5 text-brandGold" /> คู่มือการใช้งาน</h3>
              <button onClick={() => setShowGuide(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
              <p className="text-sm font-semibold text-brandTeal mb-4">ระบบจัดการการลาออก (Resignation & Turnover)</p>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">1. ขั้นตอนการลาออก (Resignation Requests)</h3>
                <p className="text-sm text-gray-600 mb-2">พนักงานสามารถยื่นคำร้องผ่านระบบ หัวหน้างานและ HR จะได้รับแจ้งเตือน</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li><strong>Pending:</strong> รอการอนุมัติ</li>
                  <li><strong>Approved:</strong> อนุมัติแล้ว เริ่มกระบวนการ Offboarding</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">2. การจัดการ Offboarding</h3>
                <p className="text-sm text-gray-600 mb-2">ติดตามการคืนทรัพย์สินและการปิดระบบต่างๆ ผ่าน Checklist</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>HR สามารถติ๊กรายการที่คืนแล้ว</li>
                  <li>ระบบจะแสดง Progress % ความคืบหน้า</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">3. การสัมภาษณ์ก่อนลาออก (Exit Interview)</h3>
                <p className="text-sm text-gray-600 mb-2">บันทึกสาเหตุการลาออกและข้อเสนอแนะจากพนักงานเพื่อนำไปปรับปรุงองค์กร</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>ระบุสาเหตุหลัก (เงินเดือน, ความก้าวหน้า, ฯลฯ)</li>
                  <li>บันทึกบทสัมภาษณ์</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResignationTurnover;
