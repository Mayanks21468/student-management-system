const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// @desc  Mark attendance for multiple students at once (bulk, for a class on a date)
// @route POST /api/attendance/mark
// @body  { classId, date, records: [{ studentId, status }] }
const markAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records) || !records.length) {
      return res
        .status(400)
        .json({ message: "classId, date, and records[] are required" });
    }

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const results = [];
    for (const record of records) {
      const doc = await Attendance.findOneAndUpdate(
        { student: record.studentId, date: day },
        {
          student: record.studentId,
          class: classId,
          date: day,
          status: record.status,
          markedBy: req.user?._id,
        },
        { upsert: true, new: true, runValidators: true }
      );
      results.push(doc);
    }

    res.status(201).json({ message: "Attendance recorded", records: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc  Get attendance history with optional filters
// @route GET /api/attendance?classId=&studentId=&date=&from=&to=
const getAttendance = async (req, res) => {
  try {
    const { classId, studentId, date, from, to } = req.query;
    const query = {};

    if (classId) query.class = classId;
    if (studentId) query.student = studentId;

    if (date) {
      const day = new Date(date);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: day, $lt: nextDay };
    } else if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const records = await Attendance.find(query)
      .populate("student", "name rollNumber")
      .populate("class", "name section")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get attendance percentage for a single student
// @route GET /api/attendance/percentage/:studentId
const getStudentAttendancePercentage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const total = await Attendance.countDocuments({ student: studentId });
    const present = await Attendance.countDocuments({
      student: studentId,
      status: "Present",
    });
    const percentage = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;

    res.json({ studentId, total, present, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get existing attendance for a class on a specific date (used to pre-fill the marking form)
// @route GET /api/attendance/class/:classId/date/:date
const getClassAttendanceForDate = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const students = await Student.find({ class: classId }).select("name rollNumber");
    const records = await Attendance.find({
      class: classId,
      date: { $gte: day, $lt: nextDay },
    });

    const recordMap = {};
    records.forEach((r) => {
      recordMap[r.student.toString()] = r.status;
    });

    const merged = students.map((s) => ({
      studentId: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      status: recordMap[s._id.toString()] || "Present",
    }));

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendancePercentage,
  getClassAttendanceForDate,
};
