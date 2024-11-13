
//studentPage.js(frontend)

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

                <button class="register-button" data-course-id="${course.course_id}">Register</button>
            </div>
            <div class="course-description">
                <p>${course.description}</p>
            </div>
        `;
            courseList.appendChild(courseItem);
        });

        // Add event listeners to all "Register" buttons
        document.querySelectorAll('.register-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const courseId = event.target.getAttribute('data-course-id');
                await registerForCourse(courseId);
            });
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
        
        // Change the title to my courses
        const heading = document.querySelector('.course-dashboard h2');
        heading.textContent = 'My Courses';

        const courses = await courseResponse.json();
        const courseList = document.querySelector('.course-list');
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

});

// Register button validation
async function registerForCourse(courseId) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/register-course/${courseId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error('Failed to register for course');
        alert('Successfully registered for the course!');
    } catch (error) {
        console.error("Error during registration:", error);
    }
}

// Load enrolled courses for dropping
document.getElementById('drop-course').addEventListener('click', async () => {
    
    // Validate the user
    try {
        const token = localStorage.getItem("token");
        const userResponse = await fetch("http://localhost:3000/api/student-courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!userResponse.ok) throw new Error('Failed to fetch enrolled courses');

        const heading = document.querySelector('.course-dashboard h2');
        heading.textContent = 'Drop a Course';

        const courses = await userResponse.json();
        const courseList = document.querySelector('.course-list');
        courseList.innerHTML = '';  // Clear previous courses

        // Display each enrolled course with a drop button
        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.classList.add('course-item');
            courseItem.innerHTML = `
                <div class="course-item-header">
                    <span class="course-id-name">${course.major_name} ${course.course_id}: ${course.course_name}</span>
                    <button class="drop-button" data-course-id="${course.course_id}">Drop</button>
                </div>
                <div class="course-description">
                    <p>${course.description}</p>
                </div>
            `;
            courseList.appendChild(courseItem);
        });

        // Add event listeners to all "Drop" buttons
        document.querySelectorAll('.drop-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const courseId = event.target.getAttribute('data-course-id');
                await dropCourse(courseId);
            });
        });
    } catch (error) {
        console.error(error);
    }
});

// Drop course function
async function dropCourse(courseId) {

    // Validate the token
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/drop-course/${courseId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error('Failed to drop course');
        alert('Successfully dropped the course!');
    } catch (error) {
        console.error("Error during course drop:", error);
    }
}

// Load dropped courses for the student
document.getElementById('dropped-courses').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem("token");
        const userResponse = await fetch("http://localhost:3000/api/dropped-courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!userResponse.ok) throw new Error('Failed to fetch dropped courses');

        const heading = document.querySelector('.course-dashboard h2');
        heading.textContent = 'Dropped Courses';

        const courses = await userResponse.json();
        const courseList = document.querySelector('.course-list');
        courseList.innerHTML = '';  // Clear previous courses

        // Display each dropped course
        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.classList.add('course-item');
            courseItem.innerHTML = `
                <div class="course-item-header">
                    <span class="course-id-name">${course.major_name} ${course.course_id}: ${course.course_name}</span>
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

// Display the Set/Update Major form when the button is clicked
document.getElementById('set-major-button').addEventListener('click', async () => {
    document.getElementById('set-major-form').style.display = 'block';

    // Fetch list of available majors
    try {
        const response = await fetch("http://localhost:3000/api/majors", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error('Failed to fetch majors');
        
        const majors = await response.json();
        const majorSelect = document.getElementById('major-select');
        majorSelect.innerHTML = '';  // Clear previous options

        // Populate the dropdown with majors
        majors.forEach(major => {
            const option = document.createElement('option');
            option.value = major.major_id;
            option.textContent = major.major_name;
            majorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching majors:", error);
    }
});

// Save the selected major for the user
document.getElementById('save-major-button').addEventListener('click', async () => {
    const selectedMajorId = document.getElementById('major-select').value;
    const token = localStorage.getItem("token");


    try {
        const response = await fetch("http://localhost:3000/api/set-major", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ major_id: selectedMajorId })
        });

        if (!response.ok) throw new Error('Failed to set/update major');

        alert('Major successfully set/updated!');
        document.getElementById('set-major-form').style.display = 'none';  // Hide the form
    } catch (error) {
        console.error("Error setting/updating major:", error);
    }
});

// Hide the change major modal initially
document.getElementById('set-major-button').addEventListener('click', () => {
    document.getElementById('set-major-form').style.display = 'block';
});

// Hide the close button in the change major modal
document.querySelector('#set-major-form .close').addEventListener('click', () => {
    document.getElementById('set-major-form').style.display = 'none';
});
