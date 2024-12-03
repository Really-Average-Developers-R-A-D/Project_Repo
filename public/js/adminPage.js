//admin page coming from studentPage.js(frontend)

// This function gets the user's firstname and lastname from the database to display on the top right of the screen
document.addEventListener("DOMContentLoaded", async () => {

    // Authenticate the user, then fetch user details from the database
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/user-details", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });
        if (response.ok) {
            const userData = await response.json();
            const firstName = userData.firstName;
            const lastName = userData.lastName;
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

            // Update the user info in the top right corner
            document.getElementById("user-name").textContent = `${firstName} ${lastName}`;
            document.getElementById("user-initials").textContent = initials;
        } else {
            console.error("Failed to fetch user details");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
});

// This function has the user enter their old password, validates it in the backend, then allows the user to
// change their password and updates the password
document.addEventListener("DOMContentLoaded", () => {
    const changePasswordLink = document.getElementById("password-reset");
    const modal = document.getElementById("changePasswordModal");
    const closeModal = document.querySelector(".close");

    // Show the modal when the "Change Password" link is clicked
    changePasswordLink.addEventListener("click", () => {
        modal.style.display = "block";
    });

    // Close the modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Handle Change Password form submission
    const form = document.getElementById("changePasswordForm");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:3000/api/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const result = await response.json();

            // Display success or fail for password change
            if (response.ok) {
                document.getElementById("changePasswordSuccess").textContent = "Password changed successfully!";
                document.getElementById("changePasswordError").textContent = "";
            } else {
                document.getElementById("changePasswordError").textContent = result.error || "Error changing password";
                document.getElementById("changePasswordSuccess").textContent = "";
            }
        } catch (error) {
            document.getElementById("changePasswordError").textContent = "An error occurred. Please try again.";
            console.error("Error:", error);
        }
    });
});

// Show the password reset form
function resetPass() {
    const passReset = document.querySelector("#pass-reset");
    passReset.style.display = 'block';
}

// Function to close the password reset popup
document.querySelector(".pass-reset .close").addEventListener("click", () => {
    document.getElementById("pass-reset").style.display = "none";
});

