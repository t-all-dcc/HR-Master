# HR MASTER - System Guide

## 🌟 Prompt / คู่มือการพัฒนาระบบ: Centralized Frontend, Distributed Backend (React + Google Sheets)

**คำอธิบาย:** ไฟล์นี้คือ "คู่มือการพัฒนาระบบ" สำหรับ HR MASTER ซึ่งเป็นระบบบริหารจัดการทรัพยากรบุคคลแบบครบวงจร

### 1. System Architecture (สถาปัตยกรรมระบบ)
- **Frontend**: React (Vite + TypeScript)
- **UI Framework**: Tailwind CSS + Lucide Icons
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: Custom Tab-based Routing in `App.tsx`
- **Backend Concept**: Distributed Backend (Google Sheets / API Integration ready)

### 2. Module Overview (ภาพรวมโมดูล)

#### 2.1 Dashboard
- แสดงภาพรวมขององค์กร (Headcount, Attendance, Vacancies)
- แจ้งเตือนวันเกิดพนักงาน และการอนุมัติคำขอต่างๆ

#### 2.2 HR Management (การจัดการทรัพยากรบุคคล)
- **Employee Directory**: รายชื่อพนักงานทั้งหมด ค้นหาและกรองข้อมูลได้
- **Payroll & Compensation**: คำนวณเงินเดือนและค่าตอบแทน
- **Time & Attendance**: บันทึกเวลาเข้า-ออกงาน
- **Leave Management**: ระบบลางานและอนุมัติการลา
- **Disciplinary Actions**: บันทึกการลงโทษทางวินัย (หน้าขาว - White Page Theme)

#### 2.3 HR Development (การพัฒนาบุคลากร)
- **OJT Training**: การฝึกอบรมหน้างาน
- **Orientation Training**: การปฐมนิเทศพนักงานใหม่ (ติดตามสถานะ, มอบหมายหลักสูตร)
- **Training Planning**: แผนการฝึกอบรมประจำปี (Placeholder)
- **Skill Matrix**: ตารางทักษะพนักงาน
- **Performance**: การประเมินผลงาน (KPI/OKR)
- **Career Path & Succession**: เส้นทางอาชีพและแผนสืบทอดตำแหน่ง

#### 2.4 Recruitment (สรรหาว่าจ้าง)
- **Manpower Request**: คำขออัตรากำลังคน
- **Job Vacancies**: ประกาศรับสมัครงาน
- **Candidate Tracking**: ติดตามผู้สมัครงาน
- **Interview Schedule**: ตารางนัดสัมภาษณ์
- **Onboarding**: กระบวนการรับพนักงานใหม่

#### 2.5 Labor Relations (แรงงานสัมพันธ์)
- **Disciplinary & Labor Law**: กฎหมายแรงงานและวินัย
- **Company Regulations**: ข้อบังคับบริษัท
- **Union & Grievances**: สหภาพแรงงานและข้อร้องเรียน
- **Employee Engagement**: ความผูกพันพนักงาน

#### 2.6 HR Analytics (วิเคราะห์ข้อมูล HR)
- **Workforce Report**: รายงานกำลังคน
- **Turnover Analysis**: วิเคราะห์อัตราการลาออก
- **Budget Tracking**: ติดตามงบประมาณ HR

#### 2.7 Data Master (ข้อมูลหลัก)
- **Org Structure**: โครงสร้างองค์กร
- **Position Master**: ข้อมูลตำแหน่งงาน
- **Job Description**: รายละเอียดหน้าที่ความรับผิดชอบ
- **Branch Master**: ข้อมูลสาขา

#### 2.8 System Config (ตั้งค่าระบบ)
- **User Permissions**: กำหนดสิทธิ์ผู้ใช้งาน (Matrix View)
- **System Config (Hybrid Login)**: หน้า Login แบบ Hybrid (RFID/Camera/PIN) - White Page Theme

### 3. Theme & Design Guidelines (แนวทางการออกแบบ)
- **Color Palette**:
  - Primary: Red (#D91604), Orange (#D95032)
  - Secondary: Gold (#B8AB89), Teal (#5A94A7), Blue (#879DB5)
  - Neutral: Slate (#6A758A), Light Slate (#7D7990), Sidebar (#3F4859)
  - Background: Cream (#F2F0E4), Main BG (#F2F0EB)
- **Icons**: Lucide React (Consistent usage)
- **Typography**: Sans-serif (Inter/System Font) for UI, Serif for specific headers (HR MASTER branding)

### 4. Development Guidelines (แนวทางการพัฒนา)
- **Adding New Pages**:
  1. Create a new component in `/src/components`.
  2. Import the component in `App.tsx`.
  3. Add routing logic in `getTabContent` function in `App.tsx`.
  4. Ensure the component follows the established theme and color palette.
- **Using Placeholders**:
  - Use `PlaceholderPage` component for modules under development.
  - Example: `<PlaceholderPage title="Module Name" />`

### 5. Deployment
- Build command: `npm run build`
- Output directory: `dist/`
- Deploy to static hosting or containerized environment.

---
**Note**: This guide is a living document and should be updated as the system evolves.
