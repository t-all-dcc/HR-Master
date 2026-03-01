import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Target,
  UserPlus,
  Heart,
  BarChart3,
  Database,
  CalendarDays,
  Settings,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Cake,
  PartyPopper,
  Send,
  ClipboardCheck,
  CheckSquare,
  FileText,
  Bell,
  Megaphone,
  Calendar,
  Info,
  Home,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  LucideIcon
} from 'lucide-react';
import EmployeeDirectory from './components/EmployeeDirectory';
import PositionMaster from './components/PositionMaster';
import Recruitment from './components/Recruitment';
import OJTTraining from './components/OJTTraining';
import ManpowerRequest from './components/ManpowerRequest';
import ResignationTurnover from './components/ResignationTurnover';

import OrientationTraining from './components/OrientationTraining';
import DisciplinaryActions from './components/DisciplinaryActions';
import DepartmentLevel from './components/DepartmentLevel';
import BenefitsWelfare from './components/BenefitsWelfare';
import TimeAttendance from './components/TimeAttendance';
import PayrollCalculation from './components/PayrollCalculation';
import LeaveManagement from './components/LeaveManagement';
import JobDescriptionMaster from './components/JobDescriptionMaster';
import CareerPathSuccession from './components/CareerPathSuccession';
import SkillMatrix from './components/SkillMatrix';
import PerformanceEvaluation from './components/PerformanceEvaluation';
import UserPermissions from './components/UserPermissions';
import HybridLogin from './components/HybridLogin';
import HRCalendar from './components/HRCalendar';
import Onboarding from './components/Onboarding';
import LaborRelations from './components/LaborRelations';
import HRAnalytics from './components/HRAnalytics';
import AppraisalSummary from './components/AppraisalSummary';
import BranchMaster from './components/BranchMaster';
import PlaceholderPage from './components/PlaceholderPage';

// --- Constants & Data ---

const PALETTE = {
  bgMain: '#F2F0EB',
  glassWhite: 'rgba(255, 255, 255, 0.90)',
  red: '#D91604',
  orange: '#D95032',
  gold: '#B8AB89',
  teal: '#5A94A7',
  blue: '#879DB5',
  sidebar: '#141A26',
  text: '#3F4859',
};

