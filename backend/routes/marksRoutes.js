const express = require("express");
const router = express.Router();
const {
  addMarks,
  updateMarks,
  deleteMarks,
  getMarks,
  getReportCard,
} = require("../controllers/marksController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/report-card/:studentId", getReportCard);
router.route("/").get(getMarks).post(addMarks);
router.route("/:id").put(updateMarks).delete(deleteMarks);

module.exports = router;
