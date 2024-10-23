// setup.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/database');

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '123456789';

// Utility function to execute SQL queries
async function executeQuery(query, params = []) {
    try {
        const result = await pool.query(query, params);
        return result;
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw error;
    }
}

// Function to hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Drop existing tables
async function dropTables() {
    const dropQueries = `
        DROP TABLE IF EXISTS course_registrations CASCADE;
        DROP TABLE IF EXISTS courses CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS majors CASCADE;
    `;
    
    try {
        await executeQuery(dropQueries);
        console.log('Tables dropped successfully');
    } catch (error) {
        console.error('Error dropping tables:', error);
        throw error;
    }
}

// Create tables
async function createTables() {
    const createTablesQuery = `
        CREATE TABLE majors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            phone_number VARCHAR(20),
            office VARCHAR(100),
            major_id INTEGER REFERENCES majors(id),
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE courses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            major_id INTEGER REFERENCES majors(id),
            teacher_id INTEGER REFERENCES users(id),
            max_capacity INTEGER NOT NULL CHECK (max_capacity >= 0),
            current_enrollment INTEGER DEFAULT 0 CHECK (current_enrollment >= 0),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT enrollment_capacity_check CHECK (current_enrollment <= max_capacity)
        );

        CREATE TABLE course_registrations (
            id SERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES users(id),
            course_id INTEGER REFERENCES courses(id),
            status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped')),
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            drop_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(student_id, course_id)
        );
    `;

    try {
        await executeQuery(createTablesQuery);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

// Create triggers
async function createTriggers() {
    const triggerQuery = `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_majors_updated_at
            BEFORE UPDATE ON majors
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_courses_updated_at
            BEFORE UPDATE ON courses
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_course_registrations_updated_at
            BEFORE UPDATE ON course_registrations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
        await executeQuery(triggerQuery);
        console.log('Triggers created successfully');
    } catch (error) {
        console.error('Error creating triggers:', error);
        throw error;
    }
}

// Create indexes
async function createIndexes() {
    const indexQueries = `
        CREATE INDEX idx_users_username ON users(username);
        CREATE INDEX idx_users_role ON users(role);
        CREATE INDEX idx_users_major_id ON users(major_id);
        CREATE INDEX idx_courses_status ON courses(status);
        CREATE INDEX idx_courses_major_id ON courses(major_id);
        CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
        CREATE INDEX idx_course_registrations_student_id ON course_registrations(student_id);
        CREATE INDEX idx_course_registrations_course_id ON course_registrations(course_id);
    `;

    try {
        await executeQuery(indexQueries);
        console.log('Indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error);
        throw error;
    }
}

// Insert sample data
async function insertSampleData() {
    try {
        // Insert majors
        const majors = [
            { name: 'Computer Science', description: 'Study of computation, algorithms, and programming' },
            { name: 'Computer Information Systems', description: 'Study of information systems and data management' },
            { name: 'Cybersecurity', description: 'Study of protecting computer systems and networks' }
        ];

        for (const major of majors) {
            await executeQuery(
                'INSERT INTO majors (name, description) VALUES ($1, $2) RETURNING id',
                [major.name, major.description]
            );
        }
        console.log('Majors inserted successfully');

        // Insert users
        const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
        
        const users = [
            // Admins
            { username: 'admin1', role: 'admin', firstName: 'John', lastName: 'Johnson', phone: '123-456-7890', office: 'A-101' },
            
            // Teachers
            { username: 'drogers', role: 'teacher', firstName: 'Daniel', lastName: 'Rogers', phone: '123-456-7892', office: 'B-101', majorName: 'Computer Science' },
            { username: 'smitra', role: 'teacher', firstName: 'Sandeep', lastName: 'Mitra', phone: '123-456-7893', office: 'B-102', majorName: 'Computer Science' },
            { username: 'eiskrenova', role: 'teacher', firstName: 'Eugeniya', lastName: 'Iskrenova-Ekiert', phone: '123-456-7894', office: 'B-103', majorName: 'Computer Science' },
            
            // Students
            { username: 'tthiele', role: 'student', firstName: 'Trinity', lastName: 'Thiele', phone: '123-456-7895', majorName: 'Computer Science' },
        ];

        for (const user of users) {
            const majorResult = user.majorName ? 
                await executeQuery('SELECT id FROM majors WHERE name = $1', [user.majorName]) :
                { rows: [{ id: null }] };

            await executeQuery(
                `INSERT INTO users (username, password, role, first_name, last_name, phone_number, office, major_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [user.username, hashedPassword, user.role, user.firstName, user.lastName, user.phone, user.office, majorResult.rows[0]?.id]
            );
        }
        console.log('Users inserted successfully');

        // Insert courses
        const courses = [
            { name: 'CSC 401 - Programming Languages', description: 'Study of programming language concepts and paradigms', majorName: 'Computer Science', teacherUsername: 'drogers', maxCapacity: 30 },
            { 
                name: 'CSC 423 - Web App Development', 
                description: 'Covers the basic principles involved in developing Web-based applications that operate with a back-end relational database. Requires team project involving design/setup of database server and development of application interfacing to database.', 
                majorName: 'Computer Science', 
                teacherUsername: 'eiskrenova', 
                maxCapacity: 30 
            },
            { 
                name: 'CSC 427 - Software Engineering', 
                description: 'Provides an introduction to software engineering methodologies and programming-in-the-large. Requires students to work in teams developing a large-scale software product. Develops technical communication and writing skills. Requires extensive programming.', 
                majorName: 'Computer Science', 
                teacherUsername: 'smitra', 
                maxCapacity: 30 
            }, 
            { 
                name: 'CSC 406 - Data Structures and Algorithms', 
                description: 'Covers design and analysis of data structures and associated algorithms using object-oriented methods. Includes these topics: complexity measures, pre-and post-conditions, programming to interfaces, union-find sets, hashing, trees (AVL, splay, B-Trees), graphs, recursion, algorithm design strategies and NP-completeness. Requires extensive programming.', 
                majorName: 'Computer Science', 
                teacherUsername: 'drogers', 
                maxCapacity: 30 
            }
        ];

        for (const course of courses) {
            const majorResult = await executeQuery('SELECT id FROM majors WHERE name = $1', [course.majorName]);
            const teacherResult = await executeQuery('SELECT id FROM users WHERE username = $1', [course.teacherUsername]);

            await executeQuery(
                `INSERT INTO courses (name, description, major_id, teacher_id, max_capacity, status)
                 VALUES ($1, $2, $3, $4, $5, 'active')`,
                [course.name, course.description, majorResult.rows[0].id, teacherResult.rows[0].id, course.maxCapacity]
            );
        }
        console.log('Courses inserted successfully');

        // Insert course registrations
        const registrations = [
            { studentUsername: 'tthiele', courseName: 'CSC 401 - Programming Languages' },
            { studentUsername: 'tthiele', courseName: 'CSC 427 - Software Engineering' },
            { studentUsername: 'tthiele', courseName: 'CSC 423 - Web App Development' },
            { studentUsername: 'tthiele', courseName: 'CSC 406 - Data Structures and Algorithms' },
            
        ];

        for (const reg of registrations) {
            const studentResult = await executeQuery('SELECT id FROM users WHERE username = $1', [reg.studentUsername]);
            const courseResult = await executeQuery('SELECT id FROM courses WHERE name = $1', [reg.courseName]);

            if (!studentResult.rows[0] || !courseResult.rows[0]) {
                console.log(`Skipping registration: Student ${reg.studentUsername} or course ${reg.courseName} not found`);
                continue;
            }

            await executeQuery(
                `INSERT INTO course_registrations (student_id, course_id, status)
                 VALUES ($1, $2, 'enrolled')`,
                [studentResult.rows[0].id, courseResult.rows[0].id]
            );
        }
        console.log('Course registrations inserted successfully');

        // Update course enrollment counts
        await executeQuery(`
            UPDATE courses c
            SET current_enrollment = (
                SELECT COUNT(*)
                FROM course_registrations cr
                WHERE cr.course_id = c.id
                AND cr.status = 'enrolled'
            )
        `);
        console.log('Course enrollment counts updated successfully');

    } catch (error) {
        console.error('Error inserting sample data:', error);
        throw error;
    }
}

// Main setup function
async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        
        await dropTables();
        await createTables();
        await createTriggers();
        await createIndexes();
        await insertSampleData();
        
        console.log('Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

// Run the setup
setupDatabase();
