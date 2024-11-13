
//api-users.js
const jwt = require("jwt-simple");
const router = require("express").Router();
const secret = "supersecret"; // for encoding/decoding JWT
const db = require("./mysql-service"); 


// Send a token when given valid username/password/role
router.post("/auth", async function(req, res) {

    // Error if an input is missing
    if (!req.body.username || !req.body.password || !req.body.user_role) {
        res.status(401).json({ error: "Missing username, password, and/or role" });
        return;
    }

    // Search the database for the matching username, password, and role
    try {
        const user = await db.getOne("users", req.body.username, req.body.password, req.body.user_role);
        
        if (!user) {
            res.status(401).json({ error: "Bad username and/or password" });
        } else {
            const token = jwt.encode({ username: user.username, role: user.user_role }, secret);
            res.json({ token: token });    
        }
    } catch (error) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Check token and return users' data (Currently unused)
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

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    // Decode token to extract user details such as first name and last name
    try {
        const token = authHeader.split(" ")[1]; 
        const decoded = jwt.decode(token, secret);

        const username = decoded.username; 

        // Fetch user details from the database
        const user = await db.getUserByUsername(username);

        if (user) {
            // Send the user details in the response
            return res.json({
                firstName: user.first_name, 
                lastName: user.last_name
            });
        } else {
            return res.status(404).json({ error: "User not found" });
        }

    } catch (error) {
        // Ensure only one response is sent
        console.error("Error during GET /user-details:", error);
        return res.status(401).json({ error: "Unauthorized" });
    }
});

// Validates the user token to proceed with changing password
router.post("/change-password", async (req, res) => {
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    // Decode the token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token, secret); 

    const { oldPassword, newPassword } = req.body;

    // Find the user in the database and proceed to change password
    try {
        const user = await db.getUserByUsername(decoded.username);
        
        // Check if the old password matches
        if (user.password_ !== oldPassword) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        // Update password in the database
        await db.updateUserPassword(decoded.username, newPassword);

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to get the enrolled courses for the logged-in student
router.get("/student-courses", async (req, res) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    // Find the user by username in the database before running a query to get all the user's enrolled classes
    try {
        
        // Decode token
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const username = decoded.username; 

        // Fetch the user details from the database
        const user = await db.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Query to get course details of the student
        const result = await db.getCoursesByEnrollment(username);
        res.json(result);
    } catch (error) {
        console.error("Error fetching student courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

// Route to get available courses for the student
router.get('/available-courses', async (req, res) => {
    try {
        //Query to get available courses
        const result = await db.getCoursesByAvailability();
        res.json(result);
    } catch (error) {
        console.error('Error fetching available courses:', error);
        res.status(500).send('Error fetching available courses');
    }
});

// Route to get list of all majors for the adminstrator
router.get('/all-majors', async (req, res) => {
    try {
        //Query to get available courses
        const result = await db.getAllMajors();
        res.json(result);
    } catch (error) {
        console.error('Error fetching all majors:', error);
        res.status(500).send('Error fetching all majors');
    }
});

// Route to get list of all students for the adminstrator
router.get('/all-students', async (req, res) => {
    try {
        //Query to get available courses
        const result = await db.getAllStudents();
        res.json(result);
    } catch (error) {
        console.error('Error fetching all students:', error);
        res.status(500).send('Error fetching all students');
    }
});

// Route to get list of all teachers for the adminstrator
router.get('/all-majors', async (req, res) => {
    try {
        const result = await db.getAllMajors();
        console.log('All Majors:', result);  // Log the result
        res.json(result);
    } catch (error) {
        console.error('Error fetching all majors:', error);
        res.status(500).send('Error fetching all majors');
    }
});

// Route to get list of all teachers for the adminstrator
router.get('/all-teachers', async (req, res) => {
    try {
        const result = await db.getAllMajors();
        console.log('All Teachers:', result);  // Log the result
        res.json(result);
    } catch (error) {
        console.error('Error fetching all majors:', error);
        res.status(500).send('Error fetching all majors');
    }
});

module.exports = router;
