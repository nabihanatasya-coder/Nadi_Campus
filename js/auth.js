/* NADICAMPUS - login authentication */

// Demo account (reserved username)
const ADMIN_ACCOUNT = {
    username: "admin",
    password: "nadicampus123",
    name: "System Administrator",
    email: "admin@nadicampus.demo",
    role: "Administrator"
};

const USERS_KEY = "nadiCampusRegisteredUsers";
const SESSION_KEY = "nadiCampusUser";
const PROFILE_PREFIX = "nadiCampusAdminProfile:";


// 1. STORAGE HELPERS

function getRegisteredUsers() {

    try {
        const stored = localStorage.getItem(USERS_KEY);

        if (!stored) return [];

        const users = JSON.parse(stored);

        return Array.isArray(users) ? users : [];

    } catch (error) {
        console.error("Unable to read registered users:", error);
        return [];
    }
}


function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}


function getProfileKey(username) {
    return PROFILE_PREFIX + normalizeUsername(username);
}


function getAccountProfile(user) {

    if (!user || !user.username) return null;

    const base = {
        username: user.username,
        name: user.name || "Administrator",
        email: user.email || "",
        role: "Administrator"
    };

    try {
        let stored = localStorage.getItem(
            getProfileKey(user.username)
        );

        // One-time migration for the previous demo profile.
        // Do not overwrite a new account's profile.
        if (!stored && normalizeUsername(user.username) === "admin") {
            const legacy = localStorage.getItem(
                "nadiCampusAdminProfile"
            );

            if (legacy) {
                const legacyProfile = JSON.parse(legacy);

                if (legacyProfile &&
                    typeof legacyProfile === "object" &&
                    !Array.isArray(legacyProfile)) {

                    stored = JSON.stringify({
                        ...base,
                        name: legacyProfile.name || base.name,
                        email: legacyProfile.email || base.email
                    });

                    localStorage.setItem(
                        getProfileKey("admin"),
                        stored
                    );
                }
            }
        }

        if (!stored) return base;

        const profile = JSON.parse(stored);

        if (!profile ||
            typeof profile !== "object" ||
            Array.isArray(profile)) {
            return base;
        }

        return {
            ...base,
            name: typeof profile.name === "string" &&
                profile.name.trim()
                ? profile.name.trim()
                : base.name,
            email: typeof profile.email === "string"
                ? profile.email
                : base.email
        };

    } catch (error) {
        console.error("Unable to read account profile:", error);
        return base;
    }
}

// 2. MESSAGE HELPER

function showAuthMessage(elementId, message, type = "error") {

    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;
    element.className = "login-message show " + type;
}

// 3. PASSWORD VISIBILITY - eye toggle

function setupPasswordToggle(buttonId, inputId, iconId) {

    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!button || !input || !icon) return;

    button.addEventListener("click", function () {

        const showing = input.type === "text";

        input.type = showing ? "password" : "text";

        icon.className = showing
            ? "bi bi-eye"
            : "bi bi-eye-slash";

        button.setAttribute(
            "aria-label",
            showing ? "Show password" : "Hide password"
        );
    });
}

// 4. CREATE LOGIN SESSION

function createLoginSession(account) {

    const profile = getAccountProfile(account);

    const session = {
        username: account.username,
        name: profile.name,
        email: profile.email,
        role: "Administrator",
        loggedIn: true
    };

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );
}

// 5. LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = normalizeUsername(
            document.getElementById("username").value
        );

        const password =
            document.getElementById("password").value;

        let matchedAccount = null;

        // Demo account
        if (
            username === ADMIN_ACCOUNT.username &&
            password === ADMIN_ACCOUNT.password
        ) {
            matchedAccount = ADMIN_ACCOUNT;
        } else {

            // Registered accounts
            const registeredUsers = getRegisteredUsers();

            matchedAccount = registeredUsers.find(user =>
                normalizeUsername(user.username) === username &&
                user.password === password
            );
        }

        if (!matchedAccount) {

            showAuthMessage(
                "loginMessage",
                "Invalid username or password. Please try again.",
                "error"
            );

            return;
        }

        try {
            createLoginSession(matchedAccount);

            showAuthMessage(
                "loginMessage",
                "Login successful! Redirecting...",
                "success"
            );

            window.setTimeout(function () {
                window.location.replace("dashboard.html");
            }, 500);

        } catch (error) {

            console.error("Unable to create session:", error);

            showAuthMessage(
                "loginMessage",
                "Unable to login. Please try again.",
                "error"
            );
        }
    });
}

