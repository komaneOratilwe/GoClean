const applyCors = require("./_cors");
const supabase = require("./_supabase");
const bcrypt = require("bcryptjs");

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required."
        });
    }

    const { data: user, error } = await supabase
        .from("users")
        .select("id, full_name, email, password_hash, failed_login_attempts, locked_until, is_verified")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        console.error("Error looking up user:", error);
        return res.status(500).json({ error: "Unable to log in." });
    }

    // Same error for "no such user" and "wrong password" -
    // this is intentional, so people can't use the error to guess
    // which emails have accounts.
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    // ============= CHECK IF LOCKED =============

    if (user.locked_until && new Date(user.locked_until) > new Date()) {

        const minutesLeft = Math.ceil(
            (new Date(user.locked_until) - new Date()) / 60000
        );

        return res.status(429).json({
            error: `Too many failed attempts. Please try again in ${minutesLeft} minute(s).`
        });

    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {

        // ============= RECORD THE FAILED ATTEMPT =============

        const newAttemptCount = (user.failed_login_attempts || 0) + 1;

        const updateData = {
            failed_login_attempts: newAttemptCount
        };

        let lockedNow = false;

        if (newAttemptCount >= MAX_FAILED_ATTEMPTS) {

            const lockUntil = new Date(
                Date.now() + LOCKOUT_MINUTES * 60000
            );

            updateData.locked_until = lockUntil.toISOString();
            lockedNow = true;

        }

        await supabase
            .from("users")
            .update(updateData)
            .eq("id", user.id);

        if (lockedNow) {
            return res.status(429).json({
                error: `Too many failed attempts. Please try again in ${LOCKOUT_MINUTES} minutes.`
            });
        }

        return res.status(401).json({ error: "Invalid email or password." });

    }

    // ============= CHECK EMAIL IS VERIFIED =============

    if (!user.is_verified) {
        return res.status(403).json({
            error: "Please verify your email before logging in. Check your inbox for the verification link."
        });
    }

    // ============= SUCCESSFUL LOGIN - RESET COUNTER =============

    if (user.failed_login_attempts > 0 || user.locked_until) {

        await supabase
            .from("users")
            .update({
                failed_login_attempts: 0,
                locked_until: null
            })
            .eq("id", user.id);

    }

    res.status(200).json({
        message: "Login successful!.",
        user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email
        }
    });
};
