const Subject = require("../models/Subject");

const getSubjects = async (req, res) => {
  try {
    const { classId } = req.query;
    const query = {};
    if (classId) query.class = classId;

    const subjects = await Subject.find(query)
      .populate("class", "name section")
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("class", "name section")
      .populate("teacher", "name email");
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "This subject code already exists for the selected class" });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Assign (or change) a teacher for a subject
// @route PUT /api/subjects/:id/assign-teacher
const assignTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId || null },
      { new: true }
    ).populate("teacher", "name email");
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacher,
};
