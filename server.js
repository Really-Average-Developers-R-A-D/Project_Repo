// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Add user to all responses
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Root route with authentication check
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

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

// Auth middleware
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Routes
app.use('/', require('./routes/auth'));
app.use('/admin', authMiddleware, require('./routes/admin'));
app.use('/teacher', authMiddleware, require('./routes/teacher'));
app.use('/student', authMiddleware, require('./routes/student'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something went wrong!',
        user: req.session.user 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});