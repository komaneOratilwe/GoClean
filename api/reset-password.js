const applyCors = require("./_cors");
const supabase = require("./_supabase");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({
            error: "Reset token and new password are required."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            error: "Password must be at least 6 characters long."
        });
    }

    const { data: user, error } = await supabase
        .from("users")
        .select("id, reset_token_expires")
        .eq("reset_token", token)
        .maybeSingle();

    if (error) {
        console.error("Error looking up reset token:", error);
        return res.status(500).json({ error: "Unable to reset password." });
    }

    if (!user) {
        return res.status(400).json({
            error: "This reset link is invalid. Please request a new one."
        });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
        return res.status(400).json({
            error: "This reset link has expired. Please request a new one."
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
        .from("users")
        .update({
            password_hash: passwordHash,
            reset_token: null,
            reset_token_expires: null,
            // A successful reset is a good moment to also clear any
            // login lockout, since the person has just proven they
            // own the account.
            failed_login_attempts: 0,
            locked_until: null
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("Error updating password:", updateError);
        return res.status(500).json({ error: "Unable to reset password." });
    }

    res.status(200).json({
        message: "Your password has been updated successfully."
    });
};
