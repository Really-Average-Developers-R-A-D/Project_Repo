// This functon validates the user login credentials
function loginValidation() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (username == "Joe" && password == "passpass") {
        message.innerHTML = 'Login successful!';
        message.className = 'success';
    } else {
        message.innerHTML = "Invalid credentials";
        message.className = 'error';
    }
}

// This functions makes the forgot password form visible if selected
function resetPassForm() {
    const emailReset = document.getElementById('pass-reset');
    emailReset.style.display = 'block';
    document.getElementById('divider').style.display = 'block';
    message.innerHTML = "";
}

// This function validates a user's email address and sends password reset instructions
function passReset() {
    const email = document.getElementById('email-reset').value;
    const message = document.getElementById('message');

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

// This function improves user interaction by highlighting a role when selected by user
function selectRole(button) {
    // Remove the active status from all buttons
    let buttons = document.querySelectorAll('.role-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add the active status to user selected button so it can be highlighted
    button.classList.add('active');
}
