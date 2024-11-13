
//login.js(frontend)

// Collect user inputs and selections to be sent to the backend
document.querySelector("#loginBtn").addEventListener("click", async function() {
    // Get form data
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const role = document.querySelector("#role").value;
    login(username, password, role);
});

// This function updates the user's role based off the user's selection
function selectRole(button) {
    // Remove the active status from all buttons, changing the color of the selected role
    let buttons = document.querySelectorAll('#role-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Get the selected role of the user
    document.querySelector("#role").value = button.getAttribute("data-role");
}

// This function authenticates the user and sends inputs to the backend
async function login(username, password, role) {

    const response = await fetch("http://localhost:3000/api/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            username: username, 
            password: password, 
            user_role: role
        })
        
    });
    
    const loginStatus = document.querySelector("#errorMsg");
 
    // Authenticate the user's credentials 
    if (response.ok) {
        const tokenResponse = await response.json();
        localStorage.setItem("token", tokenResponse.token);
        loginStatus.innerHTML = `Successfully authenticated as '${username}'\n loading...`;
        loginStatus.className = 'success';
        setTimeout(() => {
            if (role == "student") {
                window.location.href = 'http://127.0.0.1:5500/public/landingStudent.html';
            } else if (role == "teacher") {
                window.location.href = 'http://127.0.0.1:5500/public/landingTeacher.html';
            } else if (role == "administrator") {
                window.location.href = 'http://127.0.0.1:5500/public/landingAdmin.html'
            }
        }, 1000);
    } else {
        loginStatus.innerHTML = `Login failed. Try again`;
        loginStatus.className = 'error';
    }
    clearForm();
}

// Clear the form if authentication fails
function clearForm() {
    document.querySelector("#username").value = "";
    document.querySelector("#password").value = "";
    document.querySelector("#role").value = "";
}

// Show the password reset form
function resetPassForm() {
    const emailReset = document.querySelector("#pass-reset");
    const divider = document.querySelector("#divider");
    divider.style.display = 'block';
    emailReset.style.display = 'block';
}

// This function validates a user's email address and sends password reset instructions
function passReset() {
    const email = document.querySelector('#email-reset').value;
    const message = document.querySelector('#errorMsg');

    // This is a regular expression that validates the email format
    // No spaces, one or more character before "@", one or more character after "@" before ".", one or more character after "@" 
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Checks to see if the email field is filled amd valid
    if (emailValid.test(email)) {
        message.innerHTML = 'Further instructions sent to ' + email;
        message.className = 'message success';
    } else {
        message.innerHTML = 'Please enter a valid email address!';
        message.className = 'message error';
    }
    
}
