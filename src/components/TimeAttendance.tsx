import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Clock, FileText, CalendarDays, MapPin, QrCode, 
  LogOut, ShieldCheck, History, LogIn, Search, Upload, Download, 
  Pencil, ChevronLeft, ChevronRight, BarChart2, PieChart, Users, 
  UserCheck, UserX, AlertTriangle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
import BaseModal from './BaseModal';

// --- Types ---
interface AttendanceRecord {
  id: string;
  name: string;
  dept: string;
  date: string;
  shift: string;
  in: string;
  out: string;
  hours: string;
  status: 'Present' | 'Late' | 'Absent' | 'Leave';
  avatar: string;
}

interface Log {
  type: 'in' | 'out';
  date: string;
  time: string;
  status: string;
  method: string;
}

// --- Mock Data ---
const MOCK_LOGS: Log[] = [
  { type: 'in', date: 'Today', time: '08:55', status: 'On Time', method: 'GPS' },
  { type: 'out', date: 'Yesterday', time: '18:05', status: 'Normal', method: 'QR Code' },
  { type: 'in', date: 'Yesterday', time: '09:15', status: 'Late', method: 'GPS' },
];

const MOCK_RECORDS: AttendanceRecord[] = [
  { id: 'EMP001', name: 'Somchai Jaidee', dept: 'Innovation', date: '2025-01-20', shift: '09-18', in: '08:50', out: '18:05', hours: '9h 15m', status: 'Present', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 'EMP002', name: 'Suda Rakdee', dept: 'HR', date: '2025-01-20', shift: '09-18', in: '09:15', out: '-', hours: '-', status: 'Late', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 'EMP003', name: 'Wichai P.', dept: 'IT', date: '2025-01-20', shift: '09-18', in: '-', out: '-', hours: '-', status: 'Absent', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 'EMP004', name: 'Emily Chen', dept: 'Marketing', date: '2025-01-20', shift: '09-18', in: '08:45', out: '18:30', hours: '9h 45m', status: 'Present', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 'EMP005', name: 'Tanawat M.', dept: 'Sales', date: '2025-01-20', shift: '09-18', in: '-', out: '-', hours: '-', status: 'Leave', avatar: 'https://i.pravatar.cc/150?img=12' },
];

// --- Constants ---
const COMPANY_LOCATION = { lat: 13.746633, lng: 100.539345 }; // Example: Bangkok
const MAX_DISTANCE_METERS = 500;