const SYSTEM_MODULES = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  {
    id: 'hrm', label: 'HR MANAGEMENT', icon: Users,
    subItems: [
      { id: 'employee_directory', label: 'EMPLOYEE DIRECTORY' },
      { id: 'payroll', label: 'PAYROLL & COMPENSATION' },
      { id: 'time_attendance', label: 'TIME & ATTENDANCE' },
      { id: 'leave_management', label: 'LEAVE MANAGEMENT' },
      { id: 'benefits', label: 'BENEFITS & WELFARE' },
      { id: 'resignation_turnover', label: 'RESIGNATION & TURNOVER' },
      { id: 'disciplinary', label: 'DISCIPLINARY ACTIONS' },
    ]
  },
  {
    id: 'hrd', label: 'HR DEVELOPMENT', icon: GraduationCap,
    subItems: [
      { id: 'ojt_training', label: 'OJT TRAINING' },
      { id: 'orientation', label: 'ORIENTATION TRAINING' },
      { id: 'training_plan', label: 'TRAINING PLANNING' },
      { id: 'skill_matrix', label: 'SKILL MATRIX' },
      { id: 'performance_hrd', label: 'PERFORMANCE' },
      { id: 'career_path', label: 'CAREER PATH' },
      { id: 'succession', label: 'SUCCESSION PLAN' },
    ]
  },
  {
    id: 'performance_mgmt', label: 'PERFORMANCE MANAGEMENT', icon: Target,
    subItems: [
      { id: 'kpi_setting', label: 'KPI / OKR SETTING' },
      { id: 'performance_evaluation', label: 'EVALUATION' },
      { id: 'self_evaluation', label: 'SELF EVALUATION' },
      { id: 'manager_review', label: 'MANAGER REVIEW' },
      { id: 'feedback_360', label: '360 FEEDBACK' },
      { id: 'appraisal_report', label: 'APPRAISAL SUMMARY' },
    ]
  },
  {
    id: 'recruitment', label: 'RECRUITMENT', icon: UserPlus,
    subItems: [
      { id: 'manpower_request', label: 'MANPOWER REQUEST' },
      { id: 'job_vacancies', label: 'JOB VACANCIES' },
      { id: 'recruitment_jd', label: 'JOB DESCRIPTION' },
      { id: 'candidate_tracking', label: 'CANDIDATE TRACKING' },
      { id: 'interview_schedule', label: 'INTERVIEW SCHEDULE' },
      { id: 'onboarding', label: 'ONBOARDING' },
    ]
  },
  {
    id: 'labor_relations', label: 'LABOR RELATIONS', icon: Heart,
    subItems: [
      { id: 'disciplinary_law', label: 'DISCIPLINARY & LABOR LAW' },
      { id: 'company_regulations', label: 'COMPANY REGULATIONS' },
      { id: 'investigation_process', label: 'INVESTIGATION & PUNISHMENT' },
      { id: 'union_grievance', label: 'UNION & GRIEVANCES' },
      { id: 'employee_engagement', label: 'ENGAGEMENT & RELATIONSHIP' },
      { id: 'sports_social', label: 'SPORTS & SOCIAL EVENTS' },
      { id: 'internal_pr', label: 'INTERNAL PR & NEWS' },
      { id: 'external_activities', label: 'EXTERNAL ACTIVITIES' },
    ]
  },
  {
    id: 'analytics', label: 'HR ANALYTICS', icon: BarChart3,
    subItems: [
      { id: 'workforce_report', label: 'WORKFORCE REPORT' },
      { id: 'turnover_analysis', label: 'TURNOVER ANALYSIS' },
      { id: 'budget_tracking', label: 'HR BUDGET TRACKING' },
    ]
  },
  {
    id: 'master', label: 'DATA MASTER', icon: Database,
    subItems: [
      { id: 'org_structure', label: 'ORG STRUCTURE' },
      { id: 'position_master', label: 'POSITION MASTER' },
      { id: 'master_jd', label: 'JOB DESCRIPTION' },
      { id: 'branch_master', label: 'BRANCH MASTER' },
    ]
  },
  { id: 'hr_calendar', label: 'HR CALENDAR', icon: CalendarDays },
  {
    id: 'setting', label: 'SETTING', icon: Settings,
    subItems: [
      { id: 'user_permission', label: 'USER PERMISSIONS' },
      { id: 'system_config', label: 'SYSTEM CONFIG' }
    ]
  }
];

const MOCK_DATA = {
  stats: [
    { label: 'Total Employees', value: '1,248', sub: 'Talent Pool', icon: Users, color: PALETTE.teal },
    { label: 'Attendance Rate', value: '98.2%', sub: 'Active Members', icon: Clock, color: PALETTE.blue },
    { label: 'Open Vacancies', value: '14', sub: 'Finding Innovation', icon: Sparkles, color: PALETTE.orange },
    { label: 'Labor Case Status', value: 'Resolved', sub: 'Friendly Workspace', icon: ShieldCheck, color: PALETTE.red },
  ],
  newMembers: [
    { name: 'พิมพ์พรรณ สวยงาม', pos: 'UX/UI Designer', dept: 'Innovation', joinDate: '01 Jan', avatar: 'https://i.pravatar.cc/150?img=47' },
    { name: 'ธนวัฒน์ มาดี', pos: 'Fullstack Dev', dept: 'Digital Tech', joinDate: '02 Jan', avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'เกริกพล ขยันงาน', pos: 'HR Specialist', dept: 'People', joinDate: '05 Jan', avatar: 'https://i.pravatar.cc/150?img=68' },
  ],
  birthdays: [
    { name: 'อภิรดี มีสุข', dept: 'Accounting', date: '10 Jan', avatar: 'https://i.pravatar.cc/150?img=32' },
    { name: 'ชวาล ยิ่งใหญ่', dept: 'Logistics', date: '12 Jan', avatar: 'https://i.pravatar.cc/150?img=13' },
  ],
  approvals: [
    { id: 'LV-2024-001', type: 'Leave Request', requester: 'สมชาย รักดี', detail: 'Sick Leave (3 Days)', status: 'Pending', icon: FileText },
    { id: 'TR-2024-015', type: 'Training Approval', requester: 'วิภาดา แสงงาม', detail: 'Innovation Camp', status: 'In Review', icon: GraduationCap },
    { id: 'MP-2024-002', type: 'Manpower Request', requester: 'IT Manager', detail: 'Lead Talent (1)', status: 'Processing', icon: UserPlus },
  ],
};

// --- Components ---

