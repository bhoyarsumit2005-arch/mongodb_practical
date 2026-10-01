const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/StudentManagement";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    email: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

// Get all students, with optional search
app.get("/api/students", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { branch: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const students = await Student.find(filter).sort({ studentId: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one student
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: Number(req.params.id) });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: "Invalid student ID" });
  }
});

// Create student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { studentId: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      studentId: Number(req.params.id)
    });

    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid student ID" });
  }
});

// Dashboard statistics using MongoDB aggregation
app.get("/api/stats", async (req, res) => {
  try {
    const [summary] = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageMarks: { $avg: "$marks" },
          highestMarks: { $max: "$marks" },
          lowestMarks: { $min: "$marks" }
        }
      }
    ]);

    const branchStats = await Student.aggregate([
      {
        $group: {
          _id: "$branch",
          totalStudents: { $sum: 1 },
          averageMarks: { $avg: "$marks" }
        }
      },
      { $sort: { totalStudents: -1 } }
    ]);

    res.json({
      summary: summary || {
        totalStudents: 0,
        averageMarks: 0,
        highestMarks: 0,
        lowestMarks: 0
      },
      branchStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
