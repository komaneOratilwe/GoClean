/* =========================================
   GOCLEAN - DASHBOARD PAGE
   ========================================= */


/* ================= CHECK LOGIN ================= */

const savedUser = localStorage.getItem("goclean_user");

if (!savedUser) {

    window.location.href = "login.html";

}

const currentUser = savedUser ? JSON.parse(savedUser) : null;


/* ================= ADMIN LINK ================= */

function addAdminLinkIfNeeded() {

    if (!currentUser || !currentUser.isAdmin) {
        return;
    }

    const nav = document.querySelector(".main-nav");

    if (!nav) {
        return;
    }

    const adminLink = document.createElement("a");
    adminLink.href = "admin.html";
    adminLink.textContent = "Admin";
    adminLink.style.color = "#dc2626";
    adminLink.style.fontWeight = "700";

    nav.appendChild(adminLink);

}

addAdminLinkIfNeeded();


/* ================= NOTIFICATIONS ================= */

const notificationButton = document.getElementById("notificationButton");
const notificationMessage = document.getElementById("notificationMessage");
const closeNotification = document.getElementById("closeNotification");

// Per-account, so switching accounts on the same browser doesn't mix
// up what's been "seen".
const notificationsSeenKey = currentUser
    ? `goclean_notifications_seen_${currentUser.id}`
    : null;


// Finds the most recent moment any of an order's status timestamps
// were set - i.e. the last time staff actually changed something.
function getLatestStatusChangeTime(order) {

    const candidates = [
        order.picked_up_at,
        order.washing_at,
        order.ready_at,
        order.out_for_delivery_at,
        order.delivered_at
    ].filter(Boolean);

    if (candidates.length === 0) {
        return null;
    }

    const times = candidates.map(value => new Date(value).getTime());

    return new Date(Math.max(...times));

}


function getLastSeenTime() {

    if (!notificationsSeenKey) {
        return new Date(0);
    }

    const stored = localStorage.getItem(notificationsSeenKey);

    return stored ? new Date(stored) : new Date(0);

}


function markNotificationsSeen() {

    if (!notificationsSeenKey) {
        return;
    }

    localStorage.setItem(notificationsSeenKey, new Date().toISOString());

}


function renderNotifications(orders) {

    if (!notificationMessage) {
        return;
    }

    const lastSeen = getLastSeenTime();

    const updates = orders
        .map(order => ({
            order,
            changedAt: getLatestStatusChangeTime(order)
        }))
        .filter(item => item.changedAt)
        .sort((a, b) => b.changedAt - a.changedAt);

    const unreadUpdates = updates.filter(item => item.changedAt > lastSeen);

    // Show or hide the little red dot based on whether there's
    // anything new since this person last opened the panel.
    const notifDot = notificationButton
        ? notificationButton.querySelector(".notif-dot")
        : null;

    if (notifDot) {
        notifDot.style.display = unreadUpdates.length > 0 ? "" : "none";
    }

    if (updates.length === 0) {

        notificationMessage.innerHTML = `
            <div>
                <strong>Notifications</strong>
                <p>No updates yet.</p>
            </div>
            <button id="closeNotification" aria-label="Close notification">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

    } else {

        const itemsHtml = updates.slice(0, 5).map(item => `
            <p>
                Order #${item.order.order_number} is now
                <strong>${item.order.status}</strong>.
            </p>
        `).join("");

        notificationMessage.innerHTML = `
            <div>
                <strong>Notifications</strong>
                ${itemsHtml}
            </div>
            <button id="closeNotification" aria-label="Close notification">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

    }

    // The close button gets rebuilt every time above, so its click
    // handler needs to be reattached each time too.
    const newCloseButton = document.getElementById("closeNotification");

    if (newCloseButton) {

        newCloseButton.addEventListener("click", function () {
            notificationMessage.classList.remove("show");
        });

    }

}


if (notificationButton) {

    notificationButton.addEventListener("click", function () {

        notificationMessage.classList.toggle("show");

        // Opening the panel counts as "seen" - the dot should
        // disappear for anything currently shown.
        if (notificationMessage.classList.contains("show")) {
            markNotificationsSeen();

            const notifDot = notificationButton.querySelector(".notif-dot");

            if (notifDot) {
                notifDot.style.display = "none";
            }
        }

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

        renderNotifications(orders);

    } catch (error) {

        console.error("Dashboard error:", error);

    }

}


/* ================= START ================= */

loadDashboard();
