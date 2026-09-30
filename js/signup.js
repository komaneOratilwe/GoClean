// Get the signup form
const signupForm = document.getElementById("signupForm");

// Get the password fields
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

// Get the password eye icons
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");


// Show / hide password
togglePassword.addEventListener("click", function () {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
    }

});


// Show / hide confirm password
toggleConfirmPassword.addEventListener("click", function () {

    if (confirmPassword.type === "password") {
        confirmPassword.type = "text";
        toggleConfirmPassword.classList.remove("fa-eye");
        toggleConfirmPassword.classList.add("fa-eye-slash");
    } else {
        confirmPassword.type = "password";
        toggleConfirmPassword.classList.remove("fa-eye-slash");
        toggleConfirmPassword.classList.add("fa-eye");
    }

});


// Handle signup form
signupForm.addEventListener("submit", async function (event) {

    // Stop the page from refreshing
    event.preventDefault();

    // Get the values entered by the user
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;


    // Check that all fields have been filled in
    if (
        fullname === "" ||
        email === "" ||
        phone === "" ||
        passwordValue === "" ||
        confirmPasswordValue === ""
    ) {
        alert("Please fill in all the fields.");
        return;
    }


    // Check that the passwords match
    if (passwordValue !== confirmPasswordValue) {
        alert("Passwords do not match.");
        return;
    }


    // Check password length
    if (passwordValue.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }


    // REAL SIGNUP - sends the details to our Vercel
    // serverless function, which creates the user in Supabase

    try {

        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: fullname,
                email: email,
                phone: phone,
                password: passwordValue
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Unable to create account. Please try again.");
            return;
        }

        alert("Account created successfully!");

        // Send the user to the login page
        window.location.href = "login.html";

    } catch (error) {

        console.error("Signup error:", error);
        alert("Something went wrong. Please check your connection and try again.");

    }

});