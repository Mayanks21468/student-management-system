import { useEffect, useState } from "react";
import api from "../api/axios";

const initialForm = {
  student: "",
  class: "",
  subject: "",
  examType: "",
  marksObtained: "",
  totalMarks: 100,
};

const AddMarks = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.class) {
      api.get(`/classes/${form.class}`).then(({ data }) => setStudents(data.students || []));
      api.get(`/subjects?classId=${form.class}`).then(({ data }) => setSubjects(data));
    } else {
      setStudents([]);
      setSubjects([]);
    }
  }, [form.class]);

  useEffect(() => {
    if (form.student) {
      api.get(`/marks?studentId=${form.student}`).then(({ data }) => setRecords(data));
    } else {
      setRecords([]);
    }
  }, [form.student]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm((prev) => ({ ...initialForm, class: prev.class, student: prev.student }));
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/marks/${editingId}`, {
          marksObtained: Number(form.marksObtained),
          totalMarks: Number(form.totalMarks),
        });
        setMessage("Marks updated successfully!");
      } else {
        await api.post("/marks", {
          ...form,
          marksObtained: Number(form.marksObtained),
          totalMarks: Number(form.totalMarks),
        });
        setMessage("Marks added successfully!");
      }
      const { data } = await api.get(`/marks?studentId=${form.student}`);
      setRecords(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save marks");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setForm((prev) => ({
      ...prev,
      subject: record.subject?._id,
      examType: record.examType,
      marksObtained: record.marksObtained,
      totalMarks: record.totalMarks,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this marks entry?")) return;
    try {
      await api.delete(`/marks/${id}`);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete marks entry");
    }
  };

  return (
    <div className="container">
      <h1>Marks & Results</h1>
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      <form className="student-form" onSubmit={handleSubmit} style={{ maxWidth: "100%" }}>
        <div className="form-row">
          <div className="form-group">
            <label>Class</label>
            <select name="class" value={form.class} onChange={handleChange} required>
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.section}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Student</label>
            <select name="student" value={form.student} onChange={handleChange} required>
              <option value="">Select a student</option>
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
            <label>Subject</label>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              disabled={Boolean(editingId)}
            >
              <option value="">Select a subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Exam Type</label>
            <input
              name="examType"
              placeholder="e.g. Midterm, Final, Unit Test 1"
              value={form.examType}
              onChange={handleChange}
              required
              disabled={Boolean(editingId)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Marks Obtained</label>
            <input
              type="number"
              name="marksObtained"
              min={0}
              value={form.marksObtained}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Marks</label>
            <input
              type="number"
              name="totalMarks"
              min={1}
              value={form.totalMarks}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Marks" : "Add Marks"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {form.student && (
        <>
          <h2 className="section-title">Marks for Selected Student</h2>
          {records.length ? (
            <div className="table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{r.subject?.name}</td>
                      <td>{r.examType}</td>
                      <td>
                        {r.marksObtained} / {r.totalMarks}
                      </td>
                      <td>{r.percentage}%</td>
                      <td>
                        <span className="badge badge-active">{r.grade}</span>
                      </td>
                      <td className="actions">
                        <button className="btn btn-small" onClick={() => handleEdit(r)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDelete(r._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No marks recorded yet for this student.</p>
          )}
        </>
      )}
    </div>
  );
};

export default AddMarks;
