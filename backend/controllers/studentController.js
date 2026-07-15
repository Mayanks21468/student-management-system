const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const ClassRoom = require("../models/ClassRoom");
const Attendance = require("../models/Attendance");

// @desc  Get all students (supports ?search= & ?course= filters)
// @route GET /api/students
// @access Private
const getStudents = async (req, res) => {
  try {
    const { search, course, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (course) query.course = course;
    if (status) query.status = status;

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single student by ID
// @route GET /api/students/:id
// @access Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a new student
// @route POST /api/students
// @access Private
const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Roll number already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc  Update a student
// @route PUT /api/students/:id
// @access Private
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc  Delete a student
// @route DELETE /api/students/:id
// @access Private
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get dashboard stats
// @route GET /api/students/stats/summary
// @access Private
const getStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const active = await Student.countDocuments({ status: "Active" });
    const graduated = await Student.countDocuments({ status: "Graduated" });
    const inactive = await Student.countDocuments({ status: "Inactive" });

    const byCourse = await Student.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);

    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await ClassRoom.countDocuments();

    // Students grouped by class (for chart)
    const byClassRaw = await Student.aggregate([
      { $match: { class: { $ne: null } } },
      { $group: { _id: "$class", count: { $sum: 1 } } },
    ]);
    const classIds = byClassRaw.map((c) => c._id);
    const classDocs = await ClassRoom.find({ _id: { $in: classIds } }).select("name section");
    const classNameMap = {};
    classDocs.forEach((c) => {
      classNameMap[c._id.toString()] = `${c.name} ${c.section || ""}`.trim();
    });
    const byClass = byClassRaw.map((c) => ({
      className: classNameMap[c._id.toString()] || "Unassigned",
      count: c.count,
    }));

    // Overall attendance percentage (all-time)
    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: "Present" });
    const overallAttendancePercentage =
      totalAttendanceRecords > 0
        ? Number(((presentRecords / totalAttendanceRecords) * 100).toFixed(2))
        : 0;

    // Attendance trend for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendRaw = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const trendMap = {};
    trendRaw.forEach((t) => {
      const day = t._id.date;
      if (!trendMap[day]) trendMap[day] = { date: day, Present: 0, Absent: 0, Late: 0 };
      trendMap[day][t._id.status] = t.count;
    });
    const attendanceTrend = Object.values(trendMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Recent student registrations (last 5)
    const recentRegistrations = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name rollNumber course createdAt");

    res.json({
      total,
      active,
      graduated,
      inactive,
      byCourse,
      totalTeachers,
      totalClasses,
      byClass,
      overallAttendancePercentage,
      attendanceTrend,
      recentRegistrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
};
