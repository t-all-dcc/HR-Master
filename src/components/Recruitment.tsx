import React, { useState, useRef, useMemo } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  UserPlus, 
  Users, 
  LayoutGrid, 
  Archive, 
  Share2, 
  Search, 
  Phone, 
  UserCheck, 
  Eye, 
  Star, 
  X, 
  Printer, 
  User, 
  GraduationCap, 
  Paperclip, 
  Send, 
  ListChecks, 
  Award, 
  Gift, 
  CheckCircle2, 
  PenTool, 
  ClipboardCheck, 
  Copy,
  PlusCircle,
  Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import SignatureCanvas from 'react-signature-canvas';
import { QRCodeCanvas } from 'qrcode.react';
import BaseModal from './BaseModal';

// --- Types ---
interface Job {
  id: number;
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
  applicants: number;
  posted: string;
  salaryRange: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
}

interface Candidate {
  id: number;
  name: string;
  position: string;
  status: string;
  formType: string;
  phone: string;
  interviewResult: string | null;
  nickname?: string;
  salary?: number;
  experience?: string;
  isStarred: boolean;
  signature: string | null;
  email?: string;
  education?: string;
  major?: string;
  university?: string;
  expList?: { company: string; position: string; start: string; end: string }[];
  nameEN?: string;
  birthdate?: string;
  idCard?: string;
  address?: string;
}

// --- Mock Data ---
const MOCK_JOBS: Job[] = [
  { 
    id: 101, title: 'Production Worker', dept: 'Production', location: 'Factory 1', type: 'Full-time', level: 'Operational', applicants: 15, posted: '2 days ago',
    salaryRange: '12,000 - 15,000 THB',
    responsibilities: ['Operate machinery safely', 'Monitor product quality', 'Maintain workspace cleanliness', 'Follow safety guidelines'],
    qualifications: ['High school diploma', 'Physical stamina', 'Attention to detail', 'Shift work availability'],
    benefits: ['Social Security', 'Overtime Pay', 'Uniform', 'Annual Bonus', 'Shuttle Bus']
  },
  { 
    id: 102, title: 'Driver (6-Wheel)', dept: 'Logistics', location: 'Warehouse', type: 'Daily', level: 'Operational', applicants: 3, posted: 'Today',
    salaryRange: '500 - 600 THB/Day',
    responsibilities: ['Deliver goods to customers', 'Maintain vehicle condition', 'Load/Unload cargo', 'Route planning'],
    qualifications: ['Valid Driving License Type 2', 'Clean driving record', 'Punctual', 'Knowledge of routes'],
    benefits: ['Daily Allowance', 'Accident Insurance']
  },
  { 
    id: 103, title: 'Maid / Cleaner', dept: 'Admin', location: 'Head Office', type: 'Contract', level: 'Operational', applicants: 8, posted: '5 days ago',
    salaryRange: '10,000 - 12,000 THB',
    responsibilities: ['Clean office areas', 'Manage pantry supplies', 'Assist in event setup'],
    qualifications: ['Primary education', 'Service mind', 'Honest and reliable'],
    benefits: ['Social Security', 'Uniform']
  },
  { 
    id: 201, title: 'Senior Accountant', dept: 'Finance', location: 'Head Office', type: 'Full-time', level: 'Professional', applicants: 5, posted: '1 week ago',
    salaryRange: '35,000 - 50,000 THB',
    responsibilities: ['Manage month-end close', 'Prepare financial statements', 'Tax filing (VAT, WHT)', 'Supervise junior staff'],
    qualifications: ["Bachelor's in Accounting", 'CPD License preferred', '3-5 years experience', 'Proficient in SAP/Express'],
    benefits: ['Provident Fund', 'Health Insurance (IPD/OPD)', 'Performance Bonus', 'Professional Development']
  },
  { 
    id: 301, title: 'Sales Manager', dept: 'Sales', location: 'Bangkok', type: 'Full-time', level: 'Management', applicants: 8, posted: '3 days ago',
    salaryRange: '50,000 - 80,000 THB + Comm',
    responsibilities: ['Lead sales team to hit targets', 'Develop sales strategies', 'Key Account Management', 'Sales forecasting'],
    qualifications: ["Bachelor's degree or higher", '5+ years in Sales', 'Leadership skills', 'Excellent English'],
    benefits: ['Car Allowance', 'Commission', 'Provident Fund', 'Health Insurance']
  },
  { 
    id: 202, title: 'IT Support Officer', dept: 'IT', location: 'Head Office', type: 'Full-time', level: 'Professional', applicants: 12, posted: 'Yesterday',
    salaryRange: '20,000 - 30,000 THB',
    responsibilities: ['Troubleshoot hardware/software', 'Network maintenance', 'User support', 'Asset inventory'],
    qualifications: ["Bachelor's in IT/CS", '1-2 years experience', 'Service mind', 'Knowledge of Windows/O365'],
    benefits: ['Social Security', 'Health Insurance', 'Training Budget']
  },
  { 
    id: 203, title: 'Mechanical Engineer', dept: 'Engineering', location: 'Factory 1', type: 'Full-time', level: 'Professional', applicants: 4, posted: '2 weeks ago',
    salaryRange: '25,000 - 40,000 THB',
    responsibilities: ['Design mechanical systems', 'Oversee equipment installation', 'Perform maintenance checks'],
    qualifications: ["Bachelor's in Mechanical Engineering", '2+ years experience', 'AutoCAD proficiency'],
    benefits: ['Provident Fund', 'Health Insurance', 'Safety Gear']
  }
];

