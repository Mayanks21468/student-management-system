import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const initialState = {
  name: "",
  code: "",
  class: "",
  teacher: "",
  maxMarks: 100,
};

const SubjectForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data)).catch(() => {});
    api.get("/teachers").then(({ data }) => setTeachers(data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/subjects", { ...form, teacher: form.teacher || null });
      navigate("/subjects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Add New Subject</h1>
      {error && <p className="error-text">{error}</p>}
      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Subject Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Subject Code</label>
            <input name="code" value={form.code} onChange={handleChange} required />
          </div>
        </div>
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
            <label>Teacher</label>
            <select name="teacher" value={form.teacher} onChange={handleChange}>
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Max Marks</label>
          <input
            type="number"
            name="maxMarks"
            min={1}
            value={form.maxMarks}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Add Subject"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/subjects")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;
