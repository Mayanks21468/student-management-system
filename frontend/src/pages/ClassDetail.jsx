import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const ClassDetail = () => {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [classRes, subjectsRes, studentsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/subjects?classId=${id}`),
        api.get(`/students`),
      ]);
      setCls(classRes.data);
      setSubjects(subjectsRes.data);
      setAllStudents(studentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((s) => s !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = async () => {
    if (!selectedStudents.length) return;
    setMessage("");
    setError("");
    try {
      const { data } = await api.put(`/classes/${id}/assign-students`, {
        studentIds: selectedStudents,
      });
      setMessage(data.message);
      setSelectedStudents([]);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign students");
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!cls) return <div className="container"><p className="error-text">{error}</p></div>;

  const unassigned = allStudents.filter(
    (s) => !cls.students.some((cs) => cs._id === s._id)
  );

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>
          {cls.name} - {cls.section}
        </h1>
        <Link to="/classes" className="btn btn-outline">
          Back to Classes
        </Link>
      </div>

      <p>
        <strong>Academic Year:</strong> {cls.academicYear} &nbsp;|&nbsp;
        <strong> Class Teacher:</strong> {cls.classTeacher?.name || "Unassigned"}
      </p>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <h2 className="section-title">Subjects</h2>
      {subjects.length ? (
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Code</th>
                <th>Teacher</th>
                <th>Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>{s.teacher?.name || "Unassigned"}</td>
                  <td>{s.maxMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">
          No subjects yet. <Link to="/subjects/new">Add one</Link>
        </p>
      )}

      <h2 className="section-title">Enrolled Students ({cls.students.length})</h2>
      {cls.students.length ? (
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
              {cls.students.map((s) => (
                <tr key={s._id}>
                  <td>{s.rollNumber}</td>
                  <td>{s.name}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">No students assigned yet.</p>
      )}

      <h2 className="section-title">Assign Students to this Class</h2>
      {unassigned.length ? (
        <>
          <div className="checkbox-list">
            {unassigned.map((s) => (
              <label key={s._id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(s._id)}
                  onChange={() => toggleStudent(s._id)}
                />
                {s.name} ({s.rollNumber})
              </label>
            ))}
          </div>
          <button
            className="btn btn-primary"
            disabled={!selectedStudents.length}
            onClick={handleAssign}
          >
            Assign Selected ({selectedStudents.length})
          </button>
        </>
      ) : (
        <p className="empty-state">All students are already assigned to a class.</p>
      )}
    </div>
  );
};

export default ClassDetail;
