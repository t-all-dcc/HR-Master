import React, { useState, useEffect, useRef } from 'react';
import { 
  CalendarOff, BarChart2, LayoutDashboard, FileText, CheckSquare, Calendar, 
  UserMinus, Clock, Thermometer, Percent, Plus, PieChart, KanbanSquare, List, 
  Eye, Check, X, ChevronLeft, ChevronRight, FilePlus, Send, BookOpen
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface LeaveRequest {
  id: number;
  employeeName?: string;
  position?: string;
  dept?: string;
  avatar?: string;
  type: string;
  dates: string;
  toDate?: string;
  days: number;
  reason: string;
  requestedDate: string;
  status: string; // For My Requests view
  finalStatus?: string; // For Approval view
  approvalFlow: { role: string; status: string; by?: string }[];
}

interface LeaveBalance {
  type: string;
  remaining: number;
  total: number;
  icon: any;
}

// --- Mock Data ---
const MOCK_BALANCES: LeaveBalance[] = [
  { type: 'Annual Leave', remaining: 6, total: 12, icon: CalendarOff },
  { type: 'Sick Leave', remaining: 28, total: 30, icon: Thermometer },
  { type: 'Business Leave', remaining: 3, total: 5, icon: FileText },
  { type: 'Unpaid Leave', remaining: 0, total: 0, icon: UserMinus },
];

const MOCK_MY_REQUESTS: LeaveRequest[] = [
  { id: 101, type: 'Annual Leave', dates: '20-22 Jan 2026', days: 3, reason: 'Family trip', requestedDate: '2026-01-10', status: 'Approved', approvalFlow: [] },
];

const MOCK_TEAM_REQUESTS: LeaveRequest[] = [
  { 
    id: 201, employeeName: 'Somchai Jaidee', position: 'Sales Officer', dept: 'Sales', avatar: 'https://i.pravatar.cc/150?img=12',
    type: 'Annual Leave', dates: '2026-01-25', toDate: '2026-01-26', days: 2, reason: 'Personal errands', requestedDate: '2026-01-22',
    status: 'Pending', finalStatus: 'Pending',
    approvalFlow: [
      { role: 'Supervisor', status: 'Approved', by: 'Sup. A' },
      { role: 'Manager', status: 'Pending', by: 'You' },
      { role: 'HR', status: 'Pending', by: '-' }
    ]
  },
  { 
    id: 202, employeeName: 'Alice Smith', position: 'Developer', dept: 'IT', avatar: 'https://i.pravatar.cc/150?img=9',
    type: 'Sick Leave', dates: '2026-01-23', toDate: '2026-01-23', days: 1, reason: 'Migraine', requestedDate: '2026-01-23',
    status: 'Pending', finalStatus: 'Pending',
    approvalFlow: [
      { role: 'Supervisor', status: 'Pending', by: 'Sup. B' },
      { role: 'Manager', status: 'Pending', by: 'You' },
      { role: 'HR', status: 'Pending', by: '-' }
    ]
  }
];

const LeaveManagement = () => {
  const [currentView, setCurrentView] = useState<'hr_overview' | 'dashboard' | 'my_leaves' | 'approvals' | 'calendar'>('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState('Manager');
  const [approvalViewMode, setApprovalViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-01-01'));
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>(MOCK_MY_REQUESTS);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>(MOCK_TEAM_REQUESTS);
  
  // Form State
  const [form, setForm] = useState({ type: 'Annual Leave', fromDate: '', toDate: '', reason: '' });

  // Refs for Charts
  const deptChartRef = useRef<HTMLCanvasElement>(null);
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const usageChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  // Computed
  const pendingCount = teamRequests.filter(req => req.finalStatus === 'Pending' && canApprove(req)).length;

  const hrStats = {
    onLeaveToday: 4,
    totalEmployees: 142,
    totalPending: 8
  };

  // --- Helpers ---
  const getLeaveColor = (type: string) => {
    if (type.includes('Annual')) return '#10B981';
    if (type.includes('Sick')) return '#D91604';
    return '#4F868C';
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === 'Approved') return 'bg-green-100 text-green-700 border-green-200';
    if (status.includes('Pending')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  function canApprove(req: LeaveRequest) {
    const myStepIndex = req.approvalFlow.findIndex(s => s.role === currentUserRole);
    if (myStepIndex === -1) return false;
    
    const myStep = req.approvalFlow[myStepIndex];
    if (myStep.status !== 'Pending') return false;

    if (myStepIndex > 0) {
      return req.approvalFlow[myStepIndex - 1].status === 'Approved';
    }
    return true;
  }

  // --- Actions ---
  const submitRequest = () => {
    if (!form.fromDate || !form.toDate) return Swal.fire('Error', 'Select dates', 'error');
    
    const newReq: LeaveRequest = {
      id: Date.now(),
      type: form.type,
      dates: `${form.fromDate} to ${form.toDate}`,
      days: 1, // Simplified calculation
      reason: form.reason,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Pending Supervisor',
      approvalFlow: [
        { role: 'Supervisor', status: 'Pending' },
        { role: 'Manager', status: 'Pending' },
        { role: 'HR', status: 'Pending' }
      ]
    };
    
    setMyRequests([newReq, ...myRequests]);
    setShowRequestModal(false);
    Swal.fire('Submitted', 'Your leave request has been sent for approval.', 'success');
  };

  const processApproval = (req: LeaveRequest, action: 'Approved' | 'Rejected') => {
    Swal.fire({
      title: `${action}?`,
      text: `Confirm to ${action.toLowerCase()} this request.`,
      icon: action === 'Approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'Approved' ? '#186B8C' : '#D91604'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRequests = teamRequests.map(r => {
          if (r.id === req.id) {
            const newFlow = [...r.approvalFlow];
            const stepIndex = newFlow.findIndex(s => s.role === currentUserRole);
            
            if (stepIndex !== -1) {
              newFlow[stepIndex].status = action;
              
              let newFinalStatus = r.finalStatus;
              if (action === 'Rejected') {
                newFinalStatus = 'Rejected';
              } else {
                if (stepIndex + 1 < newFlow.length) {
                  newFlow[stepIndex + 1].status = 'Pending';
                } else {
                  newFinalStatus = 'Approved';
                }
              }
              return { ...r, approvalFlow: newFlow, finalStatus: newFinalStatus };
            }
          }
          return r;
        });
        
        setTeamRequests(updatedRequests);
        setShowApprovalModal(false);
        Swal.fire('Success', `Request ${action}`, 'success');
      }
    });
  };

  // --- Charts ---
  useEffect(() => {
    // Cleanup old charts
    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    if (currentView === 'hr_overview') {
      if (deptChartRef.current) {
        const ctx = deptChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Sales', 'IT', 'HR', 'Marketing', 'Finance', 'Production'],
              datasets: [{ label: 'Leave Days', data: [12, 8, 4, 15, 6, 20], backgroundColor: '#4F868C', borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          }));
        }
      }
      if (trendChartRef.current) {
        const ctx = trendChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{ label: 'Total Leaves', data: [45, 30, 60, 20, 35, 50], borderColor: '#F2B705', tension: 0.4 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          }));
        }
      }
    }

    if (currentView === 'dashboard') {
      if (usageChartRef.current) {
        const ctx = usageChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Annual', 'Sick', 'Business'],
              datasets: [{ data: [6, 2, 2], backgroundColor: ['#10B981', '#D91604', '#4F868C'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          }));
        }
      }
    }
  }, [currentView]);

  // --- Calendar Logic ---
  const calendarDays = (() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let days = [];
    for(let i=0; i<firstDay; i++) days.push(null);
    for(let i=1; i<=daysInMonth; i++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      days.push({ day: i, date: dateStr });
    }
    while(days.length % 7 !== 0) days.push(null);
    return days;
  })();

  const getEventsForDate = (date: string) => {
    const all = [...teamRequests, ...myRequests.map(r => ({...r, employeeName: 'Me'}))];
    return all.filter(r => r.dates.includes(date) || (r.toDate && r.dates >= date && r.toDate <= date));
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
              <CalendarOff className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">LEAVE MANAGEMENT</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Absence & Time-off System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold">Role:</span>
            <select 
              value={currentUserRole} 
              onChange={(e) => { setCurrentUserRole(e.target.value); setCurrentView('dashboard'); }} 
              className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="Employee">Employee</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR Admin</option>
            </select>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
          {currentUserRole === 'HR' && (
            <button onClick={() => setCurrentView('hr_overview')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'hr_overview' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
              <BarChart2 className="w-4 h-4" /> HR OVERVIEW
            </button>
          )}
          <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'dashboard' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
            <LayoutDashboard className="w-4 h-4" /> MY DASHBOARD
          </button>
          <button onClick={() => setCurrentView('my_leaves')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'my_leaves' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
            <FileText className="w-4 h-4" /> MY REQUESTS
          </button>
          {currentUserRole !== 'Employee' && (
            <button onClick={() => setCurrentView('approvals')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'approvals' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
              <CheckSquare className="w-4 h-4" /> APPROVAL CENTER
              {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>
          )}
          <button onClick={() => setCurrentView('calendar')} className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'calendar' ? 'border-brandDeepBlue text-brandDeepBlue bg-white' : 'border-transparent text-gray-400 hover:text-brandDeepBlue'}`}>
            <Calendar className="w-4 h-4" /> TEAM CALENDAR
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW: HR OVERVIEW */}
        {currentView === 'hr_overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-sidebarBg">Organization Overview</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* KPI Cards */}
              <div className="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-brandRed relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">On Leave Today</p>
                  <h4 className="text-3xl font-bold text-brandRed mt-1">{hrStats.onLeaveToday}</h4>
                  <p className="text-[10px] text-gray-500 mt-2">/ {hrStats.totalEmployees} Staff</p>
                </div>
                <UserMinus className="absolute -right-4 -bottom-4 w-24 h-24 text-brandRed/10 transform rotate-12" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-brandGold relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Approval</p>
                  <h4 className="text-3xl font-bold text-brandGold mt-1">{hrStats.totalPending}</h4>
                  <p className="text-[10px] text-gray-500 mt-2">Requests</p>
                </div>
                <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-brandGold/10 transform rotate-12" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-brandBlue relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sick Leave (YTD)</p>
                  <h4 className="text-3xl font-bold text-brandBlue mt-1">2.5%</h4>
                  <p className="text-[10px] text-green-500 mt-2">Low Risk</p>
                </div>
                <Thermometer className="absolute -right-4 -bottom-4 w-24 h-24 text-brandBlue/10 transform rotate-12" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-brandTeal relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Balance</p>
                  <h4 className="text-3xl font-bold text-brandTeal mt-1">45%</h4>
                  <p className="text-[10px] text-gray-500 mt-2">Remaining</p>
                </div>
                <Percent className="absolute -right-4 -bottom-4 w-24 h-24 text-brandTeal/10 transform rotate-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Leave Distribution by Department</h4>
                <div className="h-64 relative w-full">
                  <canvas ref={deptChartRef}></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Monthly Leave Trend</h4>
                <div className="h-64 relative w-full">
                  <canvas ref={trendChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-sidebarBg">My Leave Balance</h2>
              <button onClick={() => setShowRequestModal(true)} className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow hover:bg-brandBlue flex items-center gap-2">
                <Plus className="w-4 h-4" /> Request Leave
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {MOCK_BALANCES.map((leave, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 relative overflow-hidden group">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{leave.type}</p>
                      <h4 className={`text-3xl font-bold mt-1 ${leave.remaining < 3 ? 'text-red-500' : 'text-sidebarBg'}`}>{leave.remaining}</h4>
                      <p className="text-[10px] text-gray-500 mt-2">/ {leave.total} Days Total</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400">
                      <leave.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(leave.remaining / leave.total) * 100}%`, backgroundColor: getLeaveColor(leave.type) }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white md:col-span-2">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Recent Requests</h4>
                <div className="space-y-4">
                  {myRequests.slice(0, 3).map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                          {req.type.includes('Sick') ? <Thermometer className="w-5 h-5" /> : <CalendarOff className="w-5 h-5" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-sidebarBg">{req.type}</h5>
                          <p className="text-xs text-gray-500">{req.dates} ({req.days} days)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusBadgeColor(req.status)}`}>{req.status}</span>
                        <p className="text-[9px] text-gray-400 mt-1">{req.requestedDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white flex flex-col">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-brandBlue" /> My Leave Usage
                </h4>
                <div className="flex-1 relative w-full flex items-center justify-center">
                  <canvas ref={usageChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: APPROVALS */}
        {currentView === 'approvals' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-sidebarBg">Approval Center</h2>
                <p className="text-sm text-brandMuted">Review leave requests.</p>
              </div>
              <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                <button onClick={() => setApprovalViewMode('kanban')} className={`p-2 rounded-md transition-all ${approvalViewMode === 'kanban' ? 'bg-brandDeepBlue text-white shadow' : 'text-gray-400 hover:text-sidebarBg'}`}>
                  <KanbanSquare className="w-4 h-4" />
                </button>
                <button onClick={() => setApprovalViewMode('table')} className={`p-2 rounded-md transition-all ${approvalViewMode === 'table' ? 'bg-brandDeepBlue text-white shadow' : 'text-gray-400 hover:text-sidebarBg'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {approvalViewMode === 'table' ? (
              <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden flex-1 flex flex-col">
                <div className="overflow-auto custom-scrollbar flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Dates</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Days</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teamRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={req.avatar} className="w-8 h-8 rounded-full border border-gray-100" alt={req.employeeName} />
                              <div>
                                <div className="font-bold text-sm text-sidebarBg">{req.employeeName}</div>
                                <div className="text-[10px] text-gray-400">{req.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-medium text-sidebarBg">{req.type}</td>
                          <td className="p-4 text-xs text-gray-600">{req.dates}</td>
                          <td className="p-4 text-center text-sm font-bold">{req.days}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusBadgeColor(req.finalStatus || 'Pending')}`}>
                              {req.finalStatus}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {req.finalStatus === 'Pending' && canApprove(req) ? (
                              <button onClick={() => { setSelectedRequest(req); setShowApprovalModal(true); }} className="text-brandBlue hover:text-brandDeepBlue font-bold text-xs underline">Review</button>
                            ) : (
                              <button className="text-gray-400 cursor-not-allowed"><Eye className="w-4 h-4 mx-auto" /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto h-full pb-4">
                {/* Kanban Columns */}
                {['Pending', 'Approved', 'Rejected'].map(status => (
                  <div key={status} className="bg-gray-100 rounded-xl p-3 flex flex-col min-w-[300px] w-[320px]">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="text-xs font-bold text-gray-600 uppercase">{status}</span>
                      <span className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        {teamRequests.filter(r => (status === 'Pending' ? (r.finalStatus === 'Pending' && canApprove(r)) : r.finalStatus === status)).length}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                      {teamRequests.filter(r => (status === 'Pending' ? (r.finalStatus === 'Pending' && canApprove(r)) : r.finalStatus === status)).map(req => (
                        <div key={req.id} onClick={() => { setSelectedRequest(req); setShowApprovalModal(true); }} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <img src={req.avatar} className="w-8 h-8 rounded-full border border-gray-100" alt={req.employeeName} />
                            <div>
                              <h4 className="font-bold text-sm text-sidebarBg truncate">{req.employeeName}</h4>
                              <p className="text-[10px] text-gray-500 uppercase">{req.dept}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded p-2 mb-2">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-bold text-brandDeepBlue">{req.type}</span>
                              <span className="text-gray-500">{req.days} Days</span>
                            </div>
                            <div className="text-[10px] text-gray-400">{req.dates}</div>
                          </div>
                          {status === 'Pending' && (
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded font-bold">Waiting for You</span>
                              <span className="text-xs text-brandBlue hover:underline">Review</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: MY LEAVES */}
        {currentView === 'my_leaves' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-sidebarBg mb-6">My Request History</h2>
            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Dates</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Days</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-sm text-brandDeepBlue">{req.type}</div>
                        <div className="text-[10px] text-gray-400">{req.requestedDate}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{req.dates}</td>
                      <td className="p-4 text-center font-bold">{req.days}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusBadgeColor(req.status)}`}>{req.status}</span>
                      </td>
                      <td className="p-4 text-center">
                        {req.status.includes('Pending') && (
                          <button onClick={() => Swal.fire('Cancelled', 'Request cancelled.', 'info')} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: CALENDAR */}
        {currentView === 'calendar' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg flex items-center gap-2">
                <Calendar className="w-6 h-6 text-brandGold" /> {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 rounded hover:bg-gray-200"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 rounded hover:bg-gray-200"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white p-4 flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-7 gap-1 bg-gray-100 rounded-lg p-1 text-center font-bold text-gray-500 text-xs uppercase mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto">
                {calendarDays.map((day, idx) => (
                  <div key={idx} className={`bg-gray-50 rounded-lg p-2 min-h-[100px] border border-transparent hover:border-brandTeal/30 transition-colors ${!day ? 'opacity-0' : ''}`}>
                    {day && (
                      <>
                        <span className="text-xs font-bold text-gray-700 block mb-2">{day.day}</span>
                        <div className="space-y-1">
                          {getEventsForDate(day.date).map(ev => (
                            <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate font-medium cursor-pointer ${ev.type.includes('Annual') ? 'bg-green-500' : 'bg-blue-500'}`} title={`${ev.employeeName} - ${ev.type}`}>
                              {ev.employeeName}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      <BaseModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="New Leave Request" icon={FilePlus}>
        <div className="p-6 bg-gray-50 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Leave Type</label>
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
                  <option>Annual Leave (Vacation)</option>
                  <option>Sick Leave</option>
                  <option>Business Leave</option>
                  <option>Unpaid Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Balance Remaining</label>
                <div className="px-3 py-2 bg-green-50 border border-green-100 rounded-lg text-green-700 font-bold text-sm">
                  {MOCK_BALANCES.find(b => b.type.includes(form.type.split(' ')[0]))?.remaining || '-'} Days
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">From Date</label><input type="date" value={form.fromDate} onChange={(e) => setForm({...form, fromDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
              <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">To Date</label><input type="date" value={form.toDate} onChange={(e) => setForm({...form, toDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reason</label>
              <textarea value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Please specify reason..."></textarea>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowRequestModal(false)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
          <button onClick={submitRequest} className="px-8 py-2.5 bg-brandDeepBlue text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
            <Send className="w-4 h-4" /> Submit Request
          </button>
        </div>
      </BaseModal>

      <BaseModal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title="Review Request" icon={CheckSquare}>
        {selectedRequest && (
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-4 mb-6">
              <img src={selectedRequest.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow" alt={selectedRequest.employeeName} />
              <div>
                <h3 className="text-xl font-bold text-sidebarBg">{selectedRequest.employeeName}</h3>
                <p className="text-sm text-brandMuted">{selectedRequest.position} - {selectedRequest.dept}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-xs text-gray-400 font-bold uppercase block">Leave Type</span><span className="font-bold text-brandDeepBlue">{selectedRequest.type}</span></div>
                <div><span className="text-xs text-gray-400 font-bold uppercase block">Total Days</span><span>{selectedRequest.days} Days</span></div>
                <div className="col-span-2"><span className="text-xs text-gray-400 font-bold uppercase block">Date Range</span><span>{selectedRequest.dates}</span></div>
                <div className="col-span-2"><span className="text-xs text-gray-400 font-bold uppercase block">Reason</span><p className="italic text-gray-600">"{selectedRequest.reason}"</p></div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Approval Status</h4>
              <div className="flex justify-between items-center relative w-full px-2">
                {selectedRequest.approvalFlow.map((step, idx) => (
                  <div key={idx} className={`flex flex-col items-center relative z-10 ${step.status === 'Approved' ? 'text-green-600' : (step.status === 'Rejected' ? 'text-red-600' : 'text-gray-400')}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold bg-white ${step.status === 'Approved' ? 'border-green-500 bg-green-50' : (step.status === 'Rejected' ? 'border-red-500 bg-red-50' : 'border-gray-200')}`}>
                      {step.status === 'Approved' ? <Check className="w-4 h-4" /> : (step.status === 'Rejected' ? <X className="w-4 h-4" /> : idx + 1)}
                    </div>
                    <span className="text-[10px] font-bold mt-1">{step.role}</span>
                    <span className="text-[9px]">{step.status}</span>
                  </div>
                ))}
                {/* Simple line behind steps */}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-0"></div>
              </div>
            </div>

            {selectedRequest.finalStatus === 'Pending' && canApprove(selectedRequest) ? (
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => processApproval(selectedRequest, 'Rejected')} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors">Reject</button>
                <button onClick={() => processApproval(selectedRequest, 'Approved')} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg hover:bg-brandBlue shadow-md transition-colors flex items-center gap-2">
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400 italic">
                {selectedRequest.finalStatus !== 'Pending' ? 'This request is closed.' : 'Waiting for previous approver.'}
              </div>
            )}
          </div>
        )}
      </BaseModal>

    </div>
  );
};

export default LeaveManagement;
