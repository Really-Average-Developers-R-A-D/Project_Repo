//mysql-service.js(backend)

// Establish connection to the database
const { Pool } = require("pg");
const pool = new Pool({
    host: "ep-green-tree-a5jwyvca.us-east-2.aws.neon.tech",
    user: "R.A.D Registration Database_owner", 
    password: "2pDCquHOtlX4", 
    database: "R.A.D Registration Database",
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

// Queries
module.exports = db = {
    pool,

    // Currently unused
    selectAll: async function (tableName) {
        const client = await pool.connect();
        try {
            const results = await client.query(`SELECT * FROM ${tableName}`);
            return results.rows;
        } finally {
            client.release(); 
        }
    },

    // Get user details for validation
    getOne: async function (tableName, username, password, user_role) {
        const client = await pool.connect();

        // Execute query to return a result from the database, validating the user for login
        try {
            const sql = `SELECT * FROM ${tableName} WHERE username = $1 AND password_ = $2 AND user_role = $3`;
            const results = await client.query(sql, [username, password, user_role]);
            return results.rows[0];
        } catch (error) {
            console.error("Query execution error:", error);
            throw error;
        } finally {
            client.release();
        }
    },

    // Currently unused
    addOne: async function (tableName, user) {
        const client = await pool.connect();
        try {
            const sql = `INSERT INTO ${tableName} (name, address, password, role) VALUES ($1, $2, $3, $4) RETURNING *`;
            const results = await client.query(sql, [user.name, user.address, user.password, user.role]);
            return results.rows[0];
        } finally {
            client.release();
        }
    },

    // Get user details by associated username
    getUserByUsername: async function(username) {
        const client = await pool.connect();

        // Find user information in the database given the username
        try {
            const sql = `SELECT first_name, last_name, password_, user_id FROM users WHERE username = $1`;
            const results = await client.query(sql, [username]);
            return results.rows[0];
        } finally {
            client.release();
        }
    },

    // Change the user's password in the database
    updateUserPassword: async function(username, newPassword) {
        const client = await pool.connect();

        // Query to change given user's password
        try {
            const sql = `UPDATE users SET password_ = $1 WHERE username = $2`;
            await client.query(sql, [newPassword, username]);
        } finally {
            client.release();
        }
    },

    // Get a given's user's currently enrolled courses
    getCoursesByEnrollment: async function(username) {
        const client = await pool.connect();

        // Query to get a given user's currently enrolled course(s)
        try {
            const sql = `
            SELECT m.major_name, c.course_id, c.course_name, c.description, 
                TO_CHAR(r.register_date, 'YYYY-MM-DD') AS register_date
                FROM courses c
                JOIN registered r ON c.course_id = r.course_id
                JOIN course_major cm ON c.course_id = cm.course_id
                JOIN majors m ON cm.major_id = m.major_id
                JOIN users u ON r.user_id = u.user_id
                WHERE u.username = $1 AND r.status = 'enrolled'
        `   ;
            const result = await client.query(sql, [username]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Get all courses that a student can register for
    getCoursesByAvailability: async function(userId) {
        const client = await pool.connect();

        // Query gets all courses in the database where the the current enrollment has no exceeded maximum capacity
        // nor the student is currently enrolled in
        try {
            const sql = `
            SELECT m.major_name, c.course_id, c.course_name, c.description, 
                   c.current_enrollment, c.max_capacity
            FROM courses c
            JOIN course_major cm ON c.course_id = cm.course_id
            JOIN majors m ON cm.major_id = m.major_id
            LEFT JOIN registered r ON c.course_id = r.course_id 
                                    AND r.user_id = $1
                                    AND r.status = 'enrolled'
            WHERE c.current_enrollment < c.max_capacity 
              AND r.course_id IS NULL
        `;
            const result = await client.query(sql, [userId]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Update the database for registered student
    registerStudentForCourse: async function(userId, courseId) {
        const client = await pool.connect();

        // Protect database against errors
        await client.query('BEGIN');
        try {

            // Check capacity before inserting
            const checkCapacitySql = `
            SELECT max_capacity, current_enrollment 
            FROM courses 
            WHERE course_id = $1
            `;
            const capacityResult = await client.query(checkCapacitySql, [courseId]);
            const { max_capacity, current_enrollment } = capacityResult.rows[0];

            if (current_enrollment >= max_capacity) {
            throw new Error("Course is full");
            }

            // Insert a new record or update the status to 'enrolled' if a record already exists
            const sql = `
            INSERT INTO registered (user_id, course_id, register_date, status)
            VALUES ($1, $2, CURRENT_DATE, 'enrolled')
            ON CONFLICT (user_id, course_id)
            DO UPDATE SET status = 'enrolled', register_date = CURRENT_DATE
            RETURNING *
        `;
            const result = await client.query(sql, [userId, courseId]);

            await client.query('COMMIT'); // Update the database after success

            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback the transaction in case of an error
            console.error("Error in registerStudentForCourse:", error);
            throw error;
        } finally {
            client.release();
        }
    },

    // Update course status to "dropped"
    updateCourseStatus: async function(userId, courseId) {
        const client = await pool.connect();
        try {
            const sql = `
                UPDATE registered
                SET status = 'dropped'
                WHERE user_id = $1 AND course_id = $2
            `;
            await client.query(sql, [userId, courseId]);
        } finally {
            client.release();
        }
    },

    // Fetch all dropped courses for a specific user
    getDroppedCourses: async function(userId) {
        const client = await pool.connect();
        try {
            const sql = `
                SELECT m.major_name, c.course_id, c.course_name, c.description
                FROM courses c
                JOIN registered r ON c.course_id = r.course_id
                JOIN course_major cm ON c.course_id = cm.course_id
                JOIN majors m ON cm.major_id = m.major_id
                WHERE r.user_id = $1 AND r.status = 'dropped'
            `;
            const result = await client.query(sql, [userId]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Fetch list of all majors
    getMajors: async function() {
        const client = await pool.connect();
        try {
            const sql = `SELECT major_id, major_name FROM majors`;
            const result = await client.query(sql);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Set or update a user's major
    setOrUpdateMajor: async function(userId, majorId) {
        const client = await pool.connect();
        try {
            const sql = `
                INSERT INTO student_majors (user_id, major_id, update_date)
                VALUES ($1, $2, CURRENT_DATE)
                ON CONFLICT (user_id)
                DO UPDATE SET major_id = $2, update_date = CURRENT_DATE
            `;
            await client.query(sql, [userId, majorId]);

        } catch (error) {
            console.error("Error in setOrUpdateMajor:", error);
        } finally {
            client.release();
        }
    },

    // Get the current major for a user
    getCurrentMajor: async function(userId) {
        const client = await pool.connect();
        try {
            const sql = `
                SELECT m.major_name 
                FROM student_majors sm
                JOIN majors m ON sm.major_id = m.major_id
                WHERE sm.user_id = $1
            `;
            const result = await client.query(sql, [userId]);
            return result.rows[0] ? result.rows[0].major_name : null;
        } finally {
            client.release();
        }
    },

    /* ADMIN PAGE */
    // Get a given's teachers currently active courses
    getCoursesByTeaching: async function(username) {
        const client = await pool.connect();

        // Query to get a given teachers course(s)
        try {
            const sql = `
            SELECT c.course_id, c.course_name, c.description
            FROM teaching t
            JOIN courses c ON t.course_id = c.course_id
            JOIN course_majors cm ON   c.course_id = cm.course_id
            JOIN users u ON t.user_id = u.user_id
            WHERE u.username = $1 ;


        `   ;
            const result = await client.query(sql, [username]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Get all majors from the database
    getAllMajors: async function () {
        const client = await pool.connect();
        try {
            const sql = `SELECT major_name, descritption FROM majors;`;  // Adjust your SQL query here
            const result = await client.query(sql);
            console.log("result.rows: " ,result.rows)
            return result.rows;  // Return all majors directly without additional filtering or transformation
        } catch (error) {
            console.error("Error fetching majors:", error);
        } finally {
            client.release();
        }
    },

    getAllTeachers: async function () {
        const client = await pool.connect();
        try {
            const sql = "SELECT first_name, last_name, office FROM users WHERE user_role = 'teacher'"; // Adjust your SQL query here
            const result = await client.query(sql);
    
            return result.rows;
        } catch (error) {
            console.error("Error fetching teacher roster:", error);
            throw error;
        } finally {
            client.release();
        }
    },
    
    // Get a given's teachers currently active courses (TEACHER)
    getCoursesByTeachingActive: async function(username) {
        const client = await pool.connect();

        // Query to get a given teachers course(s)
        try {
            const sql = `
            SELECT c.course_id, c.course_name, c.description, m.major_name, t.status 
            FROM teaching t
            JOIN courses c ON t.course_id = c.course_id
            JOIN course_major cm ON   c.course_id = cm.course_id
	        JOIN majors m ON cm.major_id = m.major_id
            JOIN users u ON t.user_id = u.user_id
            WHERE u.username = $1 AND t.status = 'active';

        `   ;
            const result = await client.query(sql, [username]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Get a given's teachers currently inactive courses (TEACHER)
    getCoursesByTeachingInactive: async function(username) {
        const client = await pool.connect();

        // Query to get a given teachers course(s)
        try {
            const sql = `
            SELECT c.course_id, c.course_name, c.description, m.major_name, t.status 
            FROM teaching t
            JOIN courses c ON t.course_id = c.course_id
            JOIN course_major cm ON   c.course_id = cm.course_id
	        JOIN majors m ON cm.major_id = m.major_id
            JOIN users u ON t.user_id = u.user_id
            WHERE u.username = $1 AND t.status = 'inactive';

        `   ;
            const result = await client.query(sql, [username]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Change the status of a course for teacher (TEACHER)
    changeCourseStatus: async function(userId, courseId){
        const client = await pool.connect();
        try{
            const sql = `
                UPDATE teaching
                SET status = CASE
                    WHEN status = 'inactive' THEN 'active'
                    WHEN status = 'active' THEN 'inactive'
                    ELSE status
                END
                WHERE user_id = $1 AND course_id = $2
            `;
            await client.query(sql, [userId,courseId]);
        }finally{
            client.release();
        }
    },

};

