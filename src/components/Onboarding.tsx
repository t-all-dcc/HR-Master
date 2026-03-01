import React, { useState } from 'react';
import { 
  UserPlus, 
  CheckSquare, 
  FileText, 
  Monitor, 
  CreditCard, 
  Users, 
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

interface NewHire {
  id: number;
  name: string;
  position: string;
  department: string;
  startDate: string;
  status: 'Pre-boarding' | 'Onboarding' | 'Probation' | 'Completed';
  progress: number;
}

const MOCK_NEW_HIRES: NewHire[] = [
  { id: 1, name: 'Suda M.', position: 'HR Officer', department: 'Human Resources', startDate: '2023-10-01', status: 'Onboarding', progress: 45 },
  { id: 2, name: 'Ken T.', position: 'IT Support Officer', department: 'IT', startDate: '2023-10-15', status: 'Pre-boarding', progress: 10 },
];

const Onboarding = () => {
  const [hires, setHires] = useState<NewHire[]>(MOCK_NEW_HIRES);
  const [selectedHire, setSelectedHire] = useState<NewHire | null>(null);

  const handleTaskToggle = (taskId: string) => {
    // Mock toggle logic
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Task updated',
      showConfirmButton: false,
      timer: 1000
    });
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">ONBOARDING</h1>
            <p className="text-brandTeal text-[11px] font-bold uppercase tracking-widest">New Employee Integration</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          
          {/* Left: New Hires List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-brandTeal" /> New Hires
            </h2>
            
            {hires.map(hire => (
              <div 
                key={hire.id} 
                onClick={() => setSelectedHire(hire)}
                className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${selectedHire?.id === hire.id ? 'border-brandTeal ring-1 ring-brandTeal' : 'border-gray-200 hover:border-brandTeal/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sidebarBg">{hire.name}</h3>
                    <p className="text-xs text-gray-500">{hire.position}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                    hire.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                    (hire.status === 'Pre-boarding' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')
                  }`}>
                    {hire.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Calendar className="w-3 h-3" /> Start: {hire.startDate}
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                  <div className="bg-brandTeal h-1.5 rounded-full transition-all duration-500" style={{ width: `${hire.progress}%` }}></div>
                </div>
                <div className="text-right text-[10px] text-gray-400 font-bold">{hire.progress}% Complete</div>
              </div>
            ))}
          </div>

          {/* Right: Onboarding Checklist */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
            {selectedHire ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-sidebarBg mb-1">Onboarding Checklist</h2>
                    <p className="text-sm text-gray-500">Managing tasks for <span className="font-bold text-brandDeepBlue">{selectedHire.name}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-brandGold">{selectedHire.progress}%</div>
                    <div className="text-xs text-gray-400 uppercase font-bold">Overall Progress</div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Section 1: Pre-boarding */}
                  <div>
                    <h3 className="text-sm font-bold text-brandDeepBlue mb-4 flex items-center gap-2 uppercase tracking-wide">
                      <FileText className="w-4 h-4" /> 1. Pre-boarding (Before Day 1)
                    </h3>
                    <div className="space-y-3">
                      {['Send Welcome Email', 'Prepare Employment Contract', 'Request IT Assets', 'Set up Email Account'].map((task, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer group transition-all">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brandTeal focus:ring-brandTeal" onChange={() => handleTaskToggle(`pre-${i}`)} />
                          <span className="text-sm text-gray-600 group-hover:text-sidebarBg transition-colors">{task}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: First Day */}
                  <div>
                    <h3 className="text-sm font-bold text-brandDeepBlue mb-4 flex items-center gap-2 uppercase tracking-wide">
                      <CheckSquare className="w-4 h-4" /> 2. First Day Orientation
                    </h3>
                    <div className="space-y-3">
                      {['Office Tour', 'Team Introduction', 'Review Company Policies', 'Assign Mentor'].map((task, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer group transition-all">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brandTeal focus:ring-brandTeal" onChange={() => handleTaskToggle(`day1-${i}`)} />
                          <span className="text-sm text-gray-600 group-hover:text-sidebarBg transition-colors">{task}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: IT & Assets */}
                  <div>
                    <h3 className="text-sm font-bold text-brandDeepBlue mb-4 flex items-center gap-2 uppercase tracking-wide">
                      <Monitor className="w-4 h-4" /> 3. IT & Assets
                    </h3>
                    <div className="space-y-3">
                      {['Laptop Configuration', 'Access Card Issuance', 'Software Installation', 'Security Training'].map((task, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer group transition-all">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brandTeal focus:ring-brandTeal" onChange={() => handleTaskToggle(`it-${i}`)} />
                          <span className="text-sm text-gray-600 group-hover:text-sidebarBg transition-colors">{task}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium">Select a new hire to view their onboarding checklist.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
