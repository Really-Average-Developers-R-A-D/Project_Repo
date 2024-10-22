document.getElementById('username').addEventListener("onclick", hidePassForm);
document.getElementById('password').addEventListener("onclick", hidePassForm);

// Add Event Listener so user can just hit enter to login
document.getElementById('password').addEventListener("keyup", function(event){
    if (event.key === "Enter"){
       loginValidation();
    }
 });

// This functon validates the user login credentials
function loginValidation() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let message = document.getElementById('message');


    // Our database connectionnnn
    if (username == "tthie1" && password == "passpass") {
        message.innerHTML = 'Login successful!';
        message.className = 'success';
        window.location.href = 'landingStudent.html';
    } else if (username == "Dan" && password == "passpass"){
        message.innerHTML = 'Login successful!';
        message.className = 'success';
        window.location.href = 'landingTeacher.html';
    } else if (username == "Kamal" && password == "pass"){
        message.innerHTML = 'Login successful!';
        message.className = 'success';
        window.location.href = 'landingAdmin.html';
    } else {
        message.innerText = "Username and/or password is incorrect.";
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
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

// This function hides the forgot password form
function hidePassForm() {
    ///AGGHGUCEVYBJEJMODNIEVEUCBJ
}


// Add Event Listener so user does not have to click button
document.getElementById('email-reset').addEventListener("keyup", function(event){
    if (event.key === "Enter"){
       passReset();
    }
 });


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
        message.innerHTML = 'Please enter a valid email address! YOU FUCKING IDIOT';
        message.className = 'message error';
    }
}


