document.addEventListener("DOMContentLoaded", () => {

    // ============= CHECK LOGIN =============
    const savedUser = localStorage.getItem("goclean_user");

    if (!savedUser) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(savedUser);
    const userId = user.id;

    // Find the table body
    const ordersTableBody = document.querySelector(".orders-table tbody");

    // Get orders from the GoClean backend
    fetch(`/api/orders/${userId}`)
        .then(response => {

            if (!response.ok) {
                throw new Error("Could not load orders.");
            }

            return response.json();
        })

        .then(orders => {

            // Clear the hard-coded orders
            ordersTableBody.innerHTML = "";

            // If the customer has no orders
            if (orders.length === 0) {

                ordersTableBody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            No orders found.
                        </td>
                    </tr>
                `;

                return;
            }

            // Add each order from the database
            orders.forEach(order => {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>#${order.order_number}</td>

                    <td>${order.service}</td>

                    <td>
                        <span class="status ${getStatusClass(order.status)}">
                            ${order.status}
                        </span>
                    </td>

                    <td>${formatDate(order.order_date)}</td>

                    <td>R${Number(order.total).toFixed(2)}</td>

                    <td>
                        <a 
                            href="track-order.html?id=${order.order_number}" 
                            class="view-details"
                        >
                            Track Order
                        </a>

                        ${order.status === "Pending" ? `
                            <button
                                class="cancel-order-btn"
                                data-order-number="${order.order_number}"
                                style="margin-left: 8px;"
                            >
                                Cancel
                            </button>
                        ` : ""}
                    </td>
                `;

                ordersTableBody.appendChild(row);
            });

            attachCancelButtons(userId);
        })

        .catch(error => {

            console.error("Error:", error);

            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load orders.
                    </td>
                </tr>
            `;
        });
});


// Wires up every Cancel button on the page to actually cancel the order
function attachCancelButtons(userId) {

    const cancelButtons = document.querySelectorAll(".cancel-order-btn");

    cancelButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const orderNumber = button.getAttribute("data-order-number");

            const confirmed = confirm(
                `Are you sure you want to cancel order #${orderNumber}?`
            );

            if (!confirmed) {
                return;
            }

            button.disabled = true;
            button.textContent = "Cancelling...";

            try {

                const response = await fetch(`/api/order/${orderNumber}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Unable to cancel order.");
                }

                // Reload the page so the table reflects the new status
                window.location.reload();

            } catch (error) {

                console.error("Cancel order error:", error);
                alert(error.message);

                button.disabled = false;
                button.textContent = "Cancel";

            }

        });

    });

}


// Converts the order status into a CSS class
function getStatusClass(status) {

    switch (status.toLowerCase()) {

        case "in progress":
            return "in-progress";

        case "completed":
            return "completed";

        case "cancelled":
            return "cancelled";

        case "pending":
            return "pending";

        default:
            return "";
    }
}


// Formats the date displayed in the table
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}