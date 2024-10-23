const express = require('express');
const router = express.Router();
const { requireAuth, checkRole } = require('../middleware/auth');

// Apply middleware to all teacher routes
router.use(requireAuth, checkRole(['teacher']));

router.get('/dashboard', async (req, res) => {
  try {
      const db = require('../config/database');
      const courses = await db.query(
          `SELECT 
              c.*,
              m.name as major_name
           FROM courses c
           LEFT JOIN majors m ON c.major_id = m.id
           WHERE c.teacher_id = $1
           ORDER BY c.name`,
          [req.session.user.id]
      );
      
      console.log('Found teacher courses:', courses.rows); // Debug log
      
      res.render('teacher/dashboard', {
          user: req.session.user,
          courses: courses.rows,
          path: '/teacher/dashboard'
      });
  } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('error', { 
          message: 'Error fetching courses',
          path: '/teacher/dashboard'
      });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const db = require('../config/database');
    const courses = await db.query(
      'SELECT * FROM courses WHERE teacher_id = $1',
      [req.session.user.id]
    );
    res.render('teacher/courses', { 
      courses: courses.rows,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { message: 'Error fetching courses' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const { name, description, major_id, max_capacity } = req.body;
    const db = require('../config/database');
    await db.query(
      `INSERT INTO courses 
       (name, description, major_id, teacher_id, max_capacity, status, current_enrollment)
       VALUES ($1, $2, $3, $4, $5, 'active', 0)`,
      [name, description, major_id, req.session.user.id, max_capacity]
    );
    res.redirect('/teacher/courses');
  } catch (error) {
    res.status(500).render('teacher/courses', { 
      error: 'Error creating course',
      user: req.session.user 
    });
  }
});

router.post('/courses/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = require('../config/database');
    await db.query(
      'UPDATE courses SET status = $1 WHERE id = $2 AND teacher_id = $3',
      [status, req.params.id, req.session.user.id]
    );
    res.redirect('/teacher/courses');
  } catch (error) {
    res.status(500).render('error', { message: 'Error updating course status' });
  }
});

router.get('/courses/:id/students', async (req, res) => {
  try {
    const db = require('../config/database');
    const enrolled = await db.query(
      `SELECT users.* FROM users 
       JOIN course_registrations ON users.id = course_registrations.student_id
       WHERE course_registrations.course_id = $1 AND course_registrations.status = 'enrolled'`,
      [req.params.id]
    );
    const unenrolled = await db.query(
      `SELECT users.* FROM users 
       JOIN course_registrations ON users.id = course_registrations.student_id
       WHERE course_registrations.course_id = $1 AND course_registrations.status = 'dropped'`,
      [req.params.id]
    );
    res.render('teacher/course-students', {
      enrolled: enrolled.rows,
      unenrolled: unenrolled.rows,
      courseId: req.params.id,
      user: req.session.user
    });
  } catch (error) {
    res.status(500).render('error', { message: 'Error fetching course students' });
  }
});

module.exports = router;
