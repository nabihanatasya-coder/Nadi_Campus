/*    NADICAMPUS - COURSES JAVASCRIPT  */

const courseUser = requireLogin();
if (courseUser) {
    const adminName = document.getElementById("adminName");
    const adminRole = document.getElementById("adminRole");

    if (adminName) {
        adminName.textContent = courseUser.name;
    }

    if (adminRole) {
        adminRole.textContent = courseUser.role;
    }
}

const currentDateElement = document.getElementById("currentDate");
if (currentDateElement) {
    currentDateElement.textContent = new Date().toLocaleDateString(
        "en-MY",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

// 1. Storage and sample data
const COURSE_STORAGE_KEY = "nadiCampusCourses";

const defaultCourses = [
    {
        code: "IMS564",
        name: "User Experience Design",
        programme: "Information Systems Management",
        creditHours: 3,
        semester: 4,
        status: "Active"
    },
    {
        code: "IMS565",
        name: "Information System Project Management",
        programme: "Information Systems Management",
        creditHours: 3,
        semester: 4,
        status: "Active"
    },
    {
        code: "IMS566",
        name: "Advanced Web Design Development and Content Management",
        programme: "Information Systems Management",
        creditHours: 4,
        semester: 4,
        status: "Active"
    },
    {
        code: "IMS560",
        name: "Advanced Database Management System",
        programme: "Information Systems Management",
        creditHours: 3,
        semester: 4,
        status: "Active"
    },
    {
        code: "IMR533",
        name: "Information Ethics and Law",
        programme: "Information Records Management",
        creditHours: 3,
        semester: 3,
        status: "Active"
    },
    {
        code: "IMS511",
        name: "Problem Solving and Program Design 2",
        programme: "Information Systems Management",
        creditHours: 3,
        semester: 3,
        status: "Active"
    },
    {
        code: "IML512",
        name: "Digital Literacy",
        programme: "Information Library Management",
        creditHours: 3,
        semester: 4,
        status: "Inactive"
    },
    {
        code: "ICM571",
        name: "Social Media Management",
        programme: "Information Content Management",
        creditHours: 3,
        semester: 3,
        status: "Active"
    }
];

function getCourses() {
    try {
        const savedData = localStorage.getItem(COURSE_STORAGE_KEY);

        if (savedData === null) {
            localStorage.setItem(
                COURSE_STORAGE_KEY,
                JSON.stringify(defaultCourses)
            );

            return [...defaultCourses];
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error("Unable to load courses:", error);
        return [];
    }
}

function saveCourses(updatedCourses) {
    try {
        localStorage.setItem(
            COURSE_STORAGE_KEY,
            JSON.stringify(updatedCourses)
        );

        return true;

    } catch (error) {
        console.error("Unable to save courses:", error);

        showCourseToast(
            "Unable to save course data.",
            "error"
        );

        return false;
    }
}

let courses = getCourses();

// 2. DOM element
const courseTableBody = document.getElementById("courseTableBody");

const courseTotal = document.getElementById("courseTotal");
const courseActive = document.getElementById("courseActive");
const courseInactive = document.getElementById("courseInactive");

const courseSearch = document.getElementById("courseSearch");
const programmeFilter = document.getElementById("programmeFilter");
const creditFilter = document.getElementById("creditFilter");
const statusFilter = document.getElementById("statusFilter");

const courseForm = document.getElementById("courseForm");
const courseModal = document.getElementById("courseModal");

const courseDetailsModal = document.getElementById("courseDetailsModal");
const courseDetailsContent = document.getElementById("courseDetailsContent");

const deleteCourseModal = document.getElementById("deleteCourseModal");
const deleteCourseName = document.getElementById("deleteCourseName");
const confirmDeleteCourseBtn = document.getElementById("confirmDeleteCourseBtn");

let selectedDeleteCourseCode = null;

// 3. Helper function
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function openModal(modal) {
    if (!modal) return;

    modal.classList.add("show");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("show");

    if (!document.querySelector(".custom-modal.show")) {
        document.body.classList.remove("modal-open");
    }
}

// 4. Toast notification
let courseToastTimer;

function showCourseToast(message, type = "success") {

    const toast = document.getElementById("courseToast");
    const toastMessage = document.getElementById("courseToastMessage");

    if (!toast || !toastMessage) return;

    const toastIcon = toast.querySelector("i");

    toastMessage.textContent = message;

    toast.classList.remove("error-toast");

    if (type === "error") {
        toast.classList.add("error-toast");
        toastIcon.className = "bi bi-exclamation-circle-fill";
    } else {
        toastIcon.className = "bi bi-check-circle-fill";
    }

    toast.classList.add("show");

    clearTimeout(courseToastTimer);

    courseToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// 5. Summary cards
function updateCourseSummary() {
    const total = courses.length;

    const active = courses.filter(
        course => course.status === "Active"
    ).length;

    const inactive = courses.filter(
        course => course.status === "Inactive"
    ).length;

    courseTotal.textContent = total;
    courseActive.textContent = active;
    courseInactive.textContent = inactive;
}

// 6. Course table
function renderCourses() {

    const searchValue = courseSearch.value.toLowerCase().trim();
    const selectedProgramme = programmeFilter.value;
    const selectedCredit = creditFilter.value;
    const selectedStatus = statusFilter.value;

    // Filter courses
    const filteredCourses = courses.filter(course => {

        const matchesSearch =
            course.code.toLowerCase().includes(searchValue) ||
            course.name.toLowerCase().includes(searchValue);

        const matchesProgramme =
            !selectedProgramme ||
            course.programme === selectedProgramme;

        const matchesCredit =
            !selectedCredit ||
            String(course.creditHours) === selectedCredit;

        const matchesStatus =
            !selectedStatus ||
            course.status === selectedStatus;

        return (
            matchesSearch &&
            matchesProgramme &&
            matchesCredit &&
            matchesStatus
        );
    });

    // Generate course table
    courseTableBody.innerHTML = filteredCourses.map(course => {

        const safeCode = escapeHTML(course.code);
        const safeName = escapeHTML(course.name);
        const safeProgramme = escapeHTML(course.programme);
        const safeStatus = escapeHTML(course.status);

        const statusClass =
            course.status === "Active"
                ? "active-status"
                : "inactive-status";

        return `
            <tr>
                <td class="course-desktop-only">
                    <span class="student-id-text">${safeCode}</span>
                </td>

                <td class="course-name-cell">
                    <div class="course-name-info">
                        <strong>${safeName}</strong>
                        <span class="course-mobile-code">
                            ${safeCode}
                        </span>
                    </div>
                </td>

                <td class="course-desktop-only">
                    <span class="programme-text">${safeProgramme}</span>
                </td>

                <td class="course-desktop-only">
                    <span class="student-id-text">
                        ${Number(course.creditHours)} Credits
                    </span>
                </td>

                <td>
                    <span class="semester-badge">
                        <span class="course-semester-desktop">
                            Semester ${Number(course.semester)}
                        </span>

                        <span class="course-semester-mobile">
                            ${Number(course.semester)}
                        </span>
                    </span>
                </td>

                <td>
                    <span class="student-status ${statusClass}">
                        <span></span>
                        ${safeStatus}
                    </span>
                </td>

                <td>
                    <details class="course-action-menu" open>
                        <summary
                            class="course-action-trigger"
                            aria-label="Actions for ${safeCode}"
                            title="Course actions">

                            <i class="bi bi-three-dots"></i>
                        </summary>

                    <div class="student-action-buttons">

                        <button
                            type="button"
                            class="table-action-btn view-btn"
                            data-action="view"
                            data-code="${safeCode}"
                            title="View course"
                            aria-label="View ${safeCode}">

                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="table-action-btn edit-btn"
                            data-action="edit"
                            data-code="${safeCode}"
                            title="Edit course"
                            aria-label="Edit ${safeCode}">

                            <i class="bi bi-pencil-square"></i>
                        </button>

                        <button
                            type="button"
                            class="table-action-btn delete-btn"
                            data-action="delete"
                            data-code="${safeCode}"
                            title="Delete course"
                            aria-label="Delete ${safeCode}">

                            <i class="bi bi-trash3"></i>
                        </button>

                    </div>
                    </details>
                </td>
            </tr>
        `;
    }).join("");

    // Show or hide empty state - no data
    const emptyState = document.getElementById("courseEmptyState");

    if (filteredCourses.length === 0) {
        emptyState.classList.remove("d-none");
    } else {
        emptyState.classList.add("d-none");
    }

    // Update records count
    document.getElementById("recordCount").textContent =
        `${filteredCourses.length} of ${courses.length} records`;

    document.getElementById("tableResultText").textContent =
        `Showing ${filteredCourses.length} course(s)`;

    updateCourseSummary();
    syncCourseActionMenus();
}

// Responsive course actions toggle - mobile view

function syncCourseActionMenus() {

    const isMobile = window.innerWidth <= 700;

    document.querySelectorAll(".course-action-menu")
        .forEach(menu => {

            if (!isMobile) {
                menu.open = true;
            } else {
                menu.open = false;
            }

        });
}

// Course table actions button
courseTableBody.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const code = button.dataset.code;

    if (action === "view") {
        viewCourse(code);
    }

    if (action === "edit") {
        editCourse(code);
    }

    if (action === "delete") {
        openDeleteCourseModal(code);
    }

});

// 7. Reset course form
function resetCourseForm() {
    courseForm.reset();

    document.getElementById("editCourseCode").value = "";

    document.getElementById("courseCode").readOnly = false;

    document.getElementById("courseModalTitle").textContent =
        "Add New Course";

    document.getElementById("saveCourseLabel").textContent =
        "Save Course";

    const message = document.getElementById("courseFormMessage");

    message.textContent = "";
    message.className = "modal-form-message";
}

// 8. Add course
function openAddCourseModal() {
    resetCourseForm();
    openModal(courseModal);
}

document.getElementById("addCourseBtn").addEventListener(
    "click",
    openAddCourseModal
);

// 9. Edit course
function editCourse(code) {
    const course = courses.find(
        item => item.code === code
    );

    if (!course) return;

    resetCourseForm();

    document.getElementById("editCourseCode").value = course.code;
    document.getElementById("courseCode").value = course.code;
    document.getElementById("courseCode").readOnly = true;

    document.getElementById("courseName").value = course.name;
    document.getElementById("courseProgramme").value = course.programme;
    document.getElementById("courseCredit").value = course.creditHours;
    document.getElementById("courseSemester").value = course.semester;
    document.getElementById("courseStatus").value = course.status;

    document.getElementById("courseModalTitle").textContent =
        "Edit Course";

    document.getElementById("saveCourseLabel").textContent =
        "Update Course";

    openModal(courseModal);
}

// 10. Save course
courseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const originalCode =
        document.getElementById("editCourseCode").value.trim();

    const code =
        document.getElementById("courseCode").value.trim().toUpperCase();

    const name =
        document.getElementById("courseName").value.trim();

    const programme =
        document.getElementById("courseProgramme").value;

    const creditHours =
        Number(document.getElementById("courseCredit").value);

    const semester =
        Number(document.getElementById("courseSemester").value);

    const status =
        document.getElementById("courseStatus").value;

    const message = document.getElementById("courseFormMessage");

// Check required fields
if (!code || !name || !programme || !status) {
    message.textContent =
        "Please complete all required course information.";

    message.className = "modal-form-message error";
    return;
}

// Validate credit hours
if (![2, 3, 4].includes(creditHours)) {
    message.textContent =
        "Please select valid credit hours (2, 3 or 4).";

    message.className = "modal-form-message error";
    return;
}

// Validate semester
if (
    !Number.isInteger(semester) ||
    semester < 1 ||
    semester > 8
) {
    message.textContent =
        "Please select a valid semester (1–8).";

    message.className = "modal-form-message error";
    return;
}

// Validate course status
if (!["Active", "Inactive"].includes(status)) {
    message.textContent =
        "Please select a valid course status.";

    message.className = "modal-form-message error";
    return;
}

    const duplicate = courses.some(course =>
        course.code.toLowerCase() === code.toLowerCase() &&
        course.code !== originalCode
    );

    if (duplicate) {
        message.textContent = "This course code already exists.";
        message.className = "modal-form-message error";
        return;
    }

    const courseData = {
        code,
        name,
        programme,
        creditHours,
        semester,
        status
    };

    if (originalCode) {
        
        const courseExists = courses.some(
            course => course.code === originalCode
        );

        if (!courseExists) {
            message.textContent =
                "Course record was not found. Please refresh and try again.";

            message.className = "modal-form-message error";
            return;
        }

        const updatedCourses = courses.map(course =>
            course.code === originalCode ? courseData : course
        );

        // Save before changing active data
        if (!saveCourses(updatedCourses)) return;

        courses = updatedCourses;

        closeModal(courseModal);
        showCourseToast("Course updated successfully!");

        NadiActivity.addActivity(
            "course-updated",
            `${courseData.code} - ${courseData.name} was updated.`
        );


    } else {

        const updatedCourses = [...courses, courseData];

        // Save before changing active data
        if (!saveCourses(updatedCourses)) return;

        courses = updatedCourses;

        closeModal(courseModal);
        showCourseToast("New course added successfully!");

        NadiActivity.addActivity(
            "course-added",
            `${courseData.code} - ${courseData.name} was added to course records.`
        );

    }

    renderCourses();
});

