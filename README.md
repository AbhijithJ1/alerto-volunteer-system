# 🚨 Alerto - Volunteer Dispatch System

Alerto is a high-performance, real-time civic intelligence and dispatch management platform designed to cleanly bridge the gap between Crisis Organizers and on-the-ground Volunteers. 

Built beautifully with pure Vanilla HTML/CSS inside a modern React architecture, Alerto proves that you don't need heavy CSS frameworks like Tailwind to build dynamic, responsive, and gorgeous web platforms.

## ✨ Features
- **Multi-Role Dashboards:** Securely isolated command centers tailored specifically for Organizers and Volunteers.
- **Dynamic Task Routing:** A scalable 1-to-many task architecture. Organizers set the volume of volunteers needed; the system automatically thresholds availability.
- **"I'm Interested" Mechanic:** Once tasks hit capacity, volunteers are intelligently redirected to express interest, avoiding rigid lockouts.
- **Pure Stateful Execution:** Heavily optimized local application state using Context APIs running at lightning speed with `localStorage` persistence.
- **Live Leaderboards:** Algorithmic ranking feeds that never unsync from live task completion datasets.
- **Automated Garbage Collection:** Complete pruning of dead notifications and alerts seamlessly tied to the lifecycle hook of task deletion.

## 🚀 Quick Start
To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have Node Package Manager (NPM) installed.
```sh
npm install npm@latest -g
```

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/AbhijithJ1/alerto.git
   ```
2. Navigate to the project directory:
   ```sh
   cd alerto
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```
4. Start the Vite development server:
   ```sh
   npm run dev
   ```

## 🛠️ Stack & Technologies
- **React.js (Vite)** - Foundational UI framework.
- **Vanilla CSS** - All theming, structural logic, and CSS variables done ground-up.
- **React Hot Toast** - For beautiful, lightweight popup notifications.

## 🏗️ Architecture Note
*Disclaimer: Alerto fundamentally operates entirely within the browser via `localStorage`. The application will behave perfectly as a portfolio or simulation. To deploy Alerto into a live environment where separated remote machines can pass tasks seamlessly to each other, simply strap the `AppContext.jsx` action dispatches to a live backend hook system like Firebase or PostgreSQL/WebSockets.*

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
