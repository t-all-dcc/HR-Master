import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserPlus, 
  LayoutGrid, 
  List, 
  BarChart2, 
  HelpCircle, 
  Plus, 
  Users, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock, 
  UserCheck, 
  Eye, 
  FilePlus, 
  X, 
  Send, 
  Check, 
  Briefcase 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface Request {
  id: string;
  jdCode: string;
  position: string;
  department: string;
  type: 'New' | 'Replacement';
  amount: number;
  date: string;
  status: string;
  level: string;
  empType: string;
  salaryMin: number | string;
  salaryMax: number | string;
  startDate: string;
  reason: string;
  replaceName?: string;
  recruitmentStatus?: string;
  recruitmentProgress?: number;
  candidateCount?: number;
}

interface JD {
  code: string;
  title: string;
  dept: string;
  level: string;
  purpose: string;
  responsibilities: { desc: string }[];
}

// --- Mock Data ---
const MOCK_JD_MASTER: JD[] = [
  { code: 'JD-HR-001', title: 'HR Manager', dept: 'HR', level: 'Manager', purpose: 'To oversee all aspects of Human Resources practices and processes.', responsibilities: [{desc:'Review Manpower Planning'}, {desc:'Final decisions on selection'}] },
  { code: 'JD-IT-003', title: 'Senior Software Engineer', dept: 'IT', level: 'Senior', purpose: 'Develop, record and maintain cutting edge web-based PHP applications.', responsibilities: [{desc:'Develop software features'}, {desc:'Perform Code Reviews'}] },
  { code: 'JD-SL-006', title: 'Sales Representative', dept: 'Sales', level: 'Officer', purpose: 'Sell products and services to customers.', responsibilities: [{desc:'Customer Visits'}, {desc:'Issue Quotations'}] },
  { code: 'JD-MK-008', title: 'Content Creator', dept: 'Marketing', level: 'Officer', purpose: 'Create engaging content for social media.', responsibilities: [{desc:'Write Content & Captions'}, {desc:'Create Graphic Visuals'}] }
];

const MOCK_REQUESTS: Request[] = [
  { id: 'MR-2023-001', jdCode: 'JD-SL-006', position: 'Sales Representative', department: 'Sales', type: 'New', amount: 2, date: '2023-10-01', status: 'Pending HR Review', level: 'Officer', empType: 'Full-time', salaryMin: 20000, salaryMax: 30000, startDate: '2023-11-01', reason: 'Expand market to northern region.' },
  { id: 'MR-2023-003', jdCode: 'JD-MK-008', position: 'Content Creator', department: 'Marketing', type: 'New', amount: 1, date: '2023-09-20', status: 'Approved', level: 'Officer', empType: 'Contract', salaryMin: 12000, salaryMax: 15000, startDate: '2023-10-15', reason: 'Assist in Q4 campaign.', recruitmentStatus: 'Interviewing', recruitmentProgress: 60, candidateCount: 3 },
];

const LOG_TABS = ['All', 'Pending HR Review', 'Pending Management', 'Approved', 'Rejected'];

