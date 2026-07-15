const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

// All student routes require a logged-in user
router.use(protect);

router.get("/stats/summary", getStats);
router.route("/").get(getStudents).post(createStudent);
router
  .route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
