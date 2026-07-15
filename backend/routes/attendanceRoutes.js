const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getStudentAttendancePercentage,
  getClassAttendanceForDate,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/mark", markAttendance);
router.get("/", getAttendance);
router.get("/percentage/:studentId", getStudentAttendancePercentage);
router.get("/class/:classId/date/:date", getClassAttendanceForDate);

module.exports = router;
