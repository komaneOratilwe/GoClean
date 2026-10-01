const applyCors = require("../_cors");
const supabase = require("../_supabase");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "Missing user information." });
    }

    // ============= CHECK THIS USER IS ACTUALLY AN ADMIN =============

    const { data: requestingUser, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();

    if (userError) {
        console.error("Error checking admin status:", userError);
        return res.status(500).json({ error: "Unable to load orders." });
    }

    if (!requestingUser || !requestingUser.is_admin) {
        // Same "not found"-style response whether the user doesn't
        // exist or just isn't an admin - don't reveal which.
        return res.status(403).json({ error: "Not authorized." });
    }

    // ============= LOAD ALL ORDERS, WITH THE CUSTOMER'S NAME =============

    const { data, error } = await supabase
        .from("orders")
        .select(
            "order_number, status, service, quantity, total, order_date, pickup_date, pickup_time, users(full_name, email)"
        )
        .order("order_date", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Error loading orders:", error);
        return res.status(500).json({ error: "Unable to load orders." });
    }

    res.status(200).json(data);
};
