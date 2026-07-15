const Marks = require("../models/Marks");
const { getGrade } = require("../utils/grading");

// @desc  Add a marks entry (or reject if duplicate for student+subject+examType)
// @route POST /api/marks
const addMarks = async (req, res) => {
  try {
    const marks = await Marks.create(req.body);
    const populated = await marks.populate("subject", "name code maxMarks");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Marks for this student, subject, and exam type already exist. Use update instead.",
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc  Update an existing marks entry
// @route PUT /api/marks/:id
const updateMarks = async (req, res) => {
  try {
    const marks = await Marks.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("subject", "name code maxMarks");
    if (!marks) return res.status(404).json({ message: "Marks entry not found" });
    res.json(marks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMarks = async (req, res) => {
  try {
    const marks = await Marks.findByIdAndDelete(req.params.id);
    if (!marks) return res.status(404).json({ message: "Marks entry not found" });
    res.json({ message: "Marks entry removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  List marks with optional filters
// @route GET /api/marks?studentId=&classId=&subjectId=&examType=
const getMarks = async (req, res) => {
  try {
    const { studentId, classId, subjectId, examType } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (examType) query.examType = examType;

    const records = await Marks.find(query)
      .populate("student", "name rollNumber")
      .populate("subject", "name code maxMarks")
      .sort({ createdAt: -1 });

    const withGrade = records.map((r) => {
      const percentage = r.totalMarks > 0 ? (r.marksObtained / r.totalMarks) * 100 : 0;
      return {
        ...r.toObject(),
        percentage: Number(percentage.toFixed(2)),
        grade: getGrade(percentage),
      };
    });

    res.json(withGrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Generate a full report card for one student (optionally for one examType)
// @route GET /api/marks/report-card/:studentId?examType=
const getReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { examType } = req.query;

    const query = { student: studentId };
    if (examType) query.examType = examType;

    const records = await Marks.find(query)
      .populate("student", "name rollNumber course class")
      .populate("subject", "name code");

    if (!records.length) {
      return res.status(404).json({ message: "No marks found for this student" });
    }

    let totalObtained = 0;
    let totalMax = 0;

    const subjects = records.map((r) => {
      totalObtained += r.marksObtained;
      totalMax += r.totalMarks;
      const percentage = r.totalMarks > 0 ? (r.marksObtained / r.totalMarks) * 100 : 0;
      return {
        subject: r.subject?.name,
        code: r.subject?.code,
        examType: r.examType,
        marksObtained: r.marksObtained,
        totalMarks: r.totalMarks,
        percentage: Number(percentage.toFixed(2)),
        grade: getGrade(percentage),
      };
    });

    const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    res.json({
      student: records[0].student,
      subjects,
      totalObtained,
      totalMax,
      overallPercentage: Number(overallPercentage.toFixed(2)),
      overallGrade: getGrade(overallPercentage),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addMarks, updateMarks, deleteMarks, getMarks, getReportCard };
