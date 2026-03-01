import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Gift, FileText, CheckSquare, Book, PlusCircle, 
  Search, Paperclip, CheckCircle, X, UploadCloud, Info, HeartHandshake
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface Entitlement {
  id: number;
  name: string;
  desc: string;
  limit: number;
  used: number;
  icon: any; // Lucide icon component
  bgColor: string;
  textColor: string;
  barColor: string;
}

interface Claim {
  id: string;
  category: string;
  title: string;
  date: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface ApprovalRequest {
  id: string;
  employeeName: string;
  department: string;
  category: string;
  title: string;
  date: string;
  amount: number;
}

interface CatalogItem {
  id: number;
  name: string;
  category: string;
  description: string;
  limit: number;
  image: string;
}

// --- Mock Data ---
const MOCK_ENTITLEMENTS = [
  { id: 1, name: 'Medical (OPD)', desc: 'Out-patient medical expenses', limit: 20000, used: 5000, icon: 'stethoscope', bgColor: 'bg-blue-100', textColor: 'text-blue-600', barColor: 'bg-blue-500' },
  { id: 2, name: 'Dental Care', desc: 'Dental treatments and scaling', limit: 5000, used: 1500, icon: 'smile', bgColor: 'bg-teal-100', textColor: 'text-teal-600', barColor: 'bg-teal-500' },
  { id: 3, name: 'Vision Care', desc: 'Eye exam and glasses', limit: 3000, used: 0, icon: 'eye', bgColor: 'bg-purple-100', textColor: 'text-purple-600', barColor: 'bg-purple-500' },
  { id: 4, name: 'Fitness/Wellness', desc: 'Gym and sports equipment', limit: 10000, used: 8000, icon: 'activity', bgColor: 'bg-orange-100', textColor: 'text-orange-600', barColor: 'bg-orange-500' },
  { id: 5, name: 'Education', desc: 'Courses and books', limit: 15000, used: 2500, icon: 'book-open', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', barColor: 'bg-yellow-500' },
];

const MOCK_CLAIMS: Claim[] = [
  { id: 'CLM-001', category: 'Medical (OPD)', title: 'Flu Treatment', date: '2024-01-15', amount: 1200, status: 'Approved' },
  { id: 'CLM-002', category: 'Fitness/Wellness', title: 'Gym Membership Q1', date: '2024-01-10', amount: 4500, status: 'Approved' },
  { id: 'CLM-003', category: 'Dental Care', title: 'Scaling', date: '2024-02-05', amount: 1500, status: 'Pending' },
];

const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 'REQ-101', employeeName: 'Somchai Jaidee', department: 'Sales', category: 'Medical (OPD)', title: 'Migraine Checkup', date: '2024-02-10', amount: 2500 },
  { id: 'REQ-102', employeeName: 'Alice Smith', department: 'IT', category: 'Education', title: 'AWS Certification', date: '2024-02-11', amount: 5000 },
];

const MOCK_CATALOG: CatalogItem[] = [
  { id: 1, name: 'Group Health Insurance', category: 'Health', description: 'Comprehensive coverage for IPD/OPD/Accident.', limit: 50000, image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Annual Health Checkup', category: 'Health', description: 'Standard checkup package at partner hospitals.', limit: 3000, image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Provident Fund', category: 'Financial', description: 'Company contribution 3-7% based on service years.', limit: 0, image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Remote Work Support', category: 'Allowance', description: 'Internet and electricity allowance for WFH.', limit: 1000, image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=600&q=80' },
];

