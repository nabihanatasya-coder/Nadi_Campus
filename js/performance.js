/* NADICAMPUS - ACADEMIC PERFORMANCE JAVASCRIPT */

const performanceUser = requireLogin();

if (performanceUser) {

    // 1. DOM element

    const performanceTableBody =
        document.getElementById("performanceTableBody");

    const performanceSearch =
        document.getElementById("performanceSearch");

    const performanceProgrammeFilter =
        document.getElementById("performanceProgrammeFilter");

    const performanceSemesterFilter =
        document.getElementById("performanceSemesterFilter");

    const performanceStandingFilter =
        document.getElementById("performanceStandingFilter");

    const performanceEmptyState =
        document.getElementById("performanceEmptyState");

    const performanceDetailsModal =
        document.getElementById("performanceDetailsModal");

    const performanceDetailsContent =
        document.getElementById("performanceDetailsContent");

    const PERFORMANCE_STORAGE_KEY = "nadiCampusStudents";

    let students = [];
    let gpaChart = null;

    // 2. Admin information and date

    const adminName = document.getElementById("adminName");
    const adminRole = document.getElementById("adminRole");
    const currentDate = document.getElementById("currentDate");

    if (adminName) {
        adminName.textContent = performanceUser.name;
    }

    if (adminRole) {
        adminRole.textContent = performanceUser.role;
    }

    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString(
            "en-MY",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    // 3. Get students from local storage

    function getPerformanceStudents() {

        try {
            const savedData =
                localStorage.getItem(PERFORMANCE_STORAGE_KEY);

            if (savedData === null) {
                return [];
            }

            const parsedData = JSON.parse(savedData);

            if (!Array.isArray(parsedData)) {
                console.error("Invalid student data format.");
                return [];
            }

            return parsedData.filter(student =>
                student &&
                typeof student === "object"
            );

        } catch (error) {
            console.error(
                "Unable to load academic records:",
                error
            );

            return [];
        }
    }

    // 4. HTML escaping

    function escapeHTML(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            character => {

                const entities = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                };

                return entities[character];
            }
        );
    }

    // 5. Validate GPA

    function getValidGPA(student) {

        if (
            student.gpa === null ||
            student.gpa === undefined ||
            String(student.gpa).trim() === ""
        ) {
            return null;
        }

        const gpa = Number(student.gpa);

        if (
            !Number.isFinite(gpa) ||
            gpa < 0 ||
            gpa > 4
        ) {
            return null;
        }

        return gpa;
    }

    // 6. Students academic standing - based on gpa

    function getAcademicStanding(gpa) {

        if (gpa === null) {
            return "Not Available";
        }

        if (gpa >= 3.50) {
            return "Dean's List";
        }

        if (gpa >= 3.00) {
            return "Good Standing";
        }

        if (gpa >= 2.00) {
            return "Satisfactory";
        }

        return "At Risk";
    }

    function getStandingClass(standing) {

        switch (standing) {

            case "Dean's List":
                return "standing-deans";

            case "Good Standing":
                return "standing-good";

            case "Satisfactory":
                return "standing-satisfactory";

            case "At Risk":
                return "standing-risk";

            default:
                return "standing-unavailable";
        }
    }

    // 7. Update summary cards

    function updatePerformanceSummary() {

        const totalStudents = students.length;

        const validGPAs = students
            .map(getValidGPA)
            .filter(gpa => gpa !== null);

        const totalGPA = validGPAs.reduce(
            (sum, gpa) => sum + gpa,
            0
        );
        
        const averageGPA = validGPAs.length > 0
            ? totalGPA / validGPAs.length
            : null;

        const deansList = validGPAs.filter(
            gpa => gpa >= 3.50
        ).length;

        const atRisk = validGPAs.filter(
            gpa => gpa < 2.00
        ).length;

        document.getElementById("performanceTotal").textContent =
            totalStudents;
        
        document.getElementById("performanceAverage").textContent =
            averageGPA === null ? "N/A" : averageGPA.toFixed(2);

        document.getElementById("performanceDeans").textContent =
            deansList;

        document.getElementById("performanceAtRisk").textContent =
            atRisk;
    }

    // 8. GPA distribution bar graph

    function renderGPAChart() {

        const chartCanvas =
            document.getElementById("gpaDistributionChart");

        if (!chartCanvas || typeof Chart === "undefined") {
            return;
        }

        const gpaRanges = [
            "Below 2.00",
            "2.00 - 2.49",
            "2.50 - 2.99",
            "3.00 - 3.49",
            "3.50 - 4.00"
        ];

        const gpaCounts = [0, 0, 0, 0, 0];

        students.forEach(student => {

            const gpa = getValidGPA(student);

            if (gpa === null) return;

            if (gpa < 2.00) {
                gpaCounts[0]++;
            } else if (gpa < 2.50) {
                gpaCounts[1]++;
            } else if (gpa < 3.00) {
                gpaCounts[2]++;
            } else if (gpa < 3.50) {
                gpaCounts[3]++;
            } else {
                gpaCounts[4]++;
            }
        });

        if (gpaChart) {
            gpaChart.data.datasets[0].data = gpaCounts;
            gpaChart.update();
            return;
        }

        gpaChart = new Chart(chartCanvas, {

            type: "bar",

            data: {
                labels: gpaRanges,

                datasets: [{
    label: "Number of Students",
    data: gpaCounts,

    backgroundColor: [
        "#D6A3AD",
        "#C9C2D1",
        "#AAB4CB",
        "#5F708F",
        "#BDBA76"
    ],

    hoverBackgroundColor: [
        "#C48E9A",
        "#B5AABD",
        "#929FBA",
        "#465775",
        "#A7A45F"
    ],

    borderRadius: 8,
    borderSkipped: false,
    maxBarThickness: 65
}]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        backgroundColor: "#2F3A55",
                        padding: 12,
                        displayColors: false
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        },

                        border: {
                            display: false
                        },

                        ticks: {
                            color: "#7B8292",
                            font: {
                                family: "Inter",
                                size: 11
                            }
                        }
                    },

                    y: {
                        beginAtZero: true,

                        ticks: {
                            precision: 0,
                            stepSize: 1,
                            color: "#7B8292"
                        },

                        grid: {
                            color: "#E6E8ED"
                        },

                        border: {
                            display: false,
                            dash: [4, 4]
                        }
                    }
                }
            }
        });
    }

    // 9. Filter 

    function populateProgrammeFilter() {

        const selectedValue =
            performanceProgrammeFilter.value;

        const programmes = [
            ...new Set(
                students
                    .map(student => student.programme)
                    .filter(Boolean)
            )
        ].sort();

        performanceProgrammeFilter.innerHTML =
            '<option value="">All Programmes</option>';

        programmes.forEach(programme => {

            const option = document.createElement("option");

            option.value = programme;
            option.textContent = programme;

            performanceProgrammeFilter.appendChild(option);
        });

        if (programmes.includes(selectedValue)) {
            performanceProgrammeFilter.value = selectedValue;
        }
    }

    // 10. Render table

    function renderPerformanceTable() {

        const searchValue =
            performanceSearch.value.trim().toLowerCase();

        const selectedProgramme =
            performanceProgrammeFilter.value;

        const selectedSemester =
            performanceSemesterFilter.value;

        const selectedStanding =
            performanceStandingFilter.value;

        const filteredStudents = students.filter(student => {

            const name = String(student.name ?? "").toLowerCase();
            const id = String(student.id ?? "").toLowerCase();

            const gpa = getValidGPA(student);
            const standing = getAcademicStanding(gpa);

            const matchesSearch =
                name.includes(searchValue) ||
                id.includes(searchValue);

            const matchesProgramme =
                !selectedProgramme ||
                student.programme === selectedProgramme;

            const matchesSemester =
                !selectedSemester ||
                String(student.semester) === selectedSemester;

            const matchesStanding =
                !selectedStanding ||
                standing === selectedStanding;

            return (
                matchesSearch &&
                matchesProgramme &&
                matchesSemester &&
                matchesStanding
            );
        });


        performanceTableBody.innerHTML = filteredStudents.map(student => {

            const safeName = escapeHTML(student.name);
            const safeId = escapeHTML(student.id);
            const safeProgramme = escapeHTML(student.programme);
            const safeEmail = escapeHTML(student.email);

            const gpa = getValidGPA(student);
            const standing = getAcademicStanding(gpa);

            const standingClass = getStandingClass(standing);

            const initials = String(student.name ?? "")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(word => word.charAt(0))
                .join("")
                .toUpperCase();

            const safeInitials = escapeHTML(initials);

            const gpaText = gpa === null
                ? "N/A"
                : gpa.toFixed(2);

            return `
                <tr>
                    <td>
                        <div class="student-name-cell">

                            <div class="student-table-avatar">
                                ${safeInitials}
                            </div>

                            <div class="student-name-info">
                                <strong>${safeName}</strong>

                                <span class="performance-student-email">
                                    ${safeEmail}
                                </span>

                                <span class="performance-mobile-id">
                                    ${safeId}
                                </span>
                            </div>

                        </div>
                    </td>

                    <td class="performance-desktop-only">
                        <span class="student-id-text">
                            ${safeId}
                        </span>
                    </td>

                    <td class="performance-desktop-only">
                        <span class="programme-text">
                            ${safeProgramme}
                        </span>
                    </td>

                    <td class="performance-desktop-only">
                        <span class="semester-badge">
                            Semester ${escapeHTML(student.semester)}
                        </span>
                    </td>

                    <td>
                        <strong class="performance-gpa">
                            ${gpaText}
                        </strong>
                    </td>

                    <td>
                        <span class="academic-standing ${standingClass}">
                            <span></span>
                            ${escapeHTML(standing)}
                        </span>
                    </td>

                    <td>
                        <div class="student-action-buttons">
                            <button
                                type="button"
                                class="table-action-btn view-btn"
                                data-performance-id="${safeId}"
                                title="View performance"
                                aria-label="View performance for ${safeName}">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;

        }).join("");


        // Empty state
        if (filteredStudents.length === 0) {
            performanceEmptyState.classList.remove("d-none");
        } else {
            performanceEmptyState.classList.add("d-none");
        }

        // Record count
        document.getElementById("performanceRecordCount").textContent =
            `${filteredStudents.length} of ${students.length} records`;

        document.getElementById("performanceTableResult").textContent =
            `Showing ${filteredStudents.length} student(s)`;
    }

    // 11. View academic performance details

    function viewPerformance(studentId) {

        const student = students.find(
            item => String(item.id) === String(studentId)
        );

        if (!student) return;

        const gpa = getValidGPA(student);
        const standing = getAcademicStanding(gpa);

        const standingClass = getStandingClass(standing);

        const initials = String(student.name ?? "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();

        const gpaText = gpa === null
            ? "N/A"
            : gpa.toFixed(2);

        performanceDetailsContent.innerHTML = `
            <div class="details-profile">

                <div class="details-avatar">
                    ${escapeHTML(initials)}
                </div>

                <h3>${escapeHTML(student.name)}</h3>

                <p>${escapeHTML(student.email)}</p>

                <span class="academic-standing ${standingClass}">
                    <span></span>
                    ${escapeHTML(standing)}
                </span>

            </div>

            <div class="details-information">

                <div class="details-item">
                    <span>Student ID</span>
                    <strong>${escapeHTML(student.id)}</strong>
                </div>

                <div class="details-item">
                    <span>Programme</span>
                    <strong>${escapeHTML(student.programme)}</strong>
                </div>

                <div class="details-item">
                    <span>Semester</span>
                    <strong>Semester ${escapeHTML(student.semester)}</strong>
                </div>

                <div class="details-item">
                    <span>Current GPA</span>
                    <strong>${gpaText}</strong>
                </div>

                <div class="details-item full-width">
                    <span>Academic Standing</span>
                    <strong>${escapeHTML(standing)}</strong>
                </div>

            </div>
        `;

        openPerformanceModal();
    }

// 12. Modal control
// To remember which button opened the modal
let lastPerformanceTrigger = null;

function openPerformanceModal() {

    performanceDetailsModal.classList.add("show");

    performanceDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("modal-open");

    // Move keyboard focus into the modal
    const closeButton = performanceDetailsModal.querySelector(
        ".modal-close-btn"
    );

    if (closeButton) {
        closeButton.focus();
    }
}

function closePerformanceModal() {

    // Return focus outside the modal before hiding it
    if (
        lastPerformanceTrigger &&
        lastPerformanceTrigger.isConnected
    ) {
        lastPerformanceTrigger.focus();
    } else if (
        performanceDetailsModal.contains(document.activeElement)
    ) {
        document.activeElement.blur();
    }

    performanceDetailsModal.classList.remove("show");

    performanceDetailsModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove("modal-open");

    lastPerformanceTrigger = null;
}

// Click button
performanceTableBody.addEventListener("click", function(event) {

    const button = event.target.closest(
        "button[data-performance-id]"
    );

    if (!button) return;

    // Store the button that opened the modal
    lastPerformanceTrigger = button;

    viewPerformance(button.dataset.performanceId);
});

// Close buttons and backdrop
document.querySelectorAll(
    "[data-close-performance-modal]"
).forEach(button => {

    button.addEventListener(
        "click",
        closePerformanceModal
    );
});

// Close button when click escape key
document.addEventListener("keydown", function(event) {

    if (
        event.key === "Escape" &&
        performanceDetailsModal.classList.contains("show")
    ) {
        closePerformanceModal();
    }
});

    // 13. Search and filters

    performanceSearch.addEventListener(
        "input",
        renderPerformanceTable
    );

    performanceProgrammeFilter.addEventListener(
        "change",
        renderPerformanceTable
    );

    performanceSemesterFilter.addEventListener(
        "change",
        renderPerformanceTable
    );

    performanceStandingFilter.addEventListener(
        "change",
        renderPerformanceTable
    );

    // Reset filters
    document.getElementById(
        "performanceResetFilters"
    ).addEventListener("click", function() {

        performanceSearch.value = "";
        performanceProgrammeFilter.value = "";
        performanceSemesterFilter.value = "";
        performanceStandingFilter.value = "";

        renderPerformanceTable();
    });

    // 14. Mobile sidebar

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");
    const closeSidebar = document.getElementById("closeSidebar");

    function openSidebar() {
        sidebar.classList.add("show");
        sidebarOverlay.classList.add("show");
    }

    function hideSidebar() {
        sidebar.classList.remove("show");
        sidebarOverlay.classList.remove("show");
    }

    menuToggle.addEventListener("click", openSidebar);
    closeSidebar.addEventListener("click", hideSidebar);
    sidebarOverlay.addEventListener("click", hideSidebar);

    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.addEventListener("click", hideSidebar);
    });


    // 15. Iinitial render

    function initializePerformancePage() {

        students = getPerformanceStudents();

        populateProgrammeFilter();

        updatePerformanceSummary();

        renderPerformanceTable();

        renderGPAChart();
    }

    initializePerformancePage();

    // Refresh data
    window.addEventListener("pageshow", function(event) {

        if (event.persisted) {
            initializePerformancePage();
        }
    });

    window.addEventListener("storage", function(event) {

        if (event.key === PERFORMANCE_STORAGE_KEY) {
            initializePerformancePage();
        }
    });

    window.addEventListener("focus", function () {

        // Do not refresh while details modal is open
        if (
            performanceDetailsModal.classList.contains("show")
        ) {
            return;
        }

        initializePerformancePage();
    });

}