import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, teachersRes] = await Promise.all([
        api.get("/subjects"),
        api.get("/teachers"),
      ]);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete subject");
    }
  };

  const handleAssignTeacher = async (subjectId, teacherId) => {
    try {
      const { data } = await api.put(`/subjects/${subjectId}/assign-teacher`, {
        teacherId: teacherId || null,
      });
      setSubjects((prev) => prev.map((s) => (s._id === subjectId ? data : s)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign teacher");
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Subjects</h1>
        <Link to="/subjects/new" className="btn btn-primary">
          + Add Subject
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading subjects...</p>
      ) : !subjects.length ? (
        <p className="empty-state">No subjects found. Add one to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Code</th>
                <th>Class</th>
                <th>Max Marks</th>
                <th>Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>
                    {s.class?.name} {s.class?.section}
                  </td>
                  <td>{s.maxMarks}</td>
                  <td>
                    <select
                      value={s.teacher?._id || ""}
                      onChange={(e) => handleAssignTeacher(s._id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(s._id)}
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

export default SubjectList;
