const applyCors = require("../_cors");
const supabase = require("../_supabase");

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        user_id,
        service,
        pickup_date,
        pickup_time,
        pickup_address,
        delivery_address,
        special_instructions,
        quantity,
        total
    } = req.body;

    // Basic validation - same rules as before
    if (
        !user_id ||
        !service ||
        !pickup_date ||
        !pickup_time ||
        !pickup_address ||
        !delivery_address ||
        !quantity ||
        !total
    ) {
        return res.status(400).json({
            error: "Please provide all required order information."
        });
    }

    // Generate an order number, same style as before
    const orderNumber = "QRD" + Math.floor(1000 + Math.random() * 9000);

    const { data, error } = await supabase
        .from("orders")
        .insert({
            order_number: orderNumber,
            user_id: user_id,
            service: service,
            status: "Pending",
            pickup_date: pickup_date,
            pickup_time: pickup_time,
            pickup_address: pickup_address,
            delivery_address: delivery_address,
            special_instructions: special_instructions || "",
            quantity: quantity,
            total: total
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ error: "Unable to create order." });
    }

    res.status(201).json({
        message: "Order created successfully.",
        orderNumber: orderNumber,
        orderId: data.id
    });
};
