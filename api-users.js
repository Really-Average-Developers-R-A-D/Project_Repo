//api-users.js
const jwt = require("jwt-simple");
const router = require("express").Router();
const secret = "supersecret"; // for encoding/decoding JWT
const db = require("./mysql-service"); // Use mysql-services.js instead of pg-services
//console.log("api-users.js");


// Send a token when given valid username/password/role
router.post("/auth", async function(req, res) {
    /*console.log("Received POST request:", req.body); // Log request body
    console.log("Username:", req.body.username);
    console.log("Password:", req.body.password);
    console.log("User Role:", req.body.user_role);
*/
    if (!req.body.username || !req.body.password || !req.body.user_role) {
        res.status(401).json({ error: "Missing username, password, and/or role" });
        return;
    }
    try {
        //console.log("inside api-users try");
        const user = await db.getOne("users", req.body.username, req.body.password, req.body.user_role);
        //console.log("inside api-users try 2");
        if (!user) {
            //console.log("inside api-users try if");
            res.status(401).json({ error: "Bad username and/or password" });
        } else {
            //console.log("inside api-users try else");
            const token = jwt.encode({ username: user.username, role: user.user_role }, secret);
            res.json({ token: token });
            //console.log("Done POST");
        }
    } catch (error) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Check token and return users' data
router.get("/status", async function(req, res) {
    //console.log("Entered the get");
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ error: "Missing X-Auth headers" });
    }

    const token = req.headers["x-auth"];
    //console.log("Read the token");
    try {
        //console.log("entered try");
        const decoded = jwt.decode(token, secret);
        //console.log("Entering database");
        const users = await db.selectAll("users");
        res.json(users);
    } catch (ex) {
        res.status(401).json({ error: "Invalid JWT" });
    }
});

// Fetch user details based on the token
router.get("/user-details", async (req, res) => {
    //console.log("Entered GET try");
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'
        const decoded = jwt.decode(token, secret);

        const username = decoded.username; 

        // Fetch user details from the database
        //console.log("About to enter getUsersbyUsername");
        const user = await db.getUserByUsername(username);
        //console.log("user.first_name: ", user.first_name, "user.last_name: ", user.last_name);

        if (user) {
            // Send the user details in the response
            return res.json({
                firstName: user.first_name, 
                lastName: user.last_name
            });
        } else {
            // Send a 404 error if the user isn't found
            return res.status(404).json({ error: "User not found" });
        }

    } catch (error) {
        console.error("Error during GET /user-details:", error);
        // Ensure only one response is sent
        return res.status(401).json({ error: "Unauthorized" });
    }
});

//Validates the user token to proceed with changing password
router.post("/change-password", async (req, res) => {
    const authHeader = req.headers.authorization;
    //console.log("Entered POST: /change-password");

    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    //console.log("About to split token");
    const token = authHeader.split(" ")[1];

    //console.log("About to decode token");
    const decoded = jwt.decode(token, secret); 

    const { oldPassword, newPassword } = req.body;

    try {
        // Fetch user by username
        //console.log("Entered try for old pass");
        const user = await db.getUserByUsername(decoded.username);
        //console.log("Old password: ", oldPassword);
        
        // Check if the old password matches
        if (user.password_ !== oldPassword) {
            return res.status(400).json({ error: "Incorrect current password" });
        }
        //console.log("About to update the database with values:", decoded.username, newPassword);
        // Update password in the database
        await db.updateUserPassword(decoded.username, newPassword);
        //console.log("decoded username and new password:", decoded.username, newPassword);

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to get the courses for the logged-in student
router.get("/student-courses", async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log("Entered GET student courses");
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        console.log("Entered Try");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const username = decoded.username; 
        console.log("Decoded username:", username);

        // Fetch the user details to get their user ID (you might need to adjust this depending on your database structure)
        const user = await db.getUserByUsername(username);
        console.log("Returned from database");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Assuming `user.user_id` is available as the unique identifier for courses
        const sql = `
            SELECT c.course_name, c.description 
            FROM courses c
            JOIN registered r ON c.course_id = r.course_id
            WHERE r.user_id = $1
        `;
        console.log("After query");
        const client = await db.pool.connect(); // Assuming `pool` is your PostgreSQL connection pool
        console.log("Connection established, userID:", user.user_id);
        const result = await client.query(sql, [user.user_id]);
        console.log("Sent result");
        client.release();
        console.log("Result.rows:", result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching student courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});
module.exports = router;
