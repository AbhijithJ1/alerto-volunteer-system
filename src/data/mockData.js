// ================= TASKS =================
export const INITIAL_TASKS = [
  {
    id: "task-1",
    type: "Medical Emergency",
    priority: "critical",
    location: "Hall A",
    requiredSkill: "Medical",
    createdAt: new Date(Date.now() - 120000).toISOString(),
    status: "pending",
    acceptedBy: [],
    interestedVolunteers: [],
    declinedBy: [],
    volunteersNeeded: 1,
  },
  {
    id: "task-2",
    type: "Flood Evacuation",
    priority: "critical",
    location: "Gate B",
    requiredSkill: "Rescue",
    createdAt: new Date(Date.now() - 300000).toISOString(),
    status: "pending",
    acceptedBy: [],
    interestedVolunteers: [],
    declinedBy: [],
    volunteersNeeded: 1,
  },
  {
    id: "task-3",
    type: "Supply Distribution",
    priority: "high",
    location: "Hall A",
    requiredSkill: "Logistics",
    createdAt: new Date(Date.now() - 720000).toISOString(),
    status: "pending",
    acceptedBy: [],
    interestedVolunteers: [],
    declinedBy: [],
    volunteersNeeded: 1,
  },
];


// ================= VOLUNTEERS =================
export const INITIAL_VOLUNTEERS = [
  {
    id: "vol-1",
    name: "Priya Krishnan",
    email: "priya@alerto.com",
    password: "priya123",
    role: "volunteer",
    available: true,
    dnd: false,
    location: "Hall A",
    skills: ["Medical", "First Aid"],
    tasksCompleted: 3,
  },
  {
    id: "vol-2",
    name: "Rahul Menon",
    email: "rahul@alerto.com",
    password: "rahul123",
    role: "volunteer",
    available: true,
    dnd: false,
    location: "Gate B",
    skills: ["Rescue", "Crowd Control"],
    tasksCompleted: 5,
  },
  {
    id: "vol-3",
    name: "Arjun Nair",
    email: "arjun@alerto.com",
    password: "arjun123",
    role: "volunteer",
    available: true,
    dnd: false,
    location: "Hall A",
    skills: ["Logistics", "Support"],
    tasksCompleted: 2,
  },
];


// ================= ORGANIZER =================
export const ORGANIZER_ACCOUNT = {
  id: "org-1",
  name: "Alex Morgan",
  email: "admin@alerto.com",
  password: "admin123",
  role: "organizer",
};


// ================= TASK TYPES =================
export const TASK_TYPES = [
  "Medical Emergency",
  "Evacuation Support",
  "Supply Distribution",
  "Shelter Setup",
  "Food Distribution",
  "Water Supply",
  "Crowd Control",
];


// ================= LOCATIONS =================
export const LOCATIONS = [
  "Hall A",
  "Gate B",
  "Main Stage",
  "Registration Desk",
];


// ================= PRIORITY LEVELS =================
export const PRIORITY_LEVELS = ["low", "medium", "high", "critical"];
