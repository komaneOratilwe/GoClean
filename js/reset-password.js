const resetPasswordForm = document.getElementById("resetPasswordForm");

const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get("token");

resetPasswordForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;


    if (!resetToken) {
        alert("This reset link is invalid. Please request a new one.");
        window.location.href = "forgot-password.html";
        return;
    }


    // Check password length
    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }


    // Check that both passwords match
    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }


    try {

        const response = await fetch("/api/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: resetToken,
                password: newPassword
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to reset password.");
        }

        alert("Your password has been updated successfully!");

        window.location.href = "login.html";

    } catch (error) {

        console.error("Reset password error:", error);
        alert(error.message);

    }

});
