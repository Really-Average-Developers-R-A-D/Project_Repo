module.exports = db ={
    mydb : {
        host: "ep-green-tree-a5jwyvca.us-east-2.aws.neon.tech",
        user: "R.A.D Registration Database_owner",
        password: "2pDCquHOtlX4",
        database: "R.A.D Registration Database"
    },

    selectAll: async function (conn, tableName) {
        const results = await conn.promise().query(`SELECT * FROM ${tableName}`);
        return results[0];
    },

    getOne : async function (conn, tableName, name, password, role) {
        const sql = `SELECT * FROM ${tableName} WHERE name = '${name}' AND
        password = '${password}' AND role = '${role}'`;
        const results = await conn.promise().query(sql);
        return results[0];
    },

    addOne : async function(conn, tableName, user) {
        const newValues = `"${user.name}", "${user.address}",
        "${user.password}", "${user.role}"`;
        const sql = `INSERT INTO ${tableName}
        (name,address,password,role) VALUES (${newValues})`;
        const results = await conn.promise().query(sql);
        return results;
    }
}