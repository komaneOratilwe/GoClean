/* =========================================
   GOCLEAN - DASHBOARD PAGE
   ========================================= */


/* ================= CHECK LOGIN ================= */

const savedUser = localStorage.getItem("goclean_user");

if (!savedUser) {

    window.location.href = "login.html";

}

const currentUser = savedUser ? JSON.parse(savedUser) : null;


/* ================= NOTIFICATIONS ================= */

const notificationButton = document.getElementById("notificationButton");
const notificationMessage = document.getElementById("notificationMessage");
const closeNotification = document.getElementById("closeNotification");


if (notificationButton) {

    notificationButton.addEventListener("click", function () {

        notificationMessage.classList.toggle("show");

    });

}


if (closeNotification) {

    closeNotification.addEventListener("click", function () {

        notificationMessage.classList.remove("show");

    });

}


/* ================= SERVICE ICONS ================= */

const serviceIcons = {

    "Wash & Fold": "fa-shirt",
    "Dry Cleaning": "fa-spray-can-sparkles",
    "Ironing": "fa-temperature-low",
    "Bedding": "fa-bed",
    "Pickup & Delivery": "fa-truck",
    "Special Care": "fa-hand-sparkles"

};


/* ================= WELCOME MESSAGE ================= */

function loadWelcomeMessage() {

    const welcomeHeading = document.querySelector(".welcome-section h1");

    if (!welcomeHeading || !currentUser) {
        return;
    }

    const firstName = currentUser.fullName
        ? currentUser.fullName.split(" ")[0]
        : "there";

    welcomeHeading.innerHTML = `Welcome back, ${firstName}! <span>\ud83d\udc4b</span>`;

}


/* ================= STATUS CLASS HELPER ================= */

function getStatusClass(status) {

    return status.toLowerCase().replace(/\s+/g, "-");

}


/* ================= FORMAT DATE ================= */

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


/* ================= CURRENT ORDER CARD ================= */

function updateCurrentOrder(order) {

    const section = document.querySelector(".current-order-section");

    if (!section) {
        return;
    }

    if (!order) {

        section.style.display = "none";

        return;

    }

    section.style.display = "";

    const orderNumberEl = section.querySelector(".order-number");
    const titleEl = section.querySelector(".order-details h3");
    const statusEl = section.querySelector(".status");
    const dateStrong = section.querySelector(".info-item:nth-child(1) strong");
    const trackLinks = section.querySelectorAll("a[href^='track-order.html']");

    if (orderNumberEl) {
        orderNumberEl.textContent = "#" + order.order_number;
    }

    if (titleEl) {
        titleEl.textContent = order.service;
    }

    if (statusEl) {

        statusEl.className = "status " + getStatusClass(order.status);
        statusEl.textContent = order.status;

    }

    if (dateStrong) {
        dateStrong.textContent =
            formatDate(order.pickup_date) + ", " + (order.pickup_time || "");
    }

    trackLinks.forEach(link => {
        link.href = "track-order.html?id=" + order.order_number;
    });

}


/* ================= RECENT ORDERS LIST ================= */

function updateRecentOrders(orders) {

    const ordersList = document.querySelector(".orders-list");

    if (!ordersList) {
        return;
    }

    ordersList.innerHTML = "";

    if (orders.length === 0) {

        ordersList.innerHTML = `<p>You haven't placed any orders yet.</p>`;

        return;

    }

    orders.forEach(order => {

        const icon = serviceIcons[order.service] || "fa-shirt";

        const row = document.createElement("div");
        row.className = "recent-order";

        row.innerHTML = `
            <div class="recent-main">

                <div class="order-icon">
                    <i class="fa-solid ${icon}"></i>
                </div>

                <div>
                    <span class="recent-number">#${order.order_number}</span>
                    <h3>${order.service}</h3>
                    <p>
                        ${order.quantity} kg
                        <span>\u2022</span>
                        ${formatDate(order.order_date)}
                    </p>
                </div>

            </div>

            <div class="recent-right">

                <div class="recent-status ${getStatusClass(order.status)}">
                    ${order.status}
                </div>

                <strong>R${Number(order.total).toFixed(2)}</strong>

                <a href="track-order.html?id=${order.order_number}">
                    Track Order
                </a>

            </div>
        `;

        ordersList.appendChild(row);

    });

}


/* ================= LOAD DASHBOARD DATA ================= */

async function loadDashboard() {

    loadWelcomeMessage();

    if (!currentUser) {
        return;
    }

    try {

        const response = await fetch(`/api/orders/${currentUser.id}`);

        const orders = await response.json();

        if (!response.ok) {
            throw new Error(orders.error || "Unable to load orders.");
        }

        /*
            The most recent order that isn't finished yet
            becomes the "current order" card. Everything else
            (up to 3) becomes the recent orders list.
        */

        const activeOrder = orders.find(order =>
            order.status !== "Completed" && order.status !== "Cancelled"
        );

        updateCurrentOrder(activeOrder || null);

        const recentOrders = orders
            .filter(order => order !== activeOrder)
            .slice(0, 3);

        updateRecentOrders(recentOrders);

    } catch (error) {

        console.error("Dashboard error:", error);

    }

}


/* ================= START ================= */

loadDashboard();
