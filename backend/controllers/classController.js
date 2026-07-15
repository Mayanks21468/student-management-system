const ClassRoom = require("../models/ClassRoom");
const Student = require("../models/Student");

const getClasses = async (req, res) => {
  try {
    const classes = await ClassRoom.find()
      .populate("classTeacher", "name email")
      .sort({ createdAt: -1 });

    // Attach a student count to each class
    const withCounts = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ class: cls._id });
        return { ...cls.toObject(), studentCount };
      })
    );

    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassById = async (req, res) => {
  try {
    const cls = await ClassRoom.findById(req.params.id).populate(
      "classTeacher",
      "name email"
    );
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const students = await Student.find({ class: cls._id }).select(
      "name rollNumber email status"
    );

    res.json({ ...cls.toObject(), students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const cls = await ClassRoom.create(req.body);
    res.status(201).json(cls);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "This class/section already exists for the given academic year" });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const cls = await ClassRoom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.json(cls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const cls = await ClassRoom.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Unassign students from the deleted class rather than deleting them
    await Student.updateMany({ class: cls._id }, { $set: { class: null } });

    res.json({ message: "Class removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Assign one or more students to a class
// @route PUT /api/classes/:id/assign-students
const assignStudents = async (req, res) => {
  try {
    const { studentIds } = req.body; // array of student _ids
    if (!Array.isArray(studentIds) || !studentIds.length) {
      return res.status(400).json({ message: "studentIds array is required" });
    }

    const cls = await ClassRoom.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { class: cls._id } }
    );

    res.json({ message: `${studentIds.length} student(s) assigned to ${cls.name} ${cls.section}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignStudents,
};
