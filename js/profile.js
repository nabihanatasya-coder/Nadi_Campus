/* NADICAMPUS - MYPROFILE JAVASCRIPT */

const profileUser = requireLogin();

if (profileUser) {

    const PROFILE_KEY = getProfileKey(profileUser.username);

    const profileForm = document.getElementById("profileForm");
    const fullNameInput = document.getElementById("profileFullName");
    const emailInput = document.getElementById("profileEmail");
    const usernameInput = document.getElementById("profileUsername");
    const roleInput = document.getElementById("profileRole");
    const profileMessage = document.getElementById("profileMessage");

    
    const defaultProfile = {
        name: profileUser.name || "System Administrator",
        email: profileUser.email || "",
        username: profileUser.username,
        role: "Administrator"
    };

    // 1. Get saved profile from local storage

    function getSavedProfile() {

        try {
            const saved = localStorage.getItem(PROFILE_KEY);

            if (!saved) {
                return { ...defaultProfile };
            }

            const parsed = JSON.parse(saved);

            if (!parsed || typeof parsed !== "object" ||
                Array.isArray(parsed)) {
                return { ...defaultProfile };
            }

            return {
                ...defaultProfile,
                name: typeof parsed.name === "string"
                    ? parsed.name : defaultProfile.name,
                email: typeof parsed.email === "string"
                    ? parsed.email : "",
                username: defaultProfile.username,
                role: defaultProfile.role
            };

        } catch (error) {
            console.error("Unable to read profile:", error);
            return { ...defaultProfile };
        }
    }

    let savedProfile = getSavedProfile();

    // 2. Display profile

    function getInitials(name) {
        const words = name.trim().split(/\s+/).filter(Boolean);

        return words.slice(0, 2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase() || "SA";
    }

    function updateProfileDisplay(profile) {

        document.getElementById("profileDisplayName").textContent =
            profile.name;

        document.getElementById("profileDisplayEmail").textContent =
            profile.email || "No email added";

        document.getElementById("profileInitials").textContent =
            getInitials(profile.name);

        document.getElementById("adminName").textContent =
            profile.name;

        document.getElementById("adminRole").textContent =
            profile.role;
    }

    function fillProfileForm(profile) {

        fullNameInput.value = profile.name;
        emailInput.value = profile.email;
        usernameInput.value = profile.username;
        roleInput.value = profile.role;

        updateProfileDisplay(profile);
    }

    // 3. Save edits on profile

    profileForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = fullNameInput.value.trim();
        const email = emailInput.value.trim();

if (!name) {

    profileMessage.textContent =
        "Please enter your full name.";

    profileMessage.className =
        "profile-message error";

    return;
}

if (email && !emailInput.checkValidity()) {

    profileMessage.textContent =
        "Please enter a valid email address.";

    profileMessage.className =
        "profile-message error";

    return;
}

        const updatedProfile = {
            name: name,
            email: email,
            username: defaultProfile.username,
            role: defaultProfile.role
        };

        try {
            localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(updatedProfile)
            );

            savedProfile = updatedProfile;

            // Keep current login session in sync
            const session = JSON.parse(
                sessionStorage.getItem("nadiCampusUser") || "{}"
            );

            sessionStorage.setItem(
                "nadiCampusUser",
                JSON.stringify({
                    ...session,
                    name: updatedProfile.name,
                    email: updatedProfile.email,
                    role: updatedProfile.role
                })
            );

            fillProfileForm(savedProfile);

            profileMessage.textContent =
                "Profile updated successfully!";

            profileMessage.className =
                "profile-message success";

        } catch (error) {
            console.error("Unable to save profile:", error);

            profileMessage.textContent =
                "Unable to save profile. Please try again.";

            profileMessage.className =
                "profile-message error";
        }
    });

    // 4. Clearing unsaved changes

    document.getElementById("resetProfileBtn")
        .addEventListener("click", function() {

            fillProfileForm(savedProfile);

            profileMessage.textContent =
                "Unsaved changes have been reset.";

            profileMessage.className =
                "profile-message";
        });

    // 5. Current date

    const currentDate = document.getElementById("currentDate");

    currentDate.textContent = new Date().toLocaleDateString(
        "en-MY",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    // 6. Mobile sidebar responsive

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const menuToggle =
        document.getElementById("menuToggle");

    const closeSidebar =
        document.getElementById("closeSidebar");

    function openProfileSidebar() {
        sidebar.classList.add("show");
        sidebarOverlay.classList.add("show");
    }

    function closeProfileSidebar() {
        sidebar.classList.remove("show");
        sidebarOverlay.classList.remove("show");
    }

    menuToggle.addEventListener("click", openProfileSidebar);
    closeSidebar.addEventListener("click", closeProfileSidebar);
    sidebarOverlay.addEventListener("click", closeProfileSidebar);

    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.addEventListener("click", closeProfileSidebar);
    });

    // 7. Initialized profile

    fillProfileForm(savedProfile);
}