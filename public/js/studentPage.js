
//studentPage.js(frontend)

// This function gets the user's firstname and lastname from the database to display on the top right of the screen
document.addEventListener("DOMContentLoaded", async () => {
    try {
        //console.log("inside studentPage.js");
        const token = localStorage.getItem("token");
        console.log("Token in local storage: ", token);
        const response = await fetch("http://localhost:3000/api/user-details", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });
        console.log("Response: ", response)
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
    const changePasswordLink = document.querySelector("a[href='#']");
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
            //console.log("response from name change:", response);
            const result = await response.json();
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
    //message.innerHTML = "";
}

// Function to close the password reset popup
document.querySelector(".pass-reset .close").addEventListener("click", () => {
    document.getElementById("pass-reset").style.display = "none";
});

/*document.addEventListener("DOMContentLoaded", async () => {
    // Fetch user details for the header
    //console.log("StudentPage.js getting courses")
    try {
        const token = localStorage.getItem("token");
        const courseResponse = await fetch("http://localhost:3000/api/user-details", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        //console.log("Token:", token);
    
        if (!courseResponse.ok) throw new Error('Failed to fetch available courses');

        const courses = await courseResponse.json();
        console.log("Courses: ", courses);
        const courseList = document.querySelector('.course-list');
        courseList.innerHTML = '';  // Clear previous courses

        courses.forEach(course => {
            // Create course item container
            const courseItem = document.createElement("div");
            courseItem.classList.add("course-item");

            // Populate course item with structured content
            courseItem.innerHTML = `
                <div class="course-item-header">
                    <span class="course-register-date">${course.register_date}</span>
                    <span class="course-id-name">${course.course_id}: ${course.course_name}</span>
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
});*/

// Loads the student's courses
document.addEventListener("DOMContentLoaded", async () => {
    // Fetch user details for the header
    console.log("StudentPage.js getting courses") 
    try {
        const token = localStorage.getItem("token");
        const userResponse = await fetch("http://localhost:3000/api/user-details", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("Token:", token);

        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("Checking the response");
            document.getElementById("user-name").textContent = `${userData.firstName} ${userData.lastName}`;
            document.getElementById("user-initials").textContent = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
            console.log("Response success");
        } else {
            console.error("Failed to fetch user details");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }

    // Fetch courses for the student
    try {
        console.log("Getting courses for the student");
        const courseResponse = await fetch("http://localhost:3000/api/student-courses", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (courseResponse.ok) {
            const courses = await courseResponse.json();
            const courseList = document.querySelector(".course-list");
            courseList.innerHTML = ""; // Clear any static content
            console.log("Here are the courses");
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

   

document.getElementById('available-courses').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem("token");
        const userResponse = await fetch("http://localhost:3000/api/available-courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("Token:", token);
    
        if (!userResponse.ok) throw new Error('Failed to fetch available courses');
        
        // Change the title to available courses
        const heading = document.querySelector('.course-dashboard h2');
        heading.textContent = 'Available Courses';

        const courses = await userResponse.json();
        console.log("Courses: ", courses);
        const courseList = document.querySelector('.course-list');
        courseList.innerHTML = '';  // Clear previous courses

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

// Returns to the main screen when the dashboard button is clicked
document.getElementById("dashboard-button").addEventListener("click", async () => {
    // Fetch courses for the student
    try {
        const token = localStorage.getItem("token");
        const courseResponse = await fetch("http://localhost:3000/api/student-courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("dash Token:", token);
    
        if (!courseResponse.ok) throw new Error('Failed to fetch student courses');
        
        // Change the title to available courses
        const heading = document.querySelector('.course-dashboard h2');
        heading.textContent = 'My Courses';

        const courses = await courseResponse.json();
        console.log("Courses: ", courses);
        const courseList = document.querySelector('.course-list');
        courseList.innerHTML = '';  // Clear previous courses

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