// 11. View course details
function viewCourse(code) {
    const course = courses.find(
        item => item.code === code
    );

    if (!course) return;

    courseDetailsContent.innerHTML = `
        <div class="course-detail-item">
            <span>Course Code</span>
            <strong>${escapeHTML(course.code)}</strong>
        </div>

        <div class="course-detail-item">
            <span>Course Name</span>
            <strong>${escapeHTML(course.name)}</strong>
        </div>

        <div class="course-detail-item">
            <span>Programme</span>
            <strong>${escapeHTML(course.programme)}</strong>
        </div>

        <div class="course-detail-item">
            <span>Credit Hours</span>
            <strong>${escapeHTML(course.creditHours)} Credits</strong>
        </div>

        <div class="course-detail-item">
            <span>Semester</span>
            <strong>Semester ${escapeHTML(course.semester)}</strong>
        </div>

        <div class="course-detail-item">
            <span>Status</span>
            <strong>${escapeHTML(course.status)}</strong>
        </div>
    `;

    openModal(courseDetailsModal);
}

// 12. Delete course
function openDeleteCourseModal(code) {
    const course = courses.find(
        item => item.code === code
    );

    if (!course) return;

    selectedDeleteCourseCode = code;

    deleteCourseName.textContent =
        `${course.code} - ${course.name}`;

    openModal(deleteCourseModal);
}

