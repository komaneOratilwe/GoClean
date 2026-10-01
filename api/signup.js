const applyCors = require("./_cors");
const supabase = require("./_supabase");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            error: "Full name, email and password are required."
        });
    }

    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (existingUser) {
        return res.status(409).json({
            error: "An account with this email already exists."
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const { data, error } = await supabase
        .from("users")
        .insert({
            full_name: fullName,
            email: email,
            phone: phone || null,
            password_hash: passwordHash,
            verification_token: verificationToken,
            is_verified: false
        })
        .select("id, full_name, email")
        .single();

    if (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Unable to create account." });
    }

    const verifyLink = `${process.env.SITE_URL}/verify-email.html?token=${verificationToken}`;

    // ============= SEND THE VERIFICATION EMAIL (via Gmail) =============

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
            subject: "Verify your GoClean account",
            html: `
                <p>Hi ${fullName},</p>
                <p>Thanks for signing up for GoClean. Please verify your email address to activate your account.</p>
                <p><a href="${verifyLink}">Click here to verify your email</a></p>
                <p>If you didn't create this account, you can safely ignore this email.</p>
            `
        });

    } catch (emailError) {

        console.error("Error sending verification email:", emailError);
        // We don't fail account creation just because the email
        // failed to send - the account still exists and the token
        // is still valid.

    }

    res.status(201).json({
        message: "Email sent! Please check your inbox to verify your account.",
        user: {
            id: data.id,
            fullName: data.full_name,
            email: data.email
        }
    });
};
