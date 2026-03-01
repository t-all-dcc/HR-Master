import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  enableDragDrop?: boolean;
  onDrop?: (files: File[]) => void;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  footer,
  size = 'lg',
  enableDragDrop = false,
  onDrop
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleDragEnter = (e: React.DragEvent) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the drop zone itself
    if (e.target === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (onDrop) onDrop(files);
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw] h-[95vh]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/50`}
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="p-2 bg-brandTeal/10 rounded-lg text-brandTeal">
                    <Icon size={20} />
                  </div>
                )}
                <h3 className="text-lg font-bold text-brandDeepBlue tracking-tight">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-brandRed hover:bg-brandRed/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
              {children}

              {/* Drag & Drop Overlay */}
              {isDragging && enableDragDrop && (
                <div className="absolute inset-0 bg-brandTeal/5 backdrop-blur-sm border-2 border-dashed border-brandTeal flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
                  <div className="p-6 bg-white rounded-full shadow-xl mb-4 animate-bounce">
                    <Upload size={48} className="text-brandTeal" />
                  </div>
                  <h4 className="text-xl font-bold text-brandDeepBlue">Drop files here</h4>
                  <p className="text-brandMuted">Release to upload instantly</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
