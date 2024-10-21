//login.js(frontend)
document.querySelector("#loginBtn").addEventListener("click", async function() {
    // Get form data
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const role = document.querySelector("#role").value;
    login(username, password, role);
});

function selectRole(button) {
    // Remove the active status from all buttons
    let buttons = document.querySelectorAll('#role-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add the active status to user-selected button so it can be highlighted
    button.classList.add('active');

    // Get the selected role of the user
    document.querySelector("#role").value = button.getAttribute("data-role");
}

async function login(username, password, role) {
    const response = await fetch("/api/auth", {
        method: "POST",
        body: new URLSearchParams({ username: username, password_: password, user_role: role })
    });
    
    const loginStatus = document.querySelector("#errorMsg");
    if (response.ok) {
        const tokenResponse = await response.json();
        localStorage.setItem("token", tokenResponse.token);
        loginStatus.innerHTML = `Successfully authenticated as ${username}`;
        loginStatus.className = 'success';
        window.location.href = '/landingStudent.html';
    } else {
        loginStatus.innerHTML = `Login failed. Try again`;
        loginStatus.className = 'error';
    }
    clearForm();
}

function resetPassForm() {
    const emailReset = document.querySelector("#pass-reset");
    const divider = document.querySelector("#divider");
    divider.style.display = 'block';
    emailReset.style.display = 'block';
    //message.innerHTML = "";
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

function clearForm() {
    document.querySelector("#username").value = "";
    document.querySelector("#password").value = "";
    document.querySelector("#role").value = "Student";
}