const express = require("express");
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacher,
} = require("../controllers/subjectController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getSubjects).post(createSubject);
router.route("/:id").get(getSubjectById).put(updateSubject).delete(deleteSubject);
router.put("/:id/assign-teacher", assignTeacher);

module.exports = router;
