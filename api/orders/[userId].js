const applyCors = require("../_cors");
const supabase = require("../_supabase");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = req.query;

    const { data, error } = await supabase
        .from("orders")
        .select(
            "order_number, service, status, order_date, pickup_date, pickup_time, total, picked_up_at, washing_at, ready_at, out_for_delivery_at, delivered_at"
        )
        .eq("user_id", userId)
        .order("order_date", { ascending: false });

    if (error) {
        console.error("Error getting orders:", error);
        return res.status(500).json({ error: "Unable to get orders" });
    }

    res.status(200).json(data);
};
