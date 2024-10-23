//mysql-service.js(backend)
const mysql = require('mysql2/promise'); // Use mysql2 with promises

module.exports = db = {
    mydb: {
        host: "localhost",
        user: "root", 
        password: "", 
        database: "r.a.d-registration-database",
    },

    // Method to select all rows from a table
    selectAll: async function (tableName) {
        const connection = await mysql.createConnection(this.mydb);
        try {
            const [results] = await connection.execute(`SELECT * FROM ${tableName}`);
            return results;
        } finally {
            await connection.end(); // Close the connection after query execution
        }
    },

    // Method to get one record based on name, password, and role
    getOne: async function (tableName, username, password, user_role) {
        console.log("Inside getOne")
        const connection = await mysql.createConnection(this.mydb);
        console.log("After connection");
        try {
            console.log("Entered try");
            const sql = `SELECT * FROM ${tableName} WHERE username = "${username}" AND password = "${password}" AND user_role = "${user_role}"`;
            const [results] = await connection.execute(sql, [tableName, username, password, user_role]);
            console.log("Rows evaluated", results);
            return results[0]; // Return the first matching user, if any
        } catch (error) {
            console.error("Error executing query:", error);
            throw error; // Rethrow error to handle in the calling function
        } finally {
            await connection.end();
        }
    },

    // Method to add a new user to the table
    addOne: async function (tableName, user) {
        const connection = await mysql.createConnection(this.mydb);
        try {
            const sql = `INSERT INTO ?? (name, address, password, role) VALUES (?, ?, ?, ?)`;
            const [results] = await connection.execute(sql, [tableName, user.name, user.address, user.password, user.role]);
            return results;
        } finally {
            await connection.end(); // Close the connection after query execution
        }
    },

    // Fetch a user by username
    getUserByUsername: async function(username) {
        const connection = await mysql.createConnection(this.mydb);
        console.log("Connected to getUserbyUsername");
        try {
            const [rows] = await connection.query(`SELECT firstname, last_name, password FROM users WHERE username = "${username}"`);
            console.log("After username is processed in database: ", rows[0]);
            return rows[0];
        } finally {
            connection.end();
        }
    },

    // Change a user's password after authenticating them
    updateUserPassword: async function(username, newPassword) {
        console.log("Entered update password mysql");
        const connection = await mysql.createConnection(this.mydb);
        try {
            await connection.query(`UPDATE users SET password = "${newPassword}" WHERE username = "${username}"`);
        } finally {
            connection.end();
        }
    }
};
