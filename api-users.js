
//api-users.js(backend)
const jwt = require("jwt-simple");
const { error } = require("console");
const router = require("express").Router();
const secret = "supersecret"; // for encoding/decoding JWT
const { Client } = require('pg');
const db = require("../pg-services");

// send a token when given valid username/password/role
router.post("/api/auth", async function(req, res) {
    if (!req.body.name || !req.body.password || !req.body.role) {
        res.status(401).json({ error: "Missing username, password, and/or role" });
        return;
    }
    
    const client = new Client(db.mydb);
    try {
        await client.connect(); // Open a connection

        const user = await db.getOne(client, "users", req.body.name, req.body.password, req.body.role);

        if (!user || !user.length) {
            res.status(401).json({ error: "Bad username and/or password" });
        } else {
            const token = jwt.encode({ username: user[0].name, role: user[0].role }, secret);
            res.json({ token: token });
        }
    } catch (error) {
        res.status(500).json({ error: "Database connection failed" });
    } finally {
        await client.end(); // Close the connection after each request
    }
    
});

router.get("/status", async function(req, res) {
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ error: "Missing X-Auth headers" });
    }

    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret);
        
        const client = new Client(db.mydb);
        await client.connect(); // Open a connection

        const users = await db.selectAll(client, "users");
        res.json(users);

        await client.end(); // Close the connection
    } catch (ex) {
        res.status(401).json({ error: "Invalid JWT" });
    }
});

module.exports = router;