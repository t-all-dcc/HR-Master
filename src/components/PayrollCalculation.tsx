import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, PenTool, Settings, History, HelpCircle, 
  Search, RefreshCw, FileText, TrendingUp, TrendingDown,
  PlusCircle, MinusCircle, Edit2, Save, Trash2, Check, Lock, X, Printer
} from 'lucide-react';
import Swal from 'sweetalert2';
import BaseModal from './BaseModal';

// --- Types ---
interface PayrollItem {
  id: string;
  name: string;
  amount: number;
  isSystem?: boolean;
  isTimeBased?: boolean;
  isFixed?: boolean;
  hours?: number;
  mins?: number;
  days?: number;
  multiplier?: number;
}

interface Employee {
  id: string;
  name: string;
  type: 'Monthly' | 'Daily';
  positionEN: string;
  positionTH: string;
  dept: string;
  baseSalary: number;
  avatar: string;
}

interface PayrollHistory {
  id: string;
  date: string;
  emp: string;
  positionEN: string;
  positionTH: string;
  cycle: string;
  net: number;
  status: string;
}

// --- Mock Data ---
const MOCK_EMPLOYEES: Employee[] = [
  { id: 'EMP001', name: 'Somchai Jaidee', type: 'Monthly', positionEN: 'Production Manager', positionTH: 'ผู้จัดการฝ่ายผลิต', dept: 'PRD', baseSalary: 50000, avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 'EMP002', name: 'Suda Rakdee', type: 'Monthly', positionEN: 'HR Officer', positionTH: 'เจ้าหน้าที่บุคคล', dept: 'HRD', baseSalary: 25000, avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 'EMP006', name: 'Operator 1', type: 'Daily', positionEN: 'Machine Operator', positionTH: 'พนักงานคุมเครื่อง', dept: 'PRD', baseSalary: 12000, avatar: 'https://ui-avatars.com/api/?name=OP' }
];

const MOCK_HISTORY: PayrollHistory[] = [
  { id: 'PAY-2501-001', date: '2025-01-30', emp: 'Somchai Jaidee', positionEN: 'Production Manager', positionTH: 'ผู้จัดการฝ่ายผลิต', cycle: 'Monthly', net: 48500, status: 'Paid' },
  { id: 'PAY-2501-002', date: '2025-01-30', emp: 'Suda Rakdee', positionEN: 'HR Officer', positionTH: 'เจ้าหน้าที่บุคคล', cycle: 'Monthly', net: 24100, status: 'Paid' }
];

