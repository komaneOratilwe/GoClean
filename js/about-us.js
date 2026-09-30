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