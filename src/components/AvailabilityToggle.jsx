import { motion } from 'framer-motion';

export default function AvailabilityToggle({ available, onToggle }) {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer relative select-none" onClick={onToggle}>
      <motion.div
        className={`w-12 h-[26px] rounded-full p-[3px] border shrink-0 transition-colors ${available ? 'border-[rgba(34,197,94,0.35)]' : 'border-[var(--color-border-glass)]'}`}
        animate={{ backgroundColor: available ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.06)' }}
      >
        <motion.div
          className="w-5 h-5 rounded-full shadow-md"
          animate={{ x: available ? 22 : 0, backgroundColor: available ? '#22c55e' : '#6b7280' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
      <span className="text-[0.85rem] font-semibold transition-colors" style={{ color: available ? 'var(--color-priority-low)' : 'var(--color-text-muted)' }}>
        {available ? 'Available' : 'Unavailable'}
      </span>
      {available && (
        <motion.span
          className="absolute left-[14px] top-[3px] w-5 h-5 rounded-full bg-[rgba(34,197,94,0.3)] pointer-events-none"
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