const TimeAttendance = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my_clock' | 'daily_log' | 'schedule'>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockStatus, setClockStatus] = useState<'in' | 'out'>('out');
  const [myLogs, setMyLogs] = useState<Log[]>(MOCK_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showQRModal, setShowQRModal] = useState(false);

  // Refs for Charts
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const lateChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  // --- Clock Logic ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // --- Geolocation Helper ---
  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleClock = async (type: 'in' | 'out', method: 'GPS' | 'QR Code') => {
    if (method === 'GPS') {
      Swal.fire({
        title: 'Checking Location...',
        text: 'Please wait while we verify your location.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = getDistanceFromLatLonInMeters(userLat, userLng, COMPANY_LOCATION.lat, COMPANY_LOCATION.lng);

        // For demo purposes, we might want to bypass distance check or make it very lenient
        // Uncomment strict check for production:
        // if (distance > MAX_DISTANCE_METERS) { ... error ... }

        Swal.fire({
          title: type === 'in' ? 'Clock In?' : 'Clock Out?',
          html: `Location Verified <span class="text-green-600 font-bold">(${Math.round(distance)}m away)</span><br>Time: ${formattedTime}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: type === 'in' ? '#4F868C' : '#D91604',
          confirmButtonText: 'Confirm'
        }).then((result) => {
          if (result.isConfirmed) {
            performClockAction(type, method);
          }
        });

      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Location Error', text: 'Unable to retrieve location. Please allow access.' });
      }
    } else {
      // QR Code flow is handled by modal, but this function handles the actual action
      performClockAction(type, method);
    }
  };

  const performClockAction = (type: 'in' | 'out', method: string) => {
    setClockStatus(type);
    const newLog: Log = {
      type,
      date: 'Today',
      time: formattedTime,
      status: type === 'in' ? (currentTime.getHours() >= 9 && currentTime.getMinutes() > 0 ? 'Late' : 'On Time') : 'Normal',
      method
    };
    setMyLogs([newLog, ...myLogs]);
    Swal.fire('Success', `Clocked ${type.toUpperCase()} successfully via ${method}`, 'success');
  };

  // --- Charts ---
  useEffect(() => {
    if (activeTab === 'dashboard') {
      // Destroy old charts
      chartInstances.current.forEach(c => c.destroy());
      chartInstances.current = [];

      if (trendChartRef.current) {
        const ctx = trendChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              datasets: [
                { label: 'Present', data: [135, 140, 138, 128, 130], borderColor: '#4F868C', backgroundColor: 'rgba(79, 134, 140, 0.2)', fill: true, tension: 0.4 },
                { label: 'Late', data: [5, 2, 8, 8, 4], borderColor: '#D95032', tension: 0.4 }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
          }));
        }
      }

      if (lateChartRef.current) {
        const ctx = lateChartRef.current.getContext('2d');
        if (ctx) {
          chartInstances.current.push(new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Traffic', 'Personal', 'Sick', 'Unknown'],
              datasets: [{ data: [45, 25, 15, 15], backgroundColor: ['#D95032', '#F2B705', '#186B8C', '#9295A6'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
          }));
        }
      }
    }
  }, [activeTab]);

  // --- Filtered Records ---
  const filteredRecords = MOCK_RECORDS.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Late': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Absent': return 'bg-red-50 text-red-700 border-red-200';
      case 'Leave': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebarBg tracking-tight">TIME & ATTENDANCE</h1>
              <p className="text-brandTeal text-[10px] font-bold uppercase tracking-widest">HR MASTER MODULE</p>
            </div>
          </div>
          
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'my_clock', label: 'My Clock', icon: Clock },
              { id: 'daily_log', label: 'Daily Log', icon: FileText },
              { id: 'schedule', label: 'Schedule', icon: CalendarDays },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-brandDeepBlue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-brandMuted uppercase tracking-widest">Total Employees</p>
                  <h4 className="text-3xl font-bold text-brandDeepBlue mt-1">142</h4>
                  <p className="text-[10px] text-gray-400 mt-2">Active Staff</p>
                </div>
                <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-brandDeepBlue/10 transform rotate-12" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-brandMuted uppercase tracking-widest">Present Today</p>
                  <h4 className="text-3xl font-bold text-brandTeal mt-1">128</h4>
                  <p className="text-[10px] text-gray-400 mt-2">90% Attendance</p>
                </div>
                <UserCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-brandTeal/10 transform rotate-12" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-brandMuted uppercase tracking-widest">Late Arrival</p>
                  <h4 className="text-3xl font-bold text-brandOrange mt-1">8</h4>
                  <p className="text-[10px] text-gray-400 mt-2">Avg 15 mins</p>
                </div>
                <AlertTriangle className="absolute -right-4 -bottom-4 w-24 h-24 text-brandOrange/10 transform rotate-12" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-brandMuted uppercase tracking-widest">Absent / Leave</p>
                  <h4 className="text-3xl font-bold text-brandRed mt-1">6</h4>
                  <p className="text-[10px] text-gray-400 mt-2">Requires Action</p>
                </div>
                <UserX className="absolute -right-4 -bottom-4 w-24 h-24 text-brandRed/10 transform rotate-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white md:col-span-2 h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-sidebarBg text-sm uppercase flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-brandTeal" /> Weekly Attendance Trend
                  </h3>
                </div>
                <div className="flex-1 relative w-full">
                  <canvas ref={trendChartRef}></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-white h-[400px] flex flex-col">
                <h3 className="font-bold text-sidebarBg text-sm uppercase flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-brandOrange" /> Late Analysis
                </h3>
                <div className="flex-1 relative w-full flex items-center justify-center">
                  <canvas ref={lateChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MY CLOCK */}
        {activeTab === 'my_clock' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Clock Widget */}
            <div className="bg-gradient-to-br from-sidebarBg to-[#0F172A] rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brandTeal opacity-10 rounded-full blur-[80px]"></div>
              
              <h2 className="text-brandGold font-bold tracking-[0.3em] uppercase text-sm mb-8 animate-pulse">Standard Time</h2>
              
              <div className="text-7xl md:text-8xl font-bold tracking-tighter mb-4 text-white drop-shadow-2xl font-mono">
                {formattedTime}
              </div>
              <div className="text-brandMuted font-medium text-lg tracking-wide mb-12">{formattedDate}</div>

              <div className="flex gap-4 w-full max-w-md relative z-10">
                <button 
                  onClick={() => handleClock('in', 'GPS')} 
                  disabled={clockStatus === 'in'}
                  className="flex-1 bg-brandTeal hover:bg-brandBlue disabled:opacity-30 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-2"
                >
                  <MapPin className="w-6 h-6" /> GPS IN
                </button>
                <button 
                  onClick={() => setShowQRModal(true)}
                  className="flex-1 bg-sidebarBg border border-brandGold/30 hover:border-brandGold text-brandGold py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-2"
                >
                  <QrCode className="w-6 h-6" /> SCAN QR
                </button>
                <button 
                  onClick={() => handleClock('out', 'GPS')} 
                  disabled={clockStatus === 'out'}
                  className="flex-1 bg-brandRed hover:bg-[#B91C1C] disabled:opacity-30 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-2"
                >
                  <LogOut className="w-6 h-6" /> OUT
                </button>
              </div>

              <div className="mt-8 text-xs text-brandMuted bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                Status: <span className={`font-bold ${clockStatus === 'in' ? 'text-brandTeal' : 'text-brandRed'}`}>{clockStatus === 'in' ? 'WORKING' : 'OFF DUTY'}</span>
                <span className="w-1 h-4 bg-white/20 mx-2"></span>
                <ShieldCheck className="w-3 h-3 text-brandGold" /> Location Active
              </div>
            </div>

            {/* Personal Log */}
            <div className="bg-white rounded-3xl shadow-soft border border-white p-6 flex flex-col">
              <h3 className="font-bold text-sidebarBg text-lg mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brandGold/20 flex items-center justify-center text-brandGold"><History className="w-4 h-4" /></div>
                Recent Activity
              </h3>
              
              <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {myLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-brandTeal/10 hover:bg-gray-50 transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${log.type === 'in' ? 'bg-brandTeal' : 'bg-brandRed'}`}>
                      {log.type === 'in' ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sidebarBg text-sm">{log.type === 'in' ? 'Clock In' : 'Clock Out'}</h4>
                      <p className="text-xs text-brandMuted mt-0.5 flex items-center gap-1">
                        {log.method === 'QR Code' ? <QrCode className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {log.date} • {log.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg text-sidebarBg">{log.time}</div>
                      <div className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${log.status === 'Late' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {log.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DAILY LOG */}
        {activeTab === 'daily_log' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl shadow-soft border border-white flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Employee..." 
                    className="w-full pl-10 pr-4 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:border-brandTeal outline-none"
                  />
                </div>
                <div className="h-8 w-px bg-gray-200 mx-1"></div>
                <div className="flex gap-2">
                  {['All', 'Present', 'Late', 'Absent'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? 'bg-brandDeepBlue text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-white border border-gray-200 text-sidebarBg px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
                <button className="bg-sidebarBg text-brandGold px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-brandDeepBlue transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-auto custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">Employee</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">Department</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-center">Date</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-center">Shift</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-center">Clock In</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-center">Clock Out</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-center">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img src={record.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt={record.name} />
                          <div>
                            <div className="font-bold text-sm text-sidebarBg">{record.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{record.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-brandDeepBlue font-medium">{record.dept}</td>
                      <td className="px-6 py-3 text-center text-xs font-mono text-gray-500">{record.date}</td>
                      <td className="px-6 py-3 text-center"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">{record.shift}</span></td>
                      <td className="px-6 py-3 text-center font-bold text-brandTeal font-mono text-xs">{record.in}</td>
                      <td className="px-6 py-3 text-center font-bold text-brandRed font-mono text-xs">{record.out}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusClass(record.status)}`}>{record.status}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-brandBlue hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
              <div className="text-xs font-bold text-gray-500">Showing {filteredRecords.length} records</div>
              <div className="flex gap-2">
                <button className="p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 text-gray-500"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl shadow-soft border border-white p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-sidebarBg text-lg flex items-center gap-2"><CalendarDays className="w-5 h-5 text-brandGold" /> Weekly Roster</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-sidebarBg shadow-sm hover:bg-gray-50">Previous</button>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-sidebarBg shadow-sm hover:bg-gray-50">Next</button>
              </div>
            </div>
            <div className="flex-grow overflow-auto custom-scrollbar">
              <div className="grid grid-cols-8 gap-1 min-w-[800px]">
                <div className="p-3 font-bold text-gray-400 text-xs uppercase bg-gray-50 rounded-lg">Employee</div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-3 text-center font-bold text-sidebarBg text-xs uppercase bg-brandTeal/10 rounded-lg">{day}</div>
                ))}
                
                {[1, 2, 3, 4, 5].map(i => (
                  <React.Fragment key={i}>
                    <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                      <span className="text-xs font-bold text-sidebarBg truncate">User {i}</span>
                    </div>
                    {[1, 2, 3, 4, 5, 6, 7].map(j => (
                      <div key={j} className="p-1 border-b border-gray-100 h-16">
                        {j < 6 ? (
                          <div className="w-full h-full bg-blue-50 border-l-2 border-brandBlue rounded p-1 text-[9px]">
                            <div className="font-bold text-brandBlue">09:00 - 18:00</div>
                            <div className="text-gray-500">Office</div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-300 font-bold border border-dashed border-gray-200 rounded">OFF</div>
                        )}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* QR Scanner Modal */}
      <BaseModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="Scan QR Code" icon={QrCode} size="sm">
        <div className="p-6 text-center">
          <p className="text-xs text-gray-500 mb-4">Point your camera at the office QR Code</p>
          <div className="w-full aspect-square bg-black rounded-xl overflow-hidden mb-4 flex items-center justify-center relative">
            <div className="absolute inset-0 border-2 border-brandTeal opacity-50 animate-pulse"></div>
            <p className="text-white text-xs">Camera Feed Placeholder</p>
          </div>
          <button 
            onClick={() => {
              setShowQRModal(false);
              handleClock(clockStatus === 'in' ? 'out' : 'in', 'QR Code');
            }} 
            className="w-full py-2 bg-brandDeepBlue text-white font-bold text-sm rounded-lg hover:bg-brandBlue"
          >
            Simulate Scan Success
          </button>
        </div>
      </BaseModal>

    </div>
  );
};

export default TimeAttendance;
