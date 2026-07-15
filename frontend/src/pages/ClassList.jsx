import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/classes");
      setClasses(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class? Students will be unassigned, not deleted."))
      return;
    try {
      await api.delete(`/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete class");
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Classes & Sections</h1>
        <Link to="/classes/new" className="btn btn-primary">
          + Add Class
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading classes...</p>
      ) : !classes.length ? (
        <p className="empty-state">No classes found. Add one to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Section</th>
                <th>Academic Year</th>
                <th>Class Teacher</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.section}</td>
                  <td>{c.academicYear}</td>
                  <td>{c.classTeacher?.name || "Unassigned"}</td>
                  <td>{c.studentCount}</td>
                  <td className="actions">
                    <Link to={`/classes/${c._id}`} className="btn btn-small">
                      View
                    </Link>
                    <Link to={`/classes/edit/${c._id}`} className="btn btn-small">
                      Edit
                    </Link>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(c._id)}
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

export default ClassList;
