import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, color, index = 0 }) {
  return (
    <motion.div
      className="flex items-center gap-4 p-5 glass-card glass-card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0"
        style={{ background: `${color}18`, color }}
      >
        <Icon size={22} />
      </div>
      <div className="flex flex-col">
        <motion.span
          className="text-[1.6rem] font-extrabold leading-none tracking-tight"
          key={value}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {value}
        </motion.span>
        <span className="text-[0.78rem] text-[var(--color-text-muted)] mt-0.5">{label}</span>
      </div>
    </motion.div>
  );
}
