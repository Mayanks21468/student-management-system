import { useEffect, useState } from "react";
import api from "../api/axios";

const AttendanceHistory = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ classId: "", studentId: "", from: "", to: "" });
  const [records, setRecords] = useState([]);
  const [percentage, setPercentage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data)).catch(() => {});
    api.get("/students").then(({ data }) => setStudents(data)).catch(() => {});
  }, []);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPercentage(null);
    try {
      const params = {};
      if (filters.classId) params.classId = filters.classId;
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const { data } = await api.get("/attendance", { params });
      setRecords(data);

      if (filters.studentId) {
        const { data: pctData } = await api.get(
          `/attendance/percentage/${filters.studentId}`
        );
        setPercentage(pctData.percentage);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Attendance History</h1>

      <form className="student-form" onSubmit={handleSearch} style={{ maxWidth: "100%" }}>
        <div className="form-row">
          <div className="form-group">
            <label>Class</label>
            <select name="classId" value={filters.classId} onChange={handleFilterChange}>
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.section}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Student</label>
            <select name="studentId" value={filters.studentId} onChange={handleFilterChange}>
              <option value="">All Students</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>From</label>
            <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>To</label>
            <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {percentage !== null && (
        <p className="success-text">Attendance Percentage: {percentage}%</p>
      )}
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : records.length ? (
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>
                    {r.student?.name} ({r.student?.rollNumber})
                  </td>
                  <td>
                    {r.class?.name} {r.class?.section}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${
                        r.status === "Present"
                          ? "active"
                          : r.status === "Late"
                          ? "inactive"
                          : "graduated"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">Use the filters above to search attendance records.</p>
      )}
    </div>
  );
};

export default AttendanceHistory;
