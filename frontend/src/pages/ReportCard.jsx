import { useEffect, useState } from "react";
import api from "../api/axios";

const ReportCard = () => {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [examType, setExamType] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/students").then(({ data }) => setStudents(data)).catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const params = examType ? { examType } : {};
      const { data } = await api.get(`/marks/report-card/${studentId}`, { params });
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate report card");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="container">
      <h1>Report Card</h1>

      <form className="student-form" onSubmit={handleGenerate} style={{ maxWidth: "100%" }}>
        <div className="form-row">
          <div className="form-group">
            <label>Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Exam Type (optional)</label>
            <input
              placeholder="Leave blank for all exams"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Generating..." : "Generate Report Card"}
          </button>
        </div>
      </form>

      {error && <p className="error-text">{error}</p>}

      {report && (
        <div className="report-card">
          <div className="dashboard-header">
            <h2>
              {report.student.name} ({report.student.rollNumber})
            </h2>
            <button className="btn btn-outline" onClick={handlePrint}>
              Print
            </button>
          </div>

          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.subject}</td>
                    <td>{s.examType}</td>
                    <td>
                      {s.marksObtained} / {s.totalMarks}
                    </td>
                    <td>{s.percentage}%</td>
                    <td>
                      <span className="badge badge-active">{s.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stats-grid" style={{ marginTop: 20 }}>
            <div className="stat-card">
              <h3>
                {report.totalObtained} / {report.totalMax}
              </h3>
              <p>Total Marks</p>
            </div>
            <div className="stat-card stat-active">
              <h3>{report.overallPercentage}%</h3>
              <p>Overall Percentage</p>
            </div>
            <div className="stat-card stat-graduated">
              <h3>{report.overallGrade}</h3>
              <p>Overall Grade</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
