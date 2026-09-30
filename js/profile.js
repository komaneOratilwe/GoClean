/* =========================================
   GOCLEAN - PROFILE PAGE
   ========================================= */


/* ================= CHECK LOGIN ================= */

const savedUser = localStorage.getItem("goclean_user");

if (!savedUser) {

    window.location.href = "login.html";

}

const currentUser = savedUser ? JSON.parse(savedUser) : null;


/* ================= GET ELEMENTS ================= */

const profileForm =
    document.getElementById("profileForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const pickupAddressInput =
    document.getElementById("pickupAddress");

const instructionsInput =
    document.getElementById("instructions");

const displayName =
    document.getElementById("displayName");


/* ================= ACCOUNT INFO SIDEBAR ================= */

const accountItemValues =
    document.querySelectorAll(".account-card .account-item strong");

// Order in the HTML: 0 = Email, 1 = Account Status, 2 = Member Since
const sidebarEmail = accountItemValues[0];
const sidebarMemberSince = accountItemValues[2];


/* ================= LOAD REAL PROFILE ================= */

async function loadProfile() {

    if (!currentUser) {
        return;
    }

    try {

        const response = await fetch(`/api/user/${currentUser.id}`);

        const profile = await response.json();

        if (!response.ok) {
            throw new Error(profile.error || "Unable to load profile.");
        }

        fullNameInput.value = profile.full_name || "";
        emailInput.value = profile.email || "";
        phoneInput.value = profile.phone || "";
        pickupAddressInput.value = profile.pickup_address || "";
        instructionsInput.value = profile.special_instructions || "";
        displayName.textContent = profile.full_name || "GoClean Customer";

        if (sidebarEmail) {
            sidebarEmail.textContent = profile.email || "";
        }

        if (sidebarMemberSince && profile.created_at) {
            const joinYear = new Date(profile.created_at).getFullYear();
            sidebarMemberSince.textContent = joinYear;
        }

    } catch (error) {

        console.error("Error loading profile:", error);
        alert("Unable to load your profile right now.");

    }

}


/* ================= SAVE PROFILE ================= */

profileForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const updatedName = fullNameInput.value.trim();

    if (updatedName === "") {

        alert("Please enter your full name.");

        return;

    }

    try {

        const response = await fetch(`/api/user/${currentUser.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: updatedName,
                phone: phoneInput.value.trim(),
                pickupAddress: pickupAddressInput.value.trim(),
                specialInstructions: instructionsInput.value.trim()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to update profile.");
        }

        displayName.textContent = updatedName;

        /*
            Keep localStorage in sync, so the dashboard
            greeting also shows the updated name.
        */

        currentUser.fullName = updatedName;
        localStorage.setItem("goclean_user", JSON.stringify(currentUser));

        alert("Profile updated successfully!");

    } catch (error) {

        console.error("Error updating profile:", error);
        alert("There was a problem saving your profile.\n\n" + error.message);

    }

});


/* ================= NOTIFICATIONS ================= */

const notificationButton =
    document.getElementById("notificationButton");

const notificationMessage =
    document.getElementById("notificationMessage");

const closeNotification =
    document.getElementById("closeNotification");


notificationButton.addEventListener("click", function() {

    notificationMessage.classList.add("show");

});


closeNotification.addEventListener("click", function() {

    notificationMessage.classList.remove("show");

});


/* ================= START ================= */

loadProfile();
