//mysql-service.js(backend)
//const mysql = require('mysql2/promise'); // Use mysql2 with promises
const { Pool } = require("pg");



const pool = new Pool({
    host: "ep-green-tree-a5jwyvca.us-east-2.aws.neon.tech",
    user: "R.A.D Registration Database_owner", 
    password: "2pDCquHOtlX4", 
    database: "R.A.D Registration Database",
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

module.exports = db = {
    pool,
    selectAll: async function (tableName) {
        const client = await pool.connect();
        try {
            const results = await client.query(`SELECT * FROM ${tableName}`);
            return results.rows;
        } finally {
            client.release(); // Release connection after use
        }
    },

    getOne: async function (tableName, username, password, user_role) {
        //console.log("Inside getOne")
        const client = await pool.connect();
        //console.log("After connection");
        try {
            //console.log("Entered try");
            //console.log("Username:", username, "Password:", password, "user_role:", user_role);
            const sql = `SELECT * FROM ${tableName} WHERE username = $1 AND password_ = $2 AND user_role = $3`;
            const results = await client.query(sql, [username, password, user_role]);
            //console.log("Rows evaluated:", results.rows[0]);
            return results.rows[0];
        } catch (error) {
            console.error("Query execution error:", error);
            throw error;
        } finally {
            client.release();
        }
    },

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

    getUserByUsername: async function(username) {
        //console.log("Connected to getUserbyUsername");
        const client = await pool.connect();
        try {
            //console.log("Entered try, username: ", username);
            const sql = `SELECT first_name, last_name, password_, user_id FROM users WHERE username = $1`;
            const results = await client.query(sql, [username]);
            //console.log("After username is processed in database: ", results.rows[0]);
            return results.rows[0];
        } finally {
            client.release();
        }
    },

    updateUserPassword: async function(username, newPassword) {
        //console.log("Entered update password mysql");
        const client = await pool.connect();
        try {
            const sql = `UPDATE users SET password_ = $1 WHERE username = $2`;
            await client.query(sql, [newPassword, username]);
        } finally {
            client.release();
        }
    }
};

