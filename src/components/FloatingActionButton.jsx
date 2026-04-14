import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function FloatingActionButton({ onClick }) {
  return (
    <motion.button
      className="fixed bottom-8 right-8 z-[300] w-[60px] h-[60px] flex items-center justify-center btn-gradient text-white rounded-full shadow-[0_4px_24px_rgba(99,102,241,0.35)] max-sm:bottom-5 max-sm:right-5 max-sm:w-[54px] max-sm:h-[54px]"
      onClick={onClick}
      whileHover={{ scale: 1.1, boxShadow: '0 8px 32px rgba(99, 102, 241, 0.45)' }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      aria-label="Create New Task"
    >
      <Plus size={26} strokeWidth={2.5} />
      <span className="absolute inset-[-6px] rounded-full border-2 border-[rgba(99,102,241,0.3)] animate-pulse-ring pointer-events-none" />
    </motion.button>
  );
}
