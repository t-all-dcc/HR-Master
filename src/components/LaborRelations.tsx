import React, { useState } from 'react';
import { 
  Scale, 
  BookOpen, 
  AlertTriangle, 
  Users, 
  HeartHandshake, 
  Trophy, 
  Megaphone, 
  Globe,
  Gavel,
  FileText,
  MessageSquare
} from 'lucide-react';

const LaborRelations = ({ initialTab = 'disciplinary_law' }: { initialTab?: string }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'disciplinary_law', label: 'DISCIPLINARY & LABOR LAW', icon: Scale },
    { id: 'company_regulations', label: 'COMPANY REGULATIONS', icon: BookOpen },
    { id: 'investigation_process', label: 'INVESTIGATION & PUNISHMENT', icon: AlertTriangle },
    { id: 'union_grievance', label: 'UNION & GRIEVANCES', icon: Users },
    { id: 'employee_engagement', label: 'ENGAGEMENT & RELATIONSHIP', icon: HeartHandshake },
    { id: 'sports_social', label: 'SPORTS & SOCIAL EVENTS', icon: Trophy },
    { id: 'internal_pr', label: 'INTERNAL PR & NEWS', icon: Megaphone },
    { id: 'external_activities', label: 'EXTERNAL ACTIVITIES', icon: Globe },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'disciplinary_law':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-brandTeal" /> Labor Law Compliance
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage legal compliance, labor disputes, and court cases.
              </p>
              {/* Placeholder for legal docs list */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Labor Protection Act B.E. 2541</span>
                  </div>
                  <span className="text-xs text-gray-400">Updated: 2023-01-15</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'company_regulations':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brandBlue" /> Company Regulations
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Internal rules, code of conduct, and policy documentation.
              </p>
              {/* Placeholder content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-brandBlue transition-colors cursor-pointer">
                  <h4 className="font-bold text-brandDeepBlue text-sm mb-2">Employee Handbook 2024</h4>
                  <p className="text-xs text-gray-500">Comprehensive guide for all staff.</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:border-brandBlue transition-colors cursor-pointer">
                  <h4 className="font-bold text-brandDeepBlue text-sm mb-2">IT Security Policy</h4>
                  <p className="text-xs text-gray-500">Guidelines for digital asset usage.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'investigation_process':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-500" /> Investigation & Punishment
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Track disciplinary actions, warning letters, and investigation reports.
              </p>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                <p className="text-red-600 text-sm font-medium">No active investigations.</p>
              </div>
            </div>
          </div>
        );
      case 'union_grievance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-brandOrange" /> Union & Grievances
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage labor union relations and employee grievance submissions.
              </p>
              <button className="px-4 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow-md hover:bg-brandBlue transition-all">
                Log New Grievance
              </button>
            </div>
          </div>
        );
      case 'employee_engagement':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-brandOrange" /> Engagement & Relationship
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Employee satisfaction surveys, feedback loops, and relationship building.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-center">
                  <h4 className="text-2xl font-bold text-orange-600">78%</h4>
                  <p className="text-xs text-orange-800 uppercase font-bold mt-1">Engagement Score</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'sports_social':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-brandGold" /> Sports & Social Events
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Company sports days, annual parties, and social gatherings.
              </p>
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-400 font-medium">No upcoming events scheduled.</p>
                <button className="mt-4 px-4 py-2 bg-brandTeal text-white text-xs font-bold rounded-lg hover:bg-brandDeepBlue transition-all">
                  Create Event
                </button>
              </div>
            </div>
          </div>
        );
      case 'internal_pr':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brandBlue" /> Internal PR & News
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Internal communications, newsletters, and announcements.
              </p>
              <div className="space-y-3">
                <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Monthly Newsletter - Oct 2023</span>
                  <span className="text-xs text-gray-400">Published</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'external_activities':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-sidebarBg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" /> External Activities
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                CSR projects, community engagement, and external partnerships.
              </p>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h4 className="font-bold text-green-800 text-sm mb-2">Upcoming CSR: Tree Planting</h4>
                <p className="text-xs text-green-700">Date: Nov 15, 2023 • Location: Saraburi</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-gray-300" />
              </div>
              <p>Module under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">LABOR RELATIONS</h1>
            <p className="text-brandTeal text-[11px] font-bold uppercase tracking-widest">Employee Relations & Compliance</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col px-8 py-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-4 shrink-0 custom-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-brandDeepBlue text-white border-brandDeepBlue shadow-md' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default LaborRelations;
