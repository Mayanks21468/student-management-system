import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/teachers");
      setTeachers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete teacher");
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Teachers</h1>
        <Link to="/teachers/new" className="btn btn-primary">
          + Add Teacher
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading teachers...</p>
      ) : !teachers.length ? (
        <p className="empty-state">No teachers found. Add one to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Qualification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.phone || "-"}</td>
                  <td>{t.qualification || "-"}</td>
                  <td>
                    <span className={`badge badge-${t.status.toLowerCase()}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/teachers/edit/${t._id}`} className="btn btn-small">
                      Edit
                    </Link>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherList;
