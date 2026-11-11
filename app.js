### 5. `app.js`
```javascript
// =========================================
// TheraCore State & Storage Helpers
// =========================================
const STORAGE_USERS_KEY = "theracore_users";
const STORAGE_CURRENT_USER_KEY = "theracore_current_user";

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY)) || {};
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const email = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
  if (!email) return null;
  const users = getUsers();
  return users[email] || null;
}

function updateCurrentUser(updatedUser) {
  const users = getUsers();
  users[updatedUser.email] = updatedUser;
  saveUsers(users);
}

function getTodayShortName() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
}

// =========================================
// Navigation Bar Update (All Pages)
// =========================================
function updateNavbar() {
  const navAuthLink = document.getElementById("nav-auth-link");
  if (!navAuthLink) return;

  const user = getCurrentUser();
  if (user) {
    navAuthLink.textContent = "Profile";
    navAuthLink.href = "profile.html";
  } else {
    navAuthLink.textContent = "Sign In";
    navAuthLink.href = "profile.html";
  }
}

// =========================================
// Home Page Logic (index.html)
// =========================================
function initHomePage() {
  const welcomeHeading = document.getElementById("welcome-heading");
  const streakText = document.getElementById("streak-text");
  const flameIcon = document.getElementById("flame-icon");
  const streakHint = document.getElementById("streak-hint");
  const dayItems = document.querySelectorAll(".day-item");

  if (!welcomeHeading) return;

  const user = getCurrentUser();

  if (user) {
    // Signed-in state
    welcomeHeading.textContent = `Welcome, ${user.name}`;

    const completedDays = user.completedDays || [];
    const streakCount = completedDays.length;

    streakText.textContent =
      streakCount === 1
        ? "1 Day Streak"
        : `${streakCount} Day Streak`;

    // Colour in the flame when signed in
    flameIcon.classList.remove("inactive");
    flameIcon.classList.add("active");

    streakHint.textContent = "Click any day below or finish an exercise session to update your weekly progress.";

    // Fill in completed days with blue colour + checkmark
    dayItems.forEach((item) => {
      const day = item.getAttribute("data-day");
      const circle = item.querySelector(".day-circle");

      if (completedDays.includes(day)) {
        item.classList.add("completed");
        circle.innerHTML = "&#10003;";
      } else {
        item.classList.remove("completed");
        circle.innerHTML = "";
      }

      // Allow signed-in user to toggle day completion directly
      item.onclick = () => {
        const idx = user.completedDays.indexOf(day);
        if (idx === -1) {
          user.completedDays.push(day);
        } else {
          user.completedDays.splice(idx, 1);
        }
        updateCurrentUser(user);
        initHomePage();
      };
    });
  } else {
    // Signed-out state
    welcomeHeading.textContent = "Welcome to TheraCore";
    streakText.textContent = "Start your streak";
    flameIcon.classList.remove("active");
    flameIcon.classList.add("inactive");

    dayItems.forEach((item) => {
      item.classList.remove("completed");
      item.querySelector(".day-circle").innerHTML = "";
    });
  }
}
// =========================================
// Exercises Page Logic (exercises.html)
// =========================================
function initExercisesPage() {
  const completeBtn = document.getElementById("complete-today-btn");
  if (!completeBtn) return;

  const user = getCurrentUser();
  const today = getTodayShortName();

  if (user && user.completedDays && user.completedDays.includes(today)) {
    completeBtn.textContent = `Completed Today (${today}) ✓`;
  }

  completeBtn.addEventListener("click", () => {
    const activeUser = getCurrentUser();
    if (!activeUser) {
      alert("Please sign in or create an account first to track your streak!");
      window.location.href = "profile.html";
      return;
    }

    if (!activeUser.completedDays) {
      activeUser.completedDays = [];
    }

    if (!activeUser.completedDays.includes(today)) {
      activeUser.completedDays.push(today);
      updateCurrentUser(activeUser);
    }

    completeBtn.textContent = `Completed Today (${today}) ✓`;
  });
}

// =========================================
// Profile & Auth Page Logic (profile.html)
// =========================================
function initProfilePage() {
  const authView = document.getElementById("auth-view");
  const profileView = document.getElementById("profile-view");
  if (!authView || !profileView) return;

  const user = getCurrentUser();

  if (user) {
    // Only show profile after sign-in
    authView.classList.add("hidden");
    profileView.classList.remove("hidden");

    document.getElementById("profile-avatar").textContent = user.name.charAt(0).toUpperCase();
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-activity-badge").textContent = `${user.activityLevel} Activity`;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-age").textContent = user.age ? `${user.age} years` : "Not provided";
    document.getElementById("profile-gender").textContent = user.gender || "Not provided";
    document.getElementById("profile-activity").textContent = user.activityLevel;

    const days = user.completedDays || [];
    document.getElementById("profile-streak").textContent = `${days.length} ${days.length === 1 ? "Day" : "Days"}`;
    document.getElementById("profile-days").textContent = days.length > 0 ? days.join(", ") : "None yet";

    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      window.location.reload();
    });
    return;
  }

  // Not signed in -> show Auth tabs
  authView.classList.remove("hidden");
  profileView.classList.add("hidden");

  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  });

  tabSignup.addEventListener("click", () => {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Handle Account Creation
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const age = document.getElementById("signup-age").value.trim();
    const gender = document.getElementById("signup-gender").value;
    const activityLevel = document.getElementById("signup-activity").value;
    const errorEl = document.getElementById("signup-error");

    const users = getUsers();
    if (users[email]) {
      errorEl.textContent = "An account with this email already exists. Please log in.";
      return;
    }

    users[email] = {
      name,
      email,
      password,
      age: age || "",
      gender: gender || "",
      activityLevel,
      completedDays: []
    };

    saveUsers(users);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, email);
    window.location.href = "index.html";
  });

  // Handle Log In
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");

    const users = getUsers();
    const existingUser = users[email];

    if (!existingUser || existingUser.password !== password) {
      errorEl.textContent = "Invalid email or password. Please try again or create an account.";
      return;
    }

    localStorage.setItem(STORAGE_CURRENT_USER_KEY, email);
    window.location.href = "index.html";
  });
}

// =========================================
// Initialize on Page Load
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  initHomePage();
  initExercisesPage();
  initProfilePage();
});
