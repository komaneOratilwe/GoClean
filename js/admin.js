/* =========================================
   GOCLEAN - ADMIN ORDER MANAGEMENT
   ========================================= */

const savedUser = localStorage.getItem("goclean_user");

if (!savedUser) {
    window.location.href = "login.html";
}

const currentUser = savedUser ? JSON.parse(savedUser) : null;

if (!currentUser || !currentUser.isAdmin) {
    window.location.href = "dashboard.html";
}

const messageBox = document.getElementById("message");
const table = document.getElementById("ordersTable");
const tableBody = document.getElementById("ordersTableBody");

const STATUS_OPTIONS = [
    "Pending",
    "Picked Up",
    "Washing",
    "Ready",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
];


function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = type;
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


async function loadOrders() {

    try {

        const response = await fetch(`/api/admin/orders?userId=${currentUser.id}`);

        const orders = await response.json();

        if (response.status === 403) {
            showMessage(
                "You don't have permission to view this page.",
                "error"
            );
            return;
        }

        if (!response.ok) {
            throw new Error(orders.error || "Unable to load orders.");
        }

        table.style.display = "";
        messageBox.style.display = "none";

        renderOrders(orders);

    } catch (error) {

        console.error("Error loading orders:", error);
        showMessage("Something went wrong loading orders.", "error");

    }

}


function renderOrders(orders) {

    tableBody.innerHTML = "";

    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">No orders yet.</td></tr>`;
        return;
    }

    orders.forEach(order => {

        const customerName = order.users ? order.users.full_name : "Unknown";

        const row = document.createElement("tr");

        const optionsHtml = STATUS_OPTIONS.map(status =>
            `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`
        ).join("");

        row.innerHTML = `
            <td>#${order.order_number}</td>
            <td>${customerName}</td>
            <td>${order.service}</td>
            <td>${formatDate(order.order_date)}</td>
            <td>R${Number(order.total).toFixed(2)}</td>
            <td>
                <select data-order-number="${order.order_number}">
                    ${optionsHtml}
                </select>
                <button class="save-btn" data-order-number="${order.order_number}">
                    Save
                </button>
            </td>
        `;

        tableBody.appendChild(row);

    });

    attachSaveButtons();

}


function attachSaveButtons() {

    const saveButtons = document.querySelectorAll(".save-btn");

    saveButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const orderNumber = button.getAttribute("data-order-number");

            const select = document.querySelector(
                `select[data-order-number="${orderNumber}"]`
            );

            const newStatus = select.value;

            button.disabled = true;
            button.textContent = "Saving...";

            try {

                const response = await fetch(`/api/admin/order/${orderNumber}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        status: newStatus
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Unable to update order.");
                }

                button.textContent = "Saved!";

                setTimeout(() => {
                    button.textContent = "Save";
                    button.disabled = false;
                }, 1500);

            } catch (error) {

                console.error("Error updating order:", error);
                alert(error.message);

                button.textContent = "Save";
                button.disabled = false;

            }

        });

    });

}


loadOrders();
