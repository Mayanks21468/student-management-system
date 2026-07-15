import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudentForm from "./pages/StudentForm";
import TeacherList from "./pages/TeacherList";
import TeacherForm from "./pages/TeacherForm";
import ClassList from "./pages/ClassList";
import ClassForm from "./pages/ClassForm";
import ClassDetail from "./pages/ClassDetail";
import SubjectList from "./pages/SubjectList";
import SubjectForm from "./pages/SubjectForm";
import MarkAttendance from "./pages/MarkAttendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import AddMarks from "./pages/AddMarks";
import ReportCard from "./pages/ReportCard";

const wrap = (Component) => (
  <PrivateRoute>
    <Component />
  </PrivateRoute>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={wrap(Dashboard)} />
          <Route path="/students/new" element={wrap(StudentForm)} />
          <Route path="/students/edit/:id" element={wrap(StudentForm)} />

          <Route path="/teachers" element={wrap(TeacherList)} />
          <Route path="/teachers/new" element={wrap(TeacherForm)} />
          <Route path="/teachers/edit/:id" element={wrap(TeacherForm)} />

          <Route path="/classes" element={wrap(ClassList)} />
          <Route path="/classes/new" element={wrap(ClassForm)} />
          <Route path="/classes/edit/:id" element={wrap(ClassForm)} />
          <Route path="/classes/:id" element={wrap(ClassDetail)} />

          <Route path="/subjects" element={wrap(SubjectList)} />
          <Route path="/subjects/new" element={wrap(SubjectForm)} />

          <Route path="/attendance/mark" element={wrap(MarkAttendance)} />
          <Route path="/attendance/history" element={wrap(AttendanceHistory)} />

          <Route path="/marks" element={wrap(AddMarks)} />
          <Route path="/report-card" element={wrap(ReportCard)} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
