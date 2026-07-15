import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🎓 SMS</Link>
      </div>
      {user && (
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Dashboard
          </Link>
          <Link to="/classes" className="nav-link">
            Classes
          </Link>
          <Link to="/subjects" className="nav-link">
            Subjects
          </Link>
          <Link to="/teachers" className="nav-link">
            Teachers
          </Link>
          <Link to="/attendance/mark" className="nav-link">
            Mark Attendance
          </Link>
          <Link to="/attendance/history" className="nav-link">
            Attendance History
          </Link>
          <Link to="/marks" className="nav-link">
            Marks
          </Link>
          <Link to="/report-card" className="nav-link">
            Report Card
          </Link>
          <span className="navbar-user">Hi, {user.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
