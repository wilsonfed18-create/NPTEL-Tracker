const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  predictScore
} = require('../controllers/courseController');

// All routes below are protected - user must be logged in (valid JWT token required)
router.use(protect);

router.get('/', getCourses);               // GET all courses
router.get('/:id', getCourseById);         // GET one course
router.post('/', createCourse);            // CREATE a course
router.put('/:id', updateCourse);          // UPDATE a course
router.delete('/:id', deleteCourse);       // DELETE a course
router.post('/:id/predict', predictScore); // PREDICT score for a course

module.exports = router;

/*
 * FILE EXPLANATION:
 * This file defines all the URL routes for course operations.
 * router.use(protect) means ALL routes in this file require a valid login token.
 * Each route maps to a controller function that handles the actual logic.
 * :id in the URL is a dynamic parameter (the MongoDB course ID).
 * The predict route takes exam marks and returns the predicted final score.
 */