const BenefitsWelfare = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'my_benefits' | 'claims' | 'approval' | 'catalog'>('dashboard');
  const [userRole, setUserRole] = useState<'Employee' | 'Manager' | 'HR'>('Employee');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State
  const [entitlements, setEntitlements] = useState(MOCK_ENTITLEMENTS);
  const [myClaims, setMyClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>(MOCK_APPROVALS);
  const [form, setForm] = useState({ category: '', amount: '', date: '', title: '' });

  // Computed Stats
  const myStats = useMemo(() => {
    const totalLimit = entitlements.reduce((sum, item) => sum + item.limit, 0);
    const used = entitlements.reduce((sum, item) => sum + item.used, 0);
    const pending = myClaims.filter(c => c.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);
    return { totalLimit, used, remaining: totalLimit - used, pendingAmount: pending };
  }, [entitlements, myClaims]);

  const filteredClaims = useMemo(() => {
    if (!searchQuery) return myClaims;
    return myClaims.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myClaims, searchQuery]);

  // Actions
  const openClaimModal = (category = '') => {
    setForm({ 
      category: category || entitlements[0].name, 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      title: '' 
    });
    setShowClaimModal(true);
  };

  const submitClaim = () => {
    if (!form.amount || !form.title) return Swal.fire('Error', 'Please fill all fields', 'error');
    
    const newClaim: Claim = {
      id: `CLM-${Math.floor(Math.random() * 1000)}`,
      category: form.category,
      title: form.title,
      date: form.date,
      amount: parseFloat(form.amount),
      status: 'Pending'
    };

    setMyClaims([newClaim, ...myClaims]);
    
    // Update usage locally for demo
    setEntitlements(prev => prev.map(e => {
      if (e.name === form.category) {
        return { ...e, used: e.used + parseFloat(form.amount) };
      }
      return e;
    }));

    setShowClaimModal(false);
    Swal.fire('Submitted', 'Claim submitted for approval.', 'success');
  };

  const processApproval = (req: ApprovalRequest, action: 'Approved' | 'Rejected') => {
    Swal.fire({
      title: `${action}?`,
      text: `Confirm to ${action.toLowerCase()} this request for ${req.employeeName}.`,
      icon: action === 'Approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'Approved' ? '#10B981' : '#EF4444'
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingApprovals(prev => prev.filter(r => r.id !== req.id));
        Swal.fire('Success', `Request ${action}`, 'success');
      }
    });
  };

  // Helpers
  const formatMoney = (val: number) => new Intl.NumberFormat('th-TH').format(val);
  
  const getStatusBadgeColor = (status: string) => {
    if (status === 'Approved') return 'bg-green-100 text-green-700';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  // Charts
  useEffect(() => {
    if (currentView === 'dashboard') {
      const ctx = document.getElementById('usageChart') as HTMLCanvasElement;
      let chart: Chart | null = null;

      if (ctx) {
        chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: entitlements.map(e => e.name),
            datasets: [{
              label: 'Used Amount',
              data: entitlements.map(e => e.used),
              backgroundColor: ['#3B82F6', '#14B8A6', '#A855F7', '#F97316', '#EAB308'],
              borderRadius: 6
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { y: { beginAtZero: true } } 
          }
        });
      }

      return () => {
        if (chart) chart.destroy();
      };
    }
  }, [currentView, entitlements]);

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandTeal text-brandGold shadow-lg">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">BENEFITS & WELFARE</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Employee Care System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold">Role:</span>
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value as any)} 
              className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR Admin</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-2 border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'dashboard' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> DASHBOARD
          </button>
          <button onClick={() => setCurrentView('my_benefits')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'my_benefits' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <Gift className="w-4 h-4" /> MY BENEFITS
          </button>
          <button onClick={() => setCurrentView('claims')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'claims' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <FileText className="w-4 h-4" /> CLAIM HISTORY
          </button>
          {userRole !== 'Employee' && (
            <button onClick={() => setCurrentView('approval')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'approval' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
              <CheckSquare className="w-4 h-4" /> APPROVALS
              {pendingApprovals.length > 0 && <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>}
            </button>
          )}
          <button onClick={() => setCurrentView('catalog')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'catalog' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <Book className="w-4 h-4" /> CATALOG
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Overview (FY2026)</h2>
              <button onClick={() => openClaimModal()} className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow hover:bg-brandBlue flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Make a Claim
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-soft border-l-4 border-brandTeal">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Entitlement</p>
                <h3 className="text-2xl font-bold text-sidebarBg mt-2">฿ {formatMoney(myStats.totalLimit)}</h3>
                <p className="text-[10px] text-brandTeal mt-1">Annual Budget</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-soft border-l-4 border-brandBlue">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Claimed Amount</p>
                <h3 className="text-2xl font-bold text-sidebarBg mt-2">฿ {formatMoney(myStats.used)}</h3>
                <p className="text-[10px] text-brandBlue mt-1">Total Usage</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-soft border-l-4 border-brandGold">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Remaining</p>
                <h3 className="text-2xl font-bold text-sidebarBg mt-2">฿ {formatMoney(myStats.remaining)}</h3>
                <p className="text-[10px] text-brandGold mt-1">Available to claim</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-soft border-l-4 border-brandRed">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Approval</p>
                <h3 className="text-2xl font-bold text-sidebarBg mt-2">฿ {formatMoney(myStats.pendingAmount)}</h3>
                <p className="text-[10px] text-brandRed mt-1">Waiting for manager</p>
              </div>
            </div>

            {/* Quick Usage View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Usage by Category</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="usageChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Recent Claims</h4>
                <div className="space-y-4">
                  {myClaims.slice(0, 4).map(claim => (
                    <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-brandBlue shadow-sm">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-sidebarBg">{claim.title}</h5>
                          <p className="text-[10px] text-gray-500">{claim.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs text-brandDeepBlue">฿{formatMoney(claim.amount)}</p>
                        <span className={`text-[9px] font-bold ${claim.status === 'Approved' ? 'text-green-600' : claim.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>{claim.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: MY BENEFITS */}
        {currentView === 'my_benefits' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">My Entitlements</h2>
              <p className="text-sm text-brandMuted">Check your balance per category.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {entitlements.map(benefit => (
                <div key={benefit.id} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all group hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${benefit.bgColor} ${benefit.textColor}`}>
                      <Gift className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Limit</p>
                      <p className="text-sm font-bold text-sidebarBg">฿ {formatMoney(benefit.limit)}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-sidebarBg mb-1">{benefit.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{benefit.desc}</p>
                  
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span className="text-brandBlue">{Math.round((benefit.used / benefit.limit) * 100)}% Used</span>
                    <span className="text-gray-400">Remaining: ฿ {formatMoney(benefit.limit - benefit.used)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                    <div className={`h-full rounded-full ${benefit.barColor}`} style={{ width: `${(benefit.used / benefit.limit) * 100}%` }}></div>
                  </div>
                  
                  <button onClick={() => openClaimModal(benefit.name)} className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-brandBlue hover:text-white hover:border-brandBlue transition-colors">
                    Request Claim
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: CLAIM HISTORY */}
        {currentView === 'claims' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Claim History</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search claims..." 
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-brandTeal" 
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Claim ID</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="p-4 text-xs font-mono font-bold text-brandDeepBlue">{claim.id}</td>
                      <td className="p-4 text-sm text-sidebarBg font-bold flex items-center gap-2">
                        {claim.category}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{claim.title}</td>
                      <td className="p-4 text-xs text-gray-500">{claim.date}</td>
                      <td className="p-4 text-right text-sm font-bold text-sidebarBg">฿ {formatMoney(claim.amount)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeColor(claim.status)}`}>{claim.status}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-gray-400 hover:text-brandBlue"><FileText className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: APPROVALS */}
        {currentView === 'approval' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Pending Approvals</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {pendingApprovals.map(req => (
                <div key={req.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:border-brandTeal transition-all">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg text-brandDeepBlue">{req.employeeName.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-sidebarBg">{req.employeeName}</h4>
                      <p className="text-xs text-gray-500">{req.department}</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full md:w-auto text-left md:text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase">{req.category}</p>
                    <p className="text-sm text-sidebarBg font-medium">{req.title}</p>
                    <p className="text-xs text-gray-500">{req.date}</p>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <p className="text-xl font-bold text-brandDeepBlue">฿ {formatMoney(req.amount)}</p>
                    <button className="text-[10px] text-brandBlue hover:underline flex items-center justify-end gap-1 mt-1 ml-auto"><Paperclip className="w-3 h-3" /> View Receipt</button>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button onClick={() => processApproval(req, 'Rejected')} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 border border-red-100">Reject</button>
                    <button onClick={() => processApproval(req, 'Approved')} className="px-6 py-2 bg-brandTeal text-white rounded-lg text-xs font-bold hover:bg-teal-700 shadow-md">Approve</button>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No pending claims to approve.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: CATALOG */}
        {currentView === 'catalog' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Benefits Catalog</h2>
              <p className="text-sm text-brandMuted">All available benefits for employees.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_CATALOG.map(item => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="h-32 bg-gray-100 relative">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-sidebarBg shadow">{item.category}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sidebarBg mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs font-bold text-brandBlue">Limit: ฿ {formatMoney(item.limit)}/Yr</span>
                      <button className="text-gray-400 hover:text-brandTeal"><Info className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: CLAIM FORM */}
      <BaseModal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} title="Submit Claim Request" icon={PlusCircle}>
        <div className="p-6 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Benefit Category</label>
              <select 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"
              >
                {entitlements.map(b => (
                  <option key={b.name} value={b.name}>{b.name} (Bal: {formatMoney(b.limit - b.used)})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (THB)</label>
                <input 
                  type="number" 
                  value={form.amount} 
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal font-bold text-brandDeepBlue text-right" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description / Clinic Name</label>
              <input 
                type="text" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" 
                placeholder="e.g. Dental Checkup at ABC Clinic" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Receipt / Evidence</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500">Click to upload file</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowClaimModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={submitClaim} className="px-6 py-2 bg-brandTeal text-white text-xs font-bold rounded-lg shadow hover:bg-teal-700">Submit Claim</button>
        </div>
      </BaseModal>

    </div>
  );
};

export default BenefitsWelfare;
