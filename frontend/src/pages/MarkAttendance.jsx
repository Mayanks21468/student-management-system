import { useEffect, useState } from "react";
import api from "../api/axios";

const todayStr = () => new Date().toISOString().slice(0, 10);

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data)).catch(() => {});
  }, []);

  const loadStudents = async (classId, selectedDate) => {
    if (!classId || !selectedDate) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.get(`/attendance/class/${classId}/date/${selectedDate}`);
      setRows(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students for this class");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && date) loadStudents(selectedClass, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, date]);

  const updateStatus = (studentId, status) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const markAll = (status) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.post("/attendance/mark", {
        classId: selectedClass,
        date,
        records: rows.map((r) => ({ studentId: r.studentId, status: r.status })),
      });
      setMessage("Attendance saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <h1>Mark Attendance</h1>

      <div className="form-row" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label>Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select a class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.section}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayStr()} />
        </div>
      </div>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading students...</p>
      ) : selectedClass && rows.length ? (
        <>
          <div className="form-actions" style={{ marginBottom: 12 }}>
            <button className="btn btn-outline" onClick={() => markAll("Present")}>
              Mark All Present
            </button>
            <button className="btn btn-outline" onClick={() => markAll("Absent")}>
              Mark All Absent
            </button>
          </div>
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId}>
                    <td>{r.rollNumber}</td>
                    <td>{r.name}</td>
                    <td>
                      <div className="attendance-options">
                        {["Present", "Absent", "Late"].map((status) => (
                          <label key={status} className="radio-item">
                            <input
                              type="radio"
                              name={`status-${r.studentId}`}
                              checked={r.status === status}
                              onChange={() => updateStatus(r.studentId, status)}
                            />
                            {status}
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </>
      ) : selectedClass ? (
        <p className="empty-state">No students assigned to this class yet.</p>
      ) : (
        <p className="empty-state">Select a class and date to begin.</p>
      )}
    </div>
  );
};

export default MarkAttendance;
