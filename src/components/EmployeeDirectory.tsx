import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  Users, 
  Search, 
  Upload, 
  Sparkles, 
  HelpCircle, 
  FileSpreadsheet, 
  X, 
  CheckCircle, 
  UploadCloud, 
  Camera, 
  Briefcase, 
  User, 
  Phone, 
  Coins, 
  Save, 
  Edit,
  Trash2,
  Filter,
  GraduationCap
} from 'lucide-react';
import BaseModal from '../components/BaseModal';
import Swal from 'sweetalert2';
import Papa from 'papaparse';
import { exportToGoogleSheets } from '../utils/sheetHelper';

// Mock Data
const MOCK_NEW_HIRES = [
  { id: 'CAND-001', name: 'Wipa Sookjai', position: 'Senior Accountant', dept: 'Finance', salary: 35000, startDate: '2024-02-01', appId: 'APP-2023-089', image: '' },
  { id: 'CAND-002', name: 'John Doe', position: 'Sales Executive', dept: 'Sales', salary: 25000, startDate: '2024-02-15', appId: 'APP-2023-092', image: '' }
];

const MOCK_EMPLOYEES = Array.from({length: 15}, (_, i) => ({
    empId: `EMP-2024${String(i+1).padStart(3,'0')}`, 
    nameEN: `Employee Name ${i+1}`, 
    nameTH: `ชื่อพนักงาน ${i+1}`, 
    nickname: `Nick ${i+1}`,
    jobTitle: i % 3 === 0 ? 'Senior Staff' : 'Officer', 
    jobTitleTH: i % 3 === 0 ? 'เจ้าหน้าที่อาวุโส' : 'เจ้าหน้าที่',
    department: i % 2 === 0 ? 'HR' : (i % 3 === 0 ? 'IT' : 'Sales'), 
    section: 'General', 
    office: 'Headquarters',
    workStatus: i === 4 ? 'Resigned' : 'Active', 
    hiringDate: '2024-01-01', 
    idCard: `123456789012${i}`, 
    socialSecurity: `987654321${i}`,
    birthdate: '1990-05-15', 
    age: 34, 
    gender: i % 2 === 0 ? 'Male' : 'Female', 
    nationality: 'Thai', 
    religion: 'Buddhism',
    maritalStatus: 'Single', 
    kids: 0, 
    militaryStatus: 'Exempted', 
    email: `employee${i+1}@hrmaster.com`, 
    phone: `081-234-567${i}`, 
    addressID: '123 Bangkok Thailand', 
    addressPresent: '456 Nonthaburi',
    education: "Master's Degree", 
    major: 'Management',
    image: `https://i.pravatar.cc/150?img=${i + 10}`,
    initialSalary: 25000, 
    bank: 'KBANK', 
    bankAccount: `123-4-56789-${i}`
}));

