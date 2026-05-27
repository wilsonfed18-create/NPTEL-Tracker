const Course = require('../models/Course');

// ---- HELPER FUNCTION: Calculate assignment score ----
// This function takes the marks array and course type, then returns the score out of 25
const calculateAssignmentScore = (marks, courseType) => {
  let selectedMarks = [];

  if (courseType === '4 weeks') {
    // Use all 4 marks
    selectedMarks = marks.slice(0, 4);
  } else if (courseType === '8 weeks') {
    // Sort descending and pick best 6
    selectedMarks = [...marks].sort((a, b) => b - a).slice(0, 6);
  } else if (courseType === '12 weeks') {
    // Sort descending and pick best 8
    selectedMarks = [...marks].sort((a, b) => b - a).slice(0, 8);
  }

  const selectedCount = selectedMarks.length;
  if (selectedCount === 0) return 0;

  const sum = selectedMarks.reduce((acc, mark) => acc + mark, 0);

  // Formula: (sum of selected marks / (count * 100)) * 25
  const assignmentScore = (sum / (selectedCount * 100)) * 25;

  return parseFloat(assignmentScore.toFixed(2)); // Round to 2 decimal places
};

// ---- HELPER FUNCTION: Get eligibility and certificate info ----
// NPTEL uses a 25% + 75% weightage system:
//   - Assignment score is already out of 25
//   - Exam is conducted out of 100, but counts for 75 marks
//   - So we convert: examScoreOutOf75 = (examMarks / 100) * 75
//   - Final score = assignmentScore (out of 25) + examScoreOutOf75 (out of 75) = out of 100
const getEligibilityInfo = (assignmentScore, examMarks = null) => {
  const isEligible = assignmentScore >= 10;

  let certificate = null;
  let finalScore = null;
  let examScoreOutOf75 = null;

  if (examMarks !== null) {
    // Convert exam marks from out of 100 to out of 75
    examScoreOutOf75 = parseFloat(((examMarks / 100) * 75).toFixed(2));

    // Final score is out of 100 (25 + 75)
    finalScore = parseFloat((assignmentScore + examScoreOutOf75).toFixed(2));

    // All 3 conditions must pass for a certificate
    // examScoreOutOf75 >= 30 means student scored at least 40% in exam (30/75)
    if (assignmentScore >= 10 && examScoreOutOf75 >= 30 && finalScore >= 40) {
      if (finalScore >= 90) certificate = 'Elite + Gold';
      else if (finalScore >= 75) certificate = 'Elite + Silver';
      else if (finalScore >= 60) certificate = 'Elite';
      else if (finalScore >= 40) certificate = 'Successfully Completed';
    } else {
      certificate = 'No Certificate';
    }
  }

  return { isEligible, finalScore, examScoreOutOf75, certificate };
};

// ---- GET all courses for logged-in user ----
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });

    // Add calculated fields to each course before sending
    const coursesWithStats = courses.map((course) => {
      const assignmentScore = calculateAssignmentScore(course.assignmentMarks, course.courseType);
      const { isEligible } = getEligibilityInfo(assignmentScore);

      return {
        ...course.toObject(),
        assignmentScore,
        isEligible
      };
    });

    res.json(coursesWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---- GET single course by ID ----
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const assignmentScore = calculateAssignmentScore(course.assignmentMarks, course.courseType);
    const { isEligible } = getEligibilityInfo(assignmentScore);

    res.json({ ...course.toObject(), assignmentScore, isEligible });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---- CREATE a new course ----
const createCourse = async (req, res) => {
  const { courseName, courseType, assignmentMarks } = req.body;

  try {
    const course = await Course.create({
      userId: req.userId,
      courseName,
      courseType,
      assignmentMarks
    });

    res.status(201).json({ message: 'Course added successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---- UPDATE an existing course ----
const updateCourse = async (req, res) => {
  const { courseName, courseType, assignmentMarks } = req.body;

  try {
    // findOneAndUpdate finds the course by id AND userId (so users can't edit others' courses)
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { courseName, courseType, assignmentMarks },
      { new: true } // Return the updated document
    );

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---- DELETE a course ----
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---- PREDICT score based on exam marks ----
const predictScore = async (req, res) => {
  const { examMarks } = req.body;

  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const assignmentScore = calculateAssignmentScore(course.assignmentMarks, course.courseType);
    const { isEligible, finalScore, examScoreOutOf75, certificate } = getEligibilityInfo(assignmentScore, examMarks);

    // Return both the raw exam marks and the converted score so the frontend can display both
    res.json({ assignmentScore, examMarks, examScoreOutOf75, finalScore, isEligible, certificate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, predictScore };

/*
 * FILE EXPLANATION:
 * This file handles all course-related operations (CRUD + score calculation).
 *
 * calculateAssignmentScore() - Core logic function.
 *   Picks the right marks based on course type (all 4, best 6, or best 8),
 *   then applies the formula: (sum / (count * 100)) * 25 to get score out of 25.
 *
 * getEligibilityInfo() - Checks if student is eligible and what certificate they get.
 *   NPTEL uses 25% assignment + 75% exam weightage.
 *   Exam marks entered out of 100 are converted: examScoreOutOf75 = (examMarks / 100) * 75
 *   Eligibility: assignmentScore >= 10
 *   Certificate conditions: assignmentScore >= 10, examScoreOutOf75 >= 30, finalScore >= 40
 *
 * getCourses() - Returns all courses for the logged-in user with calculated scores.
 * getCourseById() - Returns one specific course.
 * createCourse() - Saves a new course to the database.
 * updateCourse() - Updates an existing course (only if it belongs to the user).
 * deleteCourse() - Removes a course from the database.
 * predictScore() - Takes exam marks as input and predicts the final result.
 */