const KPICard: React.FC<{ title: string, val: string, color: string, icon: LucideIcon, desc: string }> = ({ title, val, color, icon: Icon, desc }) => (
  <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full">
    <div className="absolute -right-6 -bottom-6 opacity-[0.1] transform rotate-12 group-hover:scale-110 transition-all duration-500 pointer-events-none z-0">
      <Icon size={120} style={{ color: color }} />
    </div>
    <div className="relative z-10 flex justify-between items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-90 truncate">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h4 className="text-3xl font-extrabold tracking-tight leading-tight truncate" style={{ color: color }}>{val}</h4>
        </div>
        {desc && (
          <p className="text-[10px] text-gray-500 font-medium mt-2 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
            {desc}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white" style={{ backgroundColor: color + '15' }}>
        <Icon size={24} style={{ color: color }} />
      </div>
    </div>
  </div>
);

const GlassCard = ({ children, className = '', hoverEffect = true }: { children: React.ReactNode, className?: string, hoverEffect?: boolean }) => (
  <div className={`rounded-3xl p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-white/80 ${hoverEffect ? 'hover:-translate-y-1 transition-transform duration-300' : ''} ${className}`}
    style={{ backgroundColor: PALETTE.glassWhite }}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, { bg: string, text: string }> = {
    'Pending': { bg: '#FEF3C7', text: '#D97706' },
    'In Review': { bg: '#E0F2FE', text: '#0284C7' },
    'Approved': { bg: '#DCFCE7', text: '#16A34A' },
    'Rejected': { bg: '#FEE2E2', text: '#DC2626' },
    'Processing': { bg: '#F3E8FF', text: '#9333EA' },
  };
  const currentStyle = styles[status] || { bg: '#F1F5F9', text: '#475569' };
  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50"
      style={{ backgroundColor: currentStyle.bg, color: currentStyle.text }}>
      {status}
    </span>
  );
};

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  isOpen: boolean;
  subItems?: { label: string; active: boolean; onClick: () => void }[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick, isOpen, subItems, isExpanded, onToggleExpand }) => {
  const hasSubItems = subItems && subItems.length > 0;
  const isDirectActive = active && !hasSubItems;
  const isParentActive = active && hasSubItems;

  return (
    <div className="mb-1">
      <button
        onClick={hasSubItems ? onToggleExpand : onClick}
        className={`w-full flex items-center transition-all duration-500 group relative rounded-xl mx-auto overflow-hidden
                    ${isDirectActive
            ? 'text-white shadow-glow-teal border border-brandTeal/30'
            : isParentActive
              ? 'text-brandTeal bg-brandTeal/10 border border-brandTeal/10'
              : `text-[#8F9FBF] hover:text-brandTeal hover:bg-brandTeal/5`
          }
                    ${!isOpen ? 'justify-center w-12 px-0' : 'w-[90%] px-4 justify-start'} 
                    py-3
                `}
        style={isDirectActive ? { background: `linear-gradient(90deg, ${PALETTE.teal}, ${PALETTE.blue})` } : {}}
      >
        <div className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none ${isDirectActive ? 'animate-shimmer' : 'group-hover:animate-shimmer'}`} />
        <Icon size={20} strokeWidth={isDirectActive || isParentActive ? 2.5 : 2} className={`relative z-10 transition-transform duration-300 ${isDirectActive ? 'scale-110 text-white' : ''} ${isParentActive ? 'text-brandTeal' : ''}`} />
        <div className={`relative z-10 overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-between flex-1 ${isOpen ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'}`}>
          <span className={`text-sm tracking-wide uppercase text-left ${isDirectActive || isParentActive ? 'font-bold' : 'font-medium group-hover:font-semibold'}`}>
            {label}
          </span>
          {hasSubItems && (
            <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded && isOpen ? 'max-h-[500px] opacity-100 mt-1 pl-4' : 'max-h-0 opacity-0'}`}>
        <div className="border-l-2 border-brandTeal/20 pl-2 space-y-0.5">
          {hasSubItems && subItems?.map((sub, idx) => (
            <button key={idx} onClick={(e) => { e.stopPropagation(); sub.onClick(); }}
              className={`w-full flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-[11px] font-medium uppercase relative overflow-hidden group/sub justify-start text-left
                                    ${sub.active ? 'text-white font-bold' : 'text-[#8F9FBF] hover:text-brandTeal hover:bg-brandTeal/5'}
                                `}
              style={sub.active ? { background: `linear-gradient(90deg, ${PALETTE.teal}, ${PALETTE.blue})` } : {}}
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-current mr-2 relative z-10 ${sub.active ? 'bg-white' : 'opacity-30'}`}></span>
              <span className="relative z-10 text-left">{sub.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardView = () => (
  <div className="space-y-6 animate-fadeIn pb-4 px-8">
    <div className="flex justify-between items-center mb-2">
      <div>
        <h1 className="text-3xl font-bold text-[#3F4859] uppercase tracking-tight">SAWASDEE, HR TEAM!</h1>
        <p className="text-brandTeal text-sm font-medium">Strategic Talent Hub • <span className="text-brandOrange animate-pulse font-bold uppercase">Innovation Active</span></p>
      </div>
      <div className="flex gap-2">
        <button className="bg-white/80 text-brandTeal px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-white transition-all flex items-center gap-2 border border-white">
          <Home size={16} /> Our Second Home
        </button>
        <button className="bg-brandRed text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2 hover:shadow-glow-red">
          <AlertCircle size={16} /> Alert Request
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {MOCK_DATA.stats.map((stat, idx) => (
        <KPICard key={idx} title={stat.label} val={stat.value} color={stat.color} icon={stat.icon} desc={stat.sub} />
      ))}
    </div>

    {/* UPDATED BOARDS: New Members & Birthdays */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Improved New Members Board */}
      <GlassCard className="lg:col-span-2 relative overflow-hidden group bg-gradient-to-br from-white to-brandTeal/5 border-brandTeal/20">
        <div className="absolute -bottom-10 -right-10 text-brandTeal opacity-5 transform -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Users size={240} />
        </div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-[#3F4859] flex items-center gap-2 uppercase">
            <UserCheck size={20} className="text-brandTeal" />
            Our New Family Members
          </h2>
          <span className="text-[10px] text-brandTeal font-bold bg-brandTeal/10 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-brandTeal/10">Welcome Home</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {MOCK_DATA.newMembers.map((member, idx) => (
            <div key={idx} className="p-4 bg-white/60 rounded-2xl border border-white/60 hover:bg-white hover:shadow-md transition-all text-center">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brandTeal/30 shadow-sm mx-auto p-0.5">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-brandTeal text-white p-1 rounded-lg border-2 border-white">
                  <Sparkles size={10} />
                </div>
              </div>
              <h4 className="text-sm font-bold text-[#3F4859]">{member.name}</h4>
              <p className="text-[10px] text-brandTeal font-bold mt-1 uppercase tracking-tight">{member.pos}</p>
              <p className="text-[9px] text-brandMuted mt-0.5">{member.dept}</p>
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center px-1">
                <span className="text-[9px] text-brandMuted">Join</span>
                <span className="text-[9px] font-bold text-[#3F4859]">{member.joinDate}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Birthday Board */}
      <GlassCard className="relative overflow-hidden group bg-gradient-to-br from-white to-brandGold/5 border-brandGold/20">
        <div className="absolute -bottom-6 -right-6 text-brandGold opacity-10 transform rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Cake size={120} />
        </div>
        <h2 className="text-xl font-bold text-[#3F4859] mb-6 flex items-center gap-2 uppercase relative z-10">
          <PartyPopper size={20} className="text-brandOrange" />
          Birthday Wishes
        </h2>
        <div className="space-y-4 relative z-10">
          {MOCK_DATA.birthdays.map((bday, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-white/70 rounded-2xl border border-white/80 hover:scale-[1.02] transition-transform shadow-sm">
              <div className="w-10 h-10 rounded-full border-2 border-brandOrange/50 overflow-hidden shrink-0">
                <img src={bday.avatar} alt={bday.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#3F4859] truncate">{bday.name}</h4>
                <p className="text-[9px] text-brandMuted">{bday.dept}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-bold text-brandOrange">{bday.date}</p>
                <div className="flex gap-1 justify-end">
                  <span className="w-1 h-1 rounded-full bg-brandGold animate-ping"></span>
                  <span className="w-1 h-1 rounded-full bg-brandOrange animate-ping delay-75"></span>
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-3 mt-2 bg-gradient-to-r from-brandOrange to-brandGold text-white text-[10px] font-bold uppercase rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
            <Send size={12} /> Post Greeting Card
          </button>
        </div>
      </GlassCard>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Improved Pending Approvals Board */}
      <GlassCard className="lg:col-span-2 relative overflow-hidden group bg-gradient-to-br from-white to-brandBlue/5 border-brandDeepBlue/10">
        <div className="absolute -bottom-10 -right-10 text-brandBlue opacity-5 transform rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <ClipboardCheck size={240} />
        </div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-[#3F4859] flex items-center gap-2 uppercase">
            <CheckSquare size={20} className="text-brandOrange" />
            Pending Approvals
          </h2>
          <span className="text-xs text-brandBlue font-bold bg-brandBlue/10 px-3 py-1 rounded-full border border-brandBlue/10 shadow-sm uppercase tracking-tight">Requires Action</span>
        </div>
        <div className="space-y-3 relative z-10">
          {MOCK_DATA.approvals.map((req, idx) => (
            <div key={idx} className="flex items-center p-3 bg-white/70 rounded-2xl border border-white hover:bg-white transition-colors cursor-pointer group shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#F2F0EB] flex items-center justify-center text-[#3F4859] group-hover:scale-110 transition-transform shadow-inner border border-gray-200">
                <req.icon size={20} />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-[#3F4859] text-sm">{req.requester}</h4>
                  <span className="text-[10px] font-bold text-brandTeal">{req.id}</span>
                </div>
                <p className="text-[10px] text-brandMuted uppercase font-bold">{req.type} • {req.detail}</p>
              </div>
              <div className="ml-4">
                <StatusBadge status={req.status} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="bg-gradient-to-b from-white/95 to-brandRed/5 border-brandRed/10 relative overflow-hidden group">
        <div className="absolute -bottom-6 -right-6 text-brandRed opacity-5 transform -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Bell size={120} />
        </div>
        <h2 className="text-xl font-bold text-[#3F4859] mb-4 flex items-center gap-2 uppercase relative z-10">
          <Megaphone size={20} className="text-brandRed" />
          Corporate Alert
        </h2>
        <div className="space-y-4 relative z-10">
          <div className="p-4 bg-brandRed/5 rounded-2xl border border-brandRed/10 flex gap-3 items-start hover:bg-white transition-all">
            <div className="bg-white/90 p-1.5 rounded-full text-brandRed shadow-sm"><Calendar size={14} /></div>
            <div>
              <p className="text-xs font-bold text-brandRed">การประเมินผลงานรอบครึ่งปี</p>
              <p className="text-[10px] text-brandRed/80 mt-1 font-medium">Mid-year review starts Monday. Ensure all self-evaluations are done.</p>
            </div>
          </div>
          <div className="p-4 bg-brandBlue/5 rounded-2xl border border-brandBlue/10 flex gap-3 items-start hover:bg-white transition-all">
            <div className="bg-white/90 p-1.5 rounded-full text-brandBlue shadow-sm"><Info size={14} /></div>
            <div>
              <p className="text-xs font-bold text-[#16778C]">สวัสดิการประกันกลุ่มใหม่</p>
              <p className="text-[10px] text-[#16778C]/80 mt-1 font-medium">Update on group insurance plan for FY2025 available now.</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
);

const GenericView = ({ title, icon: Icon, desc }: { title: string, icon: LucideIcon, desc?: string }) => (
  <div className="animate-fadeIn px-8">
    <div className="flex justify-between items-end mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[#3F4859] uppercase tracking-tight">{title}</h2>
        <p className="text-xs text-brandTeal mt-1 font-medium italic">{desc || 'HR Master Innovation Module'}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="flex flex-col items-center justify-center min-h-[400px] text-center border-brandTeal/10">
        <div className="p-10 bg-[#F2F0EB] rounded-[2rem] mb-6 shadow-inner border border-gray-200">
          <Icon size={64} className="text-brandOrange" />
        </div>
        <h3 className="text-xl font-bold text-[#3F4859] uppercase tracking-widest">{title} Interface Ready</h3>
        <p className="text-sm text-brandMuted max-w-sm mt-4 font-medium">
          Welcome to the {title} management module. Full CRUD operations, innovation tables, and talent tracking will be initialized here.
        </p>
        <button className="mt-8 px-10 py-3 bg-brandDeepBlue text-white rounded-2xl text-xs font-bold uppercase hover:bg-brandTeal transition-all shadow-lg hover:-translate-y-1">
          Access Talent Database
        </button>
      </GlassCard>
    </div>
  </div>
);


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [visitedTabs, setVisitedTabs] = useState(['dashboard']);

  const [currentUser] = useState({
    name: 'T-DCC Developer',
    email: 'tallintelligence.dcc@gmail.com',
    position: 'Lead Developer',
    avatar: 'https://drive.google.com/thumbnail?id=1Z_fRbN9S4aA7OkHb3mlim_t60wIT4huY&sz=w400'
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!visitedTabs.includes(activeTab)) setVisitedTabs(prev => [...prev, activeTab]);
  }, [activeTab, visitedTabs]);

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
    if (!isSidebarOpen) setSidebarOpen(true);
  };

  const getTabContent = (tabId: string) => {
    if (tabId === 'employee_directory') return <EmployeeDirectory />;
    if (tabId === 'org_structure') return <DepartmentLevel />;
    if (tabId === 'position_master') return <PositionMaster />;
    if (tabId === 'master_jd' || tabId === 'recruitment_jd' || tabId === 'job_description') return <JobDescriptionMaster />;
    if (tabId === 'job_vacancies') return <Recruitment initialView="jobs" />;
    if (tabId === 'candidate_tracking') return <Recruitment initialView="candidates" />;
    if (tabId === 'interview_schedule') return <Recruitment initialView="interviews" />;
    if (tabId === 'onboarding') return <Onboarding />;
    if (tabId === 'branch_master') return <BranchMaster />;
    
    // Labor Relations
    if (['disciplinary_law', 'company_regulations', 'investigation_process', 'union_grievance', 'employee_engagement', 'sports_social', 'internal_pr', 'external_activities'].includes(tabId)) {
      return <LaborRelations initialTab={tabId} />;
    }

    // HR Analytics
    if (['workforce_report', 'turnover_analysis', 'budget_tracking'].includes(tabId)) {
      return <HRAnalytics initialTab={tabId} />;
    }

    if (tabId === 'training_plan') return <PlaceholderPage title="Training Planning" />;
    if (tabId === 'self_evaluation') return <PlaceholderPage title="Self Evaluation" />;
    if (tabId === 'manager_review') return <PlaceholderPage title="Manager Review" />;
    if (tabId === 'feedback_360') return <PlaceholderPage title="360 Feedback" />;
    if (tabId === 'appraisal_report') return <AppraisalSummary />;

    if (tabId === 'ojt_training') return <OJTTraining />;
    if (tabId === 'manpower_request') return <ManpowerRequest />;
    if (tabId === 'resignation_turnover') return <ResignationTurnover />;
    if (tabId === 'orientation') return <OrientationTraining />;
    if (tabId === 'succession' || tabId === 'career_path') return <CareerPathSuccession />;
    if (tabId === 'kpi_setting' || tabId === 'performance_evaluation' || tabId === 'performance_hrd') return <PerformanceEvaluation />;
    if (tabId === 'skill_matrix') return <SkillMatrix />;
    if (tabId === 'disciplinary') return <DisciplinaryActions />;
    if (tabId === 'benefits') return <BenefitsWelfare />;
    if (tabId === 'time_attendance') return <TimeAttendance />;
    if (tabId === 'payroll') return <PayrollCalculation />;
    if (tabId === 'leave_management') return <LeaveManagement />;
    if (tabId === 'user_permission') return <UserPermissions />;
    if (tabId === 'system_config') return <HybridLogin />;
    if (tabId === 'hr_calendar') return <HRCalendar />;

    const module = SYSTEM_MODULES.find(m => m.id === tabId || m.subItems?.some(s => s.id === tabId));
    let title = tabId.replace(/_/g, ' ').toUpperCase();
    let icon = Users;

    if (tabId === 'dashboard') return <DashboardView />;

    if (module) {
      const subItem = module.subItems?.find(s => s.id === tabId);
      title = subItem ? subItem.label : module.label;
      icon = module.icon;
    }

    return <GenericView title={title} icon={icon} />;
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-bgPage text-textMain">

      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col transition-all duration-500 z-30 shadow-grand relative bg-sidebarBg ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-10 w-6 h-6 bg-brandTeal text-white rounded-full flex items-center justify-center shadow-lg z-50 border-2 border-sidebarBg hover:bg-brandRed transition-colors cursor-pointer">
          {isSidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        <div className="h-32 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brandTeal/20 to-brandDeepBlue/30 flex items-center justify-center shadow-lg transform rotate-3 relative overflow-hidden group border border-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-brandGold/30"></div>
              <div className="relative">
                <Users
                  size={26}
                  style={{ color: '#F2B705' }}
                  strokeWidth={2.5}
                />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brandRed rounded-full border-2 border-sidebarBg shadow-glow animate-pulse"></div>
              </div>
            </div>

            <div className={`transition-all duration-500 overflow-hidden flex flex-col ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              <h1 className="text-white font-brand text-xl tracking-widest whitespace-nowrap">
                <span className="font-light">HR</span><span className="font-extrabold text-brandRed">MASTER</span>
              </h1>
              <p className="text-brandTeal font-brand text-[9px] font-bold uppercase tracking-[0.74em] mt-0.5 whitespace-nowrap">Talent Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar py-4 relative z-10">
          {SYSTEM_MODULES.map(module => (
            <NavItem
              key={module.id}
              icon={module.icon}
              label={module.label}
              active={activeTab === module.id || module.subItems?.some(s => s.id === activeTab) || false}
              onClick={() => module.subItems ? toggleMenu(module.id) : setActiveTab(module.id)}
              isOpen={isSidebarOpen}
              isExpanded={expandedMenus[module.id]}
              onToggleExpand={() => toggleMenu(module.id)}
              subItems={module.subItems?.map(sub => ({
                label: sub.label,
                active: activeTab === sub.id,
                onClick: () => setActiveTab(sub.id)
              }))}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div
              className="w-11 h-11 rounded-2xl border-2 border-brandTeal/30 bg-cover bg-center shrink-0 shadow-sm p-0.5"
            >
              <img src={currentUser.avatar} className="w-full h-full object-cover rounded-xl" alt="user" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-bold truncate w-32">{currentUser.name}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-brandTeal rounded-full animate-pulse"></span>
                  <p className="text-[#8F9FBF] text-[10px] uppercase font-bold tracking-wider">Logged in</p>
                </div>
              </div>
            )}
            {isSidebarOpen && <Settings size={18} className="ml-auto text-brandMuted hover:text-white cursor-pointer transition-colors" />}
          </div>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden bg-bgPage">
        <header className="h-24 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brandTeal to-brandDeepBlue rounded-lg shadow-lg shadow-brandTeal/20">
              <Sparkles size={18} className="text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brandDeepBlue to-brandTeal tracking-tight uppercase">
                Empowering People
              </span>
              <span className="text-[10px] font-bold text-brandOrange tracking-[0.2em] uppercase">
                Driving Excellence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-4 bg-white/70 rounded-2xl pl-5 pr-1 py-1.5 border border-brandTeal/10 backdrop-blur-sm shadow-sm">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] font-bold text-brandDeepBlue uppercase tracking-widest">{currentTime.toLocaleDateString('en-GB', { weekday: 'long' })}</span>
                <span className="text-xs font-bold text-brandTeal">{currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 bg-brandDeepBlue text-white px-4 py-2 rounded-xl text-sm shadow-inner tracking-widest font-bold">
                <Clock size={14} className="animate-pulse text-brandGold" />
                {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button className="relative p-3 rounded-2xl bg-white/70 border border-white text-brandDeepBlue shadow-sm hover:bg-white transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-brandRed rounded-full border-2 border-white shadow-glow-red"></span>
            </button>
          </div>
        </header>

        <div className="absolute inset-0 top-24 pb-4 custom-scrollbar overflow-y-auto">
          {visitedTabs.map(tabId => (
            <div key={tabId} className="min-h-full flex flex-col" style={{ display: activeTab === tabId ? 'flex' : 'none' }}>
              <div className="flex-1 w-full">
                {getTabContent(tabId)}
              </div>
              <footer className="mt-auto py-3.5 text-center border-t border-brandTeal/10 shrink-0">
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-brandGold" />
                    <span className="text-[10px] font-bold text-brandDeepBlue uppercase tracking-[0.15em]">
                      HR MASTER • THE FUTURE OF TALENT & INNOVATION • EMPOWERING PEOPLE CULTURE
                    </span>
                  </div>
                  <p className="text-[9px] text-brandTeal font-mono font-medium tracking-tight">
                    System by <span className="font-bold text-brandDeepBlue">T All Intelligence</span> | 📞 082-5695654 | 📧 tallintelligence.ho@gmail.com
                  </p>
                </div>
              </footer>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
