import { useEffect, useRef } from 'react';
import { TASK_TYPES, LOCATIONS } from '../data/mockData';

/**
 * Simulates real-time Firestore-like updates.
 * In production, replace this with onSnapshot listeners.
 */
export function useRealtimeSimulator(addTask, enabled = true) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const priorities = ['low', 'medium', 'critical'];

    const createRandomTask = () => {
      const type = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      addTask({
        type,
        priority,
        location,
        createdBy: 'organizer-sim',
      });
    };

    // Random interval between 12-30 seconds
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 18000;
      intervalRef.current = setTimeout(() => {
        createRandomTask();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [addTask, enabled]);
}
