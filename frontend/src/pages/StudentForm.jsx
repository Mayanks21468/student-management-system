import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const initialState = {
  name: "",
  rollNumber: "",
  email: "",
  phone: "",
  course: "",
  semester: 1,
  class: "",
  gender: "Other",
  address: "",
  status: "Active",
};

const StudentForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data)).catch(() => {});
    if (isEdit) {
      const fetchStudent = async () => {
        try {
          const { data } = await api.get(`/students/${id}`);
          setForm({
            name: data.name || "",
            rollNumber: data.rollNumber || "",
            email: data.email || "",
            phone: data.phone || "",
            course: data.course || "",
            semester: data.semester || 1,
            class: data.class || "",
            gender: data.gender || "Other",
            address: data.address || "",
            status: data.status || "Active",
          });
        } catch (err) {
          setError("Failed to load student details");
        }
      };
      fetchStudent();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, class: form.class || null };
      if (isEdit) {
        await api.put(`/students/${id}`, payload);
      } else {
        await api.post("/students", payload);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? "Edit Student" : "Add New Student"}</h1>
      {error && <p className="error-text">{error}</p>}
      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Roll Number</label>
            <input
              name="rollNumber"
              value={form.rollNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
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
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Course</label>
            <input name="course" value={form.course} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Semester</label>
            <input
              type="number"
              name="semester"
              min={1}
              max={12}
              value={form.semester}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Class</label>
            <select name="class" value={form.class} onChange={handleChange}>
              <option value="">Unassigned</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.section}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={3} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Student" : "Add Student"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