// 6. DEMO CREDENTIALS AUTOFILL - for demo account

const useDemoBtn = document.getElementById("useDemoBtn");

if (useDemoBtn) {

    useDemoBtn.addEventListener("click", function () {

        document.getElementById("username").value =
            ADMIN_ACCOUNT.username;

        document.getElementById("password").value =
            ADMIN_ACCOUNT.password;

        showAuthMessage(
            "loginMessage",
            "Demo credentials filled. Click Login to continue.",
            "success"
        );
    });
}

// 7. SIGN UP

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = normalizeUsername(
            document.getElementById("signupUsername").value
        );

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("signupConfirmPassword").value;

        // Validate username
        if (!/^[a-z0-9_]{4,30}$/.test(username)) {
            showAuthMessage(
                "signupMessage",
                "Username must contain 4–30 letters, numbers or underscores."
            );
            return;
        }

        // Validate password
        if (password.length < 8) {
            showAuthMessage(
                "signupMessage",
                "Password must be at least 8 characters."
            );
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            showAuthMessage(
                "signupMessage",
                "Passwords do not match."
            );
            return;
        }

        const users = getRegisteredUsers();

        // Check duplicate username
        const usernameExists =
            username === ADMIN_ACCOUNT.username ||
            users.some(user =>
                normalizeUsername(user.username) === username
            );

        if (usernameExists) {
            showAuthMessage(
                "signupMessage",
                "This username is already registered."
            );
            return;
        }

        // Create new administrator account
        const newUser = {
            username: username,
            name: username,
            email: "",
            password: password,
            role: "Administrator"
        };

        try {

            users.push(newUser);

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );

            showAuthMessage(
                "signupMessage",
                "Account created successfully! Redirecting to Login...",
                "success"
            );

            signupForm.reset();

            window.setTimeout(function () {
                window.location.replace("index.html");
            }, 1000);

        } catch (error) {

            console.error("Registration failed:", error);

            showAuthMessage(
                "signupMessage",
                "Unable to create account. Please try again."
            );
        }
    });
}

// 8. CHECK LOGIN SESSION

function checkLoginSession() {

    try {
        const stored = sessionStorage.getItem(SESSION_KEY);

        if (!stored) return null;

        const session = JSON.parse(stored);

        if (!session ||
            session.loggedIn !== true ||
            !session.username) {
            return null;
        }

        const username = normalizeUsername(
            session.username
        );

        let account;

        if (username === ADMIN_ACCOUNT.username) {
            account = ADMIN_ACCOUNT;
        } else {
            account = getRegisteredUsers().find(user =>
                normalizeUsername(user.username) === username
            );
        }

        if (!account) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }

        const profile = getAccountProfile(account);

        return {
            username: account.username,
            name: profile.name,
            email: profile.email,
            role: "Administrator",
            loggedIn: true
        };

    } catch (error) {

        console.error("Invalid login session:", error);

        sessionStorage.removeItem(SESSION_KEY);

        return null;
    }
}

// 9. PROTECT AUTHENTICATED PAGES

function requireLogin() {

    const user = checkLoginSession();

    if (!user) {
        window.location.replace("index.html");
        return null;
    }

    return user;
}

// 10. LOGOUT

function logout() {

    sessionStorage.removeItem(SESSION_KEY);

    window.location.replace("index.html");
}

// 11. INITIALIZE AUTHENTICATION PAGES

setupPasswordToggle(
    "togglePassword",
    "password",
    "passwordIcon"
);

setupPasswordToggle(
    "toggleSignupPassword",
    "signupPassword",
    "signupPasswordIcon"
);

setupPasswordToggle(
    "toggleConfirmPassword",
    "signupConfirmPassword",
    "confirmPasswordIcon"
);

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}