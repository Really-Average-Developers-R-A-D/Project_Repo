//admin page coming from studentPage.js(frontend)

// This function gets the user's firstname and lastname from the database to display on the top right of the screen
document.addEventListener("DOMContentLoaded", async () => {

    document.querySelector('.add-student-form').style.display = 'none';
    document.querySelector('.add-teacher-form').style.display = 'none';
    document.querySelector('.add-major-form').style.display = 'none';

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

        const majors = await response.json();
        const majorList = document.querySelector('.retrieved-data-list');
        majorList.innerHTML = '';

        majors.forEach(major => {
            const majorItem = document.createElement("div");
            majorItem.classList.add("major-item");
            majorItem.innerHTML = `
                <div style="display: flex; align-items: center;">
                <h3 style="font-weight: bold; margin-right: 20px;">${major.major_name}</h3>
                <p style="margin: 0;">${major.descritption}</p>
                </div>
            `;
            majorList.appendChild(majorItem);
        });
    } catch (error) {
        console.error("Error displaying majors:", error);
    }
}

async function fetchAndDisplayCourses() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/all-courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error('Failed to fetch courses');

        const courses = await response.json();
        const courseList = document.querySelector('.retrieved-data-list');
        courseList.innerHTML = '';

        courses.forEach(course => {
            const courseItem = document.createElement("div");
            courseItem.classList.add("major-item");
            courseItem.innerHTML = `
            <button class="course-button" data-course-id="${course.course_id}">
            ${course.course_id}: ${course.course_name} </button>
            <p>${course.description}</p>
            <p><strong>Current enrollment: ${course.current_enrollment}/${course.max_capacity}</strong></p>
            `;
            courseList.appendChild(courseItem);
        });

    } catch (error) {
        console.error("Error displaying courses:", error);
    }
    document.querySelectorAll('.course-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const courseID = event.target.getAttribute('data-course-id');
            handleCourseClick(courseID);
        });
    });

}


async function addAStudent() {
    const heading = document.querySelector("#content h1");
    heading.textContent = "Add a Student";

    document.querySelector('.admin-buttons').style.display = 'none';

    const majorList = document.querySelector('.major-list');
    majorList.className = 'form';
    document.querySelector('.retrieved-data-list').style.display = 'none';
    document.querySelector('.add-teacher-form').style.display = 'none';
    document.querySelector('.add-major-form').style.display = 'none';
    document.querySelector('.add-student-form').style.display = 'block';

    const studentForm = document.getElementById("studentForm");
    studentForm.addEventListener("submit", (submitEvent) => {
        submitEvent.preventDefault();

        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const phoneNumber = document.getElementById("phoneNumber").value;

        addAStudentAPIcall(firstName, lastName, username, password, phoneNumber);

        alert("Student added successfully!");

        studentForm.reset();
    });
}

async function addATeacher() {
    const heading = document.querySelector("#content h1");
    heading.textContent = "Add a Teacher";

    document.querySelector('.admin-buttons').style.display = 'none';
    document.querySelector('.retrieved-data-list').style.display = 'none';
    document.querySelector('.add-student-form').style.display = 'none';
    document.querySelector('.add-major-form').style.display = 'none';
    document.querySelector('.add-teacher-form').style.display = 'block';

    const majorList = document.querySelector('.major-list');
    majorList.className = 'form';

    const teacherForm = document.getElementById("teacherForm");
    teacherForm.addEventListener("submit", (submitEvent) => {
        submitEvent.preventDefault();

        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const phoneNumber = document.getElementById("phoneNumber").value;
        const office = document.getElementById("officeNumber").value;

        addATeacherAPIcall(firstName, lastName, username, password, phoneNumber, office);

        alert("Teacher added successfully!");

        teacherForm.reset();
    });

}

async function addAMajor() {
    const heading = document.querySelector("#content h1");
    heading.textContent = "Add a Major";

    document.querySelector('.admin-buttons').style.display = 'none';

    const majorList = document.querySelector('.major-list');
    majorList.className = 'form';
    document.querySelector('.retrieved-data-list').style.display = 'none';
    document.querySelector('.add-teacher-form').style.display = 'none';
    document.querySelector('.add-student-form').style.display = 'none';
    document.querySelector('.add-major-form').style.display = 'block';

    const majorForm = document.getElementById("majorForm");
    majorForm.addEventListener("submit", (submitEvent) => {
        submitEvent.preventDefault();

        const majorName = document.getElementById("majorName").value;
        const majorDescription = document.getElementById("majorDescription").value;

        addAMajorAPIcall(majorName, majorDescription);

        alert("Form submitted successfully!");

        majorForm.reset();
    });
};

async function returnToDashboard() {
    const heading = document.querySelector("#content h1");
    heading.textContent = "Dashboard";

    document.querySelector('.admin-buttons').style.display = 'block';
    document.querySelector('.retrieved-data-list').style.display = 'block';
    document.querySelector('.add-teacher-form').style.display = 'none';
    document.querySelector('.add-student-form').style.display = 'none';
    document.querySelector('.add-major-form').style.display = 'none';

    const navBar = document.querySelector('.admin-info');
    navBar.innerHTML = '';
    const majorList = document.querySelector('.major-list');
    majorList.innerHTML = '';
}

async function handleCourseClick(courseID) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/get-course-professor?courseId=${courseID}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Failure:', errorDetails);
            throw new Error('Failed to retrieve professor for course');
        }

        const course = await response.json(); // Parse the response once
        console.log('Course professor retrieved successfully:', course);


        const courseInfo = document.querySelector('.retrieved-data-list');
        courseInfo.innerHTML = '';

        const professorDiv = document.createElement("div");
        professorDiv.innerHTML = `
            <h3>Professor Information</h3>
            <p>First Name: ${course.first_name}</p>
            <p>Last Name: ${course.last_name}</p>
        `;

        courseInfo.appendChild(professorDiv);

    } catch (error) {
        console.error("You have an error:", error);
    }
}



async function handleMajorClick(majorID) {


}


async function addAStudentAPIcall(firstName, lastName, username, password, phoneNumber) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/add-a-student", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName, lastName, username, password, phoneNumber })
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Failure:', errorDetails);
            throw new Error('Failed to add student');
        } else {
            const data = await response.json();
            console.log('Student added successfully:', data);
        }
    } catch (error) {
        console.error("You have an error:", error);
    }

}

async function addATeacherAPIcall(firstName, lastName, username, password, phoneNumber, office) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/add-a-teacher", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName, lastName, username, password, phoneNumber, office })
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Failure:', errorDetails);
            throw new Error('Failed to add teacher');
        } else {
            const data = await response.json();
            console.log('Teacher added successfully:', data);
        }
    } catch (error) {
        console.error("You have an error:", error);
    }

}

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
    } catch (error) {
        console.error("Error displaying majors:", error);
    }

}