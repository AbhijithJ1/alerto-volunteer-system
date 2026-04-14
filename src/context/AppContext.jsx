import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { INITIAL_TASKS, INITIAL_VOLUNTEERS, ORGANIZER_ACCOUNT, TASK_TYPES, LOCATIONS } from '../data/mockData';

const AppContext = createContext(null);

const loadPersistedData = (key, defaultData) => {
  const saved = localStorage.getItem(`alerto-${key}`);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return defaultData;
};

const initialState = {
  user: null,
  tasks: loadPersistedData('tasks', INITIAL_TASKS),
  volunteers: loadPersistedData('volunteers', INITIAL_VOLUNTEERS),
  organizer: ORGANIZER_ACCOUNT,
  notifications: loadPersistedData('notifications', []),
  taskTypes: loadPersistedData('taskTypes', TASK_TYPES),
  locations: loadPersistedData('locations', LOCATIONS),
  theme: localStorage.getItem('alerto-theme') || 'dark',
  sidebarCollapsed: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      return { ...state, user: null };

    // --- TASK ACTIONS ---
    case 'ADD_TASK': {
      const newId = `task-${Date.now()}`;
      const newTask = {
        volunteersNeeded: 1,
        ...action.payload,
        id: newId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        acceptedBy: [],
        interestedVolunteers: [],
        declinedBy: [],
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId: newId,
            message: `New task: ${newTask.type} at ${newTask.location}`,
            type: 'info',
            timestamp: Date.now(),
          },
          ...state.notifications,
        ],
      };
    }

    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        notifications: state.notifications.filter((n) => n.taskId !== action.payload),
      };
    }

    case 'ACCEPT_TASK': {
      const taskToAccept = state.tasks.find(t => t.id === action.payload.taskId);
      const volName = state.volunteers.find(v => v.id === action.payload.volunteerId)?.name || 'Volunteer';
      
      const newAcceptedBy = [...(taskToAccept.acceptedBy || []), action.payload.volunteerId];
      // It immediately becomes accepted to organizer if at least 1 person is assigned
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId
            ? { ...t, status: 'accepted', acceptedBy: newAcceptedBy }
            : t
        ),
        volunteers: state.volunteers.map((v) =>
          v.id === action.payload.volunteerId ? { ...v, available: false } : v
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId: action.payload.taskId,
            message: `${volName} accepted: ${taskToAccept?.type} at ${taskToAccept?.location}`,
            type: 'success',
            timestamp: Date.now(),
          },
          ...state.notifications,
        ],
      };
    }

    case 'DECLINE_TASK': {
      const declinedTask = state.tasks.find(t => t.id === action.payload.taskId);
      const volName = state.volunteers.find(v => v.id === action.payload.volunteerId)?.name || 'Volunteer';
      return {
        ...state,
        tasks: state.tasks.map((t) => 
          t.id === action.payload.taskId
            ? { ...t, declinedBy: [...(t.declinedBy || []), action.payload.volunteerId] }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId: action.payload.taskId,
            message: `${volName} declined: ${declinedTask?.type || 'Task'} at ${declinedTask?.location || 'unknown'}`,
            type: 'warning',
            timestamp: Date.now(),
          },
          ...state.notifications,
        ],
      };
    }

    case 'COMPLETE_TASK': {
      const compTask = state.tasks.find(t => t.id === action.payload.taskId);
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId ? { ...t, status: 'completed' } : t
        ),
        volunteers: state.volunteers.map((v) =>
          compTask?.acceptedBy?.includes(v.id)
            ? { ...v, available: true }
            : v
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId: action.payload.taskId,
            message: `Task completed successfully!`,
            type: 'success',
            timestamp: Date.now(),
          },
          ...state.notifications,
        ],
      };
    }

    case 'EXPRESS_INTEREST': {
      const interestTask = state.tasks.find(t => t.id === action.payload.taskId);
      const volName = state.volunteers.find(v => v.id === action.payload.volunteerId)?.name || 'Volunteer';
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === action.payload.taskId
            ? { ...t, interestedVolunteers: [...(t.interestedVolunteers || []), action.payload.volunteerId] }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId: action.payload.taskId,
            message: `${volName} is interested in joining fully-staffed task: ${interestTask?.type}`,
            type: 'info',
            timestamp: Date.now(),
          },
          ...state.notifications,
        ]
      }
    }

    case 'APPROVE_INTEREST': {
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id === action.payload.taskId) {
            return {
              ...t,
              interestedVolunteers: (t.interestedVolunteers || []).filter(vId => vId !== action.payload.volunteerId),
              acceptedBy: [...(t.acceptedBy || []), action.payload.volunteerId],
            };
          }
          return t;
        }),
        volunteers: state.volunteers.map((v) =>
          v.id === action.payload.volunteerId ? { ...v, available: false } : v
        ),
      };
    }

    // --- VOLUNTEER ACTIONS ---
    case 'ADD_VOLUNTEER': {
      const newVol = {
        id: `vol-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        password: action.payload.password,
        role: 'volunteer',
        available: true,
        dnd: false,
        skills: action.payload.skills || [],
        location: action.payload.location || '',
        tasksCompleted: 0,
      };
      return { ...state, volunteers: [...state.volunteers, newVol] };
    }

    case 'DELETE_VOLUNTEER':
      return {
        ...state,
        volunteers: state.volunteers.filter((v) => v.id !== action.payload),
        tasks: state.tasks.map((t) => 
          (t.assignedTo === action.payload && t.status === 'accepted') 
            ? { ...t, status: 'pending', assignedTo: null } 
            : t
        ),
      };

    case 'TOGGLE_AVAILABILITY':
      return {
        ...state,
        volunteers: state.volunteers.map((v) =>
          v.id === action.payload ? { ...v, available: !v.available } : v
        ),
      };

    case 'TOGGLE_DND':
      return {
        ...state,
        volunteers: state.volunteers.map((v) =>
          v.id === action.payload ? { ...v, dnd: !v.dnd } : v
        ),
      };

    // --- DYNAMIC DATA ACTIONS ---
    case 'ADD_TASK_TYPE':
      if (state.taskTypes.includes(action.payload)) return state;
      return { ...state, taskTypes: [...state.taskTypes, action.payload] };
      
    case 'DELETE_TASK_TYPE':
      return { ...state, taskTypes: state.taskTypes.filter((type) => type !== action.payload) };

    case 'ADD_LOCATION':
      if (state.locations.includes(action.payload)) return state;
      return { ...state, locations: [...state.locations, action.payload] };

    case 'DELETE_LOCATION':
      return { ...state, locations: state.locations.filter((loc) => loc !== action.payload) };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('alerto-theme', newTheme);
      return { ...state, theme: newTheme };
    }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync theme to body class — only when user is logged in (dashboard)
  useEffect(() => {
    if (state.user) {
      if (state.theme === 'light') {
        document.body.classList.add('light');
      } else {
        document.body.classList.remove('light');
      }
    } else {
      // Always dark on landing/login
      document.body.classList.remove('light');
    }
  }, [state.theme, state.user]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('alerto-tasks', JSON.stringify(state.tasks));
    localStorage.setItem('alerto-volunteers', JSON.stringify(state.volunteers));
    localStorage.setItem('alerto-notifications', JSON.stringify(state.notifications));
    localStorage.setItem('alerto-taskTypes', JSON.stringify(state.taskTypes));
    localStorage.setItem('alerto-locations', JSON.stringify(state.locations));
  }, [state.tasks, state.volunteers, state.notifications, state.taskTypes, state.locations]);

  const login = useCallback((user) => dispatch({ type: 'LOGIN', payload: user }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  
  const addTask = useCallback((task) => dispatch({ type: 'ADD_TASK', payload: task }), []);
  const deleteTask = useCallback((taskId) => dispatch({ type: 'DELETE_TASK', payload: taskId }), []);
  const acceptTask = useCallback((taskId, volunteerId) => dispatch({ type: 'ACCEPT_TASK', payload: { taskId, volunteerId } }), []);
  const declineTask = useCallback((taskId, volunteerId) => dispatch({ type: 'DECLINE_TASK', payload: { taskId, volunteerId } }), []);
  const completeTask = useCallback((taskId, volunteerId) => dispatch({ type: 'COMPLETE_TASK', payload: { taskId, volunteerId } }), []);
  const expressInterest = useCallback((taskId, volunteerId) => dispatch({ type: 'EXPRESS_INTEREST', payload: { taskId, volunteerId } }), []);
  const approveInterest = useCallback((taskId, volunteerId) => dispatch({ type: 'APPROVE_INTEREST', payload: { taskId, volunteerId } }), []);
  
  const addVolunteer = useCallback((vol) => dispatch({ type: 'ADD_VOLUNTEER', payload: vol }), []);
  const deleteVolunteer = useCallback((id) => dispatch({ type: 'DELETE_VOLUNTEER', payload: id }), []);
  const toggleAvailability = useCallback((volunteerId) => dispatch({ type: 'TOGGLE_AVAILABILITY', payload: volunteerId }), []);
  const toggleDnd = useCallback((volunteerId) => dispatch({ type: 'TOGGLE_DND', payload: volunteerId }), []);
  
  const addTaskType = useCallback((type) => dispatch({ type: 'ADD_TASK_TYPE', payload: type }), []);
  const deleteTaskType = useCallback((type) => dispatch({ type: 'DELETE_TASK_TYPE', payload: type }), []);
  const addLocation = useCallback((loc) => dispatch({ type: 'ADD_LOCATION', payload: loc }), []);
  const deleteLocation = useCallback((loc) => dispatch({ type: 'DELETE_LOCATION', payload: loc }), []);

  const dismissNotification = useCallback((id) => dispatch({ type: 'DISMISS_NOTIFICATION', payload: id }), []);
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);

  // Authentication helper
  const authenticate = useCallback((email, password) => {
    // Check organizer
    if (email === state.organizer.email && password === state.organizer.password) {
      return { success: true, user: { id: state.organizer.id, name: state.organizer.name, email: state.organizer.email, role: 'organizer' } };
    }
    // Check volunteers
    const vol = state.volunteers.find(v => v.email === email && v.password === password);
    if (vol) {
      return { success: true, user: { id: vol.id, name: vol.name, email: vol.email, role: 'volunteer' } };
    }
    return { success: false, user: null };
  }, [state.organizer, state.volunteers]);

  const value = {
    ...state,
    login,
    logout,
    addTask,
    deleteTask,
    acceptTask,
    declineTask,
    completeTask,
    expressInterest,
    approveInterest,
    addVolunteer,
    deleteVolunteer,
    toggleAvailability,
    toggleDnd,
    addTaskType,
    deleteTaskType,
    addLocation,
    deleteLocation,
    dismissNotification,
    toggleTheme,
    toggleSidebar,
    authenticate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