const PayrollCalculation = () => {
  const [currentView, setCurrentView] = useState<'calculate' | 'settings' | 'history'>('calculate');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [previewData, setPreviewData] = useState<any>({});
  const [isSettingsEditing, setIsSettingsEditing] = useState(false);

  // Config State
  const [config, setConfig] = useState({
    cycle: 'Monthly',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    workDays: 30,
    ssoRate: 5.0 
  });

  // Standard Items
  const [standardItems, setStandardItems] = useState<{income: PayrollItem[], deduction: PayrollItem[]}>({
    income: [
      { id: 'inc_salary', name: 'Base Salary / Wages', amount: 0, isSystem: true },
      { id: 'inc_incentive', name: 'Incentive', amount: 0, isSystem: false },
      { id: 'inc_diligence', name: 'Diligence Allowance', amount: 0, isSystem: false },
      { id: 'inc_ot1', name: 'OT 1.5x (Workday)', amount: 0, isSystem: true, isTimeBased: true, multiplier: 1.5 },
      { id: 'inc_ot2', name: 'OT 2.0x (Weekend)', amount: 0, isSystem: true, isTimeBased: true, multiplier: 2.0 },
      { id: 'inc_ot3', name: 'OT 3.0x (Holiday)', amount: 0, isSystem: true, isTimeBased: true, multiplier: 3.0 },
      { id: 'inc_perf', name: 'Performance / Piece Rate', amount: 0, isSystem: false },
    ],
    deduction: [
      { id: 'ded_sso', name: 'Social Security', amount: 0, isSystem: true },
      { id: 'ded_tax', name: 'Withholding Tax', amount: 0, isSystem: false },
      { id: 'ded_late', name: 'Late Arrival', amount: 0, isSystem: true, isTimeBased: true },
      { id: 'ded_absent', name: 'Leave w/o Pay', amount: 0, isSystem: true, isTimeBased: true }, 
      { id: 'ded_accom', name: 'Accommodation Fee', amount: 0, isSystem: false },
      { id: 'ded_other', name: 'Other Deductions', amount: 0, isSystem: false }
    ]
  });
  
  const [newItem, setNewItem] = useState({ income: '', deduction: '' });

  // Calculation Data
  const [calcData, setCalcData] = useState<{income: PayrollItem[], deduction: PayrollItem[]}>({ income: [], deduction: [] });
  const [history, setHistory] = useState<PayrollHistory[]>(MOCK_HISTORY);

  // Computed
  const hourlyRate = useMemo(() => {
    if (!selectedEmp) return 0;
    return selectedEmp.baseSalary / 30 / 8;
  }, [selectedEmp]);
  
  const dailyRate = useMemo(() => {
    if (!selectedEmp) return 0;
    return selectedEmp.baseSalary / 30;
  }, [selectedEmp]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return MOCK_EMPLOYEES;
    return MOCK_EMPLOYEES.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalIncome = useMemo(() => calcData.income.reduce((sum, item) => sum + (item.amount || 0), 0), [calcData.income]);
  const totalDeduction = useMemo(() => calcData.deduction.reduce((sum, item) => sum + (item.amount || 0), 0), [calcData.deduction]);
  const netPay = useMemo(() => totalIncome - totalDeduction, [totalIncome, totalDeduction]);

  // Actions
  const initCalculation = (emp: Employee) => {
    let salary = emp.baseSalary;
    if (config.cycle === 'Semi-Monthly') salary = salary / 2;

    // Initialize Income
    const newIncome = standardItems.income.map(item => {
      let obj = { ...item, amount: 0, hours: 0, mins: 0, days: (item.id === 'inc_salary' && emp.type === 'Daily') ? config.workDays : 0 };
      
      if (item.id === 'inc_salary') {
        if (emp.type === 'Monthly') obj.amount = salary;
        else obj.amount = dailyRate * (obj.days || 0);
      }
      
      if (item.id === 'inc_perf' && emp.type !== 'Daily') return null;

      return obj;
    }).filter((x): x is PayrollItem => x !== null); 

    // Initialize Deduction
    const newDeduction = standardItems.deduction.map(item => {
      let obj = { ...item, amount: 0, hours: 0, mins: 0, days: 0 };
      if (item.id === 'ded_sso') {
        let ssoBase = Math.min(emp.baseSalary, 15000);
        obj.amount = ssoBase * (config.ssoRate / 100);
        if (config.cycle === 'Semi-Monthly') obj.amount = obj.amount / 2;
      }
      if (item.id === 'ded_tax') obj.amount = salary * 0.03; 
      return obj;
    });

    setCalcData({ income: newIncome, deduction: newDeduction });
  };

  const selectEmployee = (emp: Employee) => {
    setSelectedEmp(emp);
    setSearchQuery('');
    setShowDropdown(false);
    initCalculation(emp);
  };

  const updateTimeAmount = (item: PayrollItem, type: 'income' | 'deduction') => {
    if (!selectedEmp) return;
    
    // Create a copy of the item to modify
    const updatedItem = { ...item };

    // Daily Wage Calculation
    if (updatedItem.id === 'inc_salary' && selectedEmp.type === 'Daily') {
      updatedItem.amount = Math.round(dailyRate * (updatedItem.days || 0));
    } else {
      let h = updatedItem.hours || 0;
      let m = updatedItem.mins || 0;
      let totalHours = h + (m / 60);

      if (updatedItem.multiplier) {
        updatedItem.amount = Math.round(hourlyRate * updatedItem.multiplier * totalHours);
      } else if (updatedItem.id === 'ded_late') {
        updatedItem.amount = Math.round(hourlyRate * totalHours);
      } else if (updatedItem.id === 'ded_absent') {
        let d = updatedItem.days || 0;
        updatedItem.amount = Math.round((dailyRate * d) + (hourlyRate * totalHours));
      }
    }

    // Update state
    setCalcData(prev => ({
      ...prev,
      [type]: prev[type].map(i => i.id === item.id ? updatedItem : i)
    }));
  };

  const syncAttendance = () => {
    Swal.fire({ title: 'Syncing...', timer: 800, didOpen: () => Swal.showLoading() }).then(() => {
      // Mock sync logic
      const newIncome = [...calcData.income];
      const otIndex = newIncome.findIndex(i => i.id === 'inc_ot1');
      if (otIndex !== -1) {
        newIncome[otIndex] = { ...newIncome[otIndex], hours: 5, mins: 30 };
        // Recalculate amount for OT
        let totalHours = 5 + (30 / 60);
        newIncome[otIndex].amount = Math.round(hourlyRate * (newIncome[otIndex].multiplier || 1) * totalHours);
      }

      const newDeduction = [...calcData.deduction];
      const lateIndex = newDeduction.findIndex(d => d.id === 'ded_late');
      if (lateIndex !== -1) {
        newDeduction[lateIndex] = { ...newDeduction[lateIndex], hours: 0, mins: 45 };
        // Recalculate amount for Late
        let totalHours = 0 + (45 / 60);
        newDeduction[lateIndex].amount = Math.round(hourlyRate * totalHours);
      }
      
      setCalcData({ income: newIncome, deduction: newDeduction });
      Swal.fire('Synced', 'Data updated from attendance.', 'success');
    });
  };

  const savePayroll = () => {
    if (!selectedEmp) return;
    const newRecord: PayrollHistory = {
      id: `PAY-2502-${String(history.length+1).padStart(3,'0')}`,
      date: new Date().toISOString().split('T')[0],
      emp: selectedEmp.name,
      positionEN: selectedEmp.positionEN,
      positionTH: selectedEmp.positionTH,
      cycle: config.cycle,
      net: netPay,
      status: 'Draft'
    };
    setHistory([newRecord, ...history]);
    setShowPreviewModal(false);
    Swal.fire('Saved', 'Success', 'success');
    setCurrentView('history'); 
    setSelectedEmp(null); 
  };

  const openPreview = () => {
    if (!selectedEmp) return;
    setPreviewData({
      id: selectedEmp.id, 
      name: selectedEmp.name, 
      position: selectedEmp.positionEN, 
      dept: selectedEmp.dept,
      totalIncome, 
      totalDeduction, 
      netPay,
      income: calcData.income.filter(i => i.amount > 0), 
      deduction: calcData.deduction.filter(d => d.amount > 0)
    });
    setShowPreviewModal(true);
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">PAYROLL CALCULATION</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Pre-Payroll Processing</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
              <button onClick={() => setCurrentView('calculate')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'calculate' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <PenTool className="w-4 h-4" /> CALCULATE
              </button>
              <button onClick={() => setCurrentView('settings')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'settings' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <Settings className="w-4 h-4" /> SETTINGS
              </button>
              <button onClick={() => setCurrentView('history')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'history' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <History className="w-4 h-4" /> HISTORY
              </button>
            </div>
            <button onClick={() => setShowGuide(true)} className="w-8 h-8 rounded-full bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-colors" title="User Guide">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* VIEW: CALCULATE */}
        {currentView === 'calculate' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
            
            {/* 1. Configuration Panel */}
            <div className="bg-white rounded-2xl shadow-soft border border-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                {/* Cycle Config */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Cycle</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setConfig({...config, cycle: 'Monthly'})} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${config.cycle === 'Monthly' ? 'bg-white text-sidebarBg shadow-sm' : 'text-gray-400'}`}>Monthly</button>
                    <button onClick={() => setConfig({...config, cycle: 'Semi-Monthly'})} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${config.cycle === 'Semi-Monthly' ? 'bg-white text-brandDeepBlue shadow-sm' : 'text-gray-400'}`}>Semi-Monthly</button>
                  </div>
                </div>

                {/* Date Range */}
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Period Start</label><input type="date" value={config.startDate} onChange={(e) => setConfig({...config, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Period End</label><input type="date" value={config.endDate} onChange={(e) => setConfig({...config, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
                   <div>
                    <label className="block text-[10px] font-bold text-brandBlue uppercase mb-1 flex items-center gap-1">SSO Rate (%)</label>
                    <div className="relative">
                      <input type="number" value={config.ssoRate} onChange={(e) => setConfig({...config, ssoRate: parseFloat(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal pr-8 text-brandBlue font-bold" min="0" max="10" step="0.1" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                    </div>
                  </div>
                </div>

                {/* Employee Select */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Employee</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowDropdown(true)} 
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder="Search ID or Name..." 
                      className="w-full pl-9 pr-8 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"
                    />
                    
                    {showDropdown && filteredEmployees.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredEmployees.map(emp => (
                          <div key={emp.id} onClick={() => selectEmployee(emp)} className="p-3 hover:bg-brandTeal/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                            <div className="flex justify-between items-center">
                              <div className="font-bold text-sm text-sidebarBg">{emp.name}</div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${emp.type === 'Daily' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{emp.type}</span>
                            </div>
                            <div className="text-xs text-gray-500 flex flex-col mt-0.5">
                              <span className="font-mono text-gray-400">{emp.id}</span>
                              <span className="text-brandTeal font-bold">{emp.positionEN}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Calculation Workspace */}
            {selectedEmp ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Left: Profile & Base Data */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="bg-white rounded-2xl shadow-soft border border-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brandGold/10 rounded-bl-full"></div>
                    <div className="flex items-center gap-4 mb-6">
                      <img src={selectedEmp.avatar} className="w-16 h-16 rounded-full border-4 border-gray-50 shadow-md" alt={selectedEmp.name} />
                      <div>
                        <h2 className="text-lg font-bold text-sidebarBg">{selectedEmp.name}</h2>
                        <p className="text-xs text-brandMuted font-mono">{selectedEmp.id}</p>
                        <div className="flex flex-col mt-1">
                          <span className="text-[11px] font-bold text-brandTeal">{selectedEmp.positionEN}</span>
                          <span className="text-[10px] text-gray-400">{selectedEmp.positionTH}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Base Rate / Salary</label>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedEmp.type === 'Daily' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{selectedEmp.type}</span>
                        </div>
                        <div className="text-2xl font-bold text-sidebarBg tracking-tight">฿ {selectedEmp.baseSalary.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ {selectedEmp.type === 'Daily' ? 'Day' : 'Month'}</span></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white border border-gray-200 rounded-xl text-center">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Hourly Rate</label>
                          <div className="text-lg font-bold text-brandBlue">{hourlyRate.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                        </div>
                        <div className="p-3 bg-white border border-gray-200 rounded-xl text-center">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Daily Rate</label>
                          <div className="text-lg font-bold text-brandBlue">{dailyRate.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                        </div>
                      </div>
                      <button onClick={syncAttendance} className="w-full py-2 bg-brandDeepBlue/10 text-brandDeepBlue rounded-lg text-xs font-bold hover:bg-brandDeepBlue hover:text-white transition-colors flex justify-center items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Sync Time & Attendance
                      </button>
                    </div>
                  </div>
                  
                  {/* Net Pay Card */}
                  <div className="bg-sidebarBg text-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-brandGold text-xs font-bold uppercase tracking-widest mb-1">Estimated Net Pay</p>
                    <h2 className="text-4xl font-bold tracking-tighter mb-4">฿ {netPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                    <div className="w-full h-px bg-white/10 mb-4"></div>
                    <div className="w-full flex justify-between text-xs text-gray-400">
                      <span>Gross Income:</span>
                      <span className="text-green-400 font-bold">{totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="w-full flex justify-between text-xs text-gray-400 mt-1">
                      <span>Total Deduction:</span>
                      <span className="text-red-400 font-bold">-{totalDeduction.toLocaleString()}</span>
                    </div>
                    <button onClick={openPreview} className="mt-6 w-full py-3 bg-brandGold text-sidebarBg font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition-transform active:scale-95 flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Preview Slip
                    </button>
                  </div>
                </div>

                {/* Right: Calculator (Side-by-Side Grid) */}
                <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  
                  {/* Income Section */}
                  <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-green-50/30 flex justify-between items-center">
                      <h3 className="font-bold text-green-700 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Earnings (รายได้)</h3>
                      <button onClick={() => setCalcData(prev => ({...prev, income: [...prev.income, { id: `inc_${Date.now()}`, name: 'New Item', amount: 0, isFixed: false }] }))} className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1 rounded-lg hover:bg-green-50 font-bold">+ Custom Item</button>
                    </div>
                    
                    <div className="flex-grow flex flex-col">
                      {/* Table Header */}
                      <div className="grid grid-cols-[4fr_3fr_2.5fr_30px] gap-2 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                        <div>Item Name</div>
                        <div className="text-center">Details / Time</div>
                        <div className="text-right">Amount (THB)</div>
                        <div></div>
                      </div>
                      
                      {/* Items */}
                      <div className="p-2 space-y-0">
                        {calcData.income.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-[4fr_3fr_2.5fr_30px] gap-2 items-center px-4 py-2 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            {/* Name */}
                            <div>
                              <input 
                                type="text" 
                                value={item.name} 
                                onChange={(e) => {
                                  const newData = [...calcData.income];
                                  newData[idx].name = e.target.value;
                                  setCalcData({...calcData, income: newData});
                                }}
                                className="w-full bg-transparent border-none p-0 text-xs font-bold text-sidebarBg focus:ring-0" 
                                disabled={item.isFixed || item.isTimeBased} 
                              />
                            </div>
                            
                            {/* Input / Detail */}
                            <div className="flex justify-center items-center">
                              {/* Time Input for OT */}
                              {item.isTimeBased ? (
                                <div className="flex gap-1 items-center bg-gray-50 rounded px-1.5 py-0.5 border border-gray-200">
                                  <input 
                                    type="number" 
                                    value={item.hours || ''} 
                                    onChange={(e) => {
                                      const newData = [...calcData.income];
                                      newData[idx].hours = parseFloat(e.target.value);
                                      setCalcData({...calcData, income: newData});
                                      updateTimeAmount(newData[idx], 'income');
                                    }}
                                    className="w-8 bg-transparent outline-none p-0 text-center text-xs font-bold h-auto" 
                                    placeholder="H" 
                                  />
                                  <span className="text-xs text-gray-400 font-normal">:</span>
                                  <input 
                                    type="number" 
                                    value={item.mins || ''} 
                                    onChange={(e) => {
                                      const newData = [...calcData.income];
                                      newData[idx].mins = parseFloat(e.target.value);
                                      setCalcData({...calcData, income: newData});
                                      updateTimeAmount(newData[idx], 'income');
                                    }}
                                    className="w-8 bg-transparent outline-none p-0 text-center text-xs font-bold h-auto" 
                                    placeholder="M" 
                                  />
                                  <span className="text-[9px] text-gray-400 ml-1">x{item.multiplier}</span>
                                </div>
                              ) : (item.id === 'inc_salary' && selectedEmp.type === 'Daily') ? (
                                <div className="flex gap-1 items-center bg-gray-50 rounded px-1.5 py-0.5 border border-gray-200">
                                  <input 
                                    type="number" 
                                    value={item.days || ''} 
                                    onChange={(e) => {
                                      const newData = [...calcData.income];
                                      newData[idx].days = parseFloat(e.target.value);
                                      setCalcData({...calcData, income: newData});
                                      updateTimeAmount(newData[idx], 'income');
                                    }}
                                    className="w-10 bg-transparent outline-none p-0 text-center text-xs font-bold h-auto" 
                                  />
                                  <span className="text-xs text-gray-400 font-normal">Days</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-300">- Fixed -</span>
                              )}
                            </div>

                            {/* Amount */}
                            <div className="relative">
                              <input 
                                type="number" 
                                value={item.amount} 
                                onChange={(e) => {
                                  const newData = [...calcData.income];
                                  newData[idx].amount = parseFloat(e.target.value);
                                  setCalcData({...calcData, income: newData});
                                }}
                                className="w-full bg-transparent border-none p-0 text-right text-xs font-bold text-green-700 focus:ring-0" 
                                readOnly={item.isTimeBased || (item.id === 'inc_salary' && selectedEmp.type === 'Daily')} 
                              />
                            </div>
                            
                            {/* Action */}
                            <div className="flex justify-center">
                              {!item.isFixed ? (
                                <button onClick={() => {
                                  const newData = [...calcData.income];
                                  newData.splice(idx, 1);
                                  setCalcData({...calcData, income: newData});
                                }} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                              ) : (
                                <Lock className="w-3 h-3 text-gray-200" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Subtotal Footer */}
                    <div className="px-6 py-3 bg-green-50/50 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-green-800 mt-auto">
                      <span>Total Earnings</span>
                      <span>{totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>

                  {/* Deduction Section */}
                  <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-red-50/30 flex justify-between items-center">
                      <h3 className="font-bold text-red-700 flex items-center gap-2"><TrendingDown className="w-5 h-5" /> Deductions (รายการหัก)</h3>
                      <button onClick={() => setCalcData(prev => ({...prev, deduction: [...prev.deduction, { id: `ded_${Date.now()}`, name: 'New Deduction', amount: 0, isFixed: false }] }))} className="text-xs bg-white border border-red-200 text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 font-bold">+ Custom Item</button>
                    </div>
                    
                    <div className="flex-grow flex flex-col">
                      {/* Table Header */}
                      <div className="grid grid-cols-[4fr_3fr_2.5fr_30px] gap-2 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                        <div>Item Name</div>
                        <div className="text-center">Details / Time</div>
                        <div className="text-right">Amount (THB)</div>
                        <div></div>
                      </div>

                      {/* Items */}
                      <div className="p-2 space-y-0">
                        {calcData.deduction.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-[4fr_3fr_2.5fr_30px] gap-2 items-center px-4 py-2 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            {/* Name */}
                            <div>
                              <input 
                                type="text" 
                                value={item.name} 
                                onChange={(e) => {
                                  const newData = [...calcData.deduction];
                                  newData[idx].name = e.target.value;
                                  setCalcData({...calcData, deduction: newData});
                                }}
                                className="w-full bg-transparent border-none p-0 text-xs font-bold text-sidebarBg focus:ring-0" 
                                disabled={item.isFixed || item.isTimeBased} 
                              />
                            </div>
                            
                            {/* Input / Detail */}
                            <div className="flex justify-center items-center">
                              {item.isTimeBased ? (
                                <div className="flex gap-1 items-center bg-gray-50 rounded px-1.5 py-0.5 border border-gray-200">
                                  {item.id === 'ded_absent' && (
                                    <div className="flex items-center border-r border-gray-300 pr-1 mr-1">
                                      <input 
                                        type="number" 
                                        value={item.days || ''} 
                                        onChange={(e) => {
                                          const newData = [...calcData.deduction];
                                          newData[idx].days = parseFloat(e.target.value);
                                          setCalcData({...calcData, deduction: newData});
                                          updateTimeAmount(newData[idx], 'deduction');
                                        }}
                                        className="w-6 bg-transparent outline-none p-0 text-center text-xs font-bold h-auto" 
                                        placeholder="D" 
                                      />
                                      <span className="text-[9px] text-gray-400">d</span>
                                    </div>
                                  )}
                                  <input 
                                    type="number" 
                                    value={item.hours || ''} 
                                    onChange={(e) => {
                                      const newData = [...calcData.deduction];
                                      newData[idx].hours = parseFloat(e.target.value);
                                      setCalcData({...calcData, deduction: newData});
                                      updateTimeAmount(newData[idx], 'deduction');
                                    }}
                                    className="w-6 bg-transparent outline-none p-0 text-center text-xs font-bold h-auto" 
                                    placeholder="H" 
                                  />
                                  <span className="text-xs text-gray-400 font-normal">:</span>
                                  <input 
                                    type="number" 
                                    value={item.mins || ''} 
                                    onChange={(e) => {
                                      const newData = [...calcData.deduction];
                                      newData[idx].mins = parseFloat(e.target.value);
                                      setCalcData({...calcData, deduction: newData});
                                      updateTimeAmount(newData[idx], 'deduction');
                                    }}
                                    className="w-6 bg-transparent outline-none p-0 text-center text-xs font-bold h-auto" 
                                    placeholder="M" 
                                  />
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-300">- Fixed -</span>
                              )}
                            </div>

                            {/* Amount */}
                            <div className="relative">
                              <input 
                                type="number" 
                                value={item.amount} 
                                onChange={(e) => {
                                  const newData = [...calcData.deduction];
                                  newData[idx].amount = parseFloat(e.target.value);
                                  setCalcData({...calcData, deduction: newData});
                                }}
                                className="w-full bg-transparent border-none p-0 text-right text-xs font-bold text-red-700 focus:ring-0" 
                                readOnly={item.isTimeBased} 
                                disabled={item.id === 'ded_sso'} 
                              />
                            </div>

                            {/* Action */}
                            <div className="flex justify-center">
                              {!item.isFixed ? (
                                <button onClick={() => {
                                  const newData = [...calcData.deduction];
                                  newData.splice(idx, 1);
                                  setCalcData({...calcData, deduction: newData});
                                }} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                              ) : (
                                <Lock className="w-3 h-3 text-gray-200" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Subtotal Footer */}
                    <div className="px-6 py-3 bg-red-50/50 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-red-800 mt-auto">
                      <span>Total Deductions</span>
                      <span>{totalDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-600">Select an Employee</h3>
                <p className="text-sm text-gray-400">Search ID or Name to start calculation.</p>
              </div>
            )}

          </div>
        )}

        {/* VIEW: SETTINGS */}
        {currentView === 'settings' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-bold text-sidebarBg">Standard Payroll Items</h2>
                <p className="text-sm text-brandMuted">Define default earnings and deductions for all employees.</p>
              </div>
              <div>
                {!isSettingsEditing ? (
                  <button onClick={() => setIsSettingsEditing(true)} className="bg-white border border-brandTeal/20 text-brandTeal px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-brandTeal hover:text-white transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Items
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsSettingsEditing(false)} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-300">Cancel</button>
                    <button onClick={saveSettings} className="bg-brandDeepBlue text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-brandBlue flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Standard Income */}
              <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-green-50/30">
                  <h3 className="font-bold text-green-700 flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Standard Income</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {standardItems.income.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg">
                        <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => {
                            const newItems = [...standardItems.income];
                            newItems[idx].name = e.target.value;
                            setStandardItems({...standardItems, income: newItems});
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-brandTeal" 
                          disabled={!isSettingsEditing} 
                        />
                        {item.isSystem && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">System</span>}
                        {item.isTimeBased && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Time-based</span>}
                        {isSettingsEditing && !item.isSystem && (
                          <button onClick={() => {
                            const newItems = [...standardItems.income];
                            newItems.splice(idx, 1);
                            setStandardItems({...standardItems, income: newItems});
                          }} className="text-gray-300 hover:text-red-500 ml-auto"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isSettingsEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <input type="text" value={newItem.income} onChange={(e) => setNewItem({...newItem, income: e.target.value})} placeholder="New Income Item" className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-brandTeal" />
                        <button onClick={() => {
                          if (!newItem.income) return;
                          setStandardItems(prev => ({...prev, income: [...prev.income, { id: `inc_${Date.now()}`, name: newItem.income, amount: 0, isSystem: false }]}));
                          setNewItem({...newItem, income: ''});
                        }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Standard Deductions */}
              <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-red-50/30">
                  <h3 className="font-bold text-red-700 flex items-center gap-2"><MinusCircle className="w-5 h-5" /> Standard Deductions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {standardItems.deduction.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg">
                        <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => {
                            const newItems = [...standardItems.deduction];
                            newItems[idx].name = e.target.value;
                            setStandardItems({...standardItems, deduction: newItems});
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-brandTeal" 
                          disabled={!isSettingsEditing} 
                        />
                        {item.isSystem && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">System</span>}
                        {item.isTimeBased && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Time-based</span>}
                        {isSettingsEditing && !item.isSystem && (
                          <button onClick={() => {
                            const newItems = [...standardItems.deduction];
                            newItems.splice(idx, 1);
                            setStandardItems({...standardItems, deduction: newItems});
                          }} className="text-gray-300 hover:text-red-500 ml-auto"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isSettingsEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <input type="text" value={newItem.deduction} onChange={(e) => setNewItem({...newItem, deduction: e.target.value})} placeholder="New Deduction Item" className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-brandTeal" />
                        <button onClick={() => {
                          if (!newItem.deduction) return;
                          setStandardItems(prev => ({...prev, deduction: [...prev.deduction, { id: `ded_${Date.now()}`, name: newItem.deduction, amount: 0, isSystem: false }]}));
                          setNewItem({...newItem, deduction: ''});
                        }} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: HISTORY */}
        {currentView === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Calculation History</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search record..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-brandTeal" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 uppercase text-gray-500 font-bold text-xs">Doc No.</th>
                    <th className="p-4 uppercase text-gray-500 font-bold text-xs">Date</th>
                    <th className="p-4 uppercase text-gray-500 font-bold text-xs">Employee / Position</th>
                    <th className="p-4 uppercase text-gray-500 font-bold text-xs">Cycle</th>
                    <th className="p-4 uppercase text-gray-500 font-bold text-xs text-right">Net Pay</th>
                    <th className="p-4 uppercase text-gray-500 font-bold text-xs text-center">Status</th>
                    <th className="p-4 uppercase text-gray-500 font-bold text-xs text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono font-bold text-brandDeepBlue text-xs">{h.id}</td>
                      <td className="p-4 text-xs">{h.date}</td>
                      <td className="p-4">
                        <div className="font-bold text-sidebarBg text-sm">{h.emp}</div>
                        <div className="text-[10px] text-gray-400 flex flex-col">
                          <span>{h.positionEN}</span>
                          <span>{h.positionTH}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-500">{h.cycle}</td>
                      <td className="p-4 text-right font-mono font-bold text-green-700">฿ {h.net.toLocaleString()}</td>
                      <td className="p-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{h.status}</span></td>
                      <td className="p-4 text-center">
                        <button onClick={() => {
                          // Mock print history
                          setPreviewData({
                            id: 'HIST-001', name: h.emp, position: h.positionEN, dept: 'N/A',
                            totalIncome: h.net + 1000, totalDeduction: 1000, netPay: h.net,
                            income: [{ name: 'Base Salary', amount: h.net + 1000 }], 
                            deduction: [{ name: 'SSO', amount: 1000 }]
                          });
                          setShowPreviewModal(true);
                        }} className="text-gray-400 hover:text-brandBlue"><Printer className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* PREVIEW MODAL */}
      <BaseModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="Payslip Preview" icon={FileText} size="lg">
        <div className="p-8 bg-gray-100 overflow-y-auto custom-scrollbar">
          <div className="bg-white border border-gray-200 p-8 shadow-lg relative font-serif">
            <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">LOGO</div>
                <div>
                  <h2 className="text-lg font-bold text-black uppercase">T All Intelligence Co., Ltd.</h2>
                  <p className="text-xs text-gray-500 w-64">46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-sidebarBg uppercase">Payslip</h3>
                <p className="text-xs text-gray-500">ใบแจ้งเงินเดือน</p>
                <p className="text-xs font-bold mt-2 text-brandBlue">{new Date(config.startDate).toLocaleDateString()} - {new Date(config.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex justify-between text-xs mb-6">
              <div className="space-y-1">
                <p><span className="font-bold text-gray-500 w-20 inline-block">Name:</span> {previewData.name}</p>
                <p><span className="font-bold text-gray-500 w-20 inline-block">Position:</span> {previewData.position}</p>
              </div>
              <div className="text-right space-y-1">
                <p><span className="font-bold text-gray-500 w-20 inline-block">Emp ID:</span> {previewData.id}</p>
                <p><span className="font-bold text-gray-500 w-20 inline-block">Dept:</span> {previewData.dept}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-xs border-t border-b border-gray-300 py-4">
              {/* Income */}
              <div className="border-r border-gray-200 pr-4">
                <h4 className="font-bold text-green-700 mb-3 uppercase tracking-wide">Earnings (รายได้)</h4>
                {previewData.income?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between mb-2">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-mono">{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                ))}
              </div>
              {/* Deduction */}
              <div className="pl-4">
                <h4 className="font-bold text-red-700 mb-3 uppercase tracking-wide">Deductions (รายการหัก)</h4>
                {previewData.deduction?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between mb-2">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-mono">{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs font-bold bg-gray-50 p-2 border-b border-gray-300">
              <div className="flex justify-between pr-4">
                <span>Total Earnings</span>
                <span>{previewData.totalIncome?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-red-600 pl-4">
                <span>Total Deductions</span>
                <span>{previewData.totalDeduction?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-sidebarBg text-white rounded flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-wider">Net Pay (เงินได้สุทธิ)</span>
              <span className="text-2xl font-bold font-mono">฿ {previewData.netPay?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            
            <div className="mt-8 text-[10px] text-gray-400 text-center">
              * This is a computer-generated document. No signature is required.
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => window.print()} className="px-6 py-2 bg-brandDeepBlue text-white text-sm font-bold rounded-lg shadow hover:bg-brandBlue flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print
          </button>
          {currentView === 'calculate' && (
            <button onClick={savePayroll} className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg shadow hover:bg-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> Save
            </button>
          )}
        </div>
      </BaseModal>

      {/* Guide Slide-Over */}
      {showGuide && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-sidebarBg text-white">
              <h3 className="font-bold flex items-center gap-2 text-lg m-0 border-0"><HelpCircle className="w-5 h-5 text-brandGold" /> คู่มือการใช้งาน</h3>
              <button onClick={() => setShowGuide(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans text-sm text-gray-600">
              <p className="font-semibold text-brandTeal">ระบบคำนวณเงินเดือน (Payroll Calculation)</p>
              
              <div>
                <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">1. Settings (ตั้งค่ารายการมาตรฐาน)</h3>
                <p className="mb-2">กำหนดรายการรับ-จ่ายที่ใช้บ่อย เพื่อให้ระบบดึงไปใช้กับพนักงานทุกคน</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Edit Items:</strong> กดปุ่มนี้เพื่อแก้ไขชื่อรายการหรือลบรายการที่ไม่ใช้</li>
                  <li><strong>Standard Income:</strong> เบี้ยขยัน, ค่ากะ, Incentive</li>
                  <li><strong>Standard Deductions:</strong> ค่าที่พัก, หักอื่นๆ</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">2. Calculate (หน้าคำนวณ)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Cycle:</strong> เลือก Monthly หรือ Semi-Monthly</li>
                  <li><strong>SSO Rate:</strong> ปรับ % ประกันสังคม (ปกติ 5%)</li>
                  <li><strong>Daily Employee:</strong> สำหรับพนักงานรายวัน ระบบจะขึ้นช่อง "Days" ให้ระบุจำนวนวันทำงานเพื่อคำนวณค่าแรง</li>
                  <li><strong>Smart Inputs:</strong> กรอกเวลา OT / Late / Leave เป็น ชั่วโมง:นาที</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">3. History (ประวัติ)</h3>
                <p>ดูรายการย้อนหลัง กดปุ่มเครื่องพิมพ์เพื่อดูและพิมพ์สลิปเงินเดือนแบบถูกต้องตามกฎหมาย</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PayrollCalculation;
