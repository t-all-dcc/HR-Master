import React from 'react';
import { FileText, BarChart3, TrendingUp, Users } from 'lucide-react';

const AppraisalSummary = () => {
  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">APPRAISAL SUMMARY</h1>
            <p className="text-brandTeal text-[11px] font-bold uppercase tracking-widest">Performance Review Overview</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Completion Rate</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-sidebarBg">85%</span>
              <span className="text-xs font-bold text-green-500 mb-1">On Track</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Avg. Score</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-sidebarBg">4.2</span>
              <span className="text-xs font-bold text-gray-400 mb-1">/ 5.0</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Pending Reviews</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-brandRed">12</span>
              <span className="text-xs font-bold text-brandRed mb-1">Action Required</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-sidebarBg">Department Performance</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Performance Chart Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppraisalSummary;
