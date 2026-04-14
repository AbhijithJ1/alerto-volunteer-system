import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

export default function AlertsPage() {
  const { user, tasks, acceptTask, declineTask } = useApp();
  const [priorityFilter, setPriorityFilter] = useState('all');

  const pendingTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.status === 'pending');
    if (priorityFilter !== 'all') filtered = filtered.filter((t) => t.priority === priorityFilter);
    return filtered;
  }, [tasks, priorityFilter]);

  const handleAccept = (taskId) => {
    acceptTask(taskId, user?.id || 'vol-1');
    toast.success('Task accepted! Head to the location now.', { icon: '✅', style: { background: '#1a1040', color: '#f9fafb', border: '1px solid rgba(34,197,94,0.3)' } });
  };
  const handleDecline = (taskId) => {
    declineTask(taskId);
    toast('Task declined', { icon: '❌', style: { background: '#1a1040', color: '#f9fafb', border: '1px solid rgba(239,68,68,0.3)' } });
  };

  const filterActive = {
    all: 'border-[var(--color-primary-500)] bg-[rgba(99,102,241,0.1)] text-[var(--color-text-primary)]',
    critical: 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[var(--color-priority-critical)]',
    medium: 'border-[rgba(234,179,8,0.4)] bg-[rgba(234,179,8,0.12)] text-[var(--color-priority-medium)]',
    low: 'border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.12)] text-[var(--color-priority-low)]',
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ];

  return (
    <div className="max-w-[800px] mx-auto px-6 pt-7 pb-20 relative z-[1] max-md:px-4">
      {/* Header */}
      <motion.div className="flex items-start justify-between gap-5 mb-8 max-md:flex-col max-md:gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center bg-[rgba(99,102,241,0.12)] text-[var(--color-primary-400)] rounded-xl shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <Bell size={26} />
          </div>
          <div>
            <h1 className="text-[1.8rem] font-black tracking-tight max-md:text-[1.4rem]">Task Alerts</h1>
            <p className="text-[0.9rem] font-medium text-[var(--color-text-muted)] mt-1">Real-time incoming tasks. Accept to begin your assignment.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[var(--color-priority-critical)] text-[0.75rem] font-black tracking-[0.15em] shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.1)] uppercase">
          <span className="relative w-2.5 h-2.5">
            <span className="absolute inset-0 bg-[var(--color-priority-critical)] rounded-full animate-ping opacity-75" />
            <span className="absolute inset-0 bg-[var(--color-priority-critical)] rounded-full shadow-[0_0_8px_var(--color-priority-critical)]" />
          </span>
          LIVE
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div className="flex items-center gap-2 mb-6 pb-5 border-b border-[var(--color-border-glass)] flex-wrap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Filter size={16} className="text-[var(--color-text-muted)] mr-1" />
        {filters.map((f) => (
          <motion.button
            key={f.key}
            className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full text-[0.78rem] font-semibold border transition-all
              ${priorityFilter === f.key ? filterActive[f.key] : 'border-[var(--color-border-glass)] text-[var(--color-text-muted)] bg-[var(--color-bg-glass)] hover:border-[var(--color-border-glass-hover)] hover:text-[var(--color-text-secondary)]'}`}
            onClick={() => setPriorityFilter(f.key)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            {f.key !== 'all' && <span className={`w-[7px] h-[7px] rounded-full priority-glow-${f.key}`} />}
            {f.label}
            {f.key === 'all' && <span className="bg-[rgba(99,102,241,0.2)] px-[7px] py-px rounded-full text-[0.7rem]">{tasks.filter(t => t.status === 'pending').length}</span>}
          </motion.button>
        ))}
      </motion.div>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {pendingTasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} showActions onAccept={handleAccept} onDecline={handleDecline} />
          ))}
        </AnimatePresence>
        {pendingTasks.length === 0 && (
          <motion.div className="flex flex-col items-center text-center py-[60px] px-6 rounded-2xl border border-dashed border-[var(--color-border-glass)] bg-[var(--color-bg-glass)]" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div className="w-20 h-20 flex items-center justify-center bg-[rgba(99,102,241,0.1)] text-[var(--color-primary-400)] rounded-full mb-4 animate-float">
              <Zap size={48} />
            </div>
            <h3 className="text-[1.1rem] font-bold mb-1.5">All Clear!</h3>
            <p className="text-[0.85rem] text-[var(--color-text-muted)] max-w-[320px] leading-relaxed">No pending tasks at the moment. Stay alert — new tasks will appear here automatically.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
