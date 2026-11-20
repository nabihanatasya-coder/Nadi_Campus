/* NADICAMPUS - MYPROFILE DROPDOWN JAVASCRPIT */

document.addEventListener("DOMContentLoaded", function () {

    const profile = document.querySelector(".admin-profile");

    if (!profile) return;

    // Prevent duplicate initialization
    if (profile.dataset.dropdownReady === "true") return;

    profile.dataset.dropdownReady = "true";

    // Make profile clickable and accessible
    profile.setAttribute("role", "button");
    profile.setAttribute("tabindex", "0");
    profile.setAttribute("aria-haspopup", "true");
    profile.setAttribute("aria-expanded", "false");
    profile.setAttribute("aria-label", "Open administrator menu");

    // Create dropdown menu
    const dropdown = document.createElement("div");

    dropdown.className = "admin-dropdown-menu";
    dropdown.id = "adminDropdownMenu";

    dropdown.innerHTML = `
        <div class="admin-dropdown-heading">
            <strong>Administrator Menu</strong>
            <span>Manage your account</span>
        </div>

        <a href="profile.html" class="admin-dropdown-item">
            <i class="bi bi-person-circle"></i>
            <span>My Profile</span>
        </a>

        <a href="dashboard.html" class="admin-dropdown-item">
            <i class="bi bi-grid-1x2"></i>
            <span>Dashboard</span>
        </a>

        <div class="admin-dropdown-divider"></div>

        <button
            type="button"
            class="admin-dropdown-item admin-dropdown-logout"
            id="adminDropdownLogout">
            <i class="bi bi-box-arrow-right"></i>
            <span>Logout</span>
        </button>
    `;

    // Attach dropdown inside profile container
    profile.appendChild(dropdown);

    function openDropdown() {
        dropdown.classList.add("show");
        profile.classList.add("dropdown-open");
        profile.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
        dropdown.classList.remove("show");
        profile.classList.remove("dropdown-open");
        profile.setAttribute("aria-expanded", "false");
    }

    function toggleDropdown() {
        if (dropdown.classList.contains("show")) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    // Click profile to toggle
    profile.addEventListener("click", function (event) {

        if (event.target.closest(".admin-dropdown-menu")) {
            return;
        }

        toggleDropdown();
    });

    // Keyboard accessibility
    profile.addEventListener("keydown", function (event) {

        if (event.target !== profile) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleDropdown();
        }
    });

    // Click outside to close
    document.addEventListener("click", function (event) {

        if (!profile.contains(event.target)) {
            closeDropdown();
        }
    });

    // Click escape key to close
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeDropdown();
        }
    });

    // Logout
    document.getElementById("adminDropdownLogout")
        .addEventListener("click", function () {

            if (typeof logout === "function") {
                logout();
            } else {
                console.error("Logout function is unavailable.");
            }
        });

});