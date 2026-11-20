/* NADICAMPUS - STUDENTS JAVASCRIPT */

const studentUser = requireLogin();

if (studentUser) {

    // 1. DOM element refrences
    const studentTableBody = document.getElementById("studentTableBody");
    const studentSearch = document.getElementById("studentSearch");
    const programmeFilter = document.getElementById("programmeFilter");
    const semesterFilter = document.getElementById("semesterFilter");
    const statusFilter = document.getElementById("statusFilter");

    const studentForm = document.getElementById("studentForm");
    const studentModal = document.getElementById("studentModal");
    const detailsModal = document.getElementById("detailsModal");
    const deleteModal = document.getElementById("deleteModal");

    const studentEmptyState = document.getElementById("studentEmptyState");


    // 2. Admin information and date
    const adminName = document.getElementById("adminName");
    const adminRole = document.getElementById("adminRole");
    const currentDate = document.getElementById("currentDate");

    if (adminName) adminName.textContent = studentUser.name;
    if (adminRole) adminRole.textContent = studentUser.role;

    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString("en-MY", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // 3. Student data samples
    const defaultStudents = [
        {
            id: "2026127455",
            name: "Aina Sofea binti Abu",
            email: "aina.sofea@gmail.com",
            programme: "Information Systems Management",
            semester: 1,
            status: "Active",
            gpa: 3.65
        },
        {
            id: "2026137455",
            name: "Daniel Hakim bin Mohd",
            email: "daniel.hakim@gmail.com",
            programme: "Information Records Management",
            semester: 2,
            status: "Active",
            gpa: 3.42
        },
        {
            id: "2026127456",
            name: "Nur Amirah binti Elyas",
            email: "nur.amirah@gmail.com",
            programme: "Information Library Management",
            semester: 3,
            status: "Active",
            gpa: 3.80
        },
        {
            id: "2024100014",
            name: "Adam Firdaus bin Naim",
            email: "adam.firdaus@gmail.com",
            programme: "Information Systems Management",
            semester: 4,
            status: "Active",
            gpa: 3.25
        },
        {
            id: "2024100105",
            name: "Siti Hajar binti Mahmud",
            email: "siti.hajar@gmail.com",
            programme: "Information Records Management",
            semester: 5,
            status: "Inactive",
            gpa: 3.55
        },
        {
            id: "2024101006",
            name: "Muhammad Izzudin bin Ramli",
            email: "muhammad.izz@gmail.com",
            programme: "Information Library Management",
            semester: 6,
            status: "Active",
            gpa: 3.10
        },
        {
            id: "2024110007",
            name: "Nur Farah Nadia binti Aslam",
            email: "farah.nadia@gmail.com",
            programme: "Information Systems Management",
            semester: 3,
            status: "Active",
            gpa: 3.90
        },
        {
            id: "2024100081",
            name: "Ali Danish bin Nuh",
            email: "ali.danish@gmail.com",
            programme: "Information Content Management",
            semester: 4,
            status: "Active",
            gpa: 3.35
        },
        {
            id: "2024100091",
            name: "Hannah Maisarah binti Muhammad",
            email: "hannah.maisarah@gmail.com",
            programme: "Information Library Management",
            semester: 2,
            status: "Active",
            gpa: 3.72
        },
        {
            id: "2024100110",
            name: "Irfan Hafiz bin Zikri",
            email: "irfan.zikri@gmail.com",
            programme: "Information Systems Management",
            semester: 5,
            status: "Active",
            gpa: 3.48
        },
        {
            id: "2024101011",
            name: "Syifa Imani binti Nasrudin",
            email: "syifa.imani@gmail.com",
            programme: "Information Content Management",
            semester: 1,
            status: "Active",
            gpa: 3.60
        },
        {
            id: "2024110012",
            name: "Aqil Rayyan bin Suhaimi",
            email: "aqil.rayyan@gmail.com",
            programme: "Information Content Management",
            semester: 6,
            status: "Inactive",
            gpa: 2.95
        }
    ];

    const STORAGE_KEY = "nadiCampusStudents";

    // 4. Save data in local storage 
    function getStudents() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);

            if (savedData === null) {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(defaultStudents)
                );

                return [...defaultStudents];
            }

            const parsedData = JSON.parse(savedData);

            if (!Array.isArray(parsedData)) {
                throw new Error("Invalid student data format.");
            }

            return parsedData;

        } catch (error) {
            console.error("Unable to read student data:", error);

            showToast("Unable to load student records.", "error");

            return [];
        }
    }

    function saveStudents(students) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
            return true;

        } catch (error) {
            console.error("Unable to save student data:", error);

            showToast("Unable to save data. Check browser storage.", "error");

            return false;
        }
    }

    let students = getStudents();
    let studentToDelete = null;

    // 5. HTML escaping
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    // 6. Display student table
    function renderStudents() {

        const searchValue = studentSearch.value.trim().toLowerCase();
        const selectedProgramme = programmeFilter.value;
        const selectedSemester = semesterFilter.value;
        const selectedStatus = statusFilter.value;

        const filteredStudents = students.filter(student => {

            const matchesSearch =
                student.name.toLowerCase().includes(searchValue) ||
                student.id.toLowerCase().includes(searchValue);

            const matchesProgramme =
                !selectedProgramme ||
                student.programme === selectedProgramme;

            const matchesSemester =
                !selectedSemester ||
                String(student.semester) === selectedSemester;

            const matchesStatus =
                !selectedStatus ||
                student.status === selectedStatus;

            return (
                matchesSearch &&
                matchesProgramme &&
                matchesSemester &&
                matchesStatus
            );
        });

        studentTableBody.innerHTML = filteredStudents.map(student => {

            const safeName = escapeHTML(student.name);
            const safeId = escapeHTML(student.id);
            const safeProgramme = escapeHTML(student.programme);
            const safeStatus = escapeHTML(student.status);

            const initials = safeName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(word => word.charAt(0))
                .join("")
                .toUpperCase();

            const statusClass =
                student.status === "Active" ? "active-status" : "inactive-status";

            return `
                <tr>
                    <td>
                        <div class="student-name-cell">
                            <div class="student-table-avatar">
                                ${initials}
                            </div>

                            <div class="student-name-info">
                                <strong>${safeName}</strong>

                                <span class="student-email">
                                    ${escapeHTML(student.email)}
                                </span>

                                <span class="student-mobile-id">
                                    ${safeId}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td class="student-desktop-only"> 
                        <span class="student-id-text">${safeId}</span>
                    </td>

                    <td class="student-desktop-only">
                        <span class="programme-text">${safeProgramme}</span>
                    </td>

                    <td>
                        <span class="semester-badge">
                            <span class="semester-desktop-text">
                                Semester ${Number(student.semester)}
                            </span>

                            <span class="semester-mobile-text">
                                ${Number(student.semester)}
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
                        
                        <details class="student-action-menu" open>

                            <summary
                                class="student-action-trigger"
                                aria-label="Actions for ${safeName}"
                                title="Student actions">

                                <i class="bi bi-three-dots"></i>
                            </summary>

                        <div class="student-action-buttons">

                            <button
                                type="button"
                                class="table-action-btn view-btn"
                                data-action="view"
                                data-id="${safeId}"
                                title="View details"
                                aria-label="View ${safeName}">

                                <i class="bi bi-eye"></i>
                                <span class="student-action-label">View</span>
                            </button>

                            <button
                                type="button"
                                class="table-action-btn edit-btn"
                                data-action="edit"
                                data-id="${safeId}"
                                title="Edit student"
                                aria-label="Edit ${safeName}">

                                <i class="bi bi-pencil-square"></i>
                                <span class="student-action-label">Edit</span>
                            </button>

                            <button
                                type="button"
                                class="table-action-btn delete-btn"
                                data-action="delete"
                                data-id="${safeId}"
                                title="Delete student"
                                aria-label="Delete ${safeName}">

                                <i class="bi bi-trash3"></i>
                                <span class="student-action-label">Delete</span>
                            </button>

                        </div>

                        </details>

                    </td>
                </tr>
            `;
        }).join("");

        // Empty data diplay
        if (filteredStudents.length === 0) {
            studentEmptyState.classList.remove("d-none");
        } else {
            studentEmptyState.classList.add("d-none");
        }

        // Update result count
        document.getElementById("recordCount").textContent =
            `${filteredStudents.length} of ${students.length} records`;

        document.getElementById("tableResultText").textContent =
            `Showing ${filteredStudents.length} student(s)`;

        updateStudentSummary();
        syncStudentActionMenus();
    }

    // 7. Update student summary 
    function updateStudentSummary() {

        const total = students.length;

        const active = students.filter(
            student => student.status === "Active"
        ).length;

        const inactive = students.filter(
            student => student.status === "Inactive"
        ).length;

        document.getElementById("studentTotal").textContent = total;
        document.getElementById("studentActive").textContent = active;
        document.getElementById("studentInactive").textContent = inactive;
    }

    // 8. Modal control
    function openModal(modal) {
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeModal(modal) {

        if (!modal) return;

        // Move keyboard focus out before hiding the modal
        if (modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        if (!document.querySelector(".custom-modal.show")) {
            document.body.classList.remove("modal-open");
        }
    }

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", function () {
            const modal = button.closest(".custom-modal");

            if (modal) {
                closeModal(modal);
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            document.querySelectorAll(".custom-modal.show").forEach(modal => {
                closeModal(modal);
            });
        }
    });

    // 9. Add student
    // Reset student form
    function resetStudentForm() {
        studentForm.reset();

        document.getElementById("editStudentId").value = "";

        // Input student ID
        document.getElementById("studentId").readOnly = false;

        document.getElementById("studentModalTitle").textContent = "Add New Student";
        document.getElementById("saveStudentLabel").textContent = "Save Student";
        document.getElementById("studentFormMessage").textContent = "";
        document.getElementById("studentFormMessage").className = "modal-form-message";
    }

    // Open add student modal
    function openAddStudentModal() {
        resetStudentForm();
        openModal(studentModal);
    }

    // Add student button event
    document.getElementById("addStudentBtn").addEventListener("click", openAddStudentModal);
    
    // 10. Edit student
    function openEditStudentModal(studentId) {

        const student = students.find(
            item => String(item.id) === String(studentId)
        );

        if (!student) {
            showToast("Student record not found.", "error");
            return;
        }

        // Reset previous form state
        resetStudentForm();

        // Store original ID for updating
        document.getElementById("editStudentId").value = student.id;

        // Fill form with existing student data
        document.getElementById("studentId").value = student.id;
        document.getElementById("studentName").value = student.name;
        document.getElementById("studentEmail").value = student.email;
        document.getElementById("studentProgramme").value = student.programme;
        document.getElementById("studentSemester").value = student.semester;
        document.getElementById("studentStatus").value = student.status;
        document.getElementById("studentGPA").value = student.gpa;

        // Student ID cannot be changed while editing
        document.getElementById("studentId").readOnly = true;

        // Change modal heading and button label
        document.getElementById("studentModalTitle").textContent =
            "Edit Student";

        document.getElementById("saveStudentLabel").textContent =
            "Update Student";

        // Open modal
        openModal(studentModal);
    }

    // 11. Save student form
    studentForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const originalId = document.getElementById("editStudentId").value;

        const studentId = document.getElementById("studentId").value.trim();
        const name = document.getElementById("studentName").value.trim();
        const email = document.getElementById("studentEmail").value.trim();
        const programme = document.getElementById("studentProgramme").value;
        const semester = Number(document.getElementById("studentSemester").value);
        const status = document.getElementById("studentStatus").value;
        const gpa = Number(document.getElementById("studentGPA").value);

        const message = document.getElementById("studentFormMessage");

        // Student form validation
        // Check required text fields
        if (!studentId || !name || !email || !programme) {

            message.textContent =
                "Please complete all required student information.";

            message.className = "modal-form-message error";
            return;
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            message.textContent =
                "Please enter a valid email address.";

            message.className = "modal-form-message error";
            return;
        }

        // Validate semester
        if (
            !Number.isInteger(semester) ||
            semester < 1 ||
            semester > 6
        ) {

            message.textContent =
                "Please select a valid semester (1–6).";

            message.className = "modal-form-message error";
            return;
        }

        // Validate status
        if (!["Active", "Inactive"].includes(status)) {

            message.textContent =
                "Please select a valid student status.";

            message.className = "modal-form-message error";
            return;
        }

        // Validate GPA
        const gpaInput = document.getElementById("studentGPA");
        const gpaValue = gpaInput.value.trim();

        if (
            gpaValue === "" ||
            !Number.isFinite(gpa) ||
            gpa < 0 ||
            gpa > 4 ||
            !gpaInput.validity.valid
        ) {

            message.textContent =
                "GPA must be between 0.00 and 4.00, with up to two decimal places.";

            message.className = "modal-form-message error";
            return;
        }

        // Check duplicate student ID
        const duplicate = students.some(student =>
            student.id.toLowerCase() === studentId.toLowerCase() &&
            student.id !== originalId
        );

        if (duplicate) {
            message.textContent = "This Student ID already exists.";
            message.className = "modal-form-message error";
            return;
        }

        const studentData = {
            id: studentId,
            name,
            email,
            programme,
            semester,
            status,
            gpa: Number(gpa.toFixed(2))
        };

        if (originalId) {

            // Update existing student
            const updatedStudents = students.map(student =>
                student.id === originalId ? studentData : student
            );

            // Save first before updating the active array
            if (!saveStudents(updatedStudents)) return;

            students = updatedStudents;

            closeModal(studentModal);
            renderStudents();
            showToast("Student record updated successfully.");

            NadiActivity.addActivity(
                "student-updated",
                `${studentData.name} (${studentData.id}) was updated.`
            );



        } else {

            // Add new student
            const updatedStudents = [...students, studentData];

            // Save first before updating the active array
            if (!saveStudents(updatedStudents)) return;

            students = updatedStudents;

            closeModal(studentModal);
            renderStudents();
            showToast("New student added successfully.");

            NadiActivity.addActivity(
                "student-added",
                `${studentData.name} (${studentData.id}) was added to student records.`
            );

        }

        resetStudentForm()
    });

    // 12. View student details 
    function openStudentDetails(studentId) {

        const student = students.find(item => item.id === studentId);

        if (!student) return;

        const initials = student.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();

        const statusClass =
            student.status === "Active" ? "active-status" : "inactive-status";

        document.getElementById("studentDetailsContent").innerHTML = `

            <div class="details-profile">
                <div class="details-avatar">${escapeHTML(initials)}</div>

                <h3>${escapeHTML(student.name)}</h3>

                <p>${escapeHTML(student.id)}</p>

                <span class="student-status ${statusClass}">
                    <span></span>
                    ${escapeHTML(student.status)}
                </span>
            </div>

            <div class="details-information">

                <div class="details-item">
                    <span>Email Address</span>
                    <strong>${escapeHTML(student.email)}</strong>
                </div>

                <div class="details-item">
                    <span>Student ID</span>
                    <strong>${escapeHTML(student.id)}</strong>
                </div>

                <div class="details-item full-width">
                    <span>Programme</span>
                    <strong>${escapeHTML(student.programme)}</strong>
                </div>

                <div class="details-item">
                    <span>Semester</span>
                    <strong>Semester ${Number(student.semester)}</strong>
                </div>

                <div class="details-item">
                    <span>Current GPA</span>
                    <strong>${Number(student.gpa).toFixed(2)} / 4.00</strong>
                </div>

            </div>
        `;

        openModal(detailsModal);
    }

    // 13. Delete student
    function openDeleteStudentModal(studentId) {

        const student = students.find(item => item.id === studentId);

        if (!student) return;

        studentToDelete = studentId;

        document.getElementById("deleteStudentName").textContent = student.name;

        openModal(deleteModal);
    }

    document.getElementById("confirmDeleteBtn").addEventListener("click", function () {

        if (!studentToDelete) return;

        const deletedStudent = students.find(
            student => student.id === studentToDelete
        );

        if (!deletedStudent) return;

        const updatedStudents = students.filter(
            student => student.id !== studentToDelete
        );

        // Save first
        if (!saveStudents(updatedStudents)) return;

        // Update active data only after successful save
        students = updatedStudents;

        studentToDelete = null;

        closeModal(deleteModal);
        renderStudents();

        showToast("Student record deleted successfully.");

        NadiActivity.addActivity(
            "student-deleted",
            `${deletedStudent.name} (${deletedStudent.id}) was removed from student records.`
        );

    });

