// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Login page route
router.get('/login', (req, res) => {
    // Check if user is already logged in
    if (req.session.user) {
        switch (req.session.user.role) {
            case 'admin':
                return res.redirect('/admin/dashboard');
            case 'teacher':
                return res.redirect('/teacher/dashboard');
            case 'student':
                return res.redirect('/student/dashboard');
            default:
                return res.redirect('/');
        }
    }
    res.render('login', { layout: false });
});

// Login process route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.render('login', {
                layout: false,
                error: 'Username and password are required'
            });
        }

        // Get user from database
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        const user = result.rows[0];

        // Validate user and password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', {
                layout: false,
                error: 'Invalid username or password'
            });
        }

        // Set user session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        // Save session and redirect
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('login', {
                    layout: false,
                    error: 'Authentication error'
                });
            }

            // Redirect based on role
            switch (user.role) {
                case 'admin':
                    res.redirect('/admin/dashboard');
                    break;
                case 'teacher':
                    res.redirect('/teacher/dashboard');
                    break;
                case 'student':
                    res.redirect('/student/dashboard');
                    break;
                default:
                    res.redirect('/login');
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            layout: false,
            error: 'An unexpected error occurred'
        });
    }
});

// Change password page route
router.get('/change-password', requireAuth, (req, res) => {
    try {
        res.render('change-password', {
            user: req.session.user,
            path: '/change-password'
        });
    } catch (error) {
        console.error('Change password page error:', error);
        res.redirect('/');
    }
});

// Change password process route
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.render('change-password', {
                error: 'All fields are required',
                user: req.session.user,
                path: '/change-password'
            });
        }

        // Validate new password
        if (newPassword !== confirmPassword) {
            return res.render('change-password', {
                error: 'New passwords do not match',
                user: req.session.user,
                path: '/change-password'
            });
        }

        

        // Get user from database
        const result = await db.query(
            'SELECT * FROM users WHERE id = $1',
            [req.session.user.id]
        );

        const user = result.rows[0];

        if (!user) {
            return res.render('change-password', {
                error: 'User not found',
                user: req.session.user,
                path: '/change-password'
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.render('change-password', {
                error: 'Current password is incorrect',
                user: req.session.user,
                path: '/change-password'
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, user.id]
        );

        // Show success message
        res.render('change-password', {
            success: 'Password successfully changed',
            user: req.session.user,
            path: '/change-password'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.render('change-password', {
            error: 'An error occurred while changing password',
            user: req.session.user,
            path: '/change-password'
        });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Dashboard redirect route
router.get('/dashboard', requireAuth, (req, res) => {
    switch (req.session.user.role) {
        case 'admin':
            res.redirect('/admin/dashboard');
            break;
        case 'teacher':
            res.redirect('/teacher/dashboard');
            break;
        case 'student':
            res.redirect('/student/dashboard');
            break;
        default:
            res.redirect('/login');
    }
});

module.exports = router;