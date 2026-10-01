const applyCors = require("./_cors");
const supabase = require("./_supabase");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "GET" && req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = req.method === "GET" ? req.query.token : req.body.token;

    if (!token) {
        return res.status(400).json({ error: "Verification token is required." });
    }

    const { data: user, error } = await supabase
        .from("users")
        .select("id, is_verified")
        .eq("verification_token", token)
        .maybeSingle();

    if (error) {
        console.error("Error looking up verification token:", error);
        return res.status(500).json({ error: "Unable to verify email." });
    }

    if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification link." });
    }

    if (user.is_verified) {
        return res.status(200).json({ message: "Email already verified." });
    }

    const { error: updateError } = await supabase
        .from("users")
        .update({
            is_verified: true,
            verification_token: null
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("Error verifying email:", updateError);
        return res.status(500).json({ error: "Unable to verify email." });
    }

    res.status(200).json({ message: "Email verified successfully! You can now log in." });
};
