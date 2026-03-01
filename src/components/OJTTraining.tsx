import React, { useState, useMemo } from 'react';
import { 
  Briefcase, Map, Sparkles, BookOpen, UserPlus, ClipboardCheck, History, LayoutGrid, List, Plus, Edit2, Trash, ListChecks, Clock, User, MapPin, ArrowRight, Calendar, ChevronLeft, ChevronRight, CheckSquare, Search, Award, X, Trash2, HelpCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';
import BaseModal from './BaseModal';

// --- Types ---
interface Course {
  id: number; title: string; category: string; duration: number; trainer: string; active: boolean; desc: string; dept: string; objective: string; targetGroup: string; steps: string[];
}
interface Plan {
  id: number; courseTitle: string; dept: string; trainer: string; startDate: string; time: string; image: string; month: string; day: string; date: string; location: string;
}
interface HistoryItem {
  id: number; course: string; date: string; attendees: number; avgScore: number; passRate: number; dept: string;
}
interface StaffHistory {
  id: number; employee: string; course: string; date: string; score: number;
}

// --- Mock Data ---
const MOCK_COURSES: Course[] = [
  { id: 1, title: 'Machine Safety Protocol L1', category: 'Safety', duration: 4, trainer: 'Head Engineer', active: true, desc: 'Mandatory safety training regarding new protocols.', dept: 'Production', objective: 'Zero Accident', targetGroup: 'Operators', steps: ['Wear PPE', 'Check Emergency Stop', 'Start Machine', 'Monitor', 'Shutdown'] },
  { id: 2, title: 'Excel Advanced', category: 'Technical', duration: 6, trainer: 'IT Team', active: true, desc: 'Master Pivot tables and Macros.', dept: 'IT', objective: 'Data Analysis', targetGroup: 'All Staff', steps: ['Formulas', 'Pivot Tables', 'Macros'] },
  { id: 3, title: 'Leadership 101', category: 'Leadership', duration: 8, trainer: 'HR Manager', active: true, desc: 'Basic leadership skills.', dept: 'HR', objective: 'Team Mgmt', targetGroup: 'Supervisors', steps: ['Communication', 'Motivation', 'Conflict Resolution'] },
  { id: 4, title: 'Sales Pitching', category: 'Sales', duration: 4, trainer: 'Sales Director', active: true, desc: 'Closing deals effectively.', dept: 'Sales', objective: 'Increase Revenue', targetGroup: 'Sales Reps', steps: ['Opening', 'Objection Handling', 'Closing'] },
  { id: 5, title: 'Python for Beginners', category: 'Technical', duration: 10, trainer: 'Senior Dev', active: true, desc: 'Intro to Python programming.', dept: 'IT', objective: 'Skill Up', targetGroup: 'Developers', steps: ['Syntax', 'Loops', 'Functions'] },
  { id: 6, title: 'Conflict Resolution', category: 'Soft Skills', duration: 3, trainer: 'HR Specialist', active: true, desc: 'Handling workplace conflicts.', dept: 'HR', objective: 'Team Harmony', targetGroup: 'All Staff', steps: ['Identify', 'Listen', 'Solve'] },
  { id: 7, title: 'Fire Safety Drill', category: 'Safety', duration: 2, trainer: 'Safety Officer', active: true, desc: 'Annual fire drill.', dept: 'Production', objective: 'Compliance', targetGroup: 'All Staff', steps: ['Alarm', 'Evacuate', 'Headcount'] },
  { id: 8, title: 'GMP/HACCP Basics', category: 'Technical', duration: 5, trainer: 'QA Manager', active: true, desc: 'Food safety standards.', dept: 'Production', objective: 'Quality', targetGroup: 'Production Staff', steps: ['Hygiene', 'Process', 'Record'] }
];

const MOCK_PLANS: Plan[] = [
  { id: 1, courseTitle: 'Machine Safety Protocol L1', dept: 'Production', trainer: 'Head Engineer', startDate: '2026-02-10', time: '09:00 - 13:00', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a78e?auto=format&fit=crop&w=600&q=80', month: 'FEB', day: '10', date: '2026-02-10', location: 'Factory Floor 1' },
  { id: 2, courseTitle: 'Excel Advanced Workshop', dept: 'IT', trainer: 'IT Support', startDate: '2026-02-15', time: '13:00 - 17:00', image: 'https://images.unsplash.com/photo-1543286386-713df548e9cc?auto=format&fit=crop&w=600&q=80', month: 'FEB', day: '15', date: '2026-02-15', location: 'Lab 1' },
  { id: 3, courseTitle: 'Sales Pitching', dept: 'Sales', trainer: 'Sales Director', startDate: '2026-03-05', time: '09:00 - 13:00', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80', month: 'MAR', day: '05', date: '2026-03-05', location: 'Meeting Room A' },
  { id: 4, courseTitle: 'Fire Safety Drill', dept: 'Production', trainer: 'Safety Officer', startDate: '2026-03-20', time: '10:00 - 12:00', image: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?auto=format&fit=crop&w=600&q=80', month: 'MAR', day: '20', date: '2026-03-20', location: 'Assembly Point' }
];

const MOCK_PENDING_GRADING = [
  { id: 101, employee: 'John Doe', course: 'Advanced Sales Techniques', date: '2026-01-20' },
  { id: 102, employee: 'Jane Smith', course: 'Leadership 101', date: '2026-01-25' },
  { id: 103, employee: 'Bob Brown', course: 'Excel Basics', date: '2026-01-28' }
];

const MOCK_HISTORY_COURSE: HistoryItem[] = [
  { id: 1, course: 'Machine Safety Protocol L1', date: '2025-11-15', attendees: 45, avgScore: 88, passRate: 98, dept: 'Production' },
  { id: 2, course: 'Leadership 101', date: '2025-12-01', attendees: 12, avgScore: 92, passRate: 100, dept: 'HR' },
  { id: 3, course: 'Sales Fundamentals', date: '2025-10-10', attendees: 20, avgScore: 85, passRate: 95, dept: 'Sales' },
  { id: 4, course: 'Python Intro', date: '2025-09-05', attendees: 15, avgScore: 78, passRate: 80, dept: 'IT' },
  { id: 5, course: 'GMP/HACCP Basics', date: '2025-08-20', attendees: 30, avgScore: 90, passRate: 100, dept: 'Production' }
];

const MOCK_HISTORY_STAFF: StaffHistory[] = [
  { id: 1, employee: 'Somchai Jaidee', course: 'Machine Safety Protocol L1', date: '2025-11-15', score: 85 },
  { id: 2, employee: 'Alice Smith', course: 'Leadership 101', date: '2025-12-01', score: 92 },
  { id: 3, employee: 'John Doe', course: 'Sales Fundamentals', date: '2025-10-10', score: 88 },
  { id: 4, employee: 'Bob Brown', course: 'Python Intro', date: '2025-09-05', score: 75 }
];

const DEPARTMENTS = ['All', 'Production', 'Sales', 'IT', 'HR'];

const OJTTraining = () => {
  const [currentView, setCurrentView] = useState<'upcoming' | 'courses' | 'register' | 'evaluation' | 'history'>('upcoming');
  const [courseViewMode, setCourseViewMode] = useState<'grid' | 'table'>('grid');
  const [historyMode, setHistoryMode] = useState<'course' | 'person'>('course');
  const [activeDeptTab, setActiveDeptTab] = useState('All');
  const [historySearch, setHistorySearch] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-02-01'));
  const [selectedYear, setSelectedYear] = useState('2026');

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAnnualPlanModal, setShowAnnualPlanModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Form & Selection State
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [manageMode, setManageMode] = useState<'attendance' | 'score'>('attendance');
  
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [formCourse, setFormCourse] = useState<Partial<Course>>({ title: '', dept: 'Production', duration: 0, objective: '', steps: [''] });
  const [registrationList, setRegistrationList] = useState([{ empId: '', name: '', dept: '' }]);

  // --- Computed ---
  const filteredCourses = useMemo(() => {
    if (activeDeptTab === 'All') return courses;
    return courses.filter(c => c.dept === activeDeptTab);
  }, [courses, activeDeptTab]);

  const filteredAvailableSessions = useMemo(() => {
    const today = new Date();
    const twoMonthsLater = new Date();
    twoMonthsLater.setMonth(today.getMonth() + 2);
    let available = MOCK_PLANS.filter(p => {
      const sDate = new Date(p.date);
      return sDate >= today && sDate <= twoMonthsLater;
    });
    if (activeDeptTab !== 'All') available = available.filter(p => p.dept === activeDeptTab);
    return available;
  }, [activeDeptTab]);

  const filteredHistory = useMemo(() => {
    let data = MOCK_HISTORY_COURSE;
    if (activeDeptTab !== 'All') data = data.filter(h => h.dept === activeDeptTab);
    if (historySearch) data = data.filter(h => h.course.toLowerCase().includes(historySearch.toLowerCase()));
    return data;
  }, [activeDeptTab, historySearch]);

  const filteredStaffHistory = useMemo(() => {
    if (!historySearch) return MOCK_HISTORY_STAFF;
    const query = historySearch.toLowerCase();
    return MOCK_HISTORY_STAFF.filter(h => h.employee.toLowerCase().includes(query) || h.course.toLowerCase().includes(query));
  }, [historySearch]);

  const calendarDays = useMemo(() => {
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
  }, [currentMonth]);

  // --- Actions ---
  const getPlansForDate = (date: string) => MOCK_PLANS.filter(s => s.date === date);
  
  const changeMonth = (delta: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const getCourseCount = (dept: string) => {
    if (dept === 'All') return courses.length;
    return courses.filter(c => c.dept === dept).length;
  };

  const getRegistrationCount = (dept: string) => {
    const today = new Date();
    const twoMonthsLater = new Date();
    twoMonthsLater.setMonth(today.getMonth() + 2);
    let count = MOCK_PLANS.filter(p => {
       const sDate = new Date(p.date);
       return sDate >= today && sDate <= twoMonthsLater;
    });
    if (dept !== 'All') count = count.filter(p => p.dept === dept);
    return count.length;
  };

  const openCourseModal = () => {
    setIsEditingCourse(false);
    setFormCourse({ title: '', category: 'General', duration: 0, trainer: '', desc: '', dept: activeDeptTab !== 'All' ? activeDeptTab : 'Production', targetGroup: '', objective: '', steps: [''] });
    setShowCourseModal(true);
  };

  const editCourse = (course: Course) => {
    setIsEditingCourse(true);
    setFormCourse(JSON.parse(JSON.stringify(course)));
    setShowCourseModal(true);
  };

  const deleteCourse = (id: number) => {
    Swal.fire({ title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' }).then((result) => {
      if (result.isConfirmed) {
        setCourses(prev => prev.filter(c => c.id !== id));
        Swal.fire('Deleted!', 'Course has been deleted.', 'success');
      }
    });
  };

  const saveCourse = () => {
    if(!formCourse.title) return Swal.fire('Error', 'Please enter title', 'error');
    if (isEditingCourse && formCourse.id) {
      setCourses(prev => prev.map(c => c.id === formCourse.id ? { ...c, ...formCourse } as Course : c));
    } else {
      setCourses(prev => [...prev, { ...formCourse, id: Date.now(), active: true } as Course]);
    }
    setShowCourseModal(false);
    Swal.fire('Saved', 'Course saved successfully.', 'success');
  };

  const openCourseDetails = (planOrCourse: any) => {
    setSelectedCourse(planOrCourse);
    setShowDetailModal(true);
  };

  const openRegistrationModal = (plan: any) => {
    setSelectedCourse(plan);
    setRegistrationList([{ empId: '', name: '', dept: '' }]);
    setShowRegistrationModal(true);
  };

  const openManageModal = (item: any, mode: 'attendance' | 'score') => {
    setSelectedSession(item);
    setManageMode(mode);
    setShowManageModal(true);
  };

  const saveSessionData = () => {
    setShowManageModal(false);
    Swal.fire('Success', 'Data recorded successfully.', 'success');
  };

  const submitRegistration = () => {
    setShowRegistrationModal(false);
    Swal.fire('Success', 'Registration submitted for approval.', 'success');
  };

  const printCertificate = () => {
    Swal.fire({ icon: 'success', title: 'Generated', text: 'Certificate downloading...', timer: 1500, showConfirmButton: false });
  };

  const addStep = () => setFormCourse(prev => ({ ...prev, steps: [...(prev.steps || []), ''] }));
  
  const removeStep = (idx: number) => {
    const newSteps = [...(formCourse.steps || [])];
    newSteps.splice(idx, 1);
    setFormCourse(prev => ({ ...prev, steps: newSteps }));
  };

  const addRegRow = () => setRegistrationList(prev => [...prev, { empId: '', name: '', dept: '' }]);
  const removeRegRow = (idx: number) => setRegistrationList(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-brandTeal/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandOrange text-white shadow-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">OJT SYSTEM</h1>
            <p className="text-brandOrange text-[11px] font-bold uppercase tracking-widest">On-the-Job Training Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
            <button onClick={() => setCurrentView('upcoming')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'upcoming' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Sparkles className="w-4 h-4" /> UPCOMING
            </button>
            <button onClick={() => setCurrentView('courses')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'courses' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <BookOpen className="w-4 h-4" /> COURSES
            </button>
            <button onClick={() => setCurrentView('register')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'register' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <UserPlus className="w-4 h-4" /> REGISTER
            </button>
            <button onClick={() => setCurrentView('evaluation')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'evaluation' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <ClipboardCheck className="w-4 h-4" /> EVAL
            </button>
            <button onClick={() => setCurrentView('history')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'history' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <History className="w-4 h-4" /> HISTORY
            </button>
          </div>
          <button onClick={() => setShowGuide(true)} className="w-10 h-10 rounded-xl bg-brandOrange/10 text-brandOrange flex items-center justify-center hover:bg-brandOrange hover:text-white transition-all shadow-sm border border-brandOrange/20">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8 pt-6">
        
        {/* VIEW 1: UPCOMING */}
        {currentView === 'upcoming' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-2xl font-bold text-sidebarBg">Upcoming OJT Sessions</h2><p className="text-sm text-brandMuted">Planned on-the-job training schedules.</p></div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-gray-200 text-sidebarBg rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => setShowAnnualPlanModal(true)}>
                    <Map className="w-4 h-4" /> Manage Annual Plan
                  </button>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-gray-500">Year:</span>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="text-xs font-bold text-brandDeepBlue bg-transparent outline-none cursor-pointer">
                      <option value="2026">2026</option><option value="2025">2025</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredAvailableSessions.slice(0, 4).map(plan => (
                  <div key={plan.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-lg transition-all group flex flex-col h-full">
                    <div className="h-32 bg-gray-100 relative overflow-hidden">
                      <img src={plan.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt={plan.courseTitle} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-center shadow-lg border border-white/20">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{plan.month}</p>
                        <p className="text-lg font-extrabold text-brandDeepBlue leading-none">{plan.day}</p>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-brandOrange text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">{plan.dept}</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col bg-white">
                      <h3 className="text-sm font-bold text-sidebarBg mb-1 group-hover:text-brandOrange transition-colors">{plan.courseTitle}</h3>
                      <p className="text-xs text-gray-500 mb-2 font-mono flex items-center gap-1"><MapPin className="w-3 h-3" /> {plan.location}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-brandTeal" /> {plan.trainer}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brandTeal" /> {plan.time.split(' ')[0]}</div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100 text-center flex gap-2">
                        <button onClick={() => openCourseDetails(plan)} className="text-xs text-gray-500 font-bold hover:text-sidebarBg flex-1 border-r border-gray-200">View Details</button>
                        <button onClick={() => openRegistrationModal(plan)} className="text-xs text-brandOrange font-bold hover:underline flex items-center justify-center gap-1 flex-1">Register <ArrowRight className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-soft border border-white p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brandDeepBlue flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-brandGold" /> {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100 border border-gray-200 text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => changeMonth(0)} className="px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-200 text-xs font-bold text-brandDeepBlue">Today</button>
                  <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-100 border border-gray-200 text-gray-500"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-500 uppercase">{day}</div>
                ))}
                {calendarDays.map((day, idx) => (
                  <div key={idx} className={`bg-white h-32 p-2 relative hover:bg-gray-50 transition-colors flex flex-col ${!day ? 'bg-gray-50/50' : ''}`}>
                    {day && (
                      <>
                        <span className="text-xs font-bold text-gray-400 mb-1">{day.day}</span>
                        <div className="flex flex-col gap-1 w-full overflow-y-auto custom-scrollbar">
                          {getPlansForDate(day.date).map(plan => (
                            <div key={plan.id} className="text-[10px] px-2 py-1 rounded bg-brandBlue text-white font-bold truncate border-l-2 border-white/30 cursor-pointer" title={plan.courseTitle}>
                              {plan.courseTitle}
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

        {/* VIEW 2: COURSE MASTER */}
        {currentView === 'courses' && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold text-sidebarBg">Course Master</h2><p className="text-sm text-brandMuted">Define and manage standard training courses.</p></div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                  <button onClick={() => setCourseViewMode('grid')} className={`p-2 rounded-md transition-all ${courseViewMode === 'grid' ? 'bg-brandOrange text-white shadow' : 'text-gray-400 hover:text-sidebarBg'}`}><LayoutGrid className="w-4 h-4" /></button>
                  <button onClick={() => setCourseViewMode('table')} className={`p-2 rounded-md transition-all ${courseViewMode === 'table' ? 'bg-brandOrange text-white shadow' : 'text-gray-400 hover:text-sidebarBg'}`}><List className="w-4 h-4" /></button>
                </div>
                <button onClick={openCourseModal} className="px-6 py-2.5 bg-brandOrange text-white rounded-xl text-sm font-bold shadow-lg hover:bg-orange-700 transition-all flex items-center gap-2 h-10">
                  <Plus className="w-4 h-4" /> NEW COURSE
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <div className="inline-flex bg-gray-200 p-1 rounded-xl gap-0.5">
                {DEPARTMENTS.map(dept => (
                  <button key={dept} onClick={() => setActiveDeptTab(dept)} className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeDeptTab === dept ? 'bg-white text-brandOrange shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    {dept} <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeDeptTab === dept ? 'bg-orange-50 text-brandOrange' : 'bg-gray-300 text-white'}`}>{getCourseCount(dept)}</span>
                  </button>
                ))}
              </div>
            </div>

            {courseViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-soft p-5 hover:border-brandOrange transition-all group relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editCourse(course)} className="text-gray-400 hover:text-brandBlue"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteCourse(course.id)} className="text-gray-400 hover:text-brandRed"><Trash className="w-4 h-4" /></button>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-brandBlue bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{course.dept}</span>
                    </div>
                    <h3 className="text-lg font-bold text-sidebarBg mb-2">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{course.desc}</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs border border-gray-100 mb-3">
                      <p className="font-bold text-gray-700 mb-2 flex items-center gap-1"><ListChecks className="w-3 h-3" /> Key Steps:</p>
                      <ul className="space-y-1 text-gray-500 pl-4 list-disc">
                        {(course.steps || []).slice(0,3).map((step, i) => <li key={i}>{step}</li>)}
                        {(course.steps || []).length > 3 && <li className="text-brandOrange">+{course.steps.length - 3} more steps</li>}
                      </ul>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                      <span><Clock className="w-3 h-3 inline mr-1" /> {course.duration} Hrs</span>
                      <span>Trainer: {course.trainer}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Course Title</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Duration</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Trainer</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Steps</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCourses.map(course => (
                      <tr key={course.id} className="hover:bg-gray-50 group">
                        <td className="p-4 font-bold text-sidebarBg">{course.title}</td>
                        <td className="p-4"><span className="text-[10px] font-bold text-brandBlue bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{course.category}</span></td>
                        <td className="p-4 text-center text-xs font-mono text-gray-500">{course.duration} Hrs</td>
                        <td className="p-4 text-gray-600 text-xs">{course.trainer}</td>
                        <td className="p-4 text-center"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold">{(course.steps || []).length}</span></td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => editCourse(course)} className="p-1.5 rounded hover:bg-gray-100 text-brandBlue"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteCourse(course.id)} className="p-1.5 rounded hover:bg-gray-100 text-brandRed"><Trash className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: REGISTRATION */}
        {currentView === 'register' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6"><h2 className="text-2xl font-bold text-sidebarBg">Course Registration</h2><p className="text-sm text-brandMuted">Enroll in available OJT courses (Next 2 Months).</p></div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <div className="inline-flex bg-gray-200 p-1 rounded-xl gap-0.5">
                {DEPARTMENTS.map(dept => (
                  <button key={dept} onClick={() => setActiveDeptTab(dept)} className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeDeptTab === dept ? 'bg-white text-brandOrange shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    {dept} <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeDeptTab === dept ? 'bg-orange-50 text-brandOrange' : 'bg-gray-300 text-white'}`}>{getRegistrationCount(dept)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAvailableSessions.map(plan => (
                <div key={plan.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-lg transition-all group flex flex-col h-full">
                  <div className="h-32 bg-gray-100 relative overflow-hidden">
                    <img src={plan.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt={plan.courseTitle} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-center shadow-lg border border-white/20">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{plan.month}</p>
                      <p className="text-lg font-extrabold text-brandDeepBlue leading-none">{plan.day}</p>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-brandOrange text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">{plan.dept}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col bg-white">
                    <h3 className="text-sm font-bold text-sidebarBg mb-1 group-hover:text-brandOrange transition-colors">{plan.courseTitle}</h3>
                    <p className="text-xs text-gray-500 mb-2 font-mono flex items-center gap-1"><MapPin className="w-3 h-3" /> {plan.location}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-brandTeal" /> {plan.trainer}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brandTeal" /> {plan.time.split(' ')[0]}</div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-100 text-center flex gap-2">
                      <button onClick={() => openCourseDetails(plan)} className="text-xs text-gray-500 font-bold hover:text-sidebarBg flex-1 border-r border-gray-200">View Details</button>
                      <button onClick={() => openRegistrationModal(plan)} className="text-xs text-brandOrange font-bold hover:underline flex items-center justify-center gap-1 flex-1">Register <ArrowRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAvailableSessions.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">No courses available for registration in the next 2 months.</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: EVALUATION */}
        {currentView === 'evaluation' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-sidebarBg">Evaluation & Attendance</h2></div>
            <div className="mb-8">
              <h3 className="text-lg font-bold text-brandDeepBlue mb-4 border-b border-gray-200 pb-2">Active Classes (Attendance)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PLANS.map(plan => (
                  <div key={plan.id + '_att'} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:border-brandTeal transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-brandTeal bg-teal-50 px-2 py-0.5 rounded">{plan.dept}</span>
                      <span className="text-xs font-bold text-gray-400">{plan.date}</span>
                    </div>
                    <h4 className="font-bold text-sidebarBg mb-1">{plan.courseTitle}</h4>
                    <p className="text-xs text-gray-500 mb-4">{plan.time} | {plan.location}</p>
                    <button onClick={() => openManageModal(plan, 'attendance')} className="w-full py-2 bg-brandTeal text-white rounded-lg text-xs font-bold hover:bg-teal-700 flex items-center justify-center gap-2">
                      <CheckSquare className="w-4 h-4" /> Check Attendance
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-brandDeepBlue mb-4 border-b border-gray-200 pb-2">Pending Grading</h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {MOCK_PENDING_GRADING.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brandOrange/10 text-brandOrange flex items-center justify-center font-bold text-sm">{item.employee.charAt(0)}</div>
                      <div><h4 className="font-bold text-sm text-sidebarBg">{item.employee}</h4><p className="text-xs text-gray-500">{item.course} • {item.date}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Pending Grade</span>
                      <button onClick={() => openManageModal(item, 'score')} className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white hover:border-brandOrange hover:text-brandOrange text-xs font-bold transition-all">Grade</button>
                    </div>
                  </div>
                ))}
                {MOCK_PENDING_GRADING.length === 0 && <div className="p-8 text-center text-gray-400 text-sm italic">No pending evaluations.</div>}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: HISTORY */}
        {currentView === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Training History</h2>
              <div className="flex gap-4 items-center">
                <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                  <button onClick={() => setHistoryMode('course')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${historyMode === 'course' ? 'bg-brandDeepBlue text-white shadow' : 'text-gray-500 hover:text-sidebarBg'}`}>By Course</button>
                  <button onClick={() => setHistoryMode('person')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${historyMode === 'person' ? 'bg-brandDeepBlue text-white shadow' : 'text-gray-500 hover:text-sidebarBg'}`}>By Person</button>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type="text" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-brandTeal" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              {historyMode === 'course' ? (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Course Title</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Department</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Total Attendees</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Avg. Score</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHistory.map(h => (
                      <tr key={h.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="p-4 font-bold text-sidebarBg">{h.course}</td>
                        <td className="p-4 text-xs text-brandBlue">{h.dept}</td>
                        <td className="p-4 text-center">{h.attendees}</td>
                        <td className="p-4 text-center font-bold text-brandBlue">{h.avgScore}/100</td>
                        <td className="p-4 text-center"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">{h.passRate}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Course</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Score</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStaffHistory.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="p-4 font-bold text-sidebarBg">{p.employee}</td>
                        <td className="p-4 text-gray-600">{p.course}</td>
                        <td className="p-4 text-gray-500 font-mono text-xs">{p.date}</td>
                        <td className="p-4 text-center font-bold">{p.score}/100</td>
                        <td className="p-4 text-center">
                          <button onClick={(e) => { e.stopPropagation(); printCertificate(); }} className="text-brandGold hover:underline text-xs flex items-center justify-center gap-1 w-full">
                            <Award className="w-3 h-3" /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      
      {/* 1. ADD/EDIT COURSE */}
      <BaseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title={isEditingCourse ? 'Edit Course' : 'Create In-House Course'} icon={BookOpen} size="lg">
        <div className="p-6 space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course Title</label><input type="text" value={formCourse.title} onChange={e => setFormCourse({...formCourse, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="e.g. Safety Awareness 2026" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label><select value={formCourse.category} onChange={e => setFormCourse({...formCourse, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"><option>General</option><option>Safety</option><option>Technical</option><option>Leadership</option></select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Hrs)</label><input type="number" value={formCourse.duration} onChange={e => setFormCourse({...formCourse, duration: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label><select value={formCourse.dept} onChange={e => setFormCourse({...formCourse, dept: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">{DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Group</label><input type="text" value={formCourse.targetGroup} onChange={e => setFormCourse({...formCourse, targetGroup: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="e.g. New Hires" /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trainer / Speaker</label><input type="text" value={formCourse.trainer} onChange={e => setFormCourse({...formCourse, trainer: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Objective</label><textarea value={formCourse.objective} onChange={e => setFormCourse({...formCourse, objective: e.target.value})} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal"></textarea></div>
          <div>
            <div className="flex justify-between items-center mb-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-0">Checklist / Steps</label><button onClick={addStep} className="text-[10px] text-brandOrange font-bold hover:underline">+ Add Step</button></div>
            {(formCourse.steps || []).map((step, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={step} onChange={e => { const newSteps = [...(formCourse.steps || [])]; newSteps[idx] = e.target.value; setFormCourse({...formCourse, steps: newSteps}); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brandTeal" placeholder={`Step ${idx+1}`} />
                <button onClick={() => removeStep(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowCourseModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={saveCourse} className="px-6 py-2 bg-brandBlue text-white text-xs font-bold rounded-lg shadow hover:bg-blue-800">Save Course</button>
        </div>
      </BaseModal>

      {/* 2. COURSE DETAILS / REGISTER */}
      <BaseModal isOpen={showDetailModal || showRegistrationModal} onClose={() => { setShowDetailModal(false); setShowRegistrationModal(false); }} title={showRegistrationModal ? 'Register: ' + selectedCourse?.title : 'Course Details'} icon={showRegistrationModal ? UserPlus : BookOpen} size="lg">
        <div className="p-6">
          {showDetailModal && (
            <div>
              <h4 className="text-xl font-bold text-brandDeepBlue mb-2">{selectedCourse?.title}</h4>
              <span className="text-[10px] font-bold text-white bg-brandOrange px-2 py-0.5 rounded uppercase">{selectedCourse?.dept}</span>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <p><strong>Objective:</strong> {selectedCourse?.objective}</p>
                <p><strong>Trainer:</strong> {selectedCourse?.trainer}</p>
                <p><strong>Duration:</strong> {selectedCourse?.duration} Hours</p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2">
                  <p className="font-bold text-gray-700 mb-2 flex items-center gap-1"><ListChecks className="w-3 h-3" /> Steps:</p>
                  <ul className="space-y-1 text-gray-500 pl-4 list-disc">
                    {(selectedCourse?.steps || []).map((step: string, idx: number) => <li key={idx}>{step}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {showRegistrationModal && (
            <div>
              <p className="text-xs text-gray-500 mb-4">Date: <span className="font-bold text-brandDeepBlue">{selectedCourse?.date}</span> | Time: {selectedCourse?.time}</p>
              <div className="mb-4 flex justify-between items-center"><h4 className="text-sm font-bold text-sidebarBg">Participant List</h4><button onClick={addRegRow} className="text-[10px] text-brandBlue font-bold hover:underline">+ Add Employee</button></div>
              <div className="space-y-2">
                {registrationList.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" value={row.empId} onChange={e => { const list = [...registrationList]; list[idx].empId = e.target.value; setRegistrationList(list); }} className="w-24 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none" placeholder="Emp ID" />
                    <input type="text" value={row.name} onChange={e => { const list = [...registrationList]; list[idx].name = e.target.value; setRegistrationList(list); }} className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none" placeholder="Name" />
                    <button onClick={() => removeRegRow(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => { setShowDetailModal(false); setShowRegistrationModal(false); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Close</button>
          {showRegistrationModal && <button onClick={submitRegistration} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-blue-800">Confirm Registration</button>}
        </div>
      </BaseModal>

      {/* 3. MANAGE MODAL */}
      <BaseModal isOpen={showManageModal} onClose={() => setShowManageModal(false)} title={manageMode === 'attendance' ? 'Check Attendance' : 'Record Evaluation'} icon={manageMode === 'attendance' ? CheckSquare : ClipboardCheck} size="lg">
        <div className="p-6">
          <p className="text-sm font-bold text-brandDeepBlue mb-4">{selectedSession?.courseTitle}</p>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">E{i}</div>
                  <span className="text-sm font-bold text-gray-700">Employee {i}</span>
                </div>
                {manageMode === 'attendance' ? (
                  <input type="checkbox" className="w-5 h-5 accent-brandTeal" defaultChecked />
                ) : (
                  <div className="flex items-center gap-2">
                    <select className="text-[10px] border rounded p-1"><option>Written Test</option><option>Practical</option></select>
                    <input type="number" className="w-16 border rounded p-1 text-center text-xs" placeholder="Score" />
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowManageModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={saveSessionData} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-blue-800">{manageMode === 'attendance' ? 'Save Attendance' : 'Submit Grades'}</button>
        </div>
      </BaseModal>

      {/* 4. ANNUAL PLAN MODAL */}
      <BaseModal isOpen={showAnnualPlanModal} onClose={() => setShowAnnualPlanModal(false)} title="Manage Annual Training Plan" icon={Map} size="xl">
        <div className="p-6">
          <table className="w-full text-left bg-white rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="p-3 text-xs font-bold">Month</th><th className="p-3 text-xs font-bold">Course</th><th className="p-3 text-xs font-bold">Dept</th></tr></thead>
            <tbody>
              {MOCK_PLANS.map(plan => (
                <tr key={plan.id} className="border-b border-gray-100">
                  <td className="p-3 text-sm">{plan.month}</td>
                  <td className="p-3 text-sm font-bold text-sidebarBg">{plan.courseTitle}</td>
                  <td className="p-3 text-xs">{plan.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BaseModal>

      {/* 5. GUIDE SLIDE-OVER */}
      {showGuide && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-sidebarBg text-white">
              <h3 className="font-bold flex items-center gap-2 text-lg m-0 border-0"><HelpCircle className="w-5 h-5 text-brandGold" /> คู่มือการใช้งาน</h3>
              <button onClick={() => setShowGuide(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
              <p className="text-sm font-semibold text-brandTeal mb-4">ระบบฝึกอบรมหน้างาน (OJT System)</p>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">1. การจัดการหลักสูตร (Course Master)</h3>
                <p className="text-sm text-gray-600 mb-2">สร้างและแก้ไขหลักสูตรมาตรฐานสำหรับแต่ละแผนก</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>กำหนดชื่อหลักสูตร, วิทยากร, และระยะเวลา</li>
                  <li>สร้าง Checklist ขั้นตอนการปฏิบัติงาน (Steps) เพื่อใช้ในการประเมิน</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">2. การลงทะเบียน (Registration)</h3>
                <p className="text-sm text-gray-600 mb-2">ลงทะเบียนพนักงานเข้าอบรมในหลักสูตรที่มีตารางสอน (Upcoming Sessions)</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>เลือกหลักสูตรที่ต้องการ</li>
                  <li>เพิ่มรายชื่อพนักงาน (สามารถเพิ่มได้ทีละหลายคน)</li>
                </ul>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">3. การประเมินผล (Evaluation)</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li><strong>Attendance:</strong> เช็คชื่อผู้เข้าอบรม</li>
                  <li><strong>Grading:</strong> ให้คะแนนตาม Checklist หรือเกณฑ์ที่กำหนด (ผ่าน/ไม่ผ่าน)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OJTTraining;
