const applyCors = require("./_cors");
const supabase = require("./_supabase");
const bcrypt = require("bcryptjs");

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

    // Check if this email is already registered
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

    // Hash the password before storing it - never save plain text passwords
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from("users")
        .insert({
            full_name: fullName,
            email: email,
            phone: phone || null,
            password_hash: passwordHash
        })
        .select("id, full_name, email")
        .single();

    if (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Unable to create account." });
    }

    res.status(201).json({
        message: "Account created successfully.",
        user: {
            id: data.id,
            fullName: data.full_name,
            email: data.email
        }
    });
};
