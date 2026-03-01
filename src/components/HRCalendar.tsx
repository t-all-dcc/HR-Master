import React, { useState, useEffect, useRef } from 'react';
import { 
  CalendarClock, Calendar, List, AlertCircle, Palmtree, ChevronLeft, ChevronRight, 
  ClipboardList, Plus, Edit3, Layers, Factory, HardHat, Leaf, Utensils, Zap, 
  Users, Coins, MoreHorizontal, FilePlus, X, Info, ChevronUp, ChevronDown, 
  CalendarRange, Activity, Trash2, FileBarChart, FlaskConical, ShieldCheck, FileText, Award, Settings, Gift
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Theme & Config ---
const THEME = {
  bgMain: '#F2F0EB',
  red: '#D91604',
  orange: '#D95032',
  gold: '#B8AB89',
  teal: '#5A94A7',
  blue: '#879DB5',
  sidebar: '#3F4859',
  text: '#3F4859',
  slate: '#6A758A',
  lightSlate: '#7D7990',
  paleTeal: '#ADC6C6',
  paleRose: '#C0B7BD',
  cream: '#F2F0E4'
};

const CAT_ICONS: Record<string, any> = {
  'All': Layers,
  'Industrial': Factory,
  'Safety': HardHat,
  'Environment': Leaf,
  'Food': Utensils,
  'Energy': Zap,
  'Labor': Users,
  'Tax': Coins,
  'Other': MoreHorizontal
};

const CATEGORY_AUTHORITIES: Record<string, string[]> = {
  'Tax': ['Revenue Dept', 'Excise Dept', 'Local Admin'],
  'Labor': ['DLPW', 'SSO', 'Dept of Emp'],
  'Safety': ['DLPW', 'DIW', 'DOEB', 'Safety Inst.'],
  'Environment': ['DIW', 'PCD', 'ONEP'],
  'Industrial': ['DIW', 'IEAT', 'TISI', 'BOI'],
  'Energy': ['DEDE', 'ERC', 'DOEB'],
  'Food': ['FDA'],
  'Other': ['DBD', 'Customs']
};

const TH_HOLIDAYS = [
  { m:1, d:1, n:'วันขึ้นปีใหม่' }, { m:4, d:6, n:'วันจักรี' },
  { m:4, d:13, n:'วันสงกรานต์' }, { m:4, d:14, n:'วันสงกรานต์' }, { m:4, d:15, n:'วันสงกรานต์' },
  { m:5, d:1, n:'วันแรงงาน' }, { m:6, d:3, n:'วันเฉลิมฯ พระราชินี' },
  { m:7, d:28, n:'วันเฉลิมฯ ร.10' }, { m:8, d:12, n:'วันแม่แห่งชาติ' },
  { m:10, d:13, n:'วันนวมินทรมหาราช' }, { m:10, d:23, n:'วันปิยมหาราช' },
  { m:12, d:5, n:'วันพ่อแห่งชาติ' }, { m:12, d:10, n:'วันรัฐธรรมนูญ' }, { m:12, d:31, n:'วันสิ้นปี' }
];

// --- Mock Data Generators ---
const generateMonthlyEvents = () => {
  const events = [];
  for(let i=1; i<=12; i++) {
      const monthStr = i < 10 ? `0${i}` : `${i}`;
      events.push({ id: `EVT-M-SAF-PERF-${i}`, title: 'รายงานผลการปฏิบัติงาน จป.', date: `2025-${monthStr}-01`, deadlineDesc: 'ทุกวันที่ 1 ของเดือน', category: 'Safety', color: 'gold', icon: ClipboardList, detail: 'รายงานในระบบคอมฯ กรมสวัสดิการฯ (ผลงานเดือนก่อนหน้า)', responsible: 'Safety Officer', authority: 'DLPW', status: 'Pending' });
      events.push({ id: `EVT-M-IND-RAW-${i}`, title: 'รายงานวัตถุดิบ & รว.8', date: `2025-${monthStr}-15`, deadlineDesc: 'ทุกวันที่ 15 ของเดือน', category: 'Industrial', color: 'slate', icon: Factory, detail: 'บันทึกการใช้หอเผาทิ้ง (รว.8) และรายงานวัตถุดิบ', responsible: 'Factory Mgr', authority: 'DIW', status: 'Pending' });
      events.push({ id: `EVT-M-TAX-${i}`, title: 'ยื่นภาษีรายเดือน', date: `2025-${monthStr}-15`, deadlineDesc: 'วันที่ 15 ของเดือน', category: 'Tax', color: 'red', icon: Coins, detail: 'ภ.ง.ด.1,3,53,54, ภ.พ.30', responsible: 'Accounting', authority: 'Revenue Dept', status: 'Pending' });
      events.push({ id: `EVT-M-ENV-WTR-${i}`, title: 'รายงาน ทส.1 และ ทส.2', date: `2025-${monthStr}-15`, deadlineDesc: 'ทุกวันที่ 15 ของเดือน', category: 'Environment', color: 'teal', icon: Leaf, detail: 'สรุปผลระบบบำบัดน้ำเสีย (ออนไลน์)', responsible: 'Env Officer', authority: 'PCD', status: 'Pending' });
      
      // HR Events
      events.push({ id: `EVT-M-HR-PAYROLL-${i}`, title: 'Payroll Cut-off', date: `2025-${monthStr}-20`, deadlineDesc: 'ทุกวันที่ 20', category: 'Labor', color: 'blue', icon: Coins, detail: 'ปิดรอบการคำนวณเงินเดือน', responsible: 'HR Payroll', authority: 'Internal', status: 'Upcoming' });
      events.push({ id: `EVT-M-HR-SALARY-${i}`, title: 'Salary Payment', date: `2025-${monthStr}-28`, deadlineDesc: 'ทุกวันที่ 28', category: 'Labor', color: 'blue', icon: Coins, detail: 'จ่ายเงินเดือนพนักงาน', responsible: 'Finance', authority: 'Bank', status: 'Upcoming' });
      events.push({ id: `EVT-M-HR-SSO-${i}`, title: 'นำส่งเงินสมทบ สปส.1-10', date: `2025-${monthStr}-15`, deadlineDesc: 'ภายในวันที่ 15', category: 'Labor', color: 'orange', icon: Users, detail: 'นำส่งเงินสมทบประกันสังคม', responsible: 'HR', authority: 'SSO', status: 'Pending' });
  }
  return events;
};

const generateQuarterlyEvents = () => {
  const events = [];
  const quarters = [ { m: '03', d: '31', q: 'Q1' }, { m: '06', d: '30', q: 'Q2' }, { m: '09', d: '30', q: 'Q3' }, { m: '12', d: '31', q: 'Q4' } ];
  quarters.forEach(q => {
       events.push({ id: `EVT-Q-MCH-${q.q}`, title: `คป.1 (ตรวจปั้นจั่น ${q.q})`, date: `2025-${q.m}-${q.d}`, deadlineDesc: `สิ้นสุด ${q.q}`, category: 'Safety', color: 'gold', icon: Settings, detail: 'รายงานการตรวจปั้นจั่น', responsible: 'Engineer', authority: 'DLPW', status: 'Upcoming' });
  });
  return events;
};

const INITIAL_PERIODIC_EVENTS = [
  { id: 'EVT-HR-BONUS', title: 'Annual Bonus Payment', date: '2025-01-28', deadlineDesc: '28 มกราคม', category: 'Labor', color: 'blue', icon: Gift, detail: 'จ่ายโบนัสประจำปี', responsible: 'HR/Finance', authority: 'Internal', status: 'Submitted' },
  { id: 'EVT-HR-TAX-1K', title: 'ยื่น ภ.ง.ด.1 ก (Annual)', date: '2025-02-28', deadlineDesc: '28 กุมภาพันธ์', category: 'Tax', color: 'red', icon: FileText, detail: 'สรุปภาษีเงินได้หัก ณ ที่จ่ายประจำปี', responsible: 'HR Payroll', authority: 'Revenue Dept', status: 'Pending' },
  { id: 'EVT-HR-WFP', title: 'Workforce Planning 2026', date: '2025-10-15', deadlineDesc: '15 ตุลาคม', category: 'Labor', color: 'blue', icon: Users, detail: 'วางแผนอัตรากำลังคนปีหน้า', responsible: 'HR Manager', authority: 'Internal', status: 'Upcoming' },
  { id: 'EVT-HR-PERF', title: 'Annual Performance Review', date: '2025-12-15', deadlineDesc: '15 ธันวาคม', category: 'Labor', color: 'blue', icon: Award, detail: 'ประเมินผลงานประจำปี', responsible: 'All Managers', authority: 'Internal', status: 'Upcoming' },
  { id: 'EVT-TAX-002', title: 'P.N.D.50 (Annual CIT)', date: '2025-05-30', deadlineDesc: '30 พฤษภาคม', category: 'Tax', color: 'red', icon: Coins, detail: 'นิติบุคคล รอบบัญชี 31 ธ.ค. พร้อม Disclosure Form', responsible: 'CFO', authority: 'Revenue Dept', status: 'Pending' },
  { id: 'EVT-08-31', title: 'P.N.D.51 (Half-Year CIT)', date: '2025-08-31', deadlineDesc: '31 สิงหาคม', category: 'Tax', color: 'red', icon: Coins, detail: 'ภาษีเงินได้นิติบุคคลครึ่งปี', responsible: 'Accounting', authority: 'Revenue Dept', status: 'Upcoming' },
  { id: 'EVT-TAX-PND90', title: 'P.N.D.90/91 (Personal)', date: '2025-04-09', deadlineDesc: '9 เมษายน', category: 'Tax', color: 'red', icon: Users, detail: 'ภาษีเงินได้บุคคลธรรมดา', responsible: 'HR/Employee', authority: 'Revenue Dept', status: 'Upcoming' },
  { id: 'EVT-06-04', title: 'ส่งงบการเงิน (DBD)', date: '2025-06-04', deadlineDesc: '4 มิถุนายน', category: 'Other', color: 'orange', icon: Factory, detail: 'รอบบัญชี 31 ธ.ค.', responsible: 'Accounting', authority: 'DBD', status: 'Upcoming' },
  { id: 'EVT-01-31-LBR', title: 'รายงาน คร. 11', date: '2025-01-31', deadlineDesc: 'ภายใน ม.ค.', category: 'Labor', color: 'orange', icon: Users, detail: 'แบบแสดงสภาพการจ้าง', responsible: 'HR', authority: 'DLPW', status: 'Submitted' },
  { id: 'EVT-SAF-01-30', title: 'รายงาน จป. (รอบ 2)', date: '2025-01-31', deadlineDesc: '31 มกราคม', category: 'Safety', color: 'gold', icon: HardHat, detail: 'ผลงาน จป. (ก.ค.-ธ.ค.)', responsible: 'Safety Officer', authority: 'DLPW', status: 'Pending' },
  { id: 'EVT-SAF-07-30', title: 'รายงาน จป. (รอบ 1)', date: '2025-07-30', deadlineDesc: '30 กรกฎาคม', category: 'Safety', color: 'gold', icon: HardHat, detail: 'ผลงาน จป. (ม.ค.-มิ.ย.)', responsible: 'Safety Officer', authority: 'DLPW', status: 'Upcoming' },
  { id: 'EVT-SAF-01-31-2', title: 'แบบ สอ. 1 (ประจำปี)', date: '2025-01-31', deadlineDesc: '31 มกราคม', category: 'Safety', color: 'gold', icon: FlaskConical, detail: 'บัญชีรายชื่อสารเคมี', responsible: 'Safety Officer', authority: 'DLPW', status: 'Pending' },
  { id: 'EVT-SAF-01-31-MGT', title: 'แบบ อย. 1 (สปส. 1-10)', date: '2025-01-31', deadlineDesc: '31 มกราคม', category: 'Safety', color: 'gold', icon: ShieldCheck, detail: 'บริหารจัดการความปลอดภัย', responsible: 'Safety Manager', authority: 'DLPW', status: 'Pending' },
  { id: 'EVT-SAF-03-01', title: 'รายงานสารเคมี กอ.1', date: '2025-03-01', deadlineDesc: '1 มีนาคม', category: 'Safety', color: 'gold', icon: FlaskConical, detail: 'โรงงานเก็บ/ใช้ > 1 ตัน', responsible: 'Safety Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-SAF-03-31', title: 'Zero Accident Campaign', date: '2025-03-31', deadlineDesc: '31 มีนาคม', category: 'Safety', color: 'gold', icon: Award, detail: 'ยื่นชั่วโมงการทำงาน', responsible: 'HR/Safety', authority: 'Safety Inst.', status: 'Upcoming' },
  { id: 'EVT-SAF-04-30', title: 'แบบ สอ. 3', date: '2025-04-30', deadlineDesc: '30 เมษายน', category: 'Safety', color: 'gold', icon: FileText, detail: 'ประเมินความเสี่ยงสารเคมี', responsible: 'Safety Officer', authority: 'DLPW', status: 'Upcoming' },
  { id: 'EVT-ANN-06-01', title: 'หม้อน้ำ (รอบ 1)', date: '2025-06-30', deadlineDesc: '30 มิถุนายน', category: 'Safety', color: 'gold', icon: HardHat, detail: 'วิศวกรรับรอง', responsible: 'Engineer', authority: 'DLPW', status: 'Upcoming' },
  { id: 'EVT-ANN-12-01', title: 'หม้อน้ำ (รอบ 2)', date: '2025-12-31', deadlineDesc: '31 ธันวาคม', category: 'Safety', color: 'gold', icon: HardHat, detail: 'วิศวกรรับรอง', responsible: 'Engineer', authority: 'DLPW', status: 'Upcoming' },
  { id: 'EVT-Q-WST-Q4', title: 'สิ่งปฏิกูล (Q4)', date: '2025-01-15', deadlineDesc: '15 มกราคม', category: 'Environment', color: 'teal', icon: Trash2, detail: 'กอ.2/สก.2', responsible: 'Env Officer', authority: 'DIW', status: 'Pending' },
  { id: 'EVT-Q-WST-Q1', title: 'สิ่งปฏิกูล (Q1)', date: '2025-04-15', deadlineDesc: '15 เมษายน', category: 'Environment', color: 'teal', icon: Trash2, detail: 'กอ.2/สก.2', responsible: 'Env Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-Q-WST-Q2', title: 'สิ่งปฏิกูล (Q2)', date: '2025-07-15', deadlineDesc: '15 กรกฎาคม', category: 'Environment', color: 'teal', icon: Trash2, detail: 'กอ.2/สก.2', responsible: 'Env Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-Q-WST-Q3', title: 'สิ่งปฏิกูล (Q3)', date: '2025-10-15', deadlineDesc: '15 ตุลาคม', category: 'Environment', color: 'teal', icon: Trash2, detail: 'กอ.2/สก.2', responsible: 'Env Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-ANN-01-01', title: 'รายงาน VOCs (รอบ 1)', date: '2025-01-31', deadlineDesc: '31 มกราคม', category: 'Environment', color: 'teal', icon: Leaf, detail: 'รว.1', responsible: 'Env Officer', authority: 'DIW', status: 'Pending' },
  { id: 'EVT-ANN-07-01', title: 'รายงาน VOCs (รอบ 2)', date: '2025-07-31', deadlineDesc: '31 กรกฎาคม', category: 'Environment', color: 'teal', icon: Leaf, detail: 'รว.1', responsible: 'Env Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-ANN-03-01', title: 'รายงานข้อมูลทั่วไป (ร.ง.1)', date: '2025-03-01', deadlineDesc: '1 มีนาคม', category: 'Industrial', color: 'slate', icon: Factory, detail: 'ข้อมูลประจำปี/มลพิษ', responsible: 'Factory Mgr', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-IND-RNG8', title: 'รายงานประกอบกิจการ (ร.ง.8)', date: '2025-04-30', deadlineDesc: '30 เมษายน', category: 'Industrial', color: 'slate', icon: Factory, detail: 'รายงานประจำปี', responsible: 'Factory Mgr', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-EIA-R1', title: 'EIA/EHIA (รอบ 1)', date: '2025-07-15', deadlineDesc: 'กรกฎาคม', category: 'Environment', color: 'teal', icon: FileBarChart, detail: 'รอบ ม.ค.-มิ.ย.', responsible: 'Env Manager', authority: 'ONEP', status: 'Upcoming' },
  { id: 'EVT-EIA-R2', title: 'EIA/EHIA (รอบ 2)', date: '2025-01-31', deadlineDesc: 'มกราคม', category: 'Environment', color: 'teal', icon: FileBarChart, detail: 'รอบ ก.ค.-ธ.ค.', responsible: 'Env Manager', authority: 'ONEP', status: 'Pending' },
  { id: 'EVT-ANN-07-02', title: 'แจ้งข้อเท็จจริงวัตถุอันตราย (รอบ 1)', date: '2025-07-31', deadlineDesc: '31 กรกฎาคม', category: 'Industrial', color: 'slate', icon: Factory, detail: 'วอ./อก.7 (ครึ่งปีแรก)', responsible: 'Safety Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-ANN-09-01', title: 'รายงาน รว.1, 2, 3 (รอบ 2)', date: '2025-09-01', deadlineDesc: '1 กันยายน', category: 'Environment', color: 'teal', icon: Leaf, detail: 'ข้อมูลทั่วไป, มลพิษน้ำ, มลพิษอากาศ', responsible: 'Env Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-ANN-10-01', title: 'รายงานสารเคมี (นอกเหนือ 24 ประเภท)', date: '2025-10-01', deadlineDesc: '1 ตุลาคม', category: 'Industrial', color: 'slate', icon: Factory, detail: 'ตามบัญชีท้ายประกาศฯ', responsible: 'Safety Officer', authority: 'DIW', status: 'Upcoming' },
  { id: 'EVT-12-31', title: 'ตรวจสอบเครื่องมือวัด (BOD/COD)', date: '2025-12-31', deadlineDesc: '31 ธันวาคม', category: 'Environment', color: 'teal', icon: Activity, detail: 'รายงานผลความคลาดเคลื่อน Online Monitoring', responsible: 'Env Officer', authority: 'DIW', status: 'Upcoming' },
  ...generateMonthlyEvents(),
  ...generateQuarterlyEvents()
];

const INITIAL_EVENT_RULES = [
  { id: 'RULE-01', title: 'แบบ จป. 1', trigger: 'เมื่อมีการแต่งตั้ง จป.', deadline: 'ภายใน 15 วัน', category: 'Safety', color: 'gold', responsible: 'HR', authority: 'DLPW' },
  { id: 'RULE-02', title: 'แบบ สอ. 1 (Event)', trigger: 'เมื่อมีสารเคมีไว้ครอบครอง', deadline: 'ภายใน 7 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DLPW' },
  { id: 'RULE-03', title: 'แบบ สอ. 2', trigger: 'หลังการประเมินความปลอดภัยสารเคมี', deadline: 'ภายใน 15 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DLPW' },
  { id: 'RULE-04', title: 'แบบ สอ. 3 (Event)', trigger: 'หลังการตรวจวัดสารเคมีอันตราย', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DLPW' },
  { id: 'RULE-05', title: 'แบบ สอ. 4 (ผลตรวจสุขภาพ)', trigger: 'หลังทราบผลตรวจสุขภาพ', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'HR/Safety', authority: 'DLPW' },
  { id: 'RULE-06', title: 'แบบ กภ.รง. 8', trigger: 'หลังการตรวจวัดสภาพแวดล้อม', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DIW' },
  { id: 'RULE-07', title: 'แบบ กภ.รง. 5', trigger: 'หลังตรวจวัดความเข้มข้นสารเคมี', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DIW' },
  { id: 'RULE-08', title: 'แบบ กภ.รง. 7', trigger: 'หลังตรวจสอบระบบไฟฟ้าประจำปี', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'Engineer', authority: 'DIW' },
  { id: 'RULE-09', title: 'ทดสอบหม้อน้ำ/ปั้นจั่น', trigger: 'หลังการทดสอบ', deadline: 'ตามรอบกฎหมาย', category: 'Safety', color: 'gold', responsible: 'Engineer', authority: 'DIW/DLPW' },
  { id: 'RULE-10', title: 'การแจ้งอุบัติเหตุ (สปส. 1-16)', trigger: 'เมื่อลูกจ้างเสียชีวิต/เจ็บป่วยร้ายแรง', deadline: 'ภายใน 7/15 วัน', category: 'Safety', color: 'red', responsible: 'Safety Officer', authority: 'SSO/DLPW' },
  { id: 'RULE-11', title: 'รายงานผลฝึกซ้อมดับเพลิง/อพยพ', trigger: 'นับจากวันเสร็จสิ้นการฝึกซ้อม', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DLPW' },
  { id: 'RULE-12', title: 'รายงานการพ้นจากตำแหน่ง จป.', trigger: 'หลัง จป. พ้นจากตำแหน่ง', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'HR', authority: 'DLPW' },
  { id: 'RULE-13', title: 'รายงานอบรมที่อับอากาศ', trigger: 'หลังเสร็จสิ้นการอบรม', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DLPW' },
  { id: 'RULE-14', title: 'แจ้งผลอบรม จป. (12 ชม.)', trigger: 'หลังจบการอบรม', deadline: 'ภายใน 30 วัน', category: 'Safety', color: 'gold', responsible: 'Safety Officer', authority: 'DLPW' },
];

const HRCalendar = () => {
  const [viewType, setViewType] = useState<'calendar' | 'periodic' | 'eventBased'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date('2025-01-01')); 
  const [events, setEvents] = useState(INITIAL_PERIODIC_EVENTS); 
  const [rules, setRules] = useState(INITIAL_EVENT_RULES);
  const [customHolidays, setCustomHolidays] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', content: '' });

  const [isPeriodicModalOpen, setIsPeriodicModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const changeMonth = (offset: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));

  const filteredEvents = filterCategory === 'All' ? events : events.filter(e => e.category === filterCategory);
  const filteredRules = filterCategory === 'All' ? rules : rules.filter(e => e.category === filterCategory);
  
  const currentMonthEvents = filteredEvents.filter(evt => {
      const evtDate = new Date(evt.date);
      return evtDate.getMonth() === currentDate.getMonth() && evtDate.getFullYear() === currentDate.getFullYear();
  }).sort((a,b) => {
       const dateA = new Date(a.date).getTime();
       const dateB = new Date(b.date).getTime();
       if (dateA - dateB !== 0) return dateA - dateB;
       if (a.category !== b.category) return a.category.localeCompare(b.category);
       return (a.authority || '').localeCompare(b.authority || '');
  });
  
  const sortedPeriodicEvents = [...filteredEvents].sort((a,b) => {
       const isAMonthly = a.id.includes('EVT-M-');
       const isBMonthly = b.id.includes('EVT-M-');
       if (isAMonthly !== isBMonthly) return isAMonthly ? 1 : -1;
       const dateA = new Date(a.date).getTime();
       const dateB = new Date(b.date).getTime();
       if (dateA - dateB !== 0) return dateA - dateB;
       if (a.category !== b.category) return a.category.localeCompare(b.category);
       return (a.authority || '').localeCompare(b.authority || '');
  });

  const sortedRules = [...filteredRules].sort((a,b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return (a.authority || '').localeCompare(b.authority || '');
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData((prev: any) => ({ ...prev, category: e.target.value, authority: '' }));
  };

  const getCategoryColor = (colorName: string) => {
    const colors: Record<string, any> = {
        red: { bg: THEME.red, text: '#7F1D1D', light: `${THEME.red}20`, border: `${THEME.red}40` },
        orange: { bg: THEME.orange, text: '#7C2D12', light: `${THEME.orange}20`, border: `${THEME.orange}40` },
        gold: { bg: THEME.gold, text: '#78350F', light: `${THEME.gold}20`, border: `${THEME.gold}40` },
        teal: { bg: THEME.teal, text: '#134E4A', light: `${THEME.teal}20`, border: `${THEME.teal}40` },
        blue: { bg: THEME.blue, text: '#1E3A8A', light: `${THEME.blue}20`, border: `${THEME.blue}40` },
        slate: { bg: THEME.slate, text: '#1E293B', light: `${THEME.slate}20`, border: `${THEME.slate}40` },
        holiday: { bg: '#FEE2E2', text: '#991B1B', light: '#FEF2F2', border: '#FCA5A5' }
    };
    return colors[colorName] || colors.slate;
  };

  const savePeriodicEvent = () => {
      if(!formData.title || !formData.date) return Swal.fire('Error', 'กรุณากรอกชื่อและวันที่', 'error');
      let color = 'slate'; let icon = Calendar;
      switch(formData.category) {
          case 'Tax': color = 'red'; icon = Coins; break;
          case 'Labor': color = 'orange'; icon = Users; break;
          case 'Safety': color = 'gold'; icon = HardHat; break;
          case 'Environment': color = 'teal'; icon = Leaf; break;
          case 'Food': color = 'teal'; icon = Utensils; break;
          case 'Industrial': color = 'slate'; icon = Factory; break;
          case 'Energy': color = 'gold'; icon = Zap; break;
          case 'Other': color = 'slate'; icon = MoreHorizontal; break;
      }
      const newEvent = {
          id: `EVT-NEW-${Date.now()}`, title: formData.title, date: formData.date, deadlineDesc: formData.deadlineDesc || formData.date,
          category: formData.category, color: color, icon: icon, detail: formData.detail, responsible: formData.responsible, authority: formData.authority, status: 'Pending'
      };
      setEvents(prev => [...prev, newEvent]); setIsPeriodicModalOpen(false); Swal.fire({ icon: 'success', title: 'บันทึกเรียบร้อย', timer: 1000, showConfirmButton: false });
  };

  const saveEventRule = () => {
       if(!formData.title || !formData.trigger) return Swal.fire('Error', 'กรุณากรอกข้อมูลให้ครบ', 'error');
       let color = 'slate';
       switch(formData.category) {
          case 'Tax': color = 'red'; break;
          case 'Labor': color = 'orange'; break;
          case 'Safety': color = 'gold'; break;
          case 'Environment': color = 'teal'; break;
          case 'Food': color = 'teal'; break;
          case 'Industrial': color = 'slate'; break;
          case 'Energy': color = 'gold'; break;
          case 'Other': color = 'slate'; break;
      }
       const newRule = {
           id: `RULE-NEW-${Date.now()}`, title: formData.title, trigger: formData.trigger, deadline: formData.deadline,
           category: formData.category, color: color, responsible: formData.responsible, authority: formData.authority
       };
       setRules(prev => [...prev, newRule]); setIsRuleModalOpen(false); Swal.fire({ icon: 'success', title: 'บันทึกเรียบร้อย', timer: 1000, showConfirmButton: false });
  };
  
  const handleEditEvent = async (event: any) => {
      const { value: formValues } = await Swal.fire({
          title: 'แก้ไขรายการ',
          html: `
              <div class="flex flex-col gap-3 text-left font-sans">
                   <div><label class="text-xs font-bold text-gray-600 uppercase">ชื่องาน</label><input id="swal-edit-title" class="swal2-input m-0 w-full h-10 text-sm" value="${event.title}"></div>
                   <div><label class="text-xs font-bold text-gray-600 uppercase">รายละเอียด</label><textarea id="swal-edit-detail" class="swal2-textarea m-0 w-full text-sm">${event.detail || ''}</textarea></div>
                   <div><label class="text-xs font-bold text-gray-600 uppercase">สถานะ</label>
                      <select id="swal-edit-status" class="swal2-select m-0 w-full h-10 text-sm" style="display:block;">
                          <option value="Pending" ${event.status === 'Pending' ? 'selected' : ''}>Pending</option>
                          <option value="Upcoming" ${event.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
                          <option value="In Progress" ${event.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                          <option value="Submitted" ${event.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                      </select>
                   </div>
              </div>
          `,
          focusConfirm: false, confirmButtonText: 'บันทึก', confirmButtonColor: THEME.sidebar, showCancelButton: true, cancelButtonText: 'ยกเลิก',
          preConfirm: () => ({
              title: (document.getElementById('swal-edit-title') as HTMLInputElement).value,
              detail: (document.getElementById('swal-edit-detail') as HTMLTextAreaElement).value,
              status: (document.getElementById('swal-edit-status') as HTMLSelectElement).value
          })
      });
      if (formValues) {
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...formValues } : e));
          Swal.fire({ icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1000, showConfirmButton: false });
      }
  };

  const handleEditRule = async (rule: any) => {
       const { value: formValues } = await Swal.fire({
          title: 'แก้ไขกฎเกณฑ์',
          html: `
              <div class="flex flex-col gap-3 text-left font-sans">
                   <div><label class="text-xs font-bold text-gray-600 uppercase">เหตุการณ์กระตุ้น</label><input id="swal-rule-trigger" class="swal2-input m-0 w-full h-10 text-sm" value="${rule.trigger}"></div>
                   <div><label class="text-xs font-bold text-gray-600 uppercase">ระยะเวลาดำเนินการ</label><input id="swal-rule-deadline" class="swal2-input m-0 w-full h-10 text-sm" value="${rule.deadline}"></div>
              </div>
          `,
          focusConfirm: false, confirmButtonText: 'บันทึก', confirmButtonColor: THEME.sidebar, showCancelButton: true, cancelButtonText: 'ยกเลิก',
          preConfirm: () => ({
              trigger: (document.getElementById('swal-rule-trigger') as HTMLInputElement).value,
              deadline: (document.getElementById('swal-rule-deadline') as HTMLInputElement).value
          })
      });
      if (formValues) {
          setRules(prev => prev.map(r => r.id === rule.id ? { ...r, ...formValues } : r));
          Swal.fire({ icon: 'success', title: 'อัปเดตเรียบร้อย', timer: 1000, showConfirmButton: false });
      }
  };

  const handleNewHoliday = async () => {
       const { value: formValues } = await Swal.fire({
          title: 'เพิ่มวันหยุด',
          html: '<div class="flex flex-col gap-3 text-left font-sans"><div><label class="text-xs font-bold text-red-700 uppercase">ชื่อวันหยุด</label><input id="swal-hol-name" class="swal2-input m-0 w-full h-10 text-sm"></div><div><label class="text-xs font-bold text-red-700 uppercase">วันที่</label><input id="swal-hol-date" type="date" class="swal2-input m-0 w-full h-10 text-sm"></div></div>',
          focusConfirm: false, confirmButtonText: 'บันทึก', confirmButtonColor: THEME.red, showCancelButton: true, cancelButtonText: 'ยกเลิก',
          preConfirm: () => ({ name: (document.getElementById('swal-hol-name') as HTMLInputElement).value, date: (document.getElementById('swal-hol-date') as HTMLInputElement).value })
      });
      if (formValues && formValues.name) {
          setCustomHolidays(prev => [...prev, formValues]);
          Swal.fire({ icon: 'success', title: 'เพิ่มวันหยุดแล้ว', timer: 1500, showConfirmButton: false });
      }
  };

  const handleMouseEnter = (e: React.MouseEvent, title: string, content: string) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top, title, content });
  };
  const handleMouseLeave = () => setTooltip(prev => ({ ...prev, visible: false }));

  const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDay = getFirstDayOfMonth(currentDate);
      const days = [];
      for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-[140px] bg-gray-50/50 border border-gray-100 rounded-lg opacity-50"></div>);
      for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const dayEvents = filteredEvents.filter(e => e.date === dateStr);
          const isToday = new Date().toISOString().slice(0,10) === dateStr;
          const thaiHoliday = TH_HOLIDAYS.find(h => h.m === (currentDate.getMonth() + 1) && h.d === i);
          const customHoliday = customHolidays.find(h => h.date === dateStr);
          const holiday = thaiHoliday ? { name: thaiHoliday.n } : (customHoliday ? { name: customHoliday.name } : null);
          
          const MAX_VISIBLE = 3;
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
          const hiddenEvents = dayEvents.slice(MAX_VISIBLE);

          days.push(
              <div key={i} className={`h-[140px] border rounded-lg p-2 flex flex-col transition-all hover:shadow-md hover:z-10 relative overflow-hidden ${isToday ? 'bg-white ring-1' : 'bg-white/80'} ${holiday ? 'bg-red-50/30' : ''}`} style={{ borderColor: isToday ? THEME.sidebar : '#E5E7EB' }}>
                  <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-mono font-bold ${isToday ? 'text-gray-900' : 'text-gray-500'} ${holiday ? 'text-red-800' : ''}`}>{i}</span>
                      {holiday && <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1 rounded truncate max-w-[80px] flex items-center gap-1" title={holiday.name}><Palmtree size={8} />{holiday.name}</span>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {visibleEvents.map(evt => {
                          const style = getCategoryColor(evt.color);
                          return (
                              <button key={evt.id} onClick={() => handleEditEvent(evt)} className="text-[10px] px-1.5 py-0.5 rounded border w-full text-left flex items-center gap-1 transition-transform hover:scale-105" style={{ backgroundColor: style.light, color: style.text, borderColor: style.border }} onMouseEnter={(e) => handleMouseEnter(e, evt.title, `หมวดหมู่: ${evt.category}\nผู้รับผิดชอบ: ${evt.responsible}\nสถานะ: ${evt.status}`)} onMouseLeave={handleMouseLeave}>
                                  <evt.icon size={10} className="shrink-0"/>
                                  <span className="truncate font-medium">{evt.title}</span>
                              </button>
                          );
                      })}
                      {hiddenEvents.length > 0 && <div className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full cursor-pointer hover:bg-gray-200 block w-fit mt-auto" onMouseEnter={(e) => handleMouseEnter(e, `อีก ${hiddenEvents.length} รายการ`, hiddenEvents.map(e => `• ${e.title}`).join('\n'))} onMouseLeave={handleMouseLeave}>+{hiddenEvents.length} more</div>}
                  </div>
              </div>
          );
      }
      return days;
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F6F4] font-sans">
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 shrink-0 z-50 shadow-sm">
            <div className="px-8 pt-4 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br from-sidebarBg to-brandTeal">
                      <CalendarClock size={24} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold" style={{ color: THEME.sidebar }}>Master <span style={{ color: THEME.blue }}>Calendar</span></h1>
                      <p className="text-xs" style={{ color: THEME.lightSlate }}>Centralized Regulatory Tracking</p>
                    </div>
                    <div className="flex h-10 bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner items-center ml-4">
                        <button onClick={() => setViewType('calendar')} className={`h-full px-3 rounded-lg flex items-center justify-center transition-all ${viewType === 'calendar' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} style={{ color: viewType === 'calendar' ? THEME.sidebar : undefined }}><Calendar size={16} /></button>
                        <button onClick={() => setViewType('periodic')} className={`h-full px-3 rounded-lg flex items-center justify-center transition-all ${viewType === 'periodic' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} style={{ color: viewType === 'periodic' ? THEME.sidebar : undefined }}><List size={16} /></button>
                        <button onClick={() => setViewType('eventBased')} className={`h-full px-3 rounded-lg flex items-center justify-center transition-all ${viewType === 'eventBased' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} style={{ color: viewType === 'eventBased' ? THEME.sidebar : undefined }}><AlertCircle size={16} /></button>
                    </div>
                    <button onClick={handleNewHoliday} className="h-10 px-4 text-white rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:brightness-110" style={{ backgroundColor: THEME.red }}>
                      <Palmtree size={16} /> วันหยุด
                    </button>
                </div>
            </div>
            <div className="px-8 pb-4 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold uppercase mr-1 shrink-0" style={{ color: THEME.text }}>Filter:</span>
                <div className="flex bg-gray-100 border border-gray-200 rounded-xl p-1 gap-1 overflow-x-auto">
                    {['All', 'Industrial', 'Safety', 'Environment', 'Food', 'Energy', 'Labor', 'Tax', 'Other'].map(cat => {
                        const Icon = CAT_ICONS[cat] || Layers;
                        return (
                          <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${filterCategory === cat ? 'bg-white shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-200/50'}`} style={{ color: filterCategory === cat ? THEME.sidebar : undefined }}>
                            <Icon size={12} /> {cat}
                          </button>
                        );
                    })}
                </div>
            </div>
        </header>

        <main className="flex-1 relative p-6 w-full max-w-[1600px] mx-auto overflow-y-auto">
            <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 min-h-full flex flex-col shadow-sm rounded-2xl overflow-hidden p-4 h-auto">
                  {viewType === 'calendar' && (
                    <div className="flex h-full gap-4" style={{minHeight: '600px'}}>
                        <div className="flex-1 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-2 px-2">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20}/></button>
                                    <span className="text-lg font-bold w-48 text-center uppercase tracking-wider" style={{ color: THEME.sidebar }}>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight size={20}/></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2 text-center font-bold text-xs text-gray-400 font-mono">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}</div>
                            <div className="grid grid-cols-7 gap-2 flex-1 p-1">{renderCalendar()}</div>
                        </div>
                        <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col pl-4">
                              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl mb-2">
                                <h4 className="font-bold flex items-center gap-2 text-sm uppercase" style={{ color: THEME.sidebar }}>
                                  <ClipboardList size={16} style={{ color: THEME.orange }}/> สรุปประจำเดือน
                                </h4>
                                <p className="text-[10px] text-gray-500 mt-1">Deadlines for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                              </div>
                              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 pb-2">
                                {currentMonthEvents.length > 0 ? (
                                    currentMonthEvents.map(evt => {
                                        const style = getCategoryColor(evt.color);
                                        return (
                                            <div key={evt.id} className="p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer" style={{ borderColor: style.border }} onClick={() => handleEditEvent(evt)}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded text-red-600 bg-red-50 border border-red-100">{evt.deadlineDesc || evt.date}</span>
                                                    <span className="text-[9px] font-bold uppercase text-gray-400 border border-gray-200 px-1 rounded">{evt.category}</span>
                                                </div>
                                                <h5 className="text-xs font-bold leading-snug transition-colors" style={{ color: THEME.sidebar }}>{evt.title}</h5>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-xs italic">ไม่มีรายการในเดือนนี้</div>
                                )}
                              </div>
                        </div>
                    </div>
                )}
                
                {viewType === 'periodic' && (
                  <div className="flex flex-col min-h-0 bg-white border border-gray-100 rounded-xl overflow-hidden h-full">
                      <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-sm flex justify-between items-center" style={{ color: THEME.sidebar }}>
                          <span className="flex items-center gap-2"><CalendarRange size={16}/> รายงานประจำปี/ตามรอบ (Periodic)</span>
                          <button onClick={() => { setFormData({}); setIsPeriodicModalOpen(true); }} className="text-white px-3 py-1.5 rounded-lg text-xs hover:brightness-110 transition-colors flex items-center gap-1" style={{ backgroundColor: THEME.sidebar }}><Plus size={14}/> เพิ่มรายงาน</button>
                      </div>
                      <div className="flex-1 overflow-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-white sticky top-0 border-b border-gray-200 z-10 shadow-sm">
                                  <tr>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>กำหนดส่ง</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>ชื่อรายงาน</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>หมวดหมู่</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>ผู้รับผิดชอบ</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>หน่วยงาน</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>สถานะ</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50 text-center" style={{ color: THEME.text }}>แก้ไข</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {sortedPeriodicEvents.map(evt => {
                                      const style = getCategoryColor(evt.color);
                                      return (
                                          <tr key={evt.id} className="hover:bg-gray-50 transition-colors text-xs">
                                              <td className="p-3 font-bold whitespace-nowrap" style={{ color: THEME.slate }}>{evt.deadlineDesc || evt.date}</td>
                                              <td className="p-3 font-bold" style={{ color: THEME.sidebar }}>{evt.title}</td>
                                              <td className="p-3"><span className="px-2 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1 w-fit" style={{ backgroundColor: style.light, color: style.text, borderColor: style.border }}><evt.icon size={10} /> {evt.category}</span></td>
                                              <td className="p-3 text-gray-600">{evt.responsible || '-'}</td>
                                              <td className="p-3 text-gray-600">{evt.authority || '-'}</td>
                                              <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${evt.status === 'Submitted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{evt.status || 'Pending'}</span></td>
                                              <td className="p-3 text-center"><button onClick={() => handleEditEvent(evt)} className="text-gray-400 hover:text-gray-600 transition-colors"><Edit3 size={16} /></button></td>
                                          </tr>
                                      );
                                  })}
                              </tbody>
                          </table>
                      </div>
                  </div>
                )}

                {viewType === 'eventBased' && (
                  <div className="flex flex-col min-h-0 bg-white border border-gray-100 rounded-xl overflow-hidden h-full">
                        <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-sm flex justify-between items-center" style={{ color: THEME.sidebar }}>
                          <span className="flex items-center gap-2"><AlertCircle size={16}/> รายงานตามเหตุการณ์ (Event-Based)</span>
                          <button onClick={() => { setFormData({}); setIsRuleModalOpen(true); }} className="text-white px-3 py-1.5 rounded-lg text-xs hover:brightness-110 transition-colors flex items-center gap-1" style={{ backgroundColor: THEME.sidebar }}><Plus size={14}/> เพิ่มกฎเกณฑ์</button>
                      </div>
                      <div className="flex-1 overflow-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-white sticky top-0 border-b border-gray-200 z-10 shadow-sm">
                                  <tr>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>หมวดหมู่</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>ชื่อรายงาน/แบบ</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>เหตุการณ์กระตุ้น (Trigger)</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>ระยะเวลา</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>ผู้รับผิดชอบ</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50" style={{ color: THEME.text }}>หน่วยงาน</th>
                                      <th className="p-3 text-xs font-bold uppercase whitespace-nowrap bg-gray-50 text-center" style={{ color: THEME.text }}>แก้ไข</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {sortedRules.map(rule => {
                                      const style = getCategoryColor(rule.color);
                                      const Icon = CAT_ICONS[rule.category] || Layers;
                                      return (
                                          <tr key={rule.id} className="hover:bg-gray-50 transition-colors text-xs">
                                              <td className="p-3"><span className="px-2 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1 w-fit" style={{ backgroundColor: style.light, color: style.text, borderColor: style.border }}><Icon size={10} /> {rule.category}</span></td>
                                              <td className="p-3 text-gray-700 font-medium">{rule.title}</td>
                                              <td className="p-3 font-bold" style={{ color: THEME.sidebar }}>{rule.trigger}</td>
                                              <td className="p-3 font-mono font-bold" style={{ color: THEME.red }}>{rule.deadline}</td>
                                              <td className="p-3 text-gray-600">{rule.responsible}</td>
                                              <td className="p-3 text-gray-600">{rule.authority}</td>
                                              <td className="p-3 text-center"><button onClick={() => handleEditRule(rule)} className="text-gray-400 hover:text-gray-600 transition-colors"><Edit3 size={16} /></button></td>
                                          </tr>
                                      );
                                  })}
                              </tbody>
                          </table>
                      </div>
                  </div>
                )}
            </div>
        </main>

        {tooltip.visible && (
          <div className="fixed z-50 bg-gray-800 text-white p-3 rounded-lg text-xs shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px] max-w-xs" style={{ top: tooltip.y, left: tooltip.x }}>
            <div className="font-bold mb-1 border-b border-gray-600 pb-1" style={{ color: THEME.gold }}>{tooltip.title}</div>
            <div className="whitespace-pre-line text-gray-300 leading-relaxed">{tooltip.content}</div>
          </div>
        )}

        {/* PERIODIC MODAL */}
        {isPeriodicModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center" onClick={() => setIsPeriodicModalOpen(false)}>
              <div className="bg-white w-[90%] max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: THEME.sidebar }}>
                          <FilePlus size={20} style={{ color: THEME.orange }}/> เพิ่มรายงานรายปี/ตามรอบ
                      </h3>
                      <button onClick={() => setIsPeriodicModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="mb-4 border border-blue-100 rounded-lg bg-blue-50/50 overflow-hidden">
                          <div className="p-3 text-xs text-blue-900 leading-relaxed">
                            <p className="font-bold mb-1 flex items-center gap-1"><Info size={14}/> คำแนะนำ</p>
                            <p>กรอกข้อมูลสำหรับรายงานที่มีกำหนดเวลาแน่นอน (เช่น รายเดือน/รายปี) เลือกหมวดหมู่เพื่อให้ระบบกรองหน่วยงานที่เกี่ยวข้อง</p>
                          </div>
                      </div>
                      <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>ชื่องาน/รายงาน</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})} placeholder="เช่น รายงานประจำปี..."/></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>วันที่ครบกำหนด</label><input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.date||''} onChange={e=>setFormData({...formData, date:e.target.value})}/></div>
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>คำอธิบายวัน</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.deadlineDesc||''} onChange={e=>setFormData({...formData, deadlineDesc:e.target.value})} placeholder="เช่น 15 มกราคม"/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>หมวดหมู่</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.category||''} onChange={handleCategoryChange}><option value="">เลือก...</option>{Object.keys(CAT_ICONS).filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>หน่วยงาน</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.authority||''} onChange={e=>setFormData({...formData, authority:e.target.value})}><option value="">เลือก...</option>{(CATEGORY_AUTHORITIES[formData.category]||[]).map(a=><option key={a} value={a}>{a}</option>)}</select></div>
                      </div>
                        <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>ผู้รับผิดชอบ</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.responsible||''} onChange={e=>setFormData({...formData, responsible:e.target.value})} placeholder="เช่น จป.วิชาชีพ"/></div>
                      <div className="pt-4 flex justify-end gap-2">
                        <button onClick={()=>setIsPeriodicModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-500 text-xs font-bold hover:bg-gray-50">ยกเลิก</button>
                        <button onClick={savePeriodicEvent} className="px-4 py-2 rounded-lg text-white text-xs font-bold hover:brightness-110" style={{ backgroundColor: THEME.sidebar }}>บันทึก</button>
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* EVENT-BASED MODAL */}
        {isRuleModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center" onClick={() => setIsRuleModalOpen(false)}>
              <div className="bg-white w-[90%] max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: THEME.sidebar }}>
                          <FilePlus size={20} style={{ color: THEME.orange }}/> เพิ่มกฎเกณฑ์ตามเหตุการณ์
                      </h3>
                      <button onClick={() => setIsRuleModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>ชื่อรายงาน/กฎหมาย</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})} placeholder="ชื่อแบบรายงาน..."/></div>
                      <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>เหตุการณ์กระตุ้น</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.trigger||''} onChange={e=>setFormData({...formData, trigger:e.target.value})} placeholder="เช่น เมื่อเกิดอุบัติเหตุ..."/></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>ระยะเวลา</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.deadline||''} onChange={e=>setFormData({...formData, deadline:e.target.value})} placeholder="e.g. ภายใน 30 วัน"/></div>
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>หมวดหมู่</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.category||''} onChange={handleCategoryChange}><option value="">เลือก...</option>{Object.keys(CAT_ICONS).filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                      </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>หน่วยงาน</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.authority||''} onChange={e=>setFormData({...formData, authority:e.target.value})}><option value="">เลือก...</option>{(CATEGORY_AUTHORITIES[formData.category]||[]).map(a=><option key={a} value={a}>{a}</option>)}</select></div>
                          <div><label className="text-xs font-bold uppercase block mb-1" style={{ color: THEME.text }}>ผู้รับผิดชอบ</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={formData.responsible||''} onChange={e=>setFormData({...formData, responsible:e.target.value})} placeholder="เช่น HR"/></div>
                      </div>
                      <div className="pt-4 flex justify-end gap-2">
                        <button onClick={()=>setIsRuleModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-500 text-xs font-bold hover:bg-gray-50">ยกเลิก</button>
                        <button onClick={saveEventRule} className="px-4 py-2 rounded-lg text-white text-xs font-bold hover:brightness-110" style={{ backgroundColor: THEME.sidebar }}>บันทึก</button>
                      </div>
                  </div>
              </div>
          </div>
        )}

    </div>
  );
};

export default HRCalendar;
