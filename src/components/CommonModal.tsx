'use client';

import { motion, AnimatePresence, Variants } from "framer-motion";

interface CommonModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type: 'alert' | 'confirm';
  onClose: () => void;
  onConfirm?: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: -20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20, 
    transition: { duration: 0.2 }
  }
};

export default function CommonModal({
  isOpen,
  title,
  message,
  type,
  onClose,
  onConfirm,
}: CommonModalProps) {
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] mx-4 overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="px-7 py-6">
              {title && (
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{title}</h3>
              )}
              <p className="text-gray-600 text-base whitespace-pre-wrap leading-relaxed">{message}</p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100/80">
              {type === 'confirm' && (
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-all duration-150 ease-in-out"
                >
                  취소
                </button>
              )}
              <button
                onClick={() => {
                  if (type === 'confirm' && onConfirm) {
                    onConfirm();
                  }
                  onClose();
                }}
                className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-150 ease-in-out ${
                  type === 'alert' 
                    ? 'bg-primary hover:bg-primary-dark active:bg-blue-800 focus:ring-blue-500 shadow-blue-500/20' 
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-red-500/20'
                }`}
              >
                {type === 'confirm' ? '확인' : '닫기'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}