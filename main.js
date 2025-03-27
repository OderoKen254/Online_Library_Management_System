// Element references

const Books_API_URL =
let users = JSON.parse(localStorage.getItem("users")) || [];
let books = JSON.parse(localStorage.getItem("books")) || [];
const currentUser = null;

// initialize the app

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("currentUser")) {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
        document.getElementById('logged-in-user').textContent = `Welcome, ${currentUser.username}, login successful!`;
        document.getElementById('logout-btn').style.display = 'inline';
        document.getElementById('manage-tab').style.display = currentUser.isAdmin ? 'inline' : 'none';
        displayManageBooks();
    }
    // to initialize catalog load
    displayBooks();
});