confirmDeleteCourseBtn.addEventListener("click", function () {

    if (!selectedDeleteCourseCode) return;

    const deletedCourse = courses.find(
        course => course.code === selectedDeleteCourseCode
    );

    if (!deletedCourse) return;
    
    const updatedCourses = courses.filter(
        course => course.code !== selectedDeleteCourseCode
    );

    // Save first
    if (!saveCourses(updatedCourses)) return;

    // Update active data after successful save
    courses = updatedCourses;

    selectedDeleteCourseCode = null;

    closeModal(deleteCourseModal);

    renderCourses();

    showCourseToast("Course deleted successfully!");

    NadiActivity.addActivity(
        "course-deleted",
        `${deletedCourse.code} - ${deletedCourse.name} was removed from course records.`
    );

});

// 13. Search and filters
courseSearch.addEventListener("input", renderCourses);

programmeFilter.addEventListener("change", renderCourses);

creditFilter.addEventListener("change", renderCourses);

statusFilter.addEventListener("change", renderCourses);

document.getElementById("resetFilters").addEventListener(
    "click",
    function () {
        courseSearch.value = "";
        programmeFilter.value = "";
        creditFilter.value = "";
        statusFilter.value = "";

        renderCourses();
    }
);

// 14. Close modals

// Close modal using X, Cancel or backdrop
document.querySelectorAll("[data-close-modal]").forEach(button => {

    button.addEventListener("click", function () {

        const modal = button.closest(".custom-modal");

        if (modal) {
            closeModal(modal);
        }

    });

});

// Close modal when Escape key is pressed
document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        document.querySelectorAll(".custom-modal.show").forEach(modal => {
            closeModal(modal);
        });

    }

});

// 15. Mobile sidebar
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");

function openCourseSidebar() {
    sidebar.classList.add("show");
    sidebarOverlay.classList.add("show");
}

function closeCourseSidebar() {
    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("show");
}

menuToggle.addEventListener("click", openCourseSidebar);
closeSidebar.addEventListener("click", closeCourseSidebar);
sidebarOverlay.addEventListener("click", closeCourseSidebar);

// 16. Initial render
updateCourseSummary();
renderCourses();
window.addEventListener("resize", syncCourseActionMenus);