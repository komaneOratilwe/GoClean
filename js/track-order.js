/* =========================================
   GOCLEAN - TRACK ORDER
   ========================================= */


/* ================= CHECK LOGIN ================= */

const savedUser = localStorage.getItem("goclean_user");

if (!savedUser) {

    window.location.href = "login.html";

}

const currentUser = savedUser ? JSON.parse(savedUser) : null;


/* ================= NOTIFICATIONS ================= */

const notificationButton =
    document.getElementById("notificationButton");

const notificationMessage =
    document.getElementById("notificationMessage");

const closeNotification =
    document.getElementById("closeNotification");


notificationButton.addEventListener("click", function () {

    notificationMessage.classList.add("show");

});


closeNotification.addEventListener("click", function () {

    notificationMessage.classList.remove("show");

});


/* ================= ORDER NUMBER ================= */

const urlParams =
    new URLSearchParams(window.location.search);

const orderId =
    urlParams.get("id");

const orderNumber =
    document.getElementById("orderNumber");


/* ================= LOAD ORDER ================= */

async function loadOrder() {

    if (!orderId) {

        orderNumber.textContent =
            "#No Order Selected";

        return;

    }


    try {

        const response = await fetch(
            `/api/order/${orderId}?userId=${currentUser.id}`
        );


        const order = await response.json();


        if (!response.ok) {

            throw new Error(
                order.error || "Unable to load order."
            );

        }


        /* ================= ORDER NUMBER ================= */

        orderNumber.textContent =
            "#" + order.order_number;


        /* ================= STATUS ================= */

        updateOrderStatus(order.status);


        /* ================= TIMELINE ================= */

        updateTimeline(order);


        /* ================= DELIVERY DATE ================= */

        updateDeliveryDate(order.delivery_date);


        /* ================= DELIVERY TIME ================= */

        updateDeliveryTime(order.delivery_time);


    } catch (error) {

        console.error("Track order error:", error);

        orderNumber.textContent =
            "#Order Not Found";

    }

}


/* ================= UPDATE STATUS ================= */

function updateOrderStatus(status) {

    const statusElement =
        document.querySelector(
            ".order-summary .status"
        );


    const statusHeading =
        document.querySelector(
            ".card-heading h2"
        );


    if (!statusElement || !statusHeading) {

        return;

    }


    /* Remove old status classes */

    statusElement.classList.remove(
        "pending",
        "in-progress",
        "completed",
        "cancelled",
        "out-for-delivery"
    );


    /* Add new status class */

    const statusClass =
        status
            .toLowerCase()
            .replace(/\s+/g, "-");


    statusElement.classList.add(
        statusClass
    );


    /* Change status text */

    statusElement.innerHTML = `
        <span class="status-dot"></span>
        ${status}
    `;


    /* Change main heading */

    statusHeading.textContent =
        "Your order is currently " +
        status +
        ".";

}


/* ================= UPDATE TIMELINE ================= */

function updateTimeline(order) {

    const timelineItems =
        document.querySelectorAll(
            ".timeline-item"
        );


    if (!timelineItems.length) {

        return;

    }


    /*
       Timeline order:

       0 = Order Placed
       1 = Picked Up
       2 = Washing
       3 = Ready
       4 = Out for Delivery
       5 = Delivered
    */


    const stages = [

        {
            name: "Order Placed",
            date: order.order_date
        },

        {
            name: "Picked Up",
            date: order.picked_up_at
        },

        {
            name: "Washing",
            date: order.washing_at
        },

        {
            name: "Ready",
            date: order.ready_at
        },

        {
            name: "Out for Delivery",
            date: order.out_for_delivery_at
        },

        {
            name: "Delivered",
            date: order.delivered_at
        }

    ];


    timelineItems.forEach((item, index) => {

        const stage =
            stages[index];


        if (!stage) {

            return;

        }


        const title =
            item.querySelector("h3");

        const description =
            item.querySelector("p");

        const time =
            item.querySelector("span");


        /* ================= TITLE ================= */

        if (title) {

            title.textContent =
                stage.name;

        }


        /* ================= STAGE STATUS ================= */

        if (stage.date) {

            item.classList.add("completed");

            item.classList.remove("current");


            if (time) {

                time.textContent =
                    formatDateTime(stage.date);

            }


        } else {

            item.classList.remove("completed");


            /*
               Find the first stage without
               a timestamp and make it current.
            */

            const previousStage =
                stages[index - 1];


            if (
                index === 0 ||
                (previousStage && previousStage.date)
            ) {

                item.classList.add("current");

                if (time) {

                    time.textContent =
                        "In progress";

                }

            } else {

                item.classList.remove("current");

                if (time) {

                    time.textContent =
                        "";

                }

            }

        }


        /* ================= DESCRIPTION ================= */

        if (description) {

            description.textContent =
                getStageDescription(stage.name);

        }

    });

}


/* ================= STAGE DESCRIPTIONS ================= */

function getStageDescription(stageName) {

    switch (stageName) {

        case "Order Placed":

            return "Your order has been received.";

        case "Picked Up":

            return "Your laundry has been collected.";

        case "Washing":

            return "Your laundry is being cleaned.";

        case "Ready":

            return "Your laundry is ready for delivery.";

        case "Out for Delivery":

            return "Your order is on its way to you.";

        case "Delivered":

            return "Your laundry has been delivered.";

        default:

            return "";

    }

}


/* ================= FORMAT DATE & TIME ================= */

function formatDateTime(dateValue) {

    const date =
        new Date(dateValue);


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ) + " " +

    date.toLocaleTimeString(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ================= DELIVERY DATE ================= */

function updateDeliveryDate(dateValue) {

    const deliveryDate =
        document.querySelector(
            ".detail-card:nth-child(1) strong"
        );


    if (!deliveryDate || !dateValue) {

        return;

    }


    const date =
        new Date(dateValue);


    deliveryDate.textContent =
        date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short"
            }
        );

}


/* ================= DELIVERY TIME ================= */

function updateDeliveryTime(timeValue) {

    const deliveryTime =
        document.querySelector(
            ".detail-card:nth-child(2) strong"
        );


    if (!deliveryTime || !timeValue) {

        return;

    }


    deliveryTime.textContent =
        timeValue.substring(0, 5);

}


/* ================= START ================= */

loadOrder();