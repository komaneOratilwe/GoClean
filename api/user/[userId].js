const applyCors = require("../_cors");
const supabase = require("../_supabase");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    const { userId } = req.query;

    // ============= LOAD PROFILE =============
    if (req.method === "GET") {

        const { data, error } = await supabase
            .from("users")
            .select("id, full_name, email, phone, pickup_address, special_instructions, created_at")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("Error loading profile:", error);
            return res.status(500).json({ error: "Unable to load profile." });
        }

        if (!data) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json(data);
    }

    // ============= UPDATE PROFILE =============
    if (req.method === "PUT") {

        const { fullName, phone, pickupAddress, specialInstructions } = req.body;

        if (!fullName) {
            return res.status(400).json({ error: "Full name is required." });
        }

        const { data, error } = await supabase
            .from("users")
            .update({
                full_name: fullName,
                phone: phone || null,
                pickup_address: pickupAddress || null,
                special_instructions: specialInstructions || null
            })
            .eq("id", userId)
            .select("id, full_name, email, phone, pickup_address, special_instructions")
            .single();

        if (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ error: "Unable to update profile." });
        }

        return res.status(200).json(data);
    }

    res.status(405).json({ error: "Method not allowed" });
};