const ManpowerRequest = () => {
  const [currentUserRole, setCurrentUserRole] = useState('Manager');
  const [currentMainTab, setCurrentMainTab] = useState<'board' | 'log' | 'dashboard'>('board');
  const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // Selection
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  
  // Form
  const [form, setForm] = useState<Partial<Request> & { jobPurpose?: string; responsibilities?: { desc: string }[] }>({
    jdCode: '', position: '', department: '', level: '', 
    jobPurpose: '', responsibilities: [],
    amount: 1, type: 'New', replaceName: '', 
    startDate: '', empType: 'Full-time', salaryMin: '', salaryMax: '', reason: ''
  });

  // --- Computed ---
  const pendingCount = useMemo(() => requests.filter(r => r.status.includes('Pending')).length, [requests]);
  const approvedCount = useMemo(() => requests.filter(r => r.status === 'Approved').length, [requests]);

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'All') return requests;
    return requests.filter(r => r.status === filterStatus);
  }, [requests, filterStatus]);

  const canApprove = useMemo(() => {
    if (currentUserRole === 'HR' && selectedRequest?.status === 'Pending HR Review') return true;
    if (currentUserRole === 'Manager' && selectedRequest?.status === 'Pending Management') return true;
    return false;
  }, [currentUserRole, selectedRequest]);

  // --- Actions ---
  const getRequestsByStatus = (status: string) => requests.filter(r => r.status === status);

  const openCreateModal = () => {
    setForm({ 
      jdCode: '', position: '', department: '', level: '', jobPurpose: '', responsibilities: [],
      amount: 1, type: 'New', replaceName: '', startDate: '', empType: 'Full-time', salaryMin: '', salaryMax: '', reason: '' 
    });
    setShowCreateModal(true);
  };

  const onJDSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jd = MOCK_JD_MASTER.find(j => j.code === e.target.value);
    if (jd) {
      setForm(prev => ({
        ...prev,
        jdCode: jd.code,
        position: jd.title,
        department: jd.dept,
        level: jd.level,
        jobPurpose: jd.purpose,
        responsibilities: jd.responsibilities
      }));
    }
  };

  const submitRequest = () => {
    if(!form.jdCode || !form.reason) {
      Swal.fire('Error', 'Please select a JD and fill required fields', 'error');
      return;
    }
    
    const newReq: Request = {
      id: `MR-2023-${String(requests.length + 1).padStart(3, '0')}`,
      jdCode: form.jdCode!,
      position: form.position!,
      department: form.department!,
      type: form.type!,
      amount: form.amount!,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending HR Review',
      level: form.level!,
      empType: form.empType!,
      salaryMin: form.salaryMin!,
      salaryMax: form.salaryMax!,
      startDate: form.startDate!,
      reason: form.reason!,
      replaceName: form.replaceName,
      recruitmentStatus: 'Open', 
      recruitmentProgress: 0, 
      candidateCount: 0
    };
    
    setRequests([newReq, ...requests]);
    setShowCreateModal(false);
    Swal.fire('Success', 'Request submitted to HR', 'success');
  };

  const openViewModal = (req: Request) => {
    setSelectedRequest(req);
    setApprovalComment('');
    setShowViewModal(true);
  };

  const processApproval = (action: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        if (action === 'Approved') {
          if (req.status === 'Pending HR Review') {
            return { ...req, status: 'Pending Management' };
          } else if (req.status === 'Pending Management') {
            return { ...req, status: 'Approved', recruitmentStatus: 'Sourcing' };
          }
        } else {
          return { ...req, status: 'Rejected' };
        }
      }
      return req;
    });

    setRequests(updatedRequests);
    
    if (action === 'Approved') {
      if (selectedRequest.status === 'Pending HR Review') {
        Swal.fire('Verified', 'Request forwarded to Management', 'success');
      } else {
        Swal.fire('Approved', 'Manpower approved. Recruitment started!', 'success');
      }
    } else {
      Swal.fire('Rejected', 'Request has been rejected.', 'error');
    }
    setShowViewModal(false);
  };

  // --- Charts ---
  useEffect(() => {
    if (currentMainTab === 'dashboard') {
      const deptData: Record<string, number> = {};
      requests.forEach(r => { deptData[r.department] = (deptData[r.department] || 0) + 1; });
      
      const typeData: Record<string, number> = { New: 0, Replacement: 0 };
      requests.forEach(r => { if(typeData[r.type] !== undefined) typeData[r.type]++; });

      const ctx1 = document.getElementById('deptChart') as HTMLCanvasElement;
      const ctx2 = document.getElementById('typeChart') as HTMLCanvasElement;

      let chart1: Chart | null = null;
      let chart2: Chart | null = null;

      if (ctx1) {
        chart1 = new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: Object.keys(deptData),
            datasets: [{ label: '# of Requests', data: Object.values(deptData), backgroundColor: '#5A94A7', borderRadius: 4 }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      if (ctx2) {
        chart2 = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: Object.keys(typeData),
            datasets: [{ data: Object.values(typeData), backgroundColor: ['#16778C', '#D95032'] }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      return () => {
        if (chart1) chart1.destroy();
        if (chart2) chart2.destroy();
      };
    }
  }, [currentMainTab, requests]);

  // --- Helpers ---
  const getStatusClass = (status: string) => {
    if (status === 'Pending HR Review') return 'bg-blue-50 text-blue-600 border border-blue-200';
    if (status === 'Pending Management') return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
    if (status === 'Approved') return 'bg-green-50 text-green-600 border border-green-200';
    return 'bg-red-50 text-red-600 border border-red-200';
  };

  const getStepColor = (step: number) => {
    if (!selectedRequest) return 'bg-gray-200';
    const status = selectedRequest.status;
    if(status === 'Approved') return 'bg-green-500';
    if(status === 'Pending Management' && step === 1) return 'bg-green-500';
    return 'bg-gray-200';
  };
  
  const getStepBadgeColor = (step: number) => {
    if (!selectedRequest) return 'bg-gray-100 text-gray-400';
    const status = selectedRequest.status;
    if(status === 'Approved') return 'bg-green-500 text-white';
    if(step === 1 && (status === 'Pending Management')) return 'bg-green-500 text-white';
    if(step === 1 && (status === 'Pending HR Review')) return 'bg-blue-100 text-blue-600 border border-blue-200';
    if(step === 2 && (status === 'Pending Management')) return 'bg-yellow-100 text-yellow-600 border border-yellow-200';
    return 'bg-gray-100 text-gray-400';
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandTeal text-brandGold shadow-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">MANPOWER REQUEST</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Planning & Hiring Request</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold">Role:</span>
            <select value={currentUserRole} onChange={(e) => setCurrentUserRole(e.target.value)} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
              <option value="Manager">Manager</option>
              <option value="HR">HR Admin</option>
            </select>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50">
          <button onClick={() => setCurrentMainTab('board')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentMainTab === 'board' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <LayoutGrid className="w-4 h-4" /> REQUEST BOARD
          </button>
          <button onClick={() => setCurrentMainTab('log')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentMainTab === 'log' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <List className="w-4 h-4" /> LOG SHEET
          </button>
          <button onClick={() => setCurrentMainTab('dashboard')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentMainTab === 'dashboard' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <BarChart2 className="w-4 h-4" /> DASHBOARD
          </button>
          <button onClick={() => setShowGuide(true)} className="ml-auto my-auto w-8 h-8 rounded-full bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* TAB 1: REQUEST BOARD */}
        {currentMainTab === 'board' && (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-sidebarBg">Request Board</h2>
              <button onClick={openCreateModal} className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow-md hover:bg-brandBlue flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Request
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto h-full pb-2">
              {/* Columns */}
              {[
                { title: 'HR Review', status: 'Pending HR Review', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500' },
                { title: 'Manager Approval', status: 'Pending Management', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-500' },
                { title: 'Recruiting (Approved)', status: 'Approved', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500' },
                { title: 'Rejected', status: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500' }
              ].map(col => (
                <div key={col.status} className="bg-gray-100 rounded-xl p-3 flex flex-col h-full min-w-[280px] flex-1">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <h4 className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${col.color} ${col.bg}`}>{col.title}</h4>
                    <span className="text-xs font-bold text-gray-400">{getRequestsByStatus(col.status).length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                    {getRequestsByStatus(col.status).map(req => (
                      <div key={req.id} onClick={() => openViewModal(req)} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all ${col.border}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded">{req.id}</span>
                          <span className="text-[10px] text-gray-500">{req.date}</span>
                        </div>
                        <h5 className="font-bold text-sm text-sidebarBg mb-1">{req.position}</h5>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-mono text-brandTeal bg-brandTeal/5 px-1 rounded border border-brandTeal/20">{req.jdCode}</span>
                          <span className="text-xs text-gray-500">{req.department}</span>
                        </div>
                        
                        {req.status === 'Approved' && (
                          <div className="bg-gray-50 border border-gray-100 rounded p-2 mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-bold uppercase text-brandDeepBlue">Recruitment</span>
                              <span className="text-[9px] text-green-600 font-bold">{req.recruitmentStatus || 'Open'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-brandTeal h-1.5 rounded-full" style={{ width: `${req.recruitmentProgress}%` }}></div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${req.type === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{req.type}</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                            <Users className="w-3 h-3" /> {req.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LOG SHEET */}
        {currentMainTab === 'log' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-soft border border-white flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-sidebarBg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brandTeal" /> Request Log Sheet
                  </h3>
                  <button onClick={openCreateModal} className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create New Request
                  </button>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {LOG_TABS.map(tab => (
                    <button key={tab} onClick={() => setFilterStatus(tab)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus === tab ? 'bg-brandDeepBlue text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Req ID</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Position</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Department</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Amount</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRequests.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4 text-xs font-mono font-bold text-brandDeepBlue">{req.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-sidebarBg text-sm">{req.position}</div>
                          <div className="text-[10px] text-gray-400">JD: {req.jdCode}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{req.department}</td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-1 rounded font-bold border ${req.type === 'New' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {req.type === 'New' ? 'New Position' : 'Replacement'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-700">{req.amount}</td>
                        <td className="p-4 text-center text-xs text-gray-500">{req.date}</td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${getStatusClass(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => openViewModal(req)} className="p-2 text-gray-400 hover:text-brandDeepBlue hover:bg-brandDeepBlue/5 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic">No requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DASHBOARD */}
        {currentMainTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Performance Dashboard</h2>
              <span className="text-xs text-gray-400">Last updated: Just now</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-card border border-white flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-brandBlue/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Requests</p>
                  <h3 className="text-3xl font-bold text-sidebarBg">{requests.length}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-brandBlue font-medium">
                  <FileText className="w-4 h-4" /> Year to Date
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-card border border-white flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-brandGold/10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Approval</p>
                  <h3 className="text-3xl font-bold text-brandGold">{pendingCount}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-600 font-medium">
                  <Clock className="w-4 h-4" /> Action Needed
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-card border border-white flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Recruitment</p>
                  <h3 className="text-3xl font-bold text-green-600">{approvedCount}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <UserCheck className="w-4 h-4" /> Positions Open
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4">Requests by Department</h4>
                <div className="h-64 flex justify-center">
                  <canvas id="deptChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4">Requests by Type</h4>
                <div className="h-64 flex justify-center">
                  <canvas id="typeChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      <BaseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Manpower Request" icon={FilePlus} size="xl">
        <div className="p-6 bg-gray-50/50">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-brandDeepBlue mb-4 uppercase tracking-wide border-b border-gray-100 pb-2">1. Position & Job Scope (From JD Master)</h4>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-brandDeepBlue uppercase mb-1">Select Job Position</label>
              <select 
                value={form.jdCode || ''} 
                onChange={onJDSelect} 
                className="w-full bg-brandTeal/5 border border-brandTeal/50 rounded-lg px-3 py-2 text-sm font-bold text-brandDeepBlue outline-none focus:ring-2 focus:ring-brandTeal/20"
              >
                <option value="" disabled>-- Choose Position from Master --</option>
                {MOCK_JD_MASTER.map(jd => (
                  <option key={jd.code} value={jd.code}>{jd.code} - {jd.title} ({jd.dept})</option>
                ))}
              </select>
            </div>

            {form.jdCode && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Job Purpose</span>
                  <span className="text-[10px] font-mono text-gray-400">{form.jdCode}</span>
                </div>
                <p className="text-sm text-gray-700 italic mb-3">{form.jobPurpose}</p>
                
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Key Responsibilities (Preview)</span>
                <ul className="list-disc list-inside text-xs text-gray-600">
                  {form.responsibilities?.slice(0, 3).map((resp, i) => <li key={i}>{resp.desc}</li>)}
                  {(form.responsibilities?.length || 0) > 3 && <li className="list-none text-gray-400 pl-4 italic">+ {(form.responsibilities?.length || 0) - 3} more...</li>}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position Title</label><input type="text" value={form.position} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label><input type="text" value={form.department} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: parseInt(e.target.value)})} min="1" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label><input type="text" value={form.level} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-brandDeepBlue mb-4 uppercase tracking-wide border-b border-gray-100 pb-2">2. Justification</h4>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Request Type</label>
              <div className="flex gap-4 mt-2">
                <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 transition-colors ${form.type === 'New' ? 'border-brandTeal bg-brandTeal/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" checked={form.type === 'New'} onChange={() => setForm({...form, type: 'New'})} className="accent-brandTeal" />
                  <span className="text-sm font-bold text-sidebarBg">New Position</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 transition-colors ${form.type === 'Replacement' ? 'border-brandOrange bg-brandOrange/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" checked={form.type === 'Replacement'} onChange={() => setForm({...form, type: 'Replacement'})} className="accent-brandOrange" />
                  <span className="text-sm font-bold text-sidebarBg">Replacement</span>
                </label>
              </div>
            </div>

            {form.type === 'Replacement' && (
              <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Replacing Who?</label>
                <input type="text" value={form.replaceName} onChange={e => setForm({...form, replaceName: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Name of employee leaving" />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason / Workload Analysis</label>
              <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Explain why this position is needed..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employment Type</label>
                <select value={form.empType} onChange={e => setForm({...form, empType: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
                  <option>Full-time (Permanent)</option>
                  <option>Contract</option>
                  <option>Daily / Part-time</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget / Salary Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.salaryMin} onChange={e => setForm({...form, salaryMin: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Min" />
                  <span className="text-gray-400">-</span>
                  <input type="number" value={form.salaryMax} onChange={e => setForm({...form, salaryMax: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Max" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
          <button onClick={submitRequest} className="px-8 py-2.5 bg-brandDeepBlue text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
            <Send className="w-4 h-4" /> Submit Request
          </button>
        </div>
      </BaseModal>

      {/* VIEW MODAL */}
      <BaseModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedRequest?.position || 'Request Details'} icon={FileText} size="lg">
        {selectedRequest && (
          <div className="p-8">
            {/* Status Timeline */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center w-full max-w-lg">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow"><Check className="w-4 h-4" /></div>
                  <div className="text-[10px] font-bold mt-1 text-green-600">Submitted</div>
                </div>
                <div className={`h-1 flex-1 mx-2 rounded ${getStepColor(1)}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow ${getStepBadgeColor(1)}`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-bold mt-1 text-gray-500">HR Review</div>
                </div>
                <div className={`h-1 flex-1 mx-2 rounded ${getStepColor(2)}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow ${getStepBadgeColor(2)}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-bold mt-1 text-gray-500">Manager Approve</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="text-brandTeal font-bold uppercase text-xs mb-3 border-b border-gray-100 pb-1">Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-500">Linked JD:</span> <span className="font-mono text-brandDeepBlue font-bold bg-blue-50 px-2 rounded">{selectedRequest.jdCode}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Department:</span> <span class="font-bold">{selectedRequest.department}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Amount:</span> <span class="font-bold">{selectedRequest.amount} positions</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Level:</span> <span class="font-bold">{selectedRequest.level}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Emp Type:</span> <span class="font-bold">{selectedRequest.empType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type:</span> 
                    <span className={selectedRequest.type === 'New' ? 'text-blue-600 font-bold' : 'text-orange-600 font-bold'}>{selectedRequest.type}</span>
                  </div>
                  {selectedRequest.type === 'Replacement' && (
                    <div className="flex justify-between"><span className="text-gray-500">Replacing:</span> <span class="font-bold text-red-500">{selectedRequest.replaceName}</span></div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-brandTeal font-bold uppercase text-xs mb-3 border-b border-gray-100 pb-1">Budget & Plan</h4>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-500">Salary Range:</span> <span class="font-bold">{Number(selectedRequest.salaryMin).toLocaleString()} - {Number(selectedRequest.salaryMax).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Target Start:</span> <span class="font-bold">{selectedRequest.startDate}</span></div>
                  <div className="mt-4">
                    <span className="text-gray-500 block mb-1">Justification:</span>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">{selectedRequest.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            {canApprove ? (
              <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Review Comment</label>
                <textarea value={approvalComment} onChange={e => setApprovalComment(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal mb-4" rows={2} placeholder="Add comments for approval or rejection..."></textarea>
                
                <div className="flex justify-end gap-3">
                  <button onClick={() => processApproval('Rejected')} className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-colors">Reject</button>
                  <button onClick={() => processApproval('Approved')} className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Check className="w-4 h-4" /> Approve & Proceed
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-400 italic text-xs">
                Current Status: <span className="font-bold text-gray-600">{selectedRequest.status}</span>
              </div>
            )}
          </div>
        )}
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
              <p className="text-sm font-semibold text-brandTeal mb-4">ระบบขออัตรากำลังคน (Manpower Request)</p>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">1. การสร้างคำขอใหม่ (New Request)</h3>
                <p className="text-sm text-gray-600 mb-2">เลือกตำแหน่งงานจากฐานข้อมูล (JD Master) เพื่อให้ข้อมูลถูกต้องแม่นยำ</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li><strong>New Position:</strong> สำหรับตำแหน่งงานที่เพิ่มใหม่ในโครงสร้าง</li>
                  <li><strong>Replacement:</strong> สำหรับทดแทนพนักงานที่ลาออก (ต้องระบุชื่อคนเดิม)</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">2. กระบวนการอนุมัติ (Approval Workflow)</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li><strong>Pending HR Review:</strong> HR ตรวจสอบความถูกต้องและงบประมาณ</li>
                  <li><strong>Pending Management:</strong> ผู้บริหารอนุมัติขั้นสุดท้าย</li>
                  <li><strong>Approved:</strong> เริ่มกระบวนการสรรหาทันที</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">3. การติดตามสถานะ (Tracking)</h3>
                <p className="text-sm text-gray-600 mb-2">ดูสถานะคำขอได้ที่ Request Board หรือ Log Sheet หากอนุมัติแล้ว ระบบจะแสดงความคืบหน้าการสรรหา (Recruitment Progress)</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManpowerRequest;
