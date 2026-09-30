const forgotPasswordForm = document.getElementById("forgotPasswordForm");

forgotPasswordForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (email === "") {
        alert("Please enter your email address.");
        return;
    }

    try {

        const response = await fetch("/api/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Something went wrong.");
        }

        /*
            NOTE: since this project doesn't send real emails yet,
            the reset link is handed back directly here instead of
            being emailed. In a real production version, this is the
            one part that would change - the person would click a
            link in their inbox instead of being redirected
            immediately.
        */

        if (result.resetToken) {

            alert(result.message);

            window.location.href =
                "reset-password.html?token=" + result.resetToken;

        } else {

            // No account exists with this email - still show the
            // same generic message, and don't redirect anywhere.
            alert(result.message);

        }

    } catch (error) {

        console.error("Forgot password error:", error);
        alert("Something went wrong. Please try again.");

    }

});
