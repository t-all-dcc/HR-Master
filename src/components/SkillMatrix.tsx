import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid, Award, TrendingUp, Users, Search, Filter, 
  ChevronDown, ChevronRight, Star, AlertCircle, Download,
  CheckCircle2, XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Soft' | 'Leadership';
  description: string;
}

interface EmployeeSkill {
  empId: string;
  empName: string;
  position: string;
  dept: string;
  avatar: string;
  skills: Record<string, number>; // skillId -> level (0-5)
}

// --- Mock Data ---
const SKILLS_MASTER: Skill[] = [
  { id: 'S01', name: 'React.js', category: 'Technical', description: 'Frontend Development' },
  { id: 'S02', name: 'Node.js', category: 'Technical', description: 'Backend Development' },
  { id: 'S03', name: 'Communication', category: 'Soft', description: 'Verbal and Written' },
  { id: 'S04', name: 'Team Leadership', category: 'Leadership', description: 'Leading teams' },
  { id: 'S05', name: 'Project Mgmt', category: 'Leadership', description: 'Agile/Scrum' },
  { id: 'S06', name: 'UI/UX Design', category: 'Technical', description: 'Figma, Adobe XD' },
];

const EMPLOYEES_SKILLS: EmployeeSkill[] = [
  { 
    empId: 'E001', empName: 'Somchai J.', position: 'Senior Dev', dept: 'IT', avatar: 'https://i.pravatar.cc/150?img=12',
    skills: { 'S01': 5, 'S02': 4, 'S03': 3, 'S04': 2, 'S05': 3, 'S06': 2 }
  },
  { 
    empId: 'E002', empName: 'Alice S.', position: 'UX Designer', dept: 'IT', avatar: 'https://i.pravatar.cc/150?img=5',
    skills: { 'S01': 3, 'S02': 1, 'S03': 4, 'S04': 1, 'S05': 2, 'S06': 5 }
  },
  { 
    empId: 'E003', empName: 'Bob B.', position: 'Project Mgr', dept: 'IT', avatar: 'https://i.pravatar.cc/150?img=3',
    skills: { 'S01': 2, 'S02': 2, 'S03': 5, 'S04': 4, 'S05': 5, 'S06': 3 }
  },
];