const EmployeeDirectory = () => {
  const [currentView, setCurrentView] = useState<'new_hires' | 'employees'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [newHires, setNewHires] = useState(MOCK_NEW_HIRES);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Form State
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [previewData, setPreviewData] = useState<any[]>([]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(e => 
      e.nameEN.toLowerCase().includes(query) || 
      e.empId.toLowerCase().includes(query) || 
      e.department.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  // Handlers
  const openRegistrationModal = (data: any = null) => {
    const defaultForm = { 
        empId: '', nameEN: '', nameTH: '', nickname: '', jobTitle: '', department: '', section: '', office: '', jobStatus: 'Probation', workStatus: 'Active',
        hiringDate: new Date().toISOString().split('T')[0],
        initialSalary: 0, gender: 'Male', nationality: 'Thai', education: 'Bachelor', image: null
    };

    if (data && data.empId) {
        setFormData(JSON.parse(JSON.stringify(data)));
    } else if (data && data.appId) {
        setFormData({ 
            ...defaultForm,
            nameEN: data.name, 
            jobTitle: data.position, 
            department: data.dept, 
            initialSalary: data.salary, 
            hiringDate: data.startDate, 
            appId: data.appId
        });
    } else {
        setFormData({ ...defaultForm });
    }
    setActiveTab(0);
    setIsRegModalOpen(true);
  };

  const handleSaveEmployee = () => {
    if (!formData.empId) {
        Swal.fire('Error', 'Please generate Staff ID first.', 'error');
        return;
    }
    
    const idx = employees.findIndex(e => e.empId === formData.empId);
    if (idx !== -1) {
        const updated = [...employees];
        updated[idx] = { ...formData };
        setEmployees(updated);
    } else {
        setEmployees([formData, ...employees]);
        if (formData.appId) {
            setNewHires(prev => prev.filter(h => h.appId !== formData.appId));
        }
    }
    
    setIsRegModalOpen(false);
    Swal.fire({
        title: 'Success',
        text: 'Employee record saved successfully!',
        icon: 'success',
        confirmButtonColor: '#186B8C'
    });
    setCurrentView('employees');
  };

  const generateID = () => {
    const count = employees.length + 1;
    setFormData({ ...formData, empId: `EMP-${new Date().getFullYear()}${String(count).padStart(3, '0')}` });
  };

  const calculateServiceYear = (date: string) => {
    if(!date) return '-';
    const diff = new Date().getTime() - new Date(date).getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    return years + ' Years';
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return '-';
    const diff = Date.now() - new Date(birthdate).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  // CSV Import Logic
  const handleCSVUpload = (files: File[]) => {
    const file = files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: h => h.toLowerCase().replace(/[\s_]+/g, ''),
            complete: (res) => {
                const parsed = res.data.map((r: any) => ({
                    empId: r.empid||'', nameEN: r.nameen||'', nameTH: r.nameth||'', jobTitle: r.positionen||'', jobTitleTH: r.positionth||'',
                    department: r.department||'', hiringDate: r.hiringdate||'', workStatus: r.status||'Active'
                })).filter((r: any) => r.empId && r.nameEN);
                setPreviewData(parsed);
            }
        });
    }
  };

  const processImport = () => {
    if(!previewData.length) return;
    setEmployees([...employees, ...previewData]);
    setIsImportModalOpen(false);
    setPreviewData([]);
    Swal.fire({
        title: 'Import Successful',
        text: `Successfully imported ${previewData.length} employees.`,
        icon: 'success',
        confirmButtonColor: '#186B8C'
    });
  };

  const tabs = [
    { label: 'Identity & Job', icon: Briefcase },
    { label: 'Personal & Education', icon: User },
    { label: 'Contact Info', icon: Phone },
    { label: 'Employment & Payroll', icon: Coins }
  ];

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex flex-col md:flex-row justify-between items-center shrink-0 z-20 gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
                <UserPlus className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">ONBOARDING</h1>
                <p className="text-brandTeal text-[11px] font-bold uppercase tracking-widest">Seamless Registration</p>
            </div>
        </div>
        
        <nav className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
                <button 
                    onClick={() => setCurrentView('new_hires')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'new_hires' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Sparkles className="w-4 h-4" /> NEW HIRES
                    {newHires.length > 0 && <span className="bg-brandRed text-white text-[9px] px-1.5 py-0.5 rounded-full">{newHires.length}</span>}
                </button>
                <button 
                    onClick={() => setCurrentView('employees')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'employees' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Users className="w-4 h-4" /> DIRECTORY
                </button>
            </div>
            <button 
                onClick={() => setIsGuideOpen(true)} 
                className="w-10 h-10 rounded-xl bg-brandTeal/10 text-brandTeal flex items-center justify-center hover:bg-brandTeal hover:text-white transition-all shadow-sm border border-brandTeal/20" 
                title="User Guide"
            >
                <HelpCircle className="w-5 h-5" />
            </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
        
        {/* VIEW 1: NEW HIRES */}
        {currentView === 'new_hires' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-sidebarBg">Ready for Onboarding</h2>
                    <p className="text-sm text-brandMuted mt-1">Candidates who have passed selection. Sync data to register.</p>
                </div>

                {newHires.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">All Clear!</h3>
                        <p className="text-gray-500 font-medium">All new hires have been registered.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newHires.map(candidate => (
                            <div key={candidate.id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:border-brandTeal/50 hover:shadow-lg transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brandGold"></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                            <img 
                                                src={candidate.image || `https://ui-avatars.com/api/?name=${candidate.name}&background=random&color=fff&size=128`} 
                                                className="w-full h-full object-cover"
                                                alt={candidate.name}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sidebarBg text-lg">{candidate.name}</h3>
                                            <span className="text-[10px] bg-brandTeal/10 text-brandTeal px-2 py-1 rounded-md font-bold uppercase tracking-wide">{candidate.position}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50/80 rounded-xl p-4 text-xs space-y-3 mb-6 border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Department</span>
                                        <span className="font-bold text-sidebarBg">{candidate.dept}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Start Date</span>
                                        <span className="font-bold text-brandDeepBlue">{candidate.startDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-gray-500 font-medium">Salary</span>
                                        <span className="font-bold text-brandRed">{Number(candidate.salary).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => openRegistrationModal(candidate)} 
                                    className="w-full py-3 bg-brandDeepBlue text-white rounded-xl text-xs font-bold shadow-lg hover:bg-brandBlue hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" /> Start Registration
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* VIEW 2: EMPLOYEE DIRECTORY */}
        {currentView === 'employees' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4 pt-2">
                    <div>
                        <h2 className="text-2xl font-bold text-sidebarBg">Employee Directory</h2>
                        <p className="text-sm text-brandMuted mt-1">Total <span className="font-bold text-brandDeepBlue">{employees.length}</span> employees</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                         <button 
                            onClick={() => exportToGoogleSheets(employees, 'EmployeeDirectory')} 
                            className="px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold shadow-sm hover:bg-green-100 transition-all flex items-center gap-2"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Sync Sheets
                        </button>
                         <button 
                            onClick={() => setIsImportModalOpen(true)} 
                            className="px-5 py-2.5 bg-white text-brandDeepBlue border border-brandDeepBlue/20 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" /> UPLOAD
                        </button>
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search staff..." 
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 w-full md:w-64 transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => openRegistrationModal()} 
                            className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" /> NEW STAFF
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-soft border border-gray-100 rounded-2xl flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider pl-8">Staff ID</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Service Year</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center pr-8">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.empId} className="hover:bg-brandTeal/5 cursor-pointer transition-colors group" onClick={() => openRegistrationModal(emp)}>
                                        <td className="p-5 font-mono font-bold text-brandDeepBlue text-sm pl-8">{emp.empId}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                                    <img 
                                                        src={emp.image || `https://ui-avatars.com/api/?name=${emp.nameEN}&background=random&color=fff&size=64`}
                                                        className="w-full h-full object-cover"
                                                        alt={emp.nameEN}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-sidebarBg">{emp.nameEN}</div>
                                                    <div className="text-[11px] text-gray-400 font-sans">{emp.nameTH}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-sm font-bold text-gray-600">{emp.jobTitle}</div>
                                            <div className="text-[10px] text-gray-400 font-sans">{emp.jobTitleTH || '-'}</div>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-bold uppercase">{emp.department}</span>
                                        </td>
                                        <td className="p-5 text-xs text-gray-500 font-medium">{calculateServiceYear(emp.hiringDate)}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${emp.workStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                {emp.workStatus}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center pr-8">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); openRegistrationModal(emp); }} 
                                                className="p-2 text-gray-400 hover:text-brandBlue hover:bg-brandBlue/10 rounded-lg transition-all" 
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                        <div className="text-xs text-gray-500 font-medium">
                            Showing <span className="font-bold text-brandDeepBlue">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-brandDeepBlue">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="font-bold text-brandDeepBlue">{filteredEmployees.length}</span> entries
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${currentPage === page ? 'bg-brandDeepBlue text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredEmployees.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* REGISTRATION MODAL */}
      <BaseModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title={formData.empId ? 'Edit Employee Profile' : 'New Employee Registration'}
        icon={UserPlus}
        size="xl"
      >
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-100 flex flex-col p-6 shrink-0">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-white shadow-md overflow-hidden mb-4 relative group cursor-pointer">
                        <img 
                            src={formData.image || `https://ui-avatars.com/api/?name=${formData.nameEN || 'New'}&background=random&color=fff&size=256`} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            alt="Profile"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-8 h-8" />
                        </div>
                    </div>
                    <h3 className="font-bold text-sidebarBg truncate text-sm">{formData.nameEN || 'New Employee'}</h3>
                    <p className="text-xs text-brandTeal font-bold mt-1">{formData.empId || 'ID: Pending'}</p>
                </div>
                
                <nav className="space-y-1">
                    {tabs.map((tab, index) => (
                        <button 
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === index ? 'bg-brandTeal text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Form Content */}
            <div className="flex-1 p-8 bg-white overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-brandDeepBlue flex items-center gap-2">
                        {React.createElement(tabs[activeTab].icon, { className: "w-5 h-5 text-brandGold" })}
                        {tabs[activeTab].label}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleSaveEmployee} className="px-5 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow hover:bg-green-700 flex items-center gap-2 transition-all">
                            <Save className="w-4 h-4" /> Save Record
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* TAB 0: IDENTITY */}
                    {activeTab === 0 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Staff ID <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={formData.empId} 
                                            readOnly
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-brandDeepBlue" 
                                            placeholder="Auto-gen"
                                        />
                                        <button onClick={generateID} className="px-3 bg-brandGold text-sidebarBg rounded-lg text-xs font-bold hover:bg-yellow-400 transition-colors">Gen</button>
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name (TH)</label>
                                    <input type="text" v-model="formData.nameTH" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all font-sans" placeholder="ชื่อ-นามสกุล (ภาษาไทย)" onChange={(e) => setFormData({...formData, nameTH: e.target.value})} value={formData.nameTH} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name (EN)</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" placeholder="Name in English" onChange={(e) => setFormData({...formData, nameEN: e.target.value})} value={formData.nameEN} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nickname</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all font-sans" placeholder="ชื่อเล่น" onChange={(e) => setFormData({...formData, nickname: e.target.value})} value={formData.nickname} />
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-6"></div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Title</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} value={formData.jobTitle} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, department: e.target.value})} value={formData.department} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, section: e.target.value})} value={formData.section} /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Status</label>
                                    <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, jobStatus: e.target.value})} value={formData.jobStatus}>
                                        <option value="Probation">Probation</option>
                                        <option value="Permanent">Permanent</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Work Status</label>
                                    <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, workStatus: e.target.value})} value={formData.workStatus}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 1: PERSONAL */}
                    {activeTab === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Card / Passport</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, idCard: e.target.value})} value={formData.idCard} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Birthdate</label><input type="date" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, birthdate: e.target.value})} value={formData.birthdate} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label><input type="text" value={calculateAge(formData.birthdate)} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label><select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, gender: e.target.value})} value={formData.gender}><option>Male</option><option>Female</option></select></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nationality</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, nationality: e.target.value})} value={formData.nationality} /></div>
                            </div>
                            
                            <div className="h-px bg-gray-100 my-6"></div>
                            
                            <h4 className="text-sm font-bold text-brandDeepBlue mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-brandGold"/> Education</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Highest Degree</label><select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, education: e.target.value})} value={formData.education}><option>Bachelor</option><option>Master</option><option>PhD</option></select></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Major</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, major: e.target.value})} value={formData.major} /></div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CONTACT */}
                    {activeTab === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input type="email" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, email: e.target.value})} value={formData.email} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label><input type="tel" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, phone: e.target.value})} value={formData.phone} /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Present Address</label>
                                <textarea rows={3} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all font-sans" onChange={(e) => setFormData({...formData, addressPresent: e.target.value})} value={formData.addressPresent}></textarea>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PAYROLL */}
                    {activeTab === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hiring Date</label><input type="date" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, hiringDate: e.target.value})} value={formData.hiringDate} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salary</label><input type="number" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-brandDeepBlue text-right focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, initialSalary: e.target.value})} value={formData.initialSalary} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bank</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, bank: e.target.value})} value={formData.bank} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account No.</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, bankAccount: e.target.value})} value={formData.bankAccount} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Social Security</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal focus:ring-2 focus:ring-brandTeal/20 outline-none transition-all" onChange={(e) => setFormData({...formData, socialSecurity: e.target.value})} value={formData.socialSecurity} /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </BaseModal>

      {/* IMPORT MODAL */}
      <BaseModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Employees"
        icon={FileSpreadsheet}
        enableDragDrop={true}
        onDrop={handleCSVUpload}
      >
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600"><HelpCircle size={18} /></div>
                <div>
                    <h4 className="text-sm font-bold text-blue-800 uppercase mb-1">CSV Format Guide</h4>
                    <p className="text-xs text-blue-600 mb-2">Ensure your CSV file matches these headers:</p>
                    <div className="flex flex-wrap gap-2">
                        {['emp_id', 'name_en', 'name_th', 'position_en', 'position_th', 'department', 'hiring_date'].map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white rounded border border-blue-200 text-[10px] font-mono text-blue-700">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {!previewData.length ? (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => document.getElementById('csvInput')?.click()}>
                    <input type="file" id="csvInput" accept=".csv" className="hidden" onChange={(e) => e.target.files && handleCSVUpload(Array.from(e.target.files))} />
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-brandTeal" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700">Click to Upload CSV</h4>
                    <p className="text-sm text-gray-500">or drag and drop file here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-brandDeepBlue">Preview ({previewData.length} records)</h4>
                        <button onClick={() => setPreviewData([])} className="text-xs text-red-500 hover:underline font-bold">Remove File</button>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">ID</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Name</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Position</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Dept</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {previewData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 text-xs font-mono font-bold">{row.empId}</td>
                                        <td className="p-3 text-xs">{row.nameEN}</td>
                                        <td className="p-3 text-xs">{row.jobTitle}</td>
                                        <td className="p-3 text-xs">{row.department}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-gray-500 text-xs font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={processImport} className="px-6 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow hover:bg-green-700">Confirm Import</button>
                    </div>
                </div>
            )}
        </div>
      </BaseModal>

      {/* GUIDE SLIDE-OVER (Simple implementation using fixed position) */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsGuideOpen(false)}></div>
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="px-6 py-4 border-b bg-sidebarBg text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2 text-lg"><HelpCircle className="w-5 h-5 text-brandGold" /> คู่มือการใช้งาน</h3>
                    <button onClick={() => setIsGuideOpen(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
                    <div>
                        <h4 className="text-brandTeal font-bold text-lg mb-2">1. ลงทะเบียนพนักงานใหม่ (New Hires)</h4>
                        <p className="text-sm text-gray-600 mb-2">เมื่อผู้สมัครผ่านการคัดเลือก ข้อมูลจะถูกส่งมาที่หน้า <strong>NEW HIRES</strong></p>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                            <li>กดปุ่ม <strong>Start Registration</strong> เพื่อเริ่มกระบวนการ</li>
                            <li>ตรวจสอบและกรอกข้อมูลให้ครบถ้วน</li>
                            <li>กดปุ่ม <strong>Gen</strong> เพื่อสร้างรหัสพนักงานอัตโนมัติ</li>
                        </ul>
                    </div>
                    <div className="h-px bg-gray-100"></div>
                    <div>
                        <h4 className="text-brandTeal font-bold text-lg mb-2">2. ฐานข้อมูลพนักงาน (Directory)</h4>
                        <p className="text-sm text-gray-600">ค้นหา แก้ไข และดูข้อมูลพนักงานทั้งหมดได้ที่หน้านี้ สามารถกรองข้อมูลตามชื่อ รหัส หรือแผนกได้</p>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDirectory;
