
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
            const token = jwt.encode({ username: user.username, role: user.user_role, user_id: user.user_id }, secret);
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
        console.log("Courses: ", result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching student courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});



// Route to get the courses for the logged-in teacher
router.get("/teacher-courses", async (req, res) => {

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

        // Query to get active course details of the teacher
        const result = await db.getCoursesByTeachingActive(username);



        console.log("Active Courses: ", result);


        res.json(result);
    } catch (error) {
        console.error("Error fetching teacher courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

// Route to get the inactive courses for the logged-in teacher
router.get("/teacher-courses-inactive", async (req, res) => {


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

        // Query to get inactive course details of the teacher
        const result = await db.getCoursesByTeachingInactive(username);
        console.log("Inactive Courses: ", result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching teacher courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});


// Route to get available courses for the student
router.get('/available-courses', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }
    try {
        //Query to get available courses
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const userId = decoded.user_id; 
        const result = await db.getCoursesByAvailability(userId);
        res.json(result);
    } catch (error) {
        console.error('Error fetching available courses:', error);
        res.status(500).send('Error fetching available courses');
    }
});

// Route to register a student for a course
router.post("/register-course/:courseId", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const userId = decoded.user_id; // Fix this problem, user_id is null
        const courseId = req.params.courseId;

        const result = await db.registerStudentForCourse(userId, courseId);
        res.json({ message: "Successfully registered for the course" });
    } catch (error) {
        console.error("Error during course registration:", error);
        res.status(500).json({ error: "Failed to register for course" });
    }
});

// Route to change the status of a course
router.post("/change-course-status/:courseId", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const userId = decoded.user_id; // Fix this problem, user_id is null
        const courseId = req.params.courseId;

        const result = await db.changeCourseStatus(userId, courseId);
        res.json({ message: "Successfully changed course status" });
    } catch (error) {
        console.error("Error during course status change:", error);
        res.status(500).json({ error: "Failed to change course status" });
    }
});

// Route to drop a course
router.post("/drop-course/:courseId", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const userId = decoded.user_id;
        const courseId = req.params.courseId;

        await db.updateCourseStatus(userId, courseId);
        res.json({ message: "Successfully dropped the course" });
    } catch (error) {
        console.error("Error dropping course:", error);
        res.status(500).json({ error: "Failed to drop course" });
    }
});

// Route to get dropped courses for the logged-in student
router.get("/dropped-courses", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const userId = decoded.user_id;

        const result = await db.getDroppedCourses(userId);
        res.json(result);
    } catch (error) {
        console.error("Error fetching dropped courses:", error);
        res.status(500).json({ error: "Failed to fetch dropped courses" });
    }
});

// Route to get list of all majors
router.get("/majors", async (req, res) => {
    try {
        const majors = await db.getMajors();
        res.json(majors);
    } catch (error) {
        console.error("Error fetching majors:", error);
        res.status(500).json({ error: "Failed to fetch majors" });
    }
});

// Route to set/update user's major
router.post("/set-major", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const userId = decoded.user_id;
        const { major_id } = req.body;

        const result = await db.setOrUpdateMajor(userId, major_id);

        res.json({ message: "Major successfully set/updated" });
    } catch (error) {
        console.error("Error setting/updating major:", error);
        res.status(500).json({ error: "Failed to set/update major" });
    }
});

// Route to get the user's current major
router.get("/current-major", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token, secret);
        const userId = decoded.user_id;

        const currentMajor = await db.getCurrentMajor(userId);
        res.json({ currentMajor });
    } catch (error) {
        console.error("Error fetching current major:", error);
        res.status(500).json({ error: "Failed to fetch current major" });
    }
});

// Route to add a student
router.post("/add-a-student", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const { firstName, lastName, username, password, phoneNumber} = req.body;

        if (!firstName || !lastName || !username || !password || !phoneNumber) {
            return res.status(400).json({ error: "Missing required fields (firstName, lastName, username, password, phoneNumber)" });
        }

        const newStudent = await db.addStudent(firstName, lastName, username, password, phoneNumber);

        res.status(201).json({ message: "Student added successfully", newStudent });
    } catch (error) {
        console.error("Error adding student:", error.message);
        res.status(500).json({ error: "Failed to add student", details: error.message });
    }
});

// Route to add a teacher
router.post("/add-a-teacher", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const { firstName, lastName, username, password, phoneNumber, office} = req.body;

        if (!firstName || !lastName || !username || !password || !phoneNumber || !office) {
            return res.status(400).json({ error: "Missing required fields (firstName, lastName, username, password, phoneNumber, office)" });
        }

        const newStudent = await db.addTeacher(firstName, lastName, username, password, phoneNumber, office);

        res.status(201).json({ message: "Teacher added successfully", newStudent });
    } catch (error) {
        console.error("Error adding teacher:", error.message);
        res.status(500).json({ error: "Failed to add teacher", details: error.message });
    }
});

// Route to add a major
router.post("/add-a-major", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    try {
        const { majorName, majorDescription } = req.body;

        if (!majorName || !majorDescription) {
            return res.status(400).json({ error: "Missing required fields (majorName, majorDescription)" });
        }

        const newMajor = await db.addMajor(majorName, majorDescription);

        res.status(201).json({ message: "Major added successfully", newMajor });
    } catch (error) {
        console.error("Error adding major:", error.message); 
        res.status(500).json({ error: "Failed to add major", details: error.message });
    }
});

// Route to get all majors for admin
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

// Route to get all courses for admin
router.get('/all-courses', async (req, res) => {
    try {
        const result = await db.getAllCourses();
        console.log('All Courses:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching all courses:', error);
        res.status(500).send('Error fetching all courses');
    }
});

// Route to get all courses for admin
router.get('/all-courses', async (req, res) => {
    try {
        const result = await db.getAllCourses();
        console.log('All Courses:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching all courses:', error);
        res.status(500).send('Error fetching all courses');
    }
});

// Route to get the course roster for the admin
router.get('/get-course-roster', async (req, res) => {
    const courseId = req.query.courseId;

    if (!courseId) {
        return res.status(400).send('Missing courseId parameter');
    }

    try {
        const result = await db.getCourseRosterForAdmin(courseId);
        console.log(`Students for course ${courseId}:`, result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching the course roster:', error);
        res.status(500).send('Error fetching the course roster');
    }
});

// Route to get the course professor for the admin
router.get('/get-course-professor', async (req, res) => {
    const courseId = req.query.courseId;

    if (!courseId) {
        return res.status(400).send('Missing courseId parameter');
    }

    try {
        const result = await db.getCourseProfForAdmin(courseId);
        console.log(`Professor for course ${courseId}:`, result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching the professor for the course:', error);
        res.status(500).send('Error fetching the professor for the course');
    }
});

module.exports = router;
