import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

const HRAnalytics = ({ initialTab = 'workforce_report' }: { initialTab?: string }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const WORKFORCE_DATA = [
    { name: 'Production', male: 120, female: 80 },
    { name: 'Sales', male: 40, female: 60 },
    { name: 'Admin', male: 10, female: 30 },
    { name: 'IT', male: 15, female: 5 },
    { name: 'HR', male: 5, female: 15 },
  ];

  const TURNOVER_DATA = [
    { month: 'Jan', rate: 2.5 },
    { month: 'Feb', rate: 1.8 },
    { month: 'Mar', rate: 3.0 },
    { month: 'Apr', rate: 2.1 },
    { month: 'May', rate: 1.5 },
    { month: 'Jun', rate: 2.8 },
  ];

  const BUDGET_DATA = [
    { name: 'Salaries', value: 6500000 },
    { name: 'Benefits', value: 1200000 },
    { name: 'Training', value: 500000 },
    { name: 'Recruitment', value: 300000 },
    { name: 'Events', value: 200000 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderContent = () => {
    switch (activeTab) {
      case 'workforce_report':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Total Headcount</h4>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-sidebarBg">380</span>
                  <span className="text-xs font-bold text-green-500 flex items-center mb-1"><ArrowUpRight className="w-3 h-3" /> +12</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Male / Female Ratio</h4>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-sidebarBg">48:52</span>
                  <span className="text-xs font-bold text-gray-400 mb-1">Balanced</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Avg. Tenure</h4>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-sidebarBg">3.2</span>
                  <span className="text-xs font-bold text-gray-400 mb-1">Years</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
              <h3 className="font-bold text-sidebarBg mb-6">Headcount by Department</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WORKFORCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Bar dataKey="male" name="Male" stackId="a" fill="#5A94A7" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="female" name="Female" stackId="a" fill="#D95032" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'turnover_analysis':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
              <h3 className="font-bold text-sidebarBg mb-6">Monthly Turnover Rate (%)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TURNOVER_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="rate" stroke="#D91604" strokeWidth={3} dot={{r: 4, fill: '#D91604', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'budget_tracking':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
                <h3 className="font-bold text-sidebarBg mb-6">HR Budget Allocation</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={BUDGET_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {BUDGET_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-sidebarBg mb-6">Budget Summary</h3>
                <div className="space-y-4">
                  {BUDGET_DATA.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-sidebarBg">{item.value.toLocaleString()} THB</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-500">Total Budget</span>
                    <span className="font-bold text-xl text-brandDeepBlue">
                      {BUDGET_DATA.reduce((a, b) => a + b.value, 0).toLocaleString()} THB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">HR ANALYTICS</h1>
            <p className="text-brandTeal text-[11px] font-bold uppercase tracking-widest">Data-Driven Insights</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Year: 2023
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 shrink-0">
          {[
            { id: 'workforce_report', label: 'WORKFORCE REPORT', icon: Users },
            { id: 'turnover_analysis', label: 'TURNOVER ANALYSIS', icon: TrendingUp },
            { id: 'budget_tracking', label: 'HR BUDGET TRACKING', icon: DollarSign },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
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

export default HRAnalytics;
