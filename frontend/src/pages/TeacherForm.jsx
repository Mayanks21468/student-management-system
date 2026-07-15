import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const initialState = {
  name: "",
  email: "",
  phone: "",
  qualification: "",
  status: "Active",
};

const TeacherForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/teachers/${id}`)
        .then(({ data }) =>
          setForm({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            qualification: data.qualification || "",
            status: data.status || "Active",
          })
        )
        .catch(() => setError("Failed to load teacher details"));
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
      if (isEdit) {
        await api.put(`/teachers/${id}`, form);
      } else {
        await api.post("/teachers", form);
      }
      navigate("/teachers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? "Edit Teacher" : "Add New Teacher"}</h1>
      {error && <p className="error-text">{error}</p>}
      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Qualification</label>
            <input
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Teacher" : "Add Teacher"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/teachers")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
