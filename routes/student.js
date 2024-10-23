const express = require('express');
const router = express.Router();
const { requireAuth, checkRole } = require('../middleware/auth');

// Apply middleware to all student routes
router.use(requireAuth, checkRole(['student']));

router.get('/dashboard', async (req, res) => {
  try {
      const db = require('../config/database');
      const registrations = await db.query(
          `SELECT 
              c.*,
              u.first_name as teacher_first_name,
              u.last_name as teacher_last_name
           FROM courses c
           JOIN course_registrations cr ON c.id = cr.course_id
           JOIN users u ON c.teacher_id = u.id
           WHERE cr.student_id = $1
           AND cr.status = 'enrolled'
           ORDER BY c.name`,
          [req.session.user.id]
      );
      
      console.log('Found registrations:', registrations.rows); // Debug log
      
      res.render('student/dashboard', {
          user: req.session.user,
          registrations: registrations.rows,
          path: '/student/dashboard'
      });
  } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('error', { 
          message: 'Error fetching courses',
          path: '/student/dashboard'
      });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const db = require('../config/database');
    const student = await db.query(
      'SELECT major_id FROM students WHERE user_id = $1',
      [req.session.user.id]
    );
    
    const courses = await db.query(
      `SELECT * FROM courses 
       WHERE major_id = $1 
       AND status = 'active' 
       AND current_enrollment < max_capacity`,
      [student.rows[0].major_id]
    );
    
    res.render('student/courses', { 
      courses: courses.rows,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { message: 'Error fetching courses' });
  }
});



router.post('/courses/:id/register', async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Check if course has available capacity
    const course = await db.query(
      'SELECT * FROM courses WHERE id = $1 AND status = \'active\'',
      [req.params.id]
    );
    
    if (!course.rows[0] || course.rows[0].current_enrollment >= course.rows[0].max_capacity) {
      throw new Error('Course is full or inactive');
    }
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Add registration
    await db.query(
      `INSERT INTO course_registrations (course_id, student_id, status)
       VALUES ($1, $2, 'enrolled')`,
      [req.params.id, req.session.user.id]
    );
    
    // Update course enrollment
    await db.query(
      'UPDATE courses SET current_enrollment = current_enrollment + 1 WHERE id = $1',
      [req.params.id]
    );
    
    await db.query('COMMIT');
    res.redirect('/student/registered');
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).render('error', { message: 'Error registering for course' });
  }
});

router.post('/courses/:id/drop', async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Update registration status
    await db.query(
      `UPDATE course_registrations 
       SET status = 'dropped' 
       WHERE course_id = $1 AND student_id = $2`,
      [req.params.id, req.session.user.id]
    );
    
    // Update course enrollment
    await db.query(
      'UPDATE courses SET current_enrollment = current_enrollment - 1 WHERE id = $1',
      [req.params.id]
    );
    
    await db.query('COMMIT');
    res.redirect('/student/registered');
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).render('error', { message: 'Error dropping course' });
  }
});

module.exports = router;

