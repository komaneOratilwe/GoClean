const applyCors = require("./_cors");
const supabase = require("./_supabase");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    const { data: user, error } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        console.error("Error looking up user:", error);
        return res.status(500).json({ error: "Unable to process request." });
    }

    // Always the same generic response whether or not the account
    // exists, so someone can't use this to check which emails have
    // accounts.
    const genericMessage =
        "If an account exists with this email, a password reset link has been sent.";

    if (!user) {
        return res.status(200).json({ message: genericMessage });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { error: updateError } = await supabase
        .from("users")
        .update({
            reset_token: token,
            reset_token_expires: expires.toISOString()
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("Error saving reset token:", updateError);
        return res.status(500).json({ error: "Unable to process request." });
    }

    const resetLink = `${process.env.SITE_URL}/reset-password.html?token=${token}`;

    // ============= SEND THE EMAIL (via Gmail) =============

    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        await transporter.sendMail({
            from: `GoClean <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Reset your GoClean password",
            html: `
                <p>Hi ${user.full_name || "there"},</p>
                <p>We received a request to reset your GoClean password. This link expires in 24 hours.</p>
                <p><a href="${resetLink}">Click here to reset your password</a></p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            `
        });

    } catch (emailError) {

        console.error("Error sending email:", emailError);
        // We don't fail the whole request just because the email
        // failed to send - the token is still valid either way, and
        // we don't want to leak whether sending succeeded.

    }

    res.status(200).json({ message: genericMessage });
};
