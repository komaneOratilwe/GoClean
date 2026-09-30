/* =========================================
   GOCLEAN - NEW ORDER JAVASCRIPT
   ========================================= */


/* ---------- CHECK LOGIN ---------- */

const savedUser = localStorage.getItem("goclean_user");

if (!savedUser) {

    window.location.href = "login.html";

}

const currentUser = savedUser ? JSON.parse(savedUser) : null;


/* ---------- SERVICE PRICES ---------- */

const servicePrices = {

    "wash-fold": {
        name: "Wash & Fold",
        price: 35
    },

    "dry-cleaning": {
        name: "Dry Cleaning",
        price: 50
    },

    "ironing": {
        name: "Ironing",
        price: 25
    },

    "bedding": {
        name: "Bedding",
        price: 80
    },

    "pickup-delivery": {
        name: "Pickup & Delivery",
        price: 30
    },

    "special-care": {
        name: "Special Care",
        price: 60
    }

};


/* ---------- GET FORM ELEMENTS ---------- */

const orderForm = document.getElementById("orderForm");

const serviceSelect = document.getElementById("service");

const quantityInput = document.getElementById("quantity");

const pickupDate = document.getElementById("pickupDate");

const pickupTime = document.getElementById("pickupTime");

const addressInput = document.getElementById("address");

const instructionsInput = document.getElementById("instructions");

const summaryService = document.getElementById("summaryService");

const summaryQuantity = document.getElementById("summaryQuantity");

const summaryPrice = document.getElementById("summaryPrice");

const summaryTotal = document.getElementById("summaryTotal");


/* ---------- READ SERVICE FROM URL ---------- */

const urlParams = new URLSearchParams(window.location.search);

const selectedService = urlParams.get("service");


/*
   If the user came from the Services page,
   automatically select the service.
*/

if (selectedService && servicePrices[selectedService]) {

    serviceSelect.value = selectedService;

    updateSummary();

}


/* ---------- UPDATE ORDER SUMMARY ---------- */

function updateSummary() {

    const selectedValue = serviceSelect.value;

    const quantity = Number(quantityInput.value) || 1;

    summaryQuantity.textContent = quantity;


    if (!selectedValue || !servicePrices[selectedValue]) {

        summaryService.textContent = "Not selected";

        summaryPrice.textContent = "R0.00";

        summaryTotal.textContent = "R0.00";

        return;

    }


    const service = servicePrices[selectedValue];

    const total = service.price * quantity;


    summaryService.textContent = service.name;

    summaryPrice.textContent =
        "R" + service.price.toFixed(2);

    summaryTotal.textContent =
        "R" + total.toFixed(2);

}


/* ---------- LISTEN FOR CHANGES ---------- */

serviceSelect.addEventListener(
    "change",
    updateSummary
);

quantityInput.addEventListener(
    "input",
    updateSummary
);


/* ---------- SET MINIMUM PICKUP DATE ---------- */

const today = new Date();

const year = today.getFullYear();

const month =
    String(today.getMonth() + 1).padStart(2, "0");

const day =
    String(today.getDate()).padStart(2, "0");

const todayString =
    `${year}-${month}-${day}`;

pickupDate.min = todayString;


/* ---------- PLACE ORDER ---------- */

orderForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!currentUser) {
            window.location.href = "login.html";
            return;
        }


        /* ---------- GET FORM VALUES ---------- */

        const serviceValue =
            serviceSelect.value;

        const quantity =
            Number(quantityInput.value);

        const date =
            pickupDate.value;

        const time =
            pickupTime.value;

        const address =
            addressInput.value.trim();

        const instructions =
            instructionsInput.value.trim();


        /* ---------- VALIDATION ---------- */

        if (!serviceValue) {

            alert(
                "Please select a laundry service."
            );

            return;

        }


        if (!quantity || quantity < 1) {

            alert(
                "Please enter a valid quantity."
            );

            return;

        }


        if (!date) {

            alert(
                "Please select a pickup date."
            );

            return;

        }


        if (!time) {

            alert(
                "Please select a pickup time."
            );

            return;

        }


        if (!address) {

            alert(
                "Please enter your pickup and delivery address."
            );

            return;

        }


        /* ---------- CALCULATE TOTAL ---------- */

        const service =
            servicePrices[serviceValue];

        const total =
            service.price * quantity;


        /* ---------- CREATE ORDER DATA ---------- */

        const orderData = {

            user_id: currentUser.id,

            service: service.name,

            pickup_date: date,

            pickup_time: time,

            pickup_address: address,

            delivery_address: address,

            special_instructions: instructions,

            quantity: quantity,

            total: total

        };


        console.log(
            "Sending order to backend:",
            orderData
        );


        /* ---------- SEND ORDER TO BACKEND ---------- */

        try {

            const response = await fetch(
                "/api/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(orderData)
                }
            );


            const result =
                await response.json();


            /* ---------- CHECK FOR ERROR ---------- */

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Unable to place order."
                );

            }


            /* ---------- SUCCESS ---------- */

            alert(
                "Order placed successfully!\n\n" +
                "Order Number: " +
                result.orderNumber
            );


            /*
               Go to My Orders after the order
               has successfully been saved.
            */

            window.location.href =
                "my-orders.html";


        } catch (error) {

            console.error(
                "Order error:",
                error
            );


            alert(
                "There was a problem placing your order.\n\n" +
                error.message
            );

        }

    }
);


/* ---------- NOTIFICATIONS ---------- */

function showNotifications() {

    const notification =
        document.getElementById(
            "notificationMessage"
        );

    notification.classList.add("show");

}


function closeNotifications() {

    const notification =
        document.getElementById(
            "notificationMessage"
        );

    notification.classList.remove("show");

}


/* ---------- INITIAL SUMMARY ---------- */

updateSummary();
