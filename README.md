# HR MASTER - Human Resource Management System

## Overview
HR MASTER is a comprehensive Human Resource Management System designed to streamline HR processes, from recruitment to retirement. It features a centralized frontend built with React and a distributed backend architecture (conceptually) to manage various HR modules.

## Key Features
- **Dashboard**: Real-time overview of HR metrics (Headcount, Attendance, Vacancies).
- **HR Management**: Employee Directory, Payroll, Time & Attendance, Leave Management, Benefits, Disciplinary Actions.
- **HR Development**: OJT, Orientation, Training Planning, Skill Matrix, Performance, Career Path, Succession Planning.
- **Recruitment**: Manpower Request, Job Vacancies, Candidate Tracking, Interview Scheduling, Onboarding.
- **Labor Relations**: Disciplinary & Labor Law, Company Regulations, Union & Grievances, Employee Engagement.
- **HR Analytics**: Workforce Reports, Turnover Analysis, Budget Tracking.
- **Data Master**: Organization Structure, Position Master, Job Descriptions, Branch Master.
- **System Config**: User Permissions, System Configuration (Hybrid Login).

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts, Chart.js
- **UI Components**: SweetAlert2, Framer Motion (animate-in classes)

## Theme & Design
The system follows a "HR MASTER" aesthetic with a specific color palette:
- **Primary Colors**: Red (#D91604), Orange (#D95032)
- **Secondary Colors**: Gold (#B8AB89), Teal (#5A94A7), Blue (#879DB5)
- **Backgrounds**: Light/White theme for configuration pages, specific gradients for dashboards.

## Installation & Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.

## Project Structure
- `/src/components`: Contains all functional modules and UI components.
- `/src/App.tsx`: Main routing and layout configuration.
- `/src/index.css`: Global styles and Tailwind configuration.

## Modules Status
- **Active**: Dashboard, Employee Directory, Recruitment, Orientation, HR Calendar, User Permissions, System Config.
- **In Progress**: Training Plan, Self Evaluation, Manager Review, 360 Feedback, Appraisal Report (Placeholder pages added).

## User Guide
For detailed usage instructions, please refer to `SYSTEM_GUIDE.md`.
