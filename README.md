# DispatchIQ — Field Service Scheduler

A full-stack field service management platform built with Next.js 14, MongoDB, Socket.io, and Leaflet maps. Manage jobs, dispatch technicians, and track field activity in real time — all from a dark, professional UI.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=auth0&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=react&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongodb&logoColor=white)

---

## What It Does

| Feature | Description |
|---|---|
| **Job Management** | Create, assign, and track service jobs through a drag-and-drop Kanban board or a calendar view |
| **Live Dispatch Map** | See technician locations and job pins on an interactive map, updated in real time via WebSocket |
| **Real-time Updates** | Every status change, new job, and location ping is pushed instantly to all connected clients |
| **Role-Based Access** | Three roles — Admin, Dispatcher, Technician — each with their own view and permissions |
| **Notifications** | In-app notification bell with live badge count; email notifications on job assignment |
| **Analytics** | Charts for jobs by status/priority, daily trends, and top-performing technicians |
| **Admin Panel** | Full user management: create, update, and deactivate accounts |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript strict mode) |
| Database | MongoDB via Mongoose 8 |
| Auth | NextAuth.js v5 beta (JWT strategy) |
| Real-time | Socket.io on a custom Node HTTP server |
| Maps | Leaflet + React-Leaflet (OpenStreetMap, no API key required) |
| Styling | Tailwind CSS with custom dark design tokens |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Drag & Drop | @dnd-kit |
| Calendar | FullCalendar |
| Charts | Recharts |
| Animation | Framer Motion |
| Email | Nodemailer (console in dev, SMTP in prod) |

---

## Prerequisites

- **Node.js** 18 or later
- **MongoDB** running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas connection string
- **npm** 9 or later

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd fieldServiceScheduler
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root (a template is already provided):

```env
# Auth
NEXTAUTH_SECRET=your-secret-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/dispatchiq

# Socket.io (keep this the same as NEXTAUTH_URL in dev)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Email — leave blank to print emails to the terminal instead of sending them
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@dispatchiq.com
```

> **NEXTAUTH_SECRET** must be at least 32 random characters. Generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Seed the database

This creates 12 demo users and 60 sample jobs in the Oslo area:

```bash
npm run seed
```

You will see login credentials printed at the end:

