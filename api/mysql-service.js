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
                WHERE u.username = $1
        `   ;
            const result = await client.query(sql, [username]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    // Get all courses that a student can register for
    getCoursesByAvailability: async function() {
        const client = await pool.connect();

        // Query gets all courses in the database where the the current enrollment has no exceeded maximum capacity
        try {
            const sql = `
            SELECT m.major_name, c.course_id, c.course_name, c.description, c.current_enrollment, c.max_capacity
            FROM courses c
            JOIN course_major cm ON c.course_id = cm.course_id
            JOIN majors m ON cm.major_id = m.major_id
            WHERE c.current_enrollment < c.max_capacity
            `;
            const result = await client.query(sql);
            return result.rows;
        } finally {
            client.release();
        }
    }
};

