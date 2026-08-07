# CRAVE.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Crave is a minimalist, full-stack food ordering application designed with a strict high-contrast editorial aesthetic. Engineered entirely from scratch as a collaborative two-developer pair project, it features a fluid React Native frontend natively animated via Reanimated, backed by a robust transactional Node.js/Express API and a managed PostgreSQL database.

The current architecture prioritizes rapid execution, end-to-end functionality, and raw SQL performance, with a definitive roadmap mapped out for enterprise-level scaling.

---

## Technical Stack

**Frontend Architecture:**
* **Framework:** React Native managed by Expo
* **Navigation:** Expo Router
* **State Management:** Native React Context API (`AuthContext`, `CartContext`, `MenuContext`)
* **3D Graphics & WebGL:** Three.js via `react-native-webview` for hardware-accelerated 3D live map rendering
* **Design System:** Custom Brutalist/Editorial UI (Ink Black, Alabaster, Terracotta `#C45D4A`)

**Backend Architecture:**
* **Runtime:** Node.js with Express.js
* **Database:** PostgreSQL (Hosted via Supabase)
* **Caching & Auth:** In-memory menu caching & JWT bearer token middleware
* **Data Access:** Native `pg` connection pool with PostgreSQL JSON aggregation (`json_agg`, `json_build_object`)
* **Deployment:** Render PaaS

---

## Current Implementation

### Core Systems
- [x] **Secure Authentication:** End-to-end JWT-based login and registration system with auth middleware.
- [x] **In-Memory Caching:** Server-side menu caching for fast responses and low database load.
- [x] **Dynamic Catalog:** Real-time menu fetching mapped directly from the cloud database.
- [x] **Global State Cart:** Per-item +/- steppers, swipe-to-delete gestures, and lightweight context providers.
- [x] **Transactional Checkout:** Atomic SQL transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) ensuring order data and order items write concurrently without corruption.
- [x] **Itemized Historical Ledger:** Enriched order cards displaying complete item breakdowns, line subtotals, and live status badges.
- [x] **3D Live Delivery Tracking:** Interactive 3D low-poly city map with a delivery bike & cyclist courier model, Dijkstra minimum-distance shortest-path routing, destination randomization, and synchronized database status updates.

### UI / UX
- [x] **Editorial Design Language:** Minimalist layout with sharp ALL-CAPS typography, terracotta accents, and zero frame-drops.
- [x] **Mounting Animations:** Subtle staggered fade-ins and interactive gestures for high-fidelity user feedback.
- [x] **Dynamic Calculations:** Real-time basket tallying, live telemetry (distance, speed, street, ETA), and status updates.

---

## Future Roadmap (Enterprise Scaling)

While the current stack is highly functional, the architecture is designed to iteratively adopt enterprise-grade design patterns.

- [ ] **Advanced State Management:** Migrate from React Context to **Zustand** or **Redux Toolkit** to prevent unnecessary re-renders as the app scales.
- [ ] **Database ORM Integration:** Implement **Prisma** or **Drizzle ORM** for type-safe database queries and automated schema migrations.
- [ ] **Infrastructure Security:** Implement API **Rate Limiting** (e.g., `express-rate-limit`) to protect against DDoS and brute-force attacks.
- [ ] **Caching Layer:** Introduce **Redis** to cache static menu items, significantly reducing PostgreSQL query loads.
- [ ] **Optimistic UI Updates:** Refactor cart logic to utilize optimistic updates for zero-latency user interactions.
- [ ] **CI/CD Pipelines:** Implement GitHub Actions for automated linting, testing, and cloud deployment.

---

## Getting Started

Follow these steps to run CRAVE. on your local machine.

### Prerequisites
* Node.js (v18+)
* npm or yarn
* Expo Go app on your physical mobile device
* A PostgreSQL instance (Local or Supabase)

### 1. Backend Setup
Clone the repository and spin up the Node environment.

```bash
git clone https://github.com/ukasha167/CRAVE..git
cd CRAVE.

cd backend
npm install
```

Create a `.env` file in the `backend` directory and add your credentials:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres
JWT_SECRET=your_super_secret_key
PORT=3000
```

Start the server:

```bash
npm start
```

### 2. Frontend Setup

Open a new terminal window and initialize the React Native app.

```bash
cd frontend
npm install
```

*Note: By default, the frontend is configured to point to a live production server. To test locally, update the `API_URL` variable inside your `.tsx` files to point to your local machine's IP address (e.g., `http://192.168.X.X:3000/api`).*

Start the Expo bundler:

```bash
npx expo start -c
```

Scan the QR code to launch the application.

---

## License

This project is open-source and available under the MIT License.