// Responsive student actions toggle - in mobile view
function syncStudentActionMenus() {

    const isMobile = window.innerWidth <= 700;

    document.querySelectorAll(".student-action-menu")
        .forEach(menu => {
            menu.open = !isMobile;
        });
}

    // 14. Table action delegation
    studentTableBody.addEventListener("click", function (event) {

        const button = event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const studentId = button.dataset.id;

        if (action === "view") {
            openStudentDetails(studentId);
        }

        if (action === "edit") {
            openEditStudentModal(studentId);
        }

        if (action === "delete") {
            openDeleteStudentModal(studentId);
        }
    });

    // 15. Search and filters
    studentSearch.addEventListener("input", renderStudents);
    programmeFilter.addEventListener("change", renderStudents);
    semesterFilter.addEventListener("change", renderStudents);
    statusFilter.addEventListener("change", renderStudents);

    document.getElementById("resetFilters").addEventListener("click", function () {

        studentSearch.value = "";
        programmeFilter.value = "";
        semesterFilter.value = "";
        statusFilter.value = "";

        renderStudents();
    });

    // 16. Toast notification
    let toastTimer;

    function showToast(message, type = "success") {

        const toast = document.getElementById("studentToast");
        const toastMessage = document.getElementById("studentToastMessage");
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

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // 17. Mobile sidebar
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

    // 18. Initial render 
    renderStudents();
    window.addEventListener("resize", syncStudentActionMenus);
}