const SkillMatrix = () => {
  const [currentView, setCurrentView] = useState<'matrix' | 'gap_analysis' | 'individual'>('matrix');
  const [selectedDept, setSelectedDept] = useState('IT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSkill | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // --- Computed ---
  const filteredEmployees = useMemo(() => {
    return EMPLOYEES_SKILLS.filter(emp => 
      emp.dept === selectedDept && 
      emp.empName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedDept, searchQuery]);

  const skillGaps = useMemo(() => {
    // Mock target levels (e.g., Senior Dev needs level 4 in React)
    const targets: Record<string, number> = { 'S01': 4, 'S02': 3, 'S03': 3, 'S04': 3, 'S05': 3, 'S06': 2 };
    
    return filteredEmployees.map(emp => {
      let gapCount = 0;
      const gaps: { skill: string, current: number, target: number }[] = [];
      
      Object.entries(targets).forEach(([skillId, target]) => {
        const current = emp.skills[skillId] || 0;
        if (current < target) {
          gapCount++;
          gaps.push({ skill: SKILLS_MASTER.find(s => s.id === skillId)?.name || skillId, current, target });
        }
      });
      
      return { ...emp, gapCount, gaps };
    });
  }, [filteredEmployees]);

  // --- Actions ---
  const getLevelColor = (level: number) => {
    if (level === 0) return 'bg-gray-100 text-gray-300';
    if (level <= 2) return 'bg-red-100 text-red-600';
    if (level === 3) return 'bg-yellow-100 text-yellow-600';
    if (level >= 4) return 'bg-green-100 text-green-600';
    return 'bg-gray-100';
  };

  const openEmployeeDetail = (emp: EmployeeSkill) => {
    setSelectedEmployee(emp);
    setShowDetailModal(true);
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandTeal text-white shadow-lg">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">SKILL MATRIX</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">Competency Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
              <button onClick={() => setCurrentView('matrix')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'matrix' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <Grid className="w-4 h-4" /> MATRIX VIEW
              </button>
              <button onClick={() => setCurrentView('gap_analysis')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${currentView === 'gap_analysis' ? 'bg-sidebarBg text-brandGold shadow-sm' : 'text-gray-500 hover:text-brandBlue'}`}>
                <TrendingUp className="w-4 h-4" /> GAP ANALYSIS
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-bgPage p-6">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search employee..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brandTeal w-64 shadow-sm"
              />
            </div>
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 focus:outline-none shadow-sm"
            >
              <option value="IT">IT Department</option>
              <option value="Sales">Sales Department</option>
              <option value="HR">HR Department</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded-full"></span> Beginner (1-2)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 rounded-full"></span> Intermediate (3)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded-full"></span> Expert (4-5)</div>
          </div>
        </div>

        {/* VIEW: MATRIX */}
        {currentView === 'matrix' && (
          <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-50 p-4 border-b border-r border-gray-200 min-w-[250px]">
                      <span className="text-xs font-bold text-gray-500 uppercase">Employee</span>
                    </th>
                    {SKILLS_MASTER.map(skill => (
                      <th key={skill.id} className="p-4 border-b border-gray-200 bg-gray-50 text-center min-w-[100px]">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-sidebarBg">{skill.name}</span>
                          <span className="text-[10px] text-gray-400 font-normal">{skill.category}</span>
                        </div>
                      </th>
                    ))}
                    <th className="p-4 border-b border-gray-200 bg-gray-50 text-center min-w-[100px]">
                      <span className="text-xs font-bold text-gray-500 uppercase">Avg Score</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => {
                    const totalScore = Object.values(emp.skills).reduce((a, b) => a + b, 0);
                    const avgScore = (totalScore / SKILLS_MASTER.length).toFixed(1);
                    
                    return (
                      <tr key={emp.empId} className="hover:bg-gray-50 transition-colors group">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 p-4 border-b border-r border-gray-200">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => openEmployeeDetail(emp)}>
                            <img src={emp.avatar} alt={emp.empName} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                            <div>
                              <div className="text-sm font-bold text-sidebarBg">{emp.empName}</div>
                              <div className="text-xs text-gray-500">{emp.position}</div>
                            </div>
                          </div>
                        </td>
                        {SKILLS_MASTER.map(skill => {
                          const level = emp.skills[skill.id] || 0;
                          return (
                            <td key={skill.id} className="p-4 border-b border-gray-100 text-center">
                              <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-bold ${getLevelColor(level)}`}>
                                {level}
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-4 border-b border-gray-100 text-center">
                          <span className="text-sm font-bold text-brandDeepBlue">{avgScore}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: GAP ANALYSIS */}
        {currentView === 'gap_analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {skillGaps.map(emp => (
              <div key={emp.empId} className="bg-white rounded-2xl shadow-soft border border-white p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                  <img src={emp.avatar} alt={emp.empName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-sidebarBg">{emp.empName}</h3>
                    <p className="text-xs text-gray-500">{emp.position}</p>
                  </div>
                  <div className="ml-auto">
                    {emp.gapCount > 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {emp.gapCount} Gaps
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  {emp.gaps.length > 0 ? (
                    emp.gaps.map((gap, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-gray-700">{gap.skill}</span>
                          <span className="text-red-500">Gap: -{gap.target - gap.current}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span>Current: {gap.current}</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400" style={{ width: `${(gap.current / 5) * 100}%` }}></div>
                          </div>
                          <span>Target: {gap.target}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                      <Award className="w-12 h-12 mb-2 opacity-20" />
                      <p className="text-xs">All skills meet or exceed expectations.</p>
                    </div>
                  )}
                </div>

                {emp.gapCount > 0 && (
                  <button className="mt-4 w-full py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg hover:bg-brandBlue transition-colors">
                    Assign Training Plan
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Employee Detail Modal */}
      <BaseModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Skill Profile" icon={Users} size="lg">
        {selectedEmployee && (
          <div className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <img src={selectedEmployee.avatar} className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
              <div>
                <h2 className="text-2xl font-bold text-sidebarBg">{selectedEmployee.empName}</h2>
                <p className="text-brandTeal font-bold">{selectedEmployee.position}</p>
                <p className="text-sm text-gray-500">{selectedEmployee.dept} Department</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-2">Technical Skills</h3>
                <div className="space-y-4">
                  {SKILLS_MASTER.filter(s => s.category === 'Technical').map(skill => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-gray-600">{skill.name}</span>
                        <span className="font-bold text-brandBlue">{selectedEmployee.skills[skill.id] || 0}/5</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-brandBlue h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${((selectedEmployee.skills[skill.id] || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-2">Soft & Leadership</h3>
                <div className="space-y-4">
                  {SKILLS_MASTER.filter(s => s.category !== 'Technical').map(skill => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-gray-600">{skill.name}</span>
                        <span className="font-bold text-brandGold">{selectedEmployee.skills[skill.id] || 0}/5</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-brandGold h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${((selectedEmployee.skills[skill.id] || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseModal>

    </div>
  );
};

export default SkillMatrix;
