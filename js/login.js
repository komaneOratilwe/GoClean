/* =========================================
   GOCLEAN - LOGIN PAGE
   ========================================= */


/* ================= LOGIN FORM ================= */

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    /* Check that both fields contain information */

    if (email === "" || password === "") {

        alert("Please enter your email address and password.");

        return;

    }


    /*
        REAL LOGIN

        Sends the email and password to our Vercel
        serverless function, which checks Supabase.
    */

    try {

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Login failed. Please try again.");
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
            return;
        }

        /*
            Save the logged-in user so other pages
            (like placing an order) know who's logged in.
        */

        localStorage.setItem("goclean_user", JSON.stringify(result.user));

        alert("Login successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error("Login error:", error);
        alert("Something went wrong. Please check your connection and try again.");

    }

});



/* ================= SHOW / HIDE PASSWORD ================= */

const togglePassword =
    document.getElementById("togglePassword");

const passwordInput =
    document.getElementById("password");


togglePassword.addEventListener("click", function() {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.classList.remove("fa-eye");

        togglePassword.classList.add("fa-eye-slash");

    } else {

        passwordInput.type = "password";

        togglePassword.classList.remove("fa-eye-slash");

        togglePassword.classList.add("fa-eye");

    }

});
