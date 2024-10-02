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
    message.innerHTML = "";
}

// This function validates a user's email address and sends password reset instructions
function passReset() {
    const email = document.getElementById('email-reset').value;
    const message = document.getElementById('message');

    // Checks to see if the email field is filled
    if (email) {
        message.innerHTML = 'Further instructions sent to ' + email;
        message.className = 'message success';
    } else {
        message.innerHTML = 'Please enter a valid email address!';
        message.className = 'message error';
    }
}