```
Login credentials:
  Admin:      admin@dispatchiq.com     / admin1234
  Dispatcher: dispatch@dispatchiq.com  / dispatch1234
  Dispatcher: dispatch2@dispatchiq.com / dispatch1234
  Tech 1-8:   tech1@dispatchiq.com … tech8@dispatchiq.com / tech1234
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any of the credentials above.

---

## User Roles

### Admin
- Everything a Dispatcher can do, plus:
- Manage all user accounts (create, edit, deactivate)
- Access the Settings page

### Dispatcher
- View the live dashboard with KPI cards and activity feed
- Create new jobs using the 3-step guided form
- Assign jobs to technicians and reassign them
- Manage jobs via drag-and-drop Kanban board
- View the calendar view of scheduled jobs
- Open the live dispatch map with technician and job locations
- View technician availability and active job counts
- View analytics charts

### Technician
- View jobs assigned to them (Today section highlighted)
- Start, complete, or put jobs on hold
- Log actual duration and completion notes on finishing
- Open job location in Google Maps with one tap
- View their own position on the map

---

## Project Structure

```
fieldServiceScheduler/
├── app/
│   ├── (auth)/login/          # Login page and form
│   ├── (dispatcher)/          # Dispatcher + Admin pages
│   │   ├── dashboard/         # KPI cards, donut chart, live feed
│   │   ├── jobs/              # Kanban board + calendar, filters
│   │   ├── jobs/new/          # 3-step job creation form
│   │   ├── map/               # Live dispatch map
│   │   ├── technicians/       # Technician cards with status
│   │   └── analytics/         # Charts and stats
│   ├── (technician)/          # Technician-only pages
│   │   ├── my-jobs/           # Job list with today section
│   │   └── my-jobs/[id]/      # Job detail + actions
│   ├── (admin)/admin/         # User management + settings
│   └── api/                   # REST API routes
│       ├── jobs/              # CRUD + assign + status update
│       ├── technicians/       # List + location ping
│       ├── notifications/     # Get + mark read
│       ├── analytics/         # Overview + per-technician
│       └── admin/users/       # User management
├── components/
│   ├── ui/                    # Button, Card, Badge, Modal, Input, Avatar…
│   ├── layout/                # Sidebar, Topbar, MobileNav
│   ├── jobs/                  # KanbanBoard, JobCard, JobForm, JobDetailPanel…
│   ├── map/                   # DispatchMap, JobMarker, TechnicianMarker…
│   └── notifications/         # NotificationBell, NotificationDropdown
├── models/                    # Mongoose schemas (User, Job, StatusHistory…)
├── lib/                       # db, auth, socket, mailer, geo, formatters
├── store/                     # Zustand stores (jobs, notifications, map)
├── hooks/                     # useSocket, useJobs, useNotifications, useMap
├── types/                     # Shared TypeScript interfaces
├── scripts/seed.ts            # Database seed script
└── server.ts                  # Custom Node server with Socket.io
```

---

## Key Workflows

### Creating a Job (Dispatcher)
1. Click **New Job** in the Jobs page
2. **Step 1** — Enter title, type (installation / maintenance / repair / inspection / emergency), priority, description, scheduled date, and estimated duration
3. **Step 2** — Enter customer details and address; the map preview auto-geocodes the address using the free Nominatim API
4. **Step 3** — Optionally assign a technician, add notes, and review the summary before submitting
5. The job appears instantly on the Kanban board in the **Unassigned** column; all connected dispatchers receive a live Socket.io event

### Dispatching a Job
- Drag the Kanban card to a new column to update its status
- Open a job's detail panel and use the **Assign Technician** section to set or change the assigned technician
- The technician receives an in-app notification and an email (or a console log in dev mode)

### Completing a Job (Technician)
1. Open the job from **My Jobs**
2. Tap **Start Job** → **Complete Job**
3. A modal asks for actual duration and optional completion notes
4. The status updates in real time on the dispatcher's Kanban board

---

## API Reference

All endpoints require a valid session cookie. Role restrictions are noted.

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/jobs` | All | List jobs (filtered, paginated) |
| POST | `/api/jobs` | Admin, Dispatcher | Create a job |
| GET | `/api/jobs/[id]` | All | Get a single job (with history) |
| PATCH | `/api/jobs/[id]` | Admin, Dispatcher | Update job fields |
| DELETE | `/api/jobs/[id]` | Admin | Soft-cancel a job |
| PATCH | `/api/jobs/[id]/assign` | Admin, Dispatcher | Assign a technician |
| PATCH | `/api/jobs/[id]/status` | All | Update job status |
| GET | `/api/technicians` | Admin, Dispatcher | List technicians with job counts |
| PATCH | `/api/technicians/[id]/location` | All | Update technician GPS location |
| GET | `/api/notifications` | All | Get notifications (unread first) |
| PATCH | `/api/notifications` | All | Mark all notifications as read |
| PATCH | `/api/notifications/[id]` | All | Mark one notification as read |
| GET | `/api/analytics/overview` | Admin, Dispatcher | Dashboard analytics |
| GET | `/api/analytics/technician` | Admin, Dispatcher | Per-technician stats |
| GET | `/api/admin/users` | Admin, Dispatcher | List all users |
| POST | `/api/admin/users` | Admin | Create a user |
| PATCH | `/api/admin/users/[id]` | Admin | Update a user |
| DELETE | `/api/admin/users/[id]` | Admin | Deactivate a user |

---

## Socket.io Events

The custom server (`server.ts`) runs Socket.io on the same port as Next.js.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join:dispatcher` | — | Join the `dispatchers` room |
| `join:technician` | `{ technicianId }` | Join personal technician room |
| `join:user` | `{ userId }` | Join personal user room |
| `location:ping` | `{ technicianId, coordinates, accuracy }` | Send GPS update |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `job:created` | `{ job }` | New job was created |
| `job:assigned` | `{ job }` | Job was assigned to a technician |
| `job:statusChanged` | `{ job }` | Job status was updated |
| `location:update` | `{ technicianId, coordinates, accuracy }` | Technician moved |
| `notification:new` | `{ notification }` | New notification for a user |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run seed` | Seed the database with demo users and jobs |
| `npm run lint` | Run ESLint |

---

## Production Deployment

1. Set all environment variables on your hosting platform (Vercel, Railway, etc.)
2. Use a MongoDB Atlas connection string for `MONGODB_URI`
3. Fill in your SMTP credentials for real email delivery
4. Generate a strong `NEXTAUTH_SECRET`
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SOCKET_URL` to your production domain

> **Note:** The custom `server.ts` (required for Socket.io) means this project **cannot be deployed to Vercel's serverless platform** as-is. Use a platform that supports long-running Node.js processes — Railway, Render, Fly.io, or a VPS work well.

---

## Demo Accounts

These are created by `npm run seed` and can be used immediately:

| Role | Email | Password |
|---|---|---|
| Admin | admin@dispatchiq.com | admin1234 |
| Dispatcher | dispatch@dispatchiq.com | dispatch1234 |
| Dispatcher | dispatch2@dispatchiq.com | dispatch1234 |
| Technician | tech1@dispatchiq.com | tech1234 |
| Technician | tech2@dispatchiq.com | tech1234 |
| Technician | tech3–8 | tech1234 |

---

## License

MIT
