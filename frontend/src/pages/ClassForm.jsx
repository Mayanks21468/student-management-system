import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const initialState = {
  name: "",
  section: "A",
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  classTeacher: "",
};

const ClassForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/teachers").then(({ data }) => setTeachers(data)).catch(() => {});
    if (isEdit) {
      api
        .get(`/classes/${id}`)
        .then(({ data }) =>
          setForm({
            name: data.name || "",
            section: data.section || "A",
            academicYear: data.academicYear || "",
            classTeacher: data.classTeacher?._id || "",
          })
        )
        .catch(() => setError("Failed to load class details"));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, classTeacher: form.classTeacher || null };
      if (isEdit) {
        await api.put(`/classes/${id}`, payload);
      } else {
        await api.post("/classes", payload);
      }
      navigate("/classes");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? "Edit Class" : "Add New Class"}</h1>
      {error && <p className="error-text">{error}</p>}
      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Class Name</label>
            <input
              name="name"
              placeholder="e.g. 10th Grade, BSc CS Year 2"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Section</label>
            <input name="section" value={form.section} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Academic Year</label>
            <input
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Class Teacher</label>
            <select name="classTeacher" value={form.classTeacher} onChange={handleChange}>
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Class" : "Add Class"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/classes")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassForm;
