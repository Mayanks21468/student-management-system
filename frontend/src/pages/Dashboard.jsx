import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import api from "../api/axios";
import StudentTable from "../components/StudentTable";

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async (searchTerm = "") => {
    try {
      setLoading(true);
      const { data } = await api.get("/students", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setStudents(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/students/stats/summary");
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete student");
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/students/new" className="btn btn-primary">
          + Add Student
        </Link>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.total}</h3>
              <p>Total Students</p>
            </div>
            <div className="stat-card stat-active">
              <h3>{stats.totalTeachers}</h3>
              <p>Total Teachers</p>
            </div>
            <div className="stat-card stat-graduated">
              <h3>{stats.totalClasses}</h3>
              <p>Total Classes</p>
            </div>
            <div className="stat-card stat-inactive">
              <h3>{stats.overallAttendancePercentage}%</h3>
              <p>Attendance Rate</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card stat-active">
              <h3>{stats.active}</h3>
              <p>Active Students</p>
            </div>
            <div className="stat-card stat-graduated">
              <h3>{stats.graduated}</h3>
              <p>Graduated</p>
            </div>
            <div className="stat-card stat-inactive">
              <h3>{stats.inactive}</h3>
              <p>Inactive</p>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Students by Class</h3>
              {stats.byClass?.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.byClass}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="empty-state">No class assignments yet.</p>
              )}
            </div>

            <div className="chart-card">
              <h3>Attendance Trend (Last 7 Days)</h3>
              {stats.attendanceTrend?.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={stats.attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Present" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="Absent" stroke="#dc2626" strokeWidth={2} />
                    <Line type="monotone" dataKey="Late" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="empty-state">No attendance recorded yet.</p>
              )}
            </div>
          </div>

          <div className="recent-registrations">
            <h3>Recent Student Registrations</h3>
            {stats.recentRegistrations?.length ? (
              <ul className="recent-list">
                {stats.recentRegistrations.map((r) => (
                  <li key={r._id}>
                    <strong>{r.name}</strong> ({r.rollNumber}) — {r.course} &middot;{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No students registered yet.</p>
            )}
          </div>
        </>
      )}

      <h2 className="section-title">All Students</h2>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name, roll number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-outline">
          Search
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading students...</p>
      ) : (
        <StudentTable students={students} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Dashboard;
