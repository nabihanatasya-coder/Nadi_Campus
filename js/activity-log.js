/* NADICAMPUS - recent activities log */

(function () {
    "use strict";

    const STORAGE_KEY = "nadiCampusActivityLog";
    const MAX_ACTIVITIES = 100;

    const ALLOWED_TYPES = [
        "student-added",
        "student-updated",
        "student-deleted",
        "course-added",
        "course-updated",
        "course-deleted"
    ];

    function getActivities() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) return [];

            const activities = JSON.parse(saved);

            return Array.isArray(activities)
                ? activities
                : [];

        } catch (error) {
            console.error("Unable to load activities:", error);
            return [];
        }
    }

    function getAdministrator() {
        try {
            const saved = sessionStorage.getItem(
                "nadiCampusUser"
            );

            if (!saved) return "Administrator";

            const user = JSON.parse(saved);

            return String(
                user.name || user.username || "Administrator"
            ).trim() || "Administrator";

        } catch (error) {
            return "Administrator";
        }
    }

    function addActivity(type, description) {

        if (!ALLOWED_TYPES.includes(type)) {
            console.warn("Unknown activity type:", type);
            return false;
        }

        const activity = {
            id: (
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
            )
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

            type: type,
            description: String(description || ""),
            administrator: getAdministrator(),
            timestamp: new Date().toISOString()
        };

        try {
            const activities = getActivities();

            activities.unshift(activity);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    activities.slice(0, MAX_ACTIVITIES)
                )
            );

            window.dispatchEvent(
                new Event("nadiCampusActivityUpdated")
            );

            return true;

        } catch (error) {
            console.error(
                "Unable to save activity log:",
                error
            );

            return false;
        }
    }

    window.NadiActivity = Object.freeze({
        getActivities,
        addActivity,
        STORAGE_KEY
    });

})();