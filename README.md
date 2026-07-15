# Student Management System (MERN Stack)

A complete full-stack Student Management System built with **MongoDB, Express, React (Vite), and Node.js**. Includes admin authentication (JWT), and full CRUD for student records, connected end-to-end.

## Features

- Admin registration & login (JWT-based auth)
- **Students:** Add / Edit / Delete / View, search, class assignment
- **Course & Class Management:** create classes/sections, assign a class teacher, assign students to a class, add subjects per class, assign teachers to subjects
- **Attendance:** mark attendance per class/date (bulk, Present/Absent/Late), view attendance history with class/student/date-range filters, per-student attendance percentage
- **Marks & Results:** add/update marks per subject and exam type, automatic percentage & letter-grade calculation, printable report cards per student
- **Dashboard:** total students/teachers/classes, attendance rate, students-by-class bar chart, 7-day attendance trend line chart, recent registrations feed
- Protected routes (frontend + backend)
- Clean, responsive UI (no external CSS framework needed)

## Folder Structure

```
student-management-system/
├── backend/                 # Express + MongoDB API
│   ├── config/db.js
│   ├── controllers/         # auth, student, teacher, class, subject, attendance, marks
│   ├── middleware/
│   ├── models/               # User, Student, Teacher, ClassRoom, Subject, Attendance, Marks
│   ├── routes/
│   ├── utils/grading.js      # percentage -> letter grade helper
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/                 # React (Vite) app
    ├── src/
    │   ├── api/axios.js
    │   ├── components/        # Navbar, PrivateRoute, StudentTable
    │   ├── context/AuthContext.jsx
    │   ├── pages/              # Dashboard, Students, Teachers, Classes, Subjects,
    │   │                        # Attendance (mark/history), Marks, Report Card
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── .env.example
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/student_management
PORT=5000
JWT_SECRET=your_own_random_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> If using MongoDB Atlas, replace `MONGO_URI` with your connection string, e.g.
> `mongodb+srv://<user>:<password>@cluster0.mongodb.net/student_management`

Start the backend (with auto-restart):
```bash
npm run dev
```
Or without nodemon:
```bash
npm start
```

The API will run at **http://localhost:5000**. Test it: visit `http://localhost:5000/api/health` — you should see `{"status":"OK", ...}`.

### 2. Frontend Setup

Open a **new terminal** window:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

By default it points to:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

The app will run at **http://localhost:5173**.

### 3. Using the App

1. Open **http://localhost:5173**
2. Click **Register** to create your first admin account
3. Log in

**Recommended order for setting things up the first time:**
1. **Teachers** → add your teachers first
2. **Classes** → create classes/sections and (optionally) assign a class teacher
3. **Students** → add students and assign them to a class
4. **Subjects** → add subjects per class and assign a teacher to each
5. **Attendance** → go to "Mark Attendance," pick a class + date, mark each student
6. **Marks** → go to "Marks," pick a class/student/subject, enter marks per exam
7. **Report Card** → pick a student to generate/print their report card
8. **Dashboard** → view live stats and charts once you have some data in the system

## API Endpoints Reference

| Method | Endpoint                        | Description                | Auth Required |
|--------|----------------------------------|-----------------------------|----------------|
| POST   | /api/auth/register              | Register admin user         | No             |
| POST   | /api/auth/login                 | Login                       | No             |
| GET    | /api/auth/profile                | Get logged-in user profile  | Yes            |
| GET    | /api/students                    | List/search students        | Yes            |
| GET    | /api/students/:id                | Get single student          | Yes            |
| POST   | /api/students                    | Create student               | Yes            |
| PUT    | /api/students/:id                | Update student               | Yes            |
| DELETE | /api/students/:id                | Delete student               | Yes            |
| GET    | /api/students/stats/summary      | Dashboard statistics + charts | Yes           |
| GET    | /api/teachers                    | List teachers                | Yes            |
| POST   | /api/teachers                    | Add teacher                  | Yes            |
| PUT    | /api/teachers/:id                | Update teacher                | Yes           |
| DELETE | /api/teachers/:id                | Delete teacher                | Yes           |
| GET    | /api/classes                     | List classes (with student count) | Yes      |
| GET    | /api/classes/:id                 | Class detail + enrolled students | Yes       |
| POST   | /api/classes                     | Create class/section          | Yes           |
| PUT    | /api/classes/:id                 | Update class                  | Yes           |
| DELETE | /api/classes/:id                 | Delete class (unassigns students) | Yes       |
| PUT    | /api/classes/:id/assign-students | Bulk-assign students to a class | Yes         |
| GET    | /api/subjects?classId=            | List subjects (optionally by class) | Yes     |
| POST   | /api/subjects                    | Add subject to a class        | Yes           |
| PUT    | /api/subjects/:id                | Update subject                | Yes           |
| DELETE | /api/subjects/:id                | Delete subject                | Yes           |
| PUT    | /api/subjects/:id/assign-teacher | Assign/change subject teacher | Yes           |
| POST   | /api/attendance/mark              | Bulk mark attendance for a class/date | Yes    |
| GET    | /api/attendance?classId=&studentId=&date=&from=&to= | Attendance history with filters | Yes |
| GET    | /api/attendance/percentage/:studentId | Attendance percentage for a student | Yes  |
| GET    | /api/attendance/class/:classId/date/:date | Pre-fill list for marking | Yes        |
| GET    | /api/marks?studentId=&classId=&subjectId=&examType= | List marks with grade | Yes    |
| POST   | /api/marks                       | Add marks entry                | Yes           |
| PUT    | /api/marks/:id                   | Update marks entry             | Yes           |
| DELETE | /api/marks/:id                   | Delete marks entry             | Yes           |
| GET    | /api/marks/report-card/:studentId?examType= | Generate report card    | Yes           |

All protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```
(This is handled automatically by the frontend once logged in.)

## Grading Scale

| Percentage | Grade |
|-----------|-------|
| 90–100    | A+    |
| 80–89     | A     |
| 70–79     | B     |
| 60–69     | C     |
| 50–59     | D     |
| 40–49     | E     |
| Below 40  | F     |

You can adjust this scale in `backend/utils/grading.js`.

## Troubleshooting

- **"MongoDB connection error"** → Make sure MongoDB is running locally (`mongod`) or your Atlas `MONGO_URI` and IP whitelist are correct.
- **CORS errors** → Confirm `CLIENT_URL` in backend `.env` matches the URL the frontend is running on.
- **401 Unauthorized on every request** → Your JWT may have expired; log out and log back in.
- **Port already in use** → Change `PORT` in backend `.env` or the Vite port in `vite.config.js`.

## Tech Stack

- **Frontend:** React 18, React Router v6, Vite, Axios
- **Backend:** Node.js, Express 4, Mongoose
- **Database:** MongoDB
- **Auth:** JWT + bcrypt password hashing

## Next Steps / Ideas to Extend

- Add pagination to the student list
- Add role-based access (admin vs staff permissions)
- Add course/teacher management modules
- Add file upload for student photos
- Deploy backend (Render/Railway) + frontend (Vercel/Netlify) + DB (MongoDB Atlas)
