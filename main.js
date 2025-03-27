// Element references

const Books_API_URL =
let users = JSON.parse(localStorage.getItem('users')) || [];
let books = JSON.parse(localStorage.getItem('books')) || [];
const currentUser = null;

// initialize the app (eventlistener for content load)

document.addEventListener('DOMContentLoaded', () => {
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

//switching tabs (event listener for click on tabs)

document.querySelectorAll('.tab-btn').forEach(button =>{
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(button.dataset.tab).style.display = 'block';
        if (button.dataset.tab === 'catalog') displayBooks();
        if (button.dataset.tab === 'manage') displayManageBooks();
    });
});

// user registration 
document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('reg-admin').checked;

    if (users.find(user => user.username === username)) {
        document.getElementById('register-message').textContent = 'Username already exists!';
        return;
    }
    users.push({ username, password, isAdmin });
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('register-message') = 'Your registration is successful! Please login.';
    e.target.reset();
});

//Submit user-login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.username === username && u.password === password);

    if (users) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('logged-in-user').textContent = `Welcome, ${user.username}`;
        document.getElementById('logout-btn').style.display = 'inline';
        document.getElementById('login-message').textContent = 'You have successfully logged in!';
        document.getElementById('manage-tab').style.display = user.isAdmin ? 'inline' : 'none';
        displayBooks();
    } else {
        document.getElementById('login-message').textContent = 'Login failed! Check your credentials.';
    }
    e.target.reset();
});

// Logging out
document.getElementById('logout-btn').addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('logged-in-user').textContent = '';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('manage-tab').style.display = 'none';
    document.querySelector('.tab-btn[data-tab="login"]').click();
});