const MOCK_CANDIDATES: Candidate[] = [
  { id: 1, name: 'Somchai Jaidee', position: 'Production Worker', status: 'New', formType: 'Worker', phone: '081-111-2222', interviewResult: null, nickname: 'Chai', salary: 500, experience: 'Factory worker 2 years', isStarred: false, signature: null },
  { id: 2, name: 'Wipa S.', position: 'Senior Accountant', status: 'Interview', formType: 'Professional', phone: '089-999-8888', interviewResult: null, email: 'wipa@email.com', education: 'Bachelor', major: 'Accounting', university: 'CU', salary: 35000, expList: [{company:'ABC Corp', position:'Accountant', start:'2020-01', end:'2023-12'}], isStarred: true, signature: null },
  { id: 3, name: 'John Doe', position: 'Sales Manager', status: 'Screening', formType: 'Professional', phone: '090-555-4444', interviewResult: null, email: 'john@email.com', education: 'Bachelor', major: 'Marketing', university: 'BU', salary: 55000, isStarred: false, signature: null },
  { id: 4, name: 'Amnat P.', position: 'Driver (6-Wheel)', status: 'New', formType: 'Worker', phone: '082-333-7777', interviewResult: null, nickname: 'Nat', salary: 600, experience: 'Truck driver 5 years', isStarred: false, signature: null },
  { id: 5, name: 'Suda M.', position: 'HR Officer', status: 'Offer', formType: 'Professional', phone: '085-555-1234', interviewResult: 'Pass', email: 'suda@email.com', education: 'Master', major: 'HRM', university: 'TU', salary: 25000, isStarred: true, signature: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Stephen_Hopkins_Signature.svg' },
  { id: 6, name: 'Ken T.', position: 'IT Support Officer', status: 'Hired', formType: 'Professional', phone: '087-777-9999', interviewResult: 'Pass', email: 'ken@email.com', education: 'Bachelor', major: 'CS', university: 'KMITL', salary: 28000, isStarred: false, signature: 'https://upload.wikimedia.org/wikipedia/commons/0/00/William_Ellery_Signature.svg' },
  { id: 7, name: 'Malee W.', position: 'Maid / Cleaner', status: 'Rejected', formType: 'Worker', phone: '081-222-3333', interviewResult: 'Fail', nickname: 'Ma', salary: 450, experience: 'None', isStarred: false, signature: null },
  { id: 8, name: 'Pranee K.', position: 'Production Worker', status: 'Interview', formType: 'Worker', phone: '089-111-2222', interviewResult: null, nickname: 'Nee', salary: 520, experience: '1 year', isStarred: false, signature: null },
  { id: 9, name: 'David B.', position: 'Mechanical Engineer', status: 'New', formType: 'Professional', phone: '091-234-5678', interviewResult: null, email: 'david@email.com', education: 'Bachelor', major: 'Engineering', university: 'KMUTT', salary: 30000, isStarred: false, signature: null }
];

const Recruitment = ({ initialView = 'jobs' }: { initialView?: 'jobs' | 'candidates' | 'application_bank' | 'interviews' }) => {
  const [currentView, setCurrentView] = useState<'jobs' | 'candidates' | 'application_bank' | 'interviews'>(initialView);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAppModal, setShowAppModal] = useState(false);
  const [showJobSpecModal, setShowJobSpecModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  // Selected Items
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Forms
  const [formType, setFormType] = useState<'Worker' | 'Professional'>('Worker');
  const [isFormTypeFixed, setIsFormTypeFixed] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [appForm, setAppForm] = useState<any>({
    position: '', salary: '', nameTH: '', nameEN: '', nickname: '', idCard: '', 
    phone: '', email: '', address: '', experience: '', birthdate: '', 
    education: 'Bachelor', major: '', university: '', 
    expList: [{company: '', position: '', start: '', end: ''}]
  });
  const [interviewForm, setInterviewForm] = useState({
    interviewer: '', date: new Date().toISOString().split('T')[0], ratings: {} as Record<string, number>, comment: ''
  });

  const sigCanvas = useRef<SignatureCanvas>(null);

  // --- Computed ---
  const filteredBankCandidates = useMemo(() => {
    if (!searchQuery) return candidates;
    const query = searchQuery.toLowerCase();
    return candidates.filter(c => c.name.toLowerCase().includes(query) || c.position.toLowerCase().includes(query));
  }, [candidates, searchQuery]);

  const getCandidatesByStatus = (status: string) => candidates.filter(c => c.status === status);

  // --- Handlers ---
  const openApplicationModal = (job: Job | null = null) => {
    setAppForm({
      position: '', salary: '', nameTH: '', nameEN: '', nickname: '', idCard: '', 
      phone: '', email: '', address: '', experience: '', birthdate: '', 
      education: 'Bachelor', major: '', university: '', 
      expList: [{company: '', position: '', start: '', end: ''}]
    });
    setSelectedJobId(job ? job.id : null);
    
    if (job) {
      setAppForm(prev => ({ ...prev, position: job.title }));
      if (job.level === 'Operational' || ['Worker', 'Driver', 'Maid', 'Operator'].some(k => job.title.includes(k))) {
        setFormType('Worker');
      } else {
        setFormType('Professional');
      }
      setIsFormTypeFixed(true);
    } else {
      setIsFormTypeFixed(false);
    }
    setShowAppModal(true);
  };

  const onPositionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedJobId(id);
    const job = jobs.find(j => j.id === id);
    if (job) {
      setAppForm(prev => ({ ...prev, position: job.title }));
      if (job.level === 'Operational' || ['Worker', 'Driver', 'Maid', 'Operator'].some(k => job.title.includes(k))) {
        setFormType('Worker');
      } else {
        setFormType('Professional');
      }
    }
  };

  const submitApplication = () => {
    if (!appForm.nameTH && !appForm.position) {
      Swal.fire('Error', 'Please fill in required fields', 'error');
      return;
    }
    
    const newCandidate: Candidate = {
      id: Date.now(),
      name: appForm.nameTH || 'Unknown',
      position: appForm.position || 'Unknown',
      status: 'New',
      formType,
      phone: appForm.phone,
      interviewResult: null,
      isStarred: false,
      signature: null,
      ...appForm
    };

    setCandidates([...candidates, newCandidate]);
    setShowAppModal(false);
    Swal.fire('Submitted!', 'Your application has been received.', 'success');
  };

  const openJobSpecModal = (job: Job) => {
    setSelectedJob(job);
    setShowJobSpecModal(true);
  };

  const viewCandidate = (c: Candidate) => {
    setSelectedCandidate(c);
    setInterviewForm({ 
      interviewer: '', 
      date: new Date().toISOString().split('T')[0], 
      ratings: { 'Technical Skills': 0, 'Experience': 0, 'Communication': 0, 'Attitude / Personality': 0 }, 
      comment: '' 
    });
    setShowCandidateModal(true);
  };

  const saveInterviewResult = (result: string) => {
    if (!interviewForm.interviewer) {
      Swal.fire('Error', 'Please enter Interviewer Name', 'error');
      return;
    }
    if (selectedCandidate) {
      const updated = candidates.map(c => {
        if (c.id === selectedCandidate.id) {
          return { 
            ...c, 
            interviewResult: result, 
            status: result === 'Pass' ? 'Offer' : (result === 'Fail' ? 'Rejected' : c.status) 
          };
        }
        return c;
      });
      setCandidates(updated);
      setShowCandidateModal(false);
      Swal.fire('Saved', 'Interview result recorded.', 'success');
    }
  };

  const registerStaff = (candidate: Candidate) => {
    Swal.fire({
      title: 'Register as Staff?', 
      text: `Send ${candidate.name} data to Employee Registration System?`, 
      icon: 'info', 
      showCancelButton: true, 
      confirmButtonColor: '#5A94A7', 
      confirmButtonText: 'Yes, Send Data'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = candidates.map(c => c.id === candidate.id ? { ...c, status: 'Hired' } : c);
        setCandidates(updated);
        Swal.fire('Sent!', 'Candidate data transferred.', 'success');
      }
    });
  };

  const toggleStar = (c: Candidate) => {
    const updated = candidates.map(item => item.id === c.id ? { ...item, isStarred: !item.isStarred } : item);
    setCandidates(updated);
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      if (selectedCandidate) {
        const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        const updated = candidates.map(c => c.id === selectedCandidate.id ? { ...c, signature } : c);
        setCandidates(updated);
        setSelectedCandidate({ ...selectedCandidate, signature }); // Update local state
        setShowSignModal(false);
        Swal.fire('Signed', 'Electronic signature saved.', 'success');
      }
    } else {
      Swal.fire('Error', 'Please sign before saving.', 'warning');
    }
  };

  const openShareJobModal = (job: Job) => {
    setSelectedJob(job);
    setShowShareModal(true);
  };

  const copyLink = () => {
    if (selectedJob) {
      navigator.clipboard.writeText(`https://hrmaster.com/apply/${selectedJob.id}`);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Link copied', showConfirmButton: false, timer: 1000 });
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">RECRUITMENT</h1>
            <p className="text-brandTeal text-[11px] font-bold uppercase tracking-widest">Talent Acquisition System</p>
          </div>
        </div>
        
        <div className="flex bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
          <button 
            onClick={() => setCurrentView('jobs')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'jobs' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutGrid className="w-4 h-4" /> JOB OPENINGS
          </button>
          <button 
            onClick={() => setCurrentView('candidates')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'candidates' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users className="w-4 h-4" /> CANDIDATES
          </button>
          <button 
            onClick={() => setCurrentView('application_bank')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'application_bank' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Archive className="w-4 h-4" /> APPLICATION BANK
          </button>
          <button 
            onClick={() => setCurrentView('interviews')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'interviews' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Clock className="w-4 h-4" /> INTERVIEW SCHEDULE
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8 pt-6">
        
        {/* VIEW 1: JOB OPENINGS */}
        {currentView === 'jobs' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-sidebarBg">Open Positions</h2>
              <button onClick={() => openApplicationModal()} className="px-6 py-2.5 bg-brandDeepBlue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Walk-in Application
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {jobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:border-brandTeal hover:shadow-lg transition-all group relative flex flex-col h-full">
                  <button onClick={() => openShareJobModal(job)} className="absolute top-4 right-4 text-gray-300 hover:text-brandTeal p-1 rounded-full hover:bg-brandTeal/10 transition-colors z-10">
                    <Share2 className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-brandTeal bg-brandTeal/10 px-2 py-1 rounded">{job.dept}</span>
                      <h3 className="text-lg font-bold text-sidebarBg mt-2 group-hover:text-brandBlue transition-colors">{job.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{job.location} • {job.type}</p>
                      <span className={`mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded border font-bold ${job.level === 'Operational' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {job.level}
                      </span>
                    </div>
                    <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-100 min-w-[60px]">
                      <span className="block text-xl font-bold text-brandDeepBlue">{job.applicants}</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Applicants</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-6 text-xs text-gray-400 font-medium">
                    <Clock className="w-3 h-3" /> Posted {job.posted}
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button onClick={() => openJobSpecModal(job)} className="w-full py-2.5 rounded-xl border border-brandTeal text-xs font-bold text-brandTeal hover:bg-brandTeal hover:text-white transition-all">
                      JOB SPEC
                    </button>
                    <button onClick={() => openApplicationModal(job)} className="w-full py-2.5 rounded-xl bg-brandDeepBlue text-xs font-bold text-white hover:bg-brandBlue transition-all shadow-md">
                      APPLY NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: CANDIDATES (Kanban) */}
        {currentView === 'candidates' && (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Candidate Pipeline</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brandTeal w-64 shadow-sm" />
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto h-full pb-4 items-start">
              {['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'].map(status => (
                <div key={status} className="bg-gray-100/50 rounded-2xl p-4 flex flex-col h-full min-w-[280px] w-[280px] border border-gray-200/50">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h4 className="text-xs font-bold text-sidebarBg uppercase tracking-wide">{status}</h4>
                    <span className="bg-white text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-100">{getCandidatesByStatus(status).length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                    {getCandidatesByStatus(status).map(c => (
                      <div key={c.id} onClick={() => viewCandidate(c)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-brandGold hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'Hired' ? 'bg-green-500' : (status === 'Rejected' ? 'bg-red-500' : 'bg-brandTeal')}`}></div>
                        <div className="pl-2">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-sm text-sidebarBg group-hover:text-brandBlue transition-colors">{c.name}</h5>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${c.formType === 'Worker' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {c.formType === 'Worker' ? 'Worker' : 'Pro'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mb-2">{c.position}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                            <Phone className="w-3 h-3" /> {c.phone}
                          </div>
                          
                          {c.interviewResult && (
                            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Interview</span>
                              <span className={`text-[9px] font-bold uppercase ${c.interviewResult === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>{c.interviewResult}</span>
                            </div>
                          )}
                          
                          {(['Offer', 'Hired'].includes(c.status) || c.interviewResult === 'Pass') && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); registerStaff(c); }} 
                              className="mt-3 w-full py-1.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" /> Register Staff
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: INTERVIEW SCHEDULE */}
        {currentView === 'interviews' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-sidebarBg">Interview Schedule</h2>
                <p className="text-xs text-brandMuted mt-1">Upcoming interviews and candidate appointments.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Interviews List */}
              <div className="lg:col-span-2 space-y-4">
                {getCandidatesByStatus('Interview').length > 0 ? (
                  getCandidatesByStatus('Interview').map(c => (
                    <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brandTeal/10 flex flex-col items-center justify-center text-brandTeal border border-brandTeal/20">
                          <span className="text-xs font-bold uppercase">{new Date().toLocaleString('en-US', { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-none">{new Date().getDate() + (c.id % 5)}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sidebarBg">{c.name}</h4>
                          <p className="text-xs text-gray-500">{c.position} • {c.formType}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 10:00 AM - 11:00 AM
                            </span>
                            <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded text-blue-600 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Meeting Room {c.id}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => viewCandidate(c)} className="px-3 py-1.5 text-xs font-bold text-brandDeepBlue border border-brandDeepBlue/20 rounded-lg hover:bg-brandDeepBlue/5 transition-colors">
                          View Profile
                        </button>
                        <button className="px-3 py-1.5 text-xs font-bold text-white bg-brandTeal rounded-lg hover:bg-brandDeepBlue transition-colors shadow-sm">
                          Start Interview
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium text-sm">No scheduled interviews found.</p>
                  </div>
                )}
              </div>

              {/* Calendar Widget (Mock) */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-sidebarBg mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brandGold" /> Calendar
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S','M','T','W','T','F','S'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-gray-400">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                    <div key={d} className={`text-xs py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 ${d === new Date().getDate() ? 'bg-brandDeepBlue text-white font-bold' : 'text-gray-600'}`}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Today's Summary</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Interviews</span>
                    <span className="font-bold text-sidebarBg">{getCandidatesByStatus('Interview').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Pending Feedback</span>
                    <span className="font-bold text-brandOrange">2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: APPLICATION BANK */}
        {currentView === 'application_bank' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-sidebarBg">Application Bank</h2>
                <p className="text-xs text-brandMuted mt-1">Database of all talent profiles for future reference.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, skill..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brandTeal w-64 shadow-sm" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-6">Candidate Name</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Position Applied</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBankCandidates.map(c => (
                      <tr key={c.id} onClick={() => viewCandidate(c)} className="hover:bg-brandTeal/5 transition-colors group cursor-pointer">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-brandDeepBlue font-bold text-xs border-2 border-white shadow-sm">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-sidebarBg text-sm group-hover:text-brandBlue transition-colors">{c.name}</div>
                              <div className="text-xs text-gray-400 font-mono">{c.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">{c.position}</td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-1 rounded border font-bold ${c.formType === 'Worker' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {c.formType === 'Worker' ? 'Worker' : 'Professional'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500 font-mono">{new Date().toLocaleDateString('en-GB')}</td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                            c.status === 'Hired' ? 'bg-green-50 text-green-700 border-green-200' : 
                            (c.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200')
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-center pr-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => viewCandidate(c)} className="p-1.5 text-gray-400 hover:text-brandBlue hover:bg-brandBlue/10 rounded-lg transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleStar(c)} className={`p-1.5 transition-all rounded-lg ${c.isStarred ? 'text-brandGold bg-brandGold/10' : 'text-gray-400 hover:text-brandGold hover:bg-brandGold/10'}`}>
                              <Star className={`w-4 h-4 ${c.isStarred ? 'fill-brandGold' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      
      {/* 1. APPLICATION MODAL */}
      <BaseModal isOpen={showAppModal} onClose={() => setShowAppModal(false)} title="Job Application" icon={Briefcase} size="xl">
        <div className="flex flex-col h-full">
          {/* Form Type Selection */}
          {!isFormTypeFixed && (
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-center">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 px-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Select Position:</span>
                <select 
                  value={selectedJobId || ''} 
                  onChange={onPositionSelect} 
                  className="text-xs font-bold text-brandDeepBlue bg-transparent outline-none py-1 w-64 cursor-pointer"
                >
                  <option value="" disabled>-- Choose Job Opening --</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title} ({job.level})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="p-8 space-y-8">
            {formType === 'Worker' ? (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><User className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-orange-800 font-bold text-sm">Worker Application Form</h4>
                    <p className="text-orange-600 text-xs">แบบฟอร์มใบสมัครงานสำหรับพนักงานฝ่ายผลิต / ทั่วไป</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position Applied</label>
                    <input type="text" value={appForm.position} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expected Wage (THB/Day)</label>
                    <input type="number" value={appForm.salary} onChange={e => setAppForm({...appForm, salary: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" placeholder="บาท / วัน" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name (TH)</label>
                    <input type="text" value={appForm.nameTH} onChange={e => setAppForm({...appForm, nameTH: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nickname</label>
                    <input type="text" value={appForm.nickname} onChange={e => setAppForm({...appForm, nickname: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Card No.</label>
                    <input type="text" value={appForm.idCard} onChange={e => setAppForm({...appForm, idCard: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                    <input type="tel" value={appForm.phone} onChange={e => setAppForm({...appForm, phone: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Briefcase className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-blue-800 font-bold text-sm">Professional Application Form</h4>
                    <p className="text-blue-600 text-xs">แบบฟอร์มใบสมัครงานสำหรับพนักงานสำนักงาน / วิชาชีพ</p>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h4 className="text-sm font-bold text-brandDeepBlue mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <User className="w-4 h-4 text-brandGold" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position Applied</label><input type="text" value={appForm.position} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expected Salary</label><input type="number" value={appForm.salary} onChange={e => setAppForm({...appForm, salary: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name (TH)</label><input type="text" value={appForm.nameTH} onChange={e => setAppForm({...appForm, nameTH: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name (EN)</label><input type="text" value={appForm.nameEN} onChange={e => setAppForm({...appForm, nameEN: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label><input type="tel" value={appForm.phone} onChange={e => setAppForm({...appForm, phone: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" /></div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-sm font-bold text-brandDeepBlue mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <GraduationCap className="w-4 h-4 text-brandGold" /> Education
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Highest Degree</label>
                      <select value={appForm.education} onChange={e => setAppForm({...appForm, education: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all">
                        <option>Bachelor</option><option>Master</option><option>PhD</option>
                      </select>
                    </div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Major</label><input type="text" value={appForm.major} onChange={e => setAppForm({...appForm, major: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">University</label><input type="text" value={appForm.university} onChange={e => setAppForm({...appForm, university: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none transition-all" /></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
            <button onClick={() => setShowAppModal(false)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-sidebarBg hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all">Cancel</button>
            <button onClick={submitApplication} className="px-8 py-2.5 bg-brandDeepBlue text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
              <Send className="w-4 h-4" /> Submit Application
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 2. JOB SPEC MODAL */}
      <BaseModal isOpen={showJobSpecModal} onClose={() => setShowJobSpecModal(false)} title="Job Specification" icon={ListChecks} size="lg">
        <div className="p-8 bg-gray-50/50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brandDeepBlue mb-2">{selectedJob?.title}</h2>
                <div className="flex gap-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {selectedJob?.dept}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob?.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedJob?.type}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Salary Range</p>
                <p className="text-xl font-bold text-brandGold">{selectedJob?.salaryRange || 'Negotiable'}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-sidebarBg mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <ListChecks className="w-4 h-4 text-brandBlue" /> Key Responsibilities
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 pl-2 marker:text-brandBlue">
                  {selectedJob?.responsibilities.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-sidebarBg mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Award className="w-4 h-4 text-brandTeal" /> Qualifications
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 pl-2 marker:text-brandTeal">
                  {selectedJob?.qualifications.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-sidebarBg mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Gift className="w-4 h-4 text-brandOrange" /> Benefits & Welfare
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedJob?.benefits.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button onClick={() => setShowJobSpecModal(false)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Close</button>
            <button onClick={() => { setShowJobSpecModal(false); openApplicationModal(selectedJob); }} className="px-8 py-2.5 bg-brandDeepBlue text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brandBlue transition-all flex items-center gap-2">
              Apply for this Job
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 3. CANDIDATE MODAL */}
      <BaseModal isOpen={showCandidateModal} onClose={() => setShowCandidateModal(false)} title="Candidate Profile" icon={User} size="lg">
        {selectedCandidate && (
          <div className="p-8 bg-gray-50/50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-brandDeepBlue font-bold text-2xl border-2 border-white shadow-md">
                      {selectedCandidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-sidebarBg">{selectedCandidate.name}</h3>
                      <div className="flex gap-2 text-sm text-gray-500 mt-1 font-medium">
                        <span>{selectedCandidate.position}</span> • <span className="text-brandTeal">{selectedCandidate.formType}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => window.print()} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-brandDeepBlue transition-all" title="Print Application">
                    <Printer className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Contact Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-bold text-sidebarBg">{selectedCandidate.phone}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-bold text-sidebarBg">{selectedCandidate.email || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Address:</span> <span className="font-bold text-sidebarBg">{selectedCandidate.address || '-'}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Salary:</span> <span className="font-bold text-sidebarBg">{selectedCandidate.salary ? selectedCandidate.salary.toLocaleString() : '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Education:</span> <span className="font-bold text-sidebarBg">{selectedCandidate.education || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Experience:</span> <span className="font-bold text-sidebarBg">{selectedCandidate.experience || '-'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Signature Area */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Applicant Signature</h5>
                    {selectedCandidate.signature ? (
                      <img src={selectedCandidate.signature} alt="Signature" className="h-12 border-b border-gray-300 pb-1" />
                    ) : (
                      <div className="h-12 border-b border-gray-300 pb-1 flex items-end text-xs text-gray-300 italic">No Digital Signature</div>
                    )}
                  </div>
                  <button onClick={() => setShowSignModal(true)} className="text-xs font-bold text-brandBlue hover:underline flex items-center gap-1">
                    <PenTool className="w-3 h-3" /> Sign Electronically
                  </button>
                </div>
              </div>
            </div>

            {/* Interview Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-brandDeepBlue text-lg mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" /> Interview Evaluation
              </h4>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Interviewer</label>
                  <input type="text" value={interviewForm.interviewer} onChange={e => setInterviewForm({...interviewForm, interviewer: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                  <input type="date" value={interviewForm.date} onChange={e => setInterviewForm({...interviewForm, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {['Technical Skills', 'Experience', 'Communication', 'Attitude / Personality'].map(criteria => (
                  <div key={criteria} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-sm font-medium text-gray-700">{criteria}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={20} 
                          className={`cursor-pointer transition-colors ${interviewForm.ratings[criteria] >= star ? 'fill-brandGold text-brandGold' : 'text-gray-200'}`}
                          onClick={() => setInterviewForm({...interviewForm, ratings: {...interviewForm.ratings, [criteria]: star}})}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comments</label>
                <textarea value={interviewForm.comment} onChange={e => setInterviewForm({...interviewForm, comment: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => saveInterviewResult('Fail')} className="px-6 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-lg hover:bg-red-100 border border-red-200 transition-all">Reject</button>
                <button onClick={() => saveInterviewResult('Pass')} className="px-8 py-2 bg-brandDeepBlue text-white font-bold text-sm rounded-lg shadow-md hover:bg-brandBlue transition-all">Pass & Offer</button>
              </div>
            </div>
          </div>
        )}
      </BaseModal>

      {/* 4. SHARE MODAL */}
      <BaseModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Job Opening" icon={Share2} size="sm">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-brandTeal/10 flex items-center justify-center text-brandTeal mx-auto mb-4">
            <Share2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-sidebarBg mb-1">{selectedJob?.title}</h3>
          <p className="text-xs text-brandMuted mb-6">Scan to apply directly</p>
          
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center mb-6 w-fit mx-auto">
            {selectedJob && (
              <QRCodeCanvas value={`https://hrmaster.com/apply/${selectedJob.id}`} size={128} />
            )}
          </div>

          <div className="flex gap-2">
            <input type="text" value={`https://hrmaster.com/apply/${selectedJob?.id}`} readOnly className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 outline-none" />
            <button onClick={copyLink} className="px-3 bg-brandDeepBlue text-white rounded-lg hover:bg-brandBlue transition-all">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 5. SIGNATURE MODAL */}
      <BaseModal isOpen={showSignModal} onClose={() => setShowSignModal(false)} title="Electronic Signature" icon={PenTool} size="md">
        <div className="p-6">
          <div className="border border-gray-300 rounded-xl mb-4 bg-white overflow-hidden shadow-inner">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{width: 500, height: 200, className: 'sigCanvas w-full h-48 cursor-crosshair'}} 
            />
          </div>
          <div className="flex justify-between">
            <button onClick={() => sigCanvas.current?.clear()} className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg font-bold transition-all">Clear</button>
            <div className="flex gap-2">
              <button onClick={() => setShowSignModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg font-bold transition-all">Cancel</button>
              <button onClick={saveSignature} className="px-6 py-2 bg-brandDeepBlue text-white text-sm font-bold rounded-lg hover:bg-brandBlue shadow-md transition-all">Save Signature</button>
            </div>
          </div>
        </div>
      </BaseModal>

    </div>
  );
};

export default Recruitment;
