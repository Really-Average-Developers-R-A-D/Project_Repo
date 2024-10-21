
// mysql-services.js(backend) 
const { Client } = require('pg');

module.exports = db = {
    mydb: {
        host: "ep-green-tree-a5jwyvca.us-east-2.aws.neon.tech",
        user: "R.A.D Registration Database_owner",
        password: "2pDCquHOtlX4",
        database: "R.A.D Registration Database",
        port: 5432,
        ssl: {
            rejectUnauthorized: false  // Accept SSL certificates from the host
        }
    },
    
    selectAll: async function (tableName) {
        const client = new Client(this.mydb);
        await client.connect();

        try {
            const results = await client.query(`SELECT * FROM ${tableName}`);
            return results.rows;
        } finally {
            await client.end(); // Close the connection after query execution
        }
    },
    
    getOne: async function (tableName, name, password, role) {
        const client = new Client(this.mydb);
        await client.connect();

        try {
            const sql = `SELECT * FROM ${tableName} WHERE name = $1 AND password = $2 AND role = $3`;
            const results = await client.query(sql, [name, password, role]);
            return results.rows[0];
        } finally {
            await client.end(); // Close the connection after query execution
        }
    },
    
    addOne: async function (tableName, user) {
        const client = new Client(this.mydb);
        await client.connect();
        
        try {
            const sql = `INSERT INTO ${tableName} (name, address, password, role) VALUES ($1, $2, $3, $4)`;
            const values = [user.name, user.address, user.password, user.role];
            const results = await client.query(sql, values);
            return results;
        } finally {
            await client.end(); // Close the connection after query execution
        }
    }
};
