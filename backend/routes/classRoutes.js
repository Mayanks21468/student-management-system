const express = require("express");
const router = express.Router();
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignStudents,
} = require("../controllers/classController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getClasses).post(createClass);
router.route("/:id").get(getClassById).put(updateClass).delete(deleteClass);
router.put("/:id/assign-students", assignStudents);

module.exports = router;
