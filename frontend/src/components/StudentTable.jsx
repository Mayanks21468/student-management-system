import { Link } from "react-router-dom";

const StudentTable = ({ students, onDelete }) => {
  if (!students.length) {
    return <p className="empty-state">No students found. Add one to get started.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="student-table">
        <thead>
          <tr>
            <th>Roll No.</th>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.rollNumber}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.course}</td>
              <td>{student.semester}</td>
              <td>
                <span className={`badge badge-${student.status.toLowerCase()}`}>
                  {student.status}
                </span>
              </td>
              <td className="actions">
                <Link to={`/students/edit/${student._id}`} className="btn btn-small">
                  Edit
                </Link>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => onDelete(student._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
