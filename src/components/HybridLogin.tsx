import React, { useState, useEffect, useRef } from 'react';
import { 
  Library, Camera, X, ScanFace, ArrowRight, ArrowLeft, 
  Delete, ShieldCheck, ShieldAlert, HelpCircle, LogIn, XCircle, Shield
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Constants ---
const THEME = {
  bgRich: '#3F4859', // Using the dark slate from the palette
  gold: '#B8AB89',   // The "Gold" replacement
  goldLight: '#F2F0E4', // Surface color
  goldDim: '#7D7990', // Muted purple/grey
  silver: '#C0B7BD', // Pale purple
  charcoal: '#141A26', // Keep dark for contrast or use #3F4859
  red: '#D91604',
  orange: '#D95032',
  teal: '#5A94A7',
  blue: '#879DB5',
};

const HybridLogin = () => {
  const [empId, setEmpId] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(1); // 1 = EMP ID, 2 = PIN
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      stopCamera();
    };
  }, []);

  // Camera Logic
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      Swal.fire('Error', 'ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งานบนเบราว์เซอร์', 'error');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Handle Numpad input
  const handlePinPress = (num: string) => {
    if (pin.length < 6 && !isAuthenticating) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Simulate auto-login when 6 digits are reached
      if (newPin.length === 6) {
        simulateLogin();
      }
    }
  };

  const handleDelete = () => {
    if (!isAuthenticating) {
      setPin(pin.slice(0, -1));
    }
  };

  const simulateLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setPin("");
      setEmpId("");
      setStep(1);
      setIsAuthenticating(false);
      Swal.fire({
        title: 'Welcome Back!',
        text: 'Authentication Successful',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Redirect or handle login success here
        window.location.href = '/';
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-white overflow-hidden font-sans text-[#3F4859]">
      {/* Background Imagery & Overlays */}
      <div className="absolute inset-0 z-0 bg-[#F2F0EB]">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069"
          alt="Office Background"
          className="absolute inset-0 w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/80 backdrop-blur-[2px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B8AB89]/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>
      </div>

      {/* Top Branding (Kiosk Header) */}
      <div className="absolute top-8 left-0 w-full px-12 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-[#B8AB89]/30 flex items-center justify-center bg-white rotate-45 shadow-lg">
            <Library size={24} className="text-[#B8AB89] -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-[#3F4859] tracking-widest leading-none">HR <span className="text-[#B8AB89]">MASTER</span></span>
            <span className="text-[10px] text-[#7D7990] tracking-[0.3em] uppercase mt-1">System Configuration</span>
          </div>
        </div>
        
        <div className="text-right border-r-2 border-[#B8AB89]/30 pr-4">
          <div className="text-2xl font-serif text-[#B8AB89] leading-none">
            {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] text-[#7D7990] tracking-widest uppercase mt-1">
            {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Main Login Interface */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-12 px-6 mt-10">
        
        {/* Left Side: RFID / NFC Scanner & Camera */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center">
          <div className="mb-6">
            <span className="text-[#B8AB89] text-xs font-bold uppercase tracking-[0.4em] mb-2 block">Primary Verification</span>
            <h2 className="text-4xl font-serif text-[#3F4859]">Scan ID Card</h2>
          </div>
          
          {isCameraActive ? (
            <div className="relative w-64 h-64 flex flex-col items-center justify-center my-8 rounded-xl overflow-hidden border-2 border-[#B8AB89]/50 shadow-xl bg-black">
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"></video>
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#B8AB89]"></div>
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#B8AB89]"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#B8AB89]"></div>
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#B8AB89]"></div>
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#B8AB89] shadow-[0_0_15px_rgba(184,171,137,1)] animate-[scan-line-vertical_2.5s_linear_infinite] z-10"></div>
              <div className="absolute bottom-3 text-[8px] text-[#B8AB89] tracking-widest uppercase bg-black/60 px-3 py-1 rounded backdrop-blur border border-[#B8AB89]/30">
                Focus Barcode Here
              </div>
            </div>
          ) : (
            <div className="relative w-64 h-64 flex items-center justify-center my-8">
              <div className="absolute inset-0 border border-[#B8AB89]/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute inset-4 border border-[#B8AB89]/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-1000"></div>
              <div className="relative w-40 h-40 bg-white border-2 border-[#B8AB89]/50 rounded-full flex flex-col items-center justify-center shadow-xl animate-[scan-pulse_2s_infinite] z-10">
                <ScanFace size={48} className="text-[#B8AB89] mb-2" />
                <span className="text-[9px] text-[#7D7990] tracking-widest uppercase">Tap Here</span>
              </div>
            </div>
          )}
          
          <div className="h-10 mt-2">
            {isCameraActive ? (
              <button 
                onClick={stopCamera}
                className="px-6 py-2 border border-[#7D7990]/40 text-[#7D7990] hover:text-[#3F4859] hover:border-[#3F4859] transition-colors rounded uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <X size={14} /> Close Camera
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="px-6 py-2 border border-[#B8AB89]/40 text-[#B8AB89] hover:bg-[#B8AB89] hover:text-white transition-colors rounded uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <Camera size={14} /> Use Camera to Scan
              </button>
            )}
          </div>

          <p className="text-[#7D7990] text-sm font-light max-w-xs mt-4 h-10">
            {isCameraActive 
              ? "หันกล้องไปที่บาร์โค้ดบนบัตรพนักงานของคุณ เพื่อเข้าสู่ระบบอัตโนมัติ" 
              : "กรุณาแตะบัตรพนักงานของคุณที่เครื่องอ่าน หรือใช้กล้องสแกนบาร์โค้ด"}
          </p>
        </div>

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center justify-center h-96 w-px bg-gradient-to-b from-transparent via-[#B8AB89]/30 to-transparent relative">
          <div className="absolute bg-white px-2 py-1 text-[10px] text-[#B8AB89] tracking-widest border border-[#B8AB89]/20 rounded uppercase">OR</div>
        </div>

        {/* Right Side: PIN Entry (Fallback) */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-8 w-full max-w-sm relative overflow-hidden min-h-[460px] flex flex-col justify-center">
            {/* Loading Overlay */}
            {isAuthenticating && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                <ShieldCheck size={48} className="text-[#B8AB89] animate-pulse mb-4" />
                <span className="text-[#B8AB89] font-serif tracking-widest text-sm animate-pulse">Authenticating...</span>
                <p className="text-[10px] text-[#7D7990] mt-4 w-3/4 text-center">Syncing HR Data & Generating Watermark...</p>
              </div>
            )}

            {step === 1 ? (
              <div className="flex flex-col h-full justify-center">
                <div className="text-center mb-6">
                  <span className="text-[#7D7990] text-[10px] font-bold uppercase tracking-[0.3em] mb-1 block">Fallback Verification</span>
                  <h3 className="text-2xl font-serif text-[#3F4859]">Employee ID</h3>
                  <p className="text-[11px] text-[#7D7990] mt-2">ระบุรหัสพนักงานของคุณ</p>
                </div>
                
                <input 
                  type="text" 
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                  placeholder="e.g. EMP-10045"
                  className="w-full bg-[#F2F0EB] border border-[#B8AB89]/30 text-[#3F4859] text-center font-mono text-xl py-4 rounded-xl focus:outline-none focus:border-[#B8AB89] focus:shadow-md mb-8 transition-all uppercase placeholder-gray-400"
                />
                
                <button 
                  onClick={() => empId.trim() !== "" && setStep(2)}
                  disabled={empId.trim() === ""}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${empId.trim() !== "" ? 'bg-[#3F4859] text-white shadow-lg hover:bg-[#2D3440]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-center">
                <div className="text-center mb-4 relative">
                  <button 
                    onClick={() => setStep(1)} 
                    className="absolute left-0 top-1 text-[#7D7990] hover:text-[#B8AB89] transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <span className="text-[#7D7990] text-[10px] font-bold uppercase tracking-[0.3em] mb-1 block">{empId}</span>
                  <h3 className="text-2xl font-serif text-[#3F4859] mb-1">Enter PIN</h3>
                  <p className="text-[10px] text-[#B8AB89] font-mono tracking-widest bg-[#B8AB89]/10 inline-block px-2 py-1 rounded border border-[#B8AB89]/20">เลข 6 ตัวสุดท้ายของบัตรประชาชน</p>
                </div>

                {/* PIN Display Dots */}
                <div className="flex justify-center gap-4 mb-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-[#B8AB89]/50 flex items-center justify-center bg-gray-50">
                      {i < pin.length && (
                        <div className="w-2.5 h-2.5 bg-[#B8AB89] rounded-full shadow-sm"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button 
                      key={num} 
                      onClick={() => handlePinPress(num.toString())}
                      className="h-14 rounded-xl text-xl font-serif text-[#3F4859] flex items-center justify-center focus:outline-none bg-white border border-gray-100 shadow-sm hover:border-[#B8AB89]/50 hover:shadow-md active:scale-95 transition-all"
                    >
                      {num}
                    </button>
                  ))}
                  <button 
                    onClick={() => setPin("")}
                    className="h-14 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#7D7990] hover:text-[#B8AB89] transition-colors focus:outline-none"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => handlePinPress("0")}
                    className="h-14 rounded-xl text-xl font-serif text-[#3F4859] flex items-center justify-center focus:outline-none bg-white border border-gray-100 shadow-sm hover:border-[#B8AB89]/50 hover:shadow-md active:scale-95 transition-all"
                  >
                    0
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="h-14 rounded-xl flex items-center justify-center text-[#7D7990] hover:text-[#B8AB89] transition-colors focus:outline-none"
                  >
                    <Delete size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Security Notification Banner */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center z-20">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-[#B8AB89]/30 px-6 py-2 rounded-full shadow-lg">
          <Shield size={14} className="text-[#B8AB89]" />
          <p className="text-[10px] text-[#7D7990] tracking-wide font-mono">
            <span className="text-[#3F4859] font-bold">SECURITY NOTICE:</span> ระบบจะดึงข้อมูล <span className="text-[#B8AB89] font-bold">ชื่อ-สกุล และ แผนกจาก HR</span> เพื่อประทับเป็นลายน้ำ (Watermark) บนเอกสารอัตโนมัติ
          </p>
        </div>
      </div>

      {/* --- HELP / POLICY DRAWER SECTION --- */}
      
      {/* Floating Help Button */}
      <button 
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-white border-2 border-[#B8AB89]/50 flex items-center justify-center text-[#B8AB89] hover:bg-[#B8AB89] hover:text-white transition-all shadow-lg"
      >
        <HelpCircle size={28} />
      </button>

      {/* Overlay for Drawer */}
      <div 
        className={`fixed inset-0 bg-[#3F4859]/20 backdrop-blur-sm z-40 transition-opacity duration-500 ${isHelpOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsHelpOpen(false)}
      ></div>

      {/* Right Side Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white border-l border-[#B8AB89]/30 z-50 transform transition-transform duration-500 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col ${isHelpOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-serif text-[#3F4859]">System Guide</h3>
            <p className="text-[10px] text-[#B8AB89] tracking-widest uppercase">UX & Security Policy</p>
          </div>
          <button 
            onClick={() => setIsHelpOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-[#B8AB89] hover:text-white transition-colors text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Section 1: How to Login */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-[#B8AB89] mb-3 flex items-center gap-2">
              <LogIn size={16} /> 1. วิธีการเข้าสู่ระบบ (Authentication)
            </h4>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-sm text-[#7D7990] leading-relaxed space-y-3">
              <p>เพื่อให้การเข้าถึงสะดวกและรวดเร็วที่สุด พนักงานสามารถเข้าระบบได้ 2 ช่องทาง:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-[#3F4859]">ช่องทางหลัก:</span> ใช้บัตรพนักงานแตะที่เครื่องอ่าน (RFID) หรือกดเปิดกล้องเพื่อสแกนบาร์โค้ดบนบัตร</li>
                <li><span className="text-[#3F4859]">ช่องทางสำรอง:</span> ระบุ <span className="text-[#B8AB89]">รหัสพนักงาน (Employee ID)</span> และใช้ <span className="text-[#B8AB89]">รหัส PIN (เลข 6 ตัวสุดท้ายของบัตรประชาชน)</span></li>
              </ul>
            </div>
          </div>

          {/* Section 2: UX vs Security */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-[#B8AB89] mb-3 flex items-center gap-2">
              <ShieldAlert size={16} /> 2. นโยบายความปลอดภัย (Information Security)
            </h4>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-sm text-[#7D7990] leading-relaxed space-y-4">
              <p>ระบบ HR MASTER มีการประนีประนอมระหว่าง "ความง่ายในการเข้าถึง (UX)" และ "ความปลอดภัยขั้นสูงสุด" ดังนี้:</p>
              
              <div className="border-l-2 border-[#B8AB89] pl-3">
                <p className="text-[#3F4859] font-bold text-xs mb-1 uppercase tracking-wider">Dynamic Watermark</p>
                <p className="text-xs">เมื่อเข้าสู่ระบบสำเร็จ ระบบจะซิงค์ข้อมูลกับฐานข้อมูล HR โดยอัตโนมัติ เพื่อดึง <span className="text-[#B8AB89] font-bold">ชื่อ-สกุล และ แผนก</span> มาประทับเป็น "ลายน้ำ (Watermark)" พาดทับเอกสารทุกหน้า เพื่อป้องกันการถ่ายภาพหรือนำข้อมูลไปเผยแพร่</p>
              </div>

              <div className="border-l-2 border-[#B8AB89] pl-3">
                <p className="text-[#3F4859] font-bold text-xs mb-1 uppercase tracking-wider">Strict Read-Only</p>
                <p className="text-xs">พนักงานทั่วไปจะได้รับสิทธิ์เพียง "อ่านและเรียกดู" เท่านั้น <br/>
                <XCircle size={12} className="inline text-red-500" /> ไม่อนุญาตให้ คัดลอกข้อความ (Copy)<br/>
                <XCircle size={12} className="inline text-red-500" /> ไม่อนุญาตให้ ดาวน์โหลด (Download)<br/>
                <XCircle size={12} className="inline text-red-500" /> ไม่อนุญาตให้ สั่งพิมพ์ (Print)</p>
              </div>
              
              <p className="text-[11px] mt-2 bg-[#B8AB89]/10 p-2 border border-[#B8AB89]/20 rounded">
                <span className="text-[#B8AB89] font-bold">หมายเหตุ:</span> หากมีความจำเป็นต้องใช้ไฟล์ต้นฉบับ จะต้องทำเรื่อง "ขอสิทธิ์ (Request Access)" ในระบบ เพื่อให้ Document Controller หรือหัวหน้างานอนุมัติเป็นรายกรณี
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-100 bg-white text-center">
          <p className="text-[10px] text-[#7D7990]/50 tracking-widest font-mono">HR MASTER • Version 9.2</p>
        </div>
      </div>
    </div>
  );
};

export default HybridLogin;
