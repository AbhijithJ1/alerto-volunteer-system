import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle2, Loader2, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { key: 'all', label: 'All Tasks', icon: ClipboardList },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'accepted', label: 'In Progress', icon: Loader2 },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export default function TaskStatusPage() {
  const { user, tasks, completeTask } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const isOrganizer = user?.role === 'organizer';

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (!isOrganizer) filtered = tasks.filter((t) => t.assignedTo === user?.id || t.status === 'pending');
    if (activeTab !== 'all') filtered = filtered.filter((t) => t.status === activeTab);
    return filtered;
  }, [tasks, activeTab, isOrganizer, user?.id]);

  const statusCounts = useMemo(() => {
    const base = isOrganizer ? tasks : tasks.filter((t) => t.assignedTo === user?.id || t.status === 'pending');
    return { all: base.length, pending: base.filter((t) => t.status === 'pending').length, accepted: base.filter((t) => t.status === 'accepted').length, completed: base.filter((t) => t.status === 'completed').length };
  }, [tasks, isOrganizer, user?.id]);

  const total = statusCounts.all || 1;
  const completedPct = Math.round((statusCounts.completed / total) * 100);
  const inProgressPct = Math.round((statusCounts.accepted / total) * 100);
  const pendingPct = Math.round((statusCounts.pending / total) * 100);

  return (
    <div className="max-w-[900px] mx-auto px-6 pt-7 pb-20 relative z-[1] max-md:px-4">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-[1.8rem] font-black tracking-tight gradient-text max-md:text-[1.4rem]">Task Status</h1>
        <p className="text-[0.9rem] font-medium text-[var(--color-text-muted)] mt-1">{isOrganizer ? 'Track all dispatched tasks and their progress.' : 'View your task assignments and their current status.'}</p>
      </motion.div>

      {/* Progress Card */}
      <motion.div className="p-6 glass-card mb-8 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-[1.25rem]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-3.5">
          <BarChart3 size={18} className="text-[var(--color-primary-400)]" />
          <span className="text-[0.85rem] font-semibold flex-1">Overall Progress</span>
          <span className="text-[0.82rem] font-bold text-[var(--color-priority-low)]">{completedPct}% Complete</span>
        </div>
        <div className="flex h-2.5 rounded-full bg-[var(--color-bg-glass)] overflow-hidden gap-0.5">
          <motion.div className="h-full rounded-full bg-[var(--color-priority-low)]" initial={{ width: 0 }} animate={{ width: `${completedPct}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
          <motion.div className="h-full rounded-full bg-[var(--color-primary-400)]" initial={{ width: 0 }} animate={{ width: `${inProgressPct}%` }} transition={{ duration: 0.8, delay: 0.4 }} />
          <motion.div className="h-full rounded-full bg-[var(--color-priority-medium)]" initial={{ width: 0 }} animate={{ width: `${pendingPct}%` }} transition={{ duration: 0.8, delay: 0.5 }} />
        </div>
        <div className="flex gap-5 mt-3 flex-wrap max-md:flex-col max-md:gap-2">
          {[
            { color: 'var(--color-priority-low)', label: `Completed (${statusCounts.completed})` },
            { color: 'var(--color-primary-400)', label: `In Progress (${statusCounts.accepted})` },
            { color: 'var(--color-priority-medium)', label: `Pending (${statusCounts.pending})` },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-[0.75rem] text-[var(--color-text-secondary)]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex gap-2 mb-8 pb-5 border-b border-[var(--color-border-glass)] overflow-x-auto scrollbar-none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <motion.button key={tab.key}
              className={`relative inline-flex items-center gap-2 px-5 py-3 text-[0.85rem] font-bold rounded-[1rem] whitespace-nowrap z-[1] transition-colors
                ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}
              onClick={() => setActiveTab(tab.key)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            >
              <Icon size={16} />
              <span className={isActive ? 'font-black' : 'font-semibold'}>{tab.label}</span>
              <span className={`text-[0.7rem] px-[8px] py-[2px] rounded-full font-black ${isActive ? 'bg-[var(--color-primary-500)] text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-[var(--color-bg-glass)] text-[var(--color-text-muted)] border border-[var(--color-border-glass)]'}`}>
                {statusCounts[tab.key]}
              </span>
              {isActive && (
                <motion.div className="absolute inset-0 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[1rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] -z-[1]" layoutId="tab-bg" transition={{ type: 'spring', stiffness: 350, damping: 25 }} />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} showCompleteAction={!isOrganizer}
              onComplete={(taskId) => { completeTask(taskId, user.id); toast.success('Task marked as complete!', { icon: '🎉', style: { background: '#1a1040', color: '#f9fafb', border: '1px solid rgba(34,197,94,0.3)' } }); }}
            />
          ))}
        </AnimatePresence>
        {filteredTasks.length === 0 && (
          <motion.div className="flex flex-col items-center text-center py-[60px] px-6 rounded-2xl border border-dashed border-[var(--color-border-glass)] bg-[var(--color-bg-glass)]" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-[70px] h-[70px] flex items-center justify-center bg-[rgba(99,102,241,0.1)] text-[var(--color-primary-400)] rounded-full mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-base font-bold mb-1 capitalize">No {activeTab === 'all' ? '' : activeTab} tasks</h3>
            <p className="text-[0.82rem] text-[var(--color-text-muted)] max-w-[300px]">
              {activeTab === 'completed' ? 'Completed tasks will appear here' : activeTab === 'accepted' ? 'No tasks currently in progress' : 'No tasks to show for this filter'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
