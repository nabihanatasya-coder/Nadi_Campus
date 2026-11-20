/* NADICAMPUS - DASHBOARD JAVASCRIPT */

// 1. Check administrator login session
const currentUser = requireLogin();

// Stop dashboard initialization if no valid session
if (currentUser) {

    // 2. Display administrator information
    const adminName = document.getElementById("adminName");
    const adminRole = document.getElementById("adminRole");
    const welcomeName = document.getElementById("welcomeName");

    if (adminName) {
        adminName.textContent = currentUser.name;
    }

    if (adminRole) {
        adminRole.textContent = currentUser.role;
    }

    if (welcomeName) {
        welcomeName.textContent = currentUser.name;
    }

    // 3. Display current date
    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        const today = new Date();

        dateElement.textContent = today.toLocaleDateString("en-MY", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // 4. Dashboard data configuration

    const STUDENT_STORAGE_KEY = "nadiCampusStudents";
    const COURSE_STORAGE_KEY = "nadiCampusCourses";

    let semesterChartInstance = null;
    let programmeChartInstance = null;

    const programmes = [
        "Information Systems Management",
        "Information Content Management",
        "Information Library Management",
        "Information Records Management"
    ];

    const semesterLabels = [
        "Semester 1",
        "Semester 2",
        "Semester 3",
        "Semester 4",
        "Semester 5",
        "Semester 6"
    ];

    // 5. Read data

    function readDashboardData(storageKey) {
        try {
            const savedData = localStorage.getItem(storageKey);

            if (savedData === null) return [];

            const parsedData = JSON.parse(savedData);

            if (!Array.isArray(parsedData)) {
                console.error("Invalid data format:", storageKey);
                return [];
            }

            return parsedData;

        } catch (error) {
            console.error("Unable to load:", storageKey, error);
            return [];
        }
    }

    // 6. Update dashboard statistics

    function updateDashboardStatistics(students, courses) {

        const totalStudents = students.length;
        const totalCourses = courses.length;

        const activeStudents = students.filter(
            student => student.status === "Active"
        ).length;

        const validGPAs = students
            .map(student => {
                if (
                    student.gpa === null ||
                    student.gpa === undefined ||
                    String(student.gpa).trim() === ""
                ) {
                    return null;
                }

                const value = Number(student.gpa);

                return Number.isFinite(value) &&
                    value >= 0 &&
                    value <= 4
                    ? value
                    : null;
            })
            .filter(gpa => gpa !== null);

        const averageGPA = validGPAs.length
            ? validGPAs.reduce((sum, gpa) => sum + gpa, 0)
                / validGPAs.length
            : null;

        document.getElementById("totalStudents").textContent =
            totalStudents.toLocaleString();

        document.getElementById("totalCourses").textContent =
            totalCourses.toLocaleString();

        document.getElementById("activeStudents").textContent =
            activeStudents.toLocaleString();

        document.getElementById("averageGPA").textContent =
            averageGPA === null ? "N/A" : averageGPA.toFixed(2);
    }

    // 7. Update student distribution by semester graph

    function updateSemesterChart(students) {

        const canvas = document.getElementById("semesterChart");

        if (!canvas || typeof Chart === "undefined") return;

        const semesterCounts = semesterLabels.map((label, index) =>
            students.filter(
                student => Number(student.semester) === index + 1
            ).length
        );

        if (semesterChartInstance) {
            semesterChartInstance.data.datasets[0].data =
                semesterCounts;

            semesterChartInstance.update();
            return;
        }

        semesterChartInstance = new Chart(canvas, {
            type: "bar",

            data: {
                labels: semesterLabels,
                datasets: [{
                    label: "Number of Students",
                    data: semesterCounts,
                    backgroundColor: ["#2F3A55", "#5C6B8A", "#AFB8CD", "#CCC3D1", "#C1BC77", "#D8A4AF"],
                    hoverBackgroundColor: "#6B403B",
                    borderRadius: 7,
                    borderSkipped: false,
                    maxBarThickness: 45
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: { display: false }
                },

                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: "#81798a" }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // 8. Update students by programme chart

    function updateProgrammeChart(students) {

        const canvas = document.getElementById("programmeChart");

        if (!canvas || typeof Chart === "undefined") return;

        const programmeCounts = programmes.map(programme =>
            students.filter(
                student => student.programme === programme
            ).length
        );

        if (programmeChartInstance) {
            programmeChartInstance.data.datasets[0].data =
                programmeCounts;

            programmeChartInstance.update();
            return;
        }

        programmeChartInstance = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: programmes,
                datasets: [{
                    data: programmeCounts,
                    backgroundColor: [
                        "#2F3A55",
                        "#C1BC77",
                        "#AFB8CD",
                        "#D8A4AF"
                    ],
                    hoverOffset: 7,
                    borderWidth: 3,
                    borderColor: "#ffffff"
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",

                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        align: "center",

                        labels: {
                            usePointStyle: true,
                            pointStyle: "circle",
                            boxWidth: 10,
                            padding: 12,
                            color: "#62596b"
                        }
                    }
                }
            }
        });
    }

    // 9. Recent activities log
    function updateRecentActivities() {

        const container = document.getElementById("activityList");

        if (!container) return;

        const activities = window.NadiActivity
            ? NadiActivity.getActivities()
            : [];

        // Empty state - no last 5 recent activities
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-clock-history"
                    style="font-size:28px;color:#5C6B8A;">
                    </i>

                    <p class="mt-2 mb-1 fw-semibold">
                        No recent activities yet
                    </p>

                    <p class="text-muted small mb-0">
                        Student and course updates will appear here.
                    </p>
                </div>
            `;

            return;
        }

        // Activity display configuration
        const activityTypes = {
            "student-added": {
                title: "New student registered",
                icon: "bi-person-plus-fill",
                color: "purple"
            },
            "student-updated": {
                title: "Student record updated",
                icon: "bi-pencil-square",
                color: "orange"
            },
            "student-deleted": {
                title: "Student record deleted",
                icon: "bi-trash3-fill",
                color: "orange"
            },
            "course-added": {
                title: "New course added",
                icon: "bi-journal-plus",
                color: "green"
            },
            "course-updated": {
                title: "Course record updated",
                icon: "bi-pencil-square",
                color: "orange"
            },
            "course-deleted": {
                title: "Course record deleted",
                icon: "bi-trash3-fill",
                color: "orange"
            }
        };

        // Safe text output
        function escapeActivityHTML(value) {
            return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        }

        // Format timestamp
        function formatActivityTime(timestamp) {

            const date = new Date(timestamp);

            if (Number.isNaN(date.getTime())) {
                return "Unknown time";
            }

            const seconds = Math.max(
                0,
                Math.floor((Date.now() - date.getTime()) / 1000)
            );

            if (seconds < 60) return "Just now";

            const minutes = Math.floor(seconds / 60);

            if (minutes < 60) {
                return `${minutes} min ago`;
            }

            const hours = Math.floor(minutes / 60);

            if (hours < 24) {
                return `${hours} hour${hours === 1 ? "" : "s"} ago`;
            }

            return date.toLocaleDateString("en-MY", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        }

        // Render latest 5 activities
        container.innerHTML = activities
            .slice(0, 5)
            .map(activity => {

                const config = activityTypes[activity.type] || {
                    title: "System activity",
                    icon: "bi-clock-history",
                    color: "purple"
                };

                return `
                    <div class="activity-item">

                        <div class="activity-icon ${config.color}">
                            <i class="bi ${config.icon}"></i>
                        </div>

                        <div class="activity-details">
                            <h4>${config.title}</h4>

                            <p>
                                ${escapeActivityHTML(activity.description)}
                            </p>

                            <small class="text-muted">
                                By ${escapeActivityHTML(activity.administrator)}
                            </small>
                        </div>

                        <span class="activity-time">
                            ${formatActivityTime(activity.timestamp)}
                        </span>

                    </div>
                `;
            })
            .join("");
    }

    // 10. Refresh dashboard
    function refreshDashboard() {

        const students =
            readDashboardData(STUDENT_STORAGE_KEY);

        const courses =
            readDashboardData(COURSE_STORAGE_KEY);

        updateDashboardStatistics(students, courses);

        updateSemesterChart(students);

        updateProgrammeChart(students);

        updateRecentActivities();
    }

        // Initial dashboard load
        refreshDashboard();

        // Refresh when returning to this page
        window.addEventListener("pageshow", refreshDashboard);

        // Refresh when returning to the browser tab
        window.addEventListener("focus", refreshDashboard);

        // Refresh when localStorage changes in another tab
        window.addEventListener("storage", function (event) {

            if (
                event.key === STUDENT_STORAGE_KEY ||
                event.key === COURSE_STORAGE_KEY ||
                event.key === null
            ) {
                refreshDashboard();
            }
        });

        // Refresh real-time activities
        window.addEventListener(
            "nadiCampusActivityUpdated",
            updateRecentActivities
        );

        // Update when another tab changes the activity log
        window.addEventListener("storage", function (event) {

            if (
                event.key === "nadiCampusActivityLog" ||
                event.key === null
            ) {
                updateRecentActivities();
            }
        });
}


// 11. Mobile sidebar toggle

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");

function openSidebar() {
    if (sidebar) sidebar.classList.add("show");
    if (sidebarOverlay) sidebarOverlay.classList.add("show");
}

function hideSidebar() {
    if (sidebar) sidebar.classList.remove("show");
    if (sidebarOverlay) sidebarOverlay.classList.remove("show");
}

if (menuToggle) {
    menuToggle.addEventListener("click", openSidebar);
}

if (closeSidebar) {
    closeSidebar.addEventListener("click", hideSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", hideSidebar);
}

// Close mobile sidebar after selecting a navigation link
document.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", function () {
        hideSidebar();
    });
});