// Loads the student's courses
document.addEventListener("DOMContentLoaded", async () => {
    // Fetch user details for the header
    try {
        const token = localStorage.getItem("token");
        const userResponse = await fetch("http://localhost:3000/api/user-details", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Update HTML text given firstname and lastname
        if (userResponse.ok) {
            const userData = await userResponse.json();
            document.getElementById("user-name").textContent = `${userData.firstName} ${userData.lastName}`;
            document.getElementById("user-initials").textContent = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
        } else {
            console.error("Failed to fetch user details");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }

    // Fetch courses for the student
    try {
        const courseResponse = await fetch("http://localhost:3000/api/student-courses", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (courseResponse.ok) {
            const courses = await courseResponse.json();
            const courseList = document.querySelector(".course-list");
            courseList.innerHTML = ""; // Clear any static content

            // Add each course to the course list
            courses.forEach(course => {
                const courseItem = document.createElement("div");
                courseItem.classList.add("course-item");
                courseItem.innerHTML = `
                    <div class="course-item-header">
                        <span class="course-id-name">${course.major_name} ${course.course_id}: ${course.course_name}</span>
                        <span class="course-register-date">Enrolled: ${course.register_date}</span>
                    </div>
                    <div class="course-description">
                        <p>${course.description}</p>
                    </div>
                `;
                courseList.appendChild(courseItem);
            });
        } else {
            console.error("Failed to fetch courses");
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
});

// Load courses available to register for    
document.getElementById('available-courses').addEventListener('click', async () => {

    // Validate user token
    try {
        const token = localStorage.getItem("token");
        const userResponse = await fetch("http://localhost:3000/api/available-courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!userResponse.ok) throw new Error('Failed to fetch available courses');

        // Change the title to available courses
        const heading = document.querySelector('.course-dashboard h2');
        heading.textContent = 'Available Courses';

        const courses = await userResponse.json();
        const courseList = document.querySelector('.course-list');
        courseList.innerHTML = '';  // Clear previous courses

        // Write each course into the course list
        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.classList.add('course-item');
            courseItem.innerHTML = `
            <div class="course-item-header">
                <span class="course-id-name">${course.major_name} ${course.course_id}: ${course.course_name}</span>
                <span class="course-register-date">Enrolled: ${course.current_enrollment} / ${course.max_capacity}</span>
            </div>
            <div class="course-description">
                <p>${course.description}</p>
            </div>
        `;
            courseList.appendChild(courseItem);
        });
    } catch (error) {
        console.error(error);
    }
});

// Returns to the home screen when the dashboard button is clicked
document.getElementById("dashboard-button").addEventListener("click", async () => {

    // Validate the token
    try {
        const token = localStorage.getItem("token");
        const courseResponse = await fetch("http://localhost:3000/api/student-courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!courseResponse.ok) throw new Error('Failed to fetch student courses');



        const courses = await courseResponse.json();
        const courseList = document.querySelector('.admin-info');
        courseList.innerHTML = '';  // Clear previous courses

        // Write each course into the course list
        courses.forEach(course => {
            const courseItem = document.createElement("div");
            courseItem.classList.add("course-item");
            courseItem.innerHTML = `
                <div class="course-item-header">
                    <span class="course-id-name">${course.major_name} ${course.course_id}: ${course.course_name}</span>
                    <span class="course-register-date">Enrolled: ${course.register_date}</span>
                </div>
                <div class="course-description">
                    <p>${course.description}</p>
                </div>
            `;
            courseList.appendChild(courseItem);
        });
    } catch (error) {
        console.error(error);
    }
});

// NEW STUFF
async function fetchAndDisplayMajors() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/all-majors", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error('Failed to fetch majors');

        const majors = await response.json(); // Assuming backend sends JSON
        const majorList = document.querySelector('.major-list');
        majorList.innerHTML = '';  // Clear any previous majors

        majors.forEach(major => {
            const majorItem = document.createElement("div");
            majorItem.classList.add("major-item");
            majorItem.innerHTML = `
                <h3>${major.major_name}</h3>
                <p>${major.descritption}</p>
            `;
            majorList.appendChild(majorItem);
        });
    } catch (error) {
        console.error("Error displaying majors:", error);
    }
}

async function addATeacher() {
    const heading = document.querySelector("#content h1");
    heading.textContent = "Add a Teacher";

    document.querySelector('.admin-buttons').style.display = 'none';

    const navBar = document.querySelector('.admin-info');
    navBar.innerHTML = '';  // Clear any previous text
    navBar.className = "";
    const majorList = document.querySelector('.major-list');
    majorList.innerHTML = '';  // Clear any previous text
}

async function addAStudent() {
    const heading = document.querySelector("#content h1");
    heading.textContent = "Add a Student";

    document.querySelector('.admin-buttons').style.display = 'none';

    const navBar = document.querySelector('.admin-info');
    navBar.innerHTML = '';  // Clear any previous text
    navBar.className = "";
    const majorList = document.querySelector('.major-list'); 
    majorList.className = 'form';
    majorList.innerHTML = '<form id="studentForm"><label for="firstName">First Name:</label><br><input type="text" id="firstName" name="firstName" required><br><br><label for="lastName">Last Name:</label><br><input type="text" id="lastName" name="lastName" required><br><br><label for="username">Username:</label><br><input type="text" id="username" name="username" required><br><br><label for="phoneNumber">Phone Number:</label><br><input type="tel" id="phoneNumber" name="phoneNumber" pattern="[0-9]{10}" placeholder="1234567890" required><br><br><button type="submit">Submit</button></form>';  // Clear any previous content
   
}

async function addAMajor() {
     const heading = document.querySelector("#content h1");
        heading.textContent = "Add a Major";

        document.querySelector('.admin-buttons').style.display = 'none';

        // Create and insert the form
        const majorList = document.querySelector('.major-list');
        majorList.className = 'form';
        majorList.innerHTML = `
            <form id="majorForm">
                <label for="majorName">Major Name (3 characters):</label><br>
                <input type="text" id="majorName" name="majorName" maxlength="3" required><br><br>
                <label for="majorDescription">Full Name of Major:</label><br>
                <textarea id="majorDescription" name="majorDescription" rows="4" cols="50" required></textarea><br><br>
                <button type="submit">Submit</button>
            </form>`;

            const majorForm = document.getElementById("majorForm");
            majorForm.addEventListener("submit", (submitEvent) => {
                submitEvent.preventDefault(); // Prevent the default form submission behavior

                // Get form values
                const majorName = document.getElementById("majorName").value;
                const majorDescription = document.getElementById("majorDescription").value;

                addAMajorAPIcall(majorName, majorDescription);

                // Do something with the values (e.g., log them, send to an API)
                console.log(`Major Name: ${majorName}`);
                console.log(`Major Description: ${majorDescription}`);

                // Optionally, provide feedback to the user
                alert("Form submitted successfully!");

                // Clear the form (optional)
                majorForm.reset();
            });
};
       
async function addAMajorAPIcall(majorName, majorDescription) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/add-a-major", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ majorName, majorDescription })
        });

        if (!response.ok) {
            const errorDetails = await response.json(); 
            console.error('Failure:', errorDetails);
            throw new Error('Failed to add major');
        } else {
            const data = await response.json();
            console.log('Major added successfully:', data);
        }

        /**const majors = await response.json(); // Assuming backend sends JSON
        const majorList = document.querySelector('.major-list');
        majorList.innerHTML = '';  // Clear any previous majors

        majors.forEach(major => {
            const majorItem = document.createElement("div");
            majorItem.classList.add("major-item");
            majorItem.innerHTML = `
                <h3>${major.major_name}</h3>
                <p>${major.descritption}</p>
            `;
            majorList.appendChild(majorItem);
        });**/
    } catch (error) {
        console.error("Error displaying majors:", error);
    }
    
}

async function returnToDashboard() {
    const heading = document.querySelector("#content h1");
    heading.textContent = "Dashboard";

    document.querySelector('.admin-buttons').style.display = 'block';

    const navBar = document.querySelector('.admin-info');
    navBar.innerHTML = '';  // Clear any previous text
    const majorList = document.querySelector('.major-list');
    majorList.innerHTML = '';  // Clear any previous text
}
