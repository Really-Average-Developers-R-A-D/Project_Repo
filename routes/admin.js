const express = require('express');
const router = express.Router();
const { requireAuth, checkRole } = require('../middleware/auth');

// Apply middleware to all admin routes
router.use(requireAuth, checkRole(['admin']));

router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', { 
      user: req.session.user,
      path: '/admin/dashboard'
  });
});


// Users management
router.get('/users', async (req, res) => {
  try {
    const db = require('../config/database');
    const users = await db.query('SELECT id, username, role FROM users');
    res.render('admin/users', { 
      users: users.rows,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { message: 'Error fetching users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const User = require('../models/user');
    await User.create(username, password, role);
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('admin/users', { 
      error: 'Error creating user',
      user: req.session.user 
    });
  }
});

router.post('/users/:id/delete', async (req, res) => {
  try {
    const db = require('../config/database');
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', { message: 'Error deleting user' });
  }
});

// Majors management
router.get('/majors', async (req, res) => {
  try {
    const db = require('../config/database');
    const majors = await db.query('SELECT * FROM majors');
    res.render('admin/majors', { 
      majors: majors.rows,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { message: 'Error fetching majors' });
  }
});

router.post('/majors', async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = require('../config/database');
    await db.query(
      'INSERT INTO majors (name, description) VALUES ($1, $2)',
      [name, description]
    );
    res.redirect('/admin/majors');
  } catch (error) {
    res.status(500).render('admin/majors', { 
      error: 'Error creating major',
      user: req.session.user 
    });
  }
});

module.exports = router;