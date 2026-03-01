import React, { useState, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  PlayCircle, 
  Calendar, 
  Award, 
  BarChart2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  FileText, 
  Video, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  UserCheck,
  HelpCircle,
  X,
  Bell
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Mock Data ---
const MOCK_NEW_HIRES = [
  { id: 1, name: 'Sarah Johnson', position: 'UX Designer', department: 'Product', startDate: '2023-10-01', status: 'In Progress', progress: 45, mentor: 'Mike Chen' },
  { id: 2, name: 'David Lee', position: 'Frontend Dev', department: 'Engineering', startDate: '2023-10-15', status: 'Not Started', progress: 0, mentor: 'Emily Davis' },
  { id: 3, name: 'Jessica Williams', position: 'HR Specialist', department: 'HR', startDate: '2023-09-20', status: 'Completed', progress: 100, mentor: 'Sarah Connor' },
  { id: 4, name: 'Michael Brown', position: 'Sales Executive', department: 'Sales', startDate: '2023-10-05', status: 'In Progress', progress: 70, mentor: 'John Smith' },
];

const MOCK_PROGRAMS = [
  { id: 1, title: 'General Company Orientation', duration: '1 Day', modules: 5, type: 'Mandatory', attendees: 12 },
  { id: 2, title: 'IT Security Awareness', duration: '2 Hours', modules: 1, type: 'Mandatory', attendees: 45 },
  { id: 3, title: 'Product Design Principles', duration: '3 Days', modules: 8, type: 'Department', attendees: 4 },
  { id: 4, title: 'Sales Bootcamp', duration: '1 Week', modules: 12, type: 'Department', attendees: 6 },
];

const MOCK_CHECKLIST = [
  { id: 1, task: 'Complete Personal Information Form', category: 'HR', status: 'Completed', dueDate: 'Day 1' },
  { id: 2, task: 'Setup Company Email & Slack', category: 'IT', status: 'Completed', dueDate: 'Day 1' },
  { id: 3, task: 'Review Employee Handbook', category: 'HR', status: 'Pending', dueDate: 'Day 3' },
  { id: 4, task: 'Meet with Department Head', category: 'Department', status: 'Pending', dueDate: 'Week 1' },
  { id: 5, task: 'Complete IT Security Training', category: 'Training', status: 'Pending', dueDate: 'Week 1' },
];

const OrientationTraining = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new_hires' | 'programs' | 'my_orientation'>('dashboard');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedHire, setSelectedHire] = useState<any>(null);

  // --- Actions ---
  const handleAssignProgram = () => {
    setShowAssignModal(false);
    Swal.fire('Assigned', 'Orientation program assigned successfully.', 'success');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Not Started': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Charts ---
  React.useEffect(() => {
    if (currentView === 'dashboard') {
      const ctx = document.getElementById('orientationProgressChart') as HTMLCanvasElement;
      let chart: Chart | null = null;

      if (ctx) {
        chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
              data: [35, 45, 20],
              backgroundColor: ['#10B981', '#3B82F6', '#E5E7EB'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
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
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">ORIENTATION TRAINING</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">New Hire Onboarding</p>
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
          <button onClick={() => setCurrentView('new_hires')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'new_hires' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <Users className="w-4 h-4" /> NEW HIRES
          </button>
          <button onClick={() => setCurrentView('programs')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'programs' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <PlayCircle className="w-4 h-4" /> PROGRAMS
          </button>
          <button onClick={() => setCurrentView('my_orientation')} className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${currentView === 'my_orientation' ? 'border-brandTeal text-brandTeal bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}>
            <CheckSquare className="w-4 h-4" /> MY ORIENTATION
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
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total New Hires</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">24</h4>
                    <p className="text-xs text-green-500 mt-1 font-bold">+5 this month</p>
                  </div>
                  <div className="p-3 bg-brandTeal/10 rounded-xl text-brandTeal"><Users className="w-6 h-6" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Completion Rate</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">85%</h4>
                    <p className="text-xs text-green-500 mt-1 font-bold">+2% vs last month</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl text-green-600"><Award className="w-6 h-6" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Avg. Time to Complete</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">12 Days</h4>
                    <p className="text-xs text-gray-400 mt-1 font-bold">Target: 14 Days</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Clock className="w-6 h-6" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pending Tasks</p>
                    <h4 className="text-3xl font-extrabold text-sidebarBg mt-2">18</h4>
                    <p className="text-xs text-red-500 mt-1 font-bold">Needs Attention</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl text-red-600"><AlertCircle className="w-6 h-6" /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Orientation Progress</h4>
                <div className="h-64 flex justify-center w-full">
                  <canvas id="orientationProgressChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white">
                <h4 className="text-sm font-bold text-sidebarBg mb-4 border-b border-gray-100 pb-2">Recent Activities</h4>
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">SJ</div>
                      <div>
                        <p className="text-xs text-gray-800"><span className="font-bold">Sarah Johnson</span> completed <span className="font-bold text-brandTeal">IT Security Module</span></p>
                        <p className="text-[10px] text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: NEW HIRES */}
        {currentView === 'new_hires' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">New Hires Tracking</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brandTeal" />
                </div>
                <button className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow hover:bg-brandBlue flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Assign Program
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Department</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Start Date</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Mentor</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Progress</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_NEW_HIRES.map(hire => (
                    <tr key={hire.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-sm text-sidebarBg">{hire.name}</div>
                        <div className="text-[10px] text-gray-400">{hire.position}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{hire.department}</td>
                      <td className="p-4 text-sm text-gray-600">{hire.startDate}</td>
                      <td className="p-4 text-sm text-gray-600">{hire.mentor}</td>
                      <td className="p-4">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mb-1">
                          <div className="h-1.5 bg-brandTeal rounded-full" style={{width: `${hire.progress}%`}}></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{hire.progress}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(hire.status)}`}>{hire.status}</span>
                      </td>
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

        {/* VIEW: PROGRAMS */}
        {currentView === 'programs' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">Orientation Programs</h2>
              <button className="px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-xs font-bold shadow hover:bg-brandBlue flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Program
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PROGRAMS.map(program => (
                <div key={program.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-brandTeal hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg ${program.type === 'Mandatory' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {program.type === 'Mandatory' ? <AlertCircle className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <button className="text-gray-300 hover:text-brandTeal"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                  <h3 className="font-bold text-sidebarBg mb-1">{program.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {program.modules} Modules</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">+{program.attendees}</div>
                    </div>
                    <button className="text-xs font-bold text-brandTeal flex items-center gap-1 group-hover:underline">View Details <ChevronRight className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MY ORIENTATION */}
        {currentView === 'my_orientation' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sidebarBg">My Orientation Checklist</h2>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-bold uppercase">Overall Progress</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{width: '60%'}}></div></div>
                  <span className="text-sm font-bold text-green-600">60%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {MOCK_CHECKLIST.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-sm transition-all">
                    <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-brandTeal'}`}>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold ${item.status === 'Completed' ? 'text-gray-400 line-through' : 'text-sidebarBg'}`}>{item.task}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-500 font-bold">{item.category}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {item.dueDate}</span>
                      </div>
                    </div>
                    {item.status !== 'Completed' && (
                      <button className="px-3 py-1 text-xs font-bold text-brandTeal border border-brandTeal rounded hover:bg-brandTeal hover:text-white transition-colors">Start</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-soft border border-gray-100">
                  <h4 className="font-bold text-sidebarBg mb-3 flex items-center gap-2"><Video className="w-4 h-4 text-brandOrange" /> Featured Content</h4>
                  <div className="space-y-3">
                    <div className="group cursor-pointer">
                      <div className="aspect-video bg-gray-900 rounded-lg mb-2 relative overflow-hidden">
                        <img src="https://picsum.photos/seed/office/400/225" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" alt="Video" />
                        <div className="absolute inset-0 flex items-center justify-center"><PlayCircle className="w-10 h-10 text-white opacity-80 group-hover:scale-110 transition-transform" /></div>
                      </div>
                      <p className="text-xs font-bold text-gray-700 group-hover:text-brandTeal">Welcome from CEO</p>
                      <p className="text-[10px] text-gray-400">5 mins video</p>
                    </div>
                  </div>
                </div>

                <div className="bg-brandDeepBlue p-5 rounded-xl shadow-soft text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-bold mb-2 text-brandGold">Need Help?</h4>
                    <p className="text-xs opacity-80 mb-4">Contact your HR representative or mentor for assistance.</p>
                    <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="text-xs font-bold">Sarah Connor</p>
                        <p className="text-[10px] opacity-70">HR Specialist</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-white/5"><Users size={100} /></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: ASSIGN PROGRAM */}
      <BaseModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Orientation" icon={UserCheck}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Employee</label>
            <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
              <option>Select...</option>
              <option>David Lee</option>
              <option>Michael Brown</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Program</label>
            <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal">
              <option>General Company Orientation</option>
              <option>IT Security Awareness</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
            <input type="date" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mentor</label>
            <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brandTeal" placeholder="Search mentor..." />
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleAssignProgram} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue">Assign</button>
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
              <p className="text-sm font-semibold text-brandTeal mb-4">ระบบปฐมนิเทศพนักงานใหม่ (Orientation)</p>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">1. ภาพรวม (Dashboard)</h3>
                <p className="text-sm text-gray-600 mb-2">ดูสถานะการปฐมนิเทศของพนักงานใหม่ทั้งหมด อัตราความสำเร็จ และงานที่ค้างอยู่</p>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">2. การจัดการพนักงานใหม่ (New Hires)</h3>
                <p className="text-sm text-gray-600 mb-2">ติดตามรายชื่อพนักงานใหม่ วันเริ่มงาน และพี่เลี้ยง (Mentor) สามารถกด <strong>Assign Program</strong> เพื่อมอบหมายหลักสูตรปฐมนิเทศ</p>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">3. หลักสูตร (Programs)</h3>
                <p className="text-sm text-gray-600 mb-2">สร้างและจัดการหลักสูตรปฐมนิเทศ เช่น หลักสูตรบังคับ (Mandatory) หรือหลักสูตรเฉพาะแผนก</p>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">4. การปฐมนิเทศของฉัน (My Orientation)</h3>
                <p className="text-sm text-gray-600 mb-2">สำหรับพนักงานใหม่ เพื่อดูรายการสิ่งที่ต้องทำ (Checklist) และเข้าถึงเนื้อหาการเรียนรู้</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrientationTraining;
