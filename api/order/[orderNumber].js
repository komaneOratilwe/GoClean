const applyCors = require("../_cors");
const supabase = require("../_supabase");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    const { orderNumber } = req.query;

    // ============= GET ORDER DETAILS =============
    if (req.method === "GET") {

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "Missing user information." });
        }

        const { data, error } = await supabase
            .from("orders")
            .select(
                "order_number, user_id, service, status, order_date, pickup_date, pickup_time, pickup_address, delivery_address, special_instructions, quantity, total, picked_up_at, washing_at, ready_at, out_for_delivery_at, delivered_at, delivery_date, delivery_time"
            )
            .eq("order_number", orderNumber)
            .maybeSingle();

        if (error) {
            console.error("Error getting order:", error);
            return res.status(500).json({ error: "Unable to get order." });
        }

        /*
            We check "not found" and "not yours" the same way on purpose -
            this stops someone from being able to tell the difference
            between an order that doesn't exist and one that belongs to
            someone else, just by trying random order numbers.
        */

        if (!data || String(data.user_id) !== String(userId)) {
            return res.status(404).json({ error: "Order not found." });
        }

        delete data.user_id;

        return res.status(200).json(data);

    }

    // ============= CANCEL ORDER =============
    if (req.method === "PATCH") {

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "Missing user information." });
        }

        const { data: existingOrder, error: lookupError } = await supabase
            .from("orders")
            .select("user_id, status")
            .eq("order_number", orderNumber)
            .maybeSingle();

        if (lookupError) {
            console.error("Error looking up order:", lookupError);
            return res.status(500).json({ error: "Unable to cancel order." });
        }

        if (!existingOrder || String(existingOrder.user_id) !== String(userId)) {
            return res.status(404).json({ error: "Order not found." });
        }

        // Only a pending order can be cancelled - once it's being
        // worked on, it's too late to just cancel it.
        if (existingOrder.status !== "Pending") {
            return res.status(400).json({
                error: "This order can no longer be cancelled."
            });
        }

        const { data: updatedOrder, error: updateError } = await supabase
            .from("orders")
            .update({ status: "Cancelled" })
            .eq("order_number", orderNumber)
            .select("order_number, status")
            .single();

        if (updateError) {
            console.error("Error cancelling order:", updateError);
            return res.status(500).json({ error: "Unable to cancel order." });
        }

        return res.status(200).json({
            message: "Order cancelled successfully.",
            order: updatedOrder
        });

    }

    res.status(405).json({ error: "Method not allowed" });
};