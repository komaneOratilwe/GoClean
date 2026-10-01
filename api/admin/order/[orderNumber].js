const applyCors = require("../../_cors");
const supabase = require("../../_supabase");

// Which timestamp column to stamp for each status, so the Track
// Order timeline has something real driving it.
const STATUS_TIMESTAMP_COLUMNS = {
    "Picked Up": "picked_up_at",
    "Washing": "washing_at",
    "Ready": "ready_at",
    "Out for Delivery": "out_for_delivery_at",
    "Delivered": "delivered_at"
};

const VALID_STATUSES = [
    "Pending",
    "Picked Up",
    "Washing",
    "Ready",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
];

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { orderNumber } = req.query;
    const { userId, status } = req.body;

    if (!userId || !status) {
        return res.status(400).json({ error: "Missing required information." });
    }

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
    }

    // ============= CHECK THIS USER IS ACTUALLY AN ADMIN =============

    const { data: requestingUser, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();

    if (userError) {
        console.error("Error checking admin status:", userError);
        return res.status(500).json({ error: "Unable to update order." });
    }

    if (!requestingUser || !requestingUser.is_admin) {
        return res.status(403).json({ error: "Not authorized." });
    }

    // ============= UPDATE THE ORDER =============

    const updateData = { status };

    const timestampColumn = STATUS_TIMESTAMP_COLUMNS[status];

    if (timestampColumn) {
        updateData[timestampColumn] = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("order_number", orderNumber)
        .select("order_number, status")
        .maybeSingle();

    if (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ error: "Unable to update order." });
    }

    if (!data) {
        return res.status(404).json({ error: "Order not found." });
    }

    res.status(200).json({
        message: "Order updated successfully.",
        order: data
    });
};
