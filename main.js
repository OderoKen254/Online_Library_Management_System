// Create element references

const Books_Library_API = 'https://stephen-king-api.onrender.com/api/books.json';

let users = JSON.parse(localStorage.getItem('users')) || [];
let books = JSON.parse(localStorage.getItem('books')) || [];
const currentUser = null;

// Event listener to initialize the app

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    if (localStorage.getItem("currentUser")) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        document.getElementById('logged-in-user').textContent = `Welcome, ${currentUser.username}, login successful!`;
        document.getElementById('logout-btn').style.display = 'inline';
        document.getElementById('manage-tab').style.display = currentUser.isAdmin ? 'inline' : 'none';
        displayManageBooks();
    }
    // to initialize tab to load users, catalog
    document.querySelector('.tab-btn[data-tab="register"]').click();
    displayUsers();
    // displayBooks();
});

// Event listener for switching tabs (i.e. click on tabs)

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        console.log(`Switching to tab: ${button.dataset.tab}`);
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        document.querySelectorAll('.user-content').forEach(content => content.style.display = 'none');
        const targetTab = document.getElementById(button.dataset.tab);
        if (targetTab) targetTab.style.display = 'block';
        if (button.dataset.tab === 'catalog') displayBooks();
        if (button.dataset.tab === 'manage') displayManageBooks();
    });
});

// Event listener for user registration 
document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('password').value.trim();
    const isAdmin = document.getElementById('reg-admin').checked;

    if (!username || !email || !password) {
        document.getElementById('register-message').textContent = 'Please fill in all fields.';
        return;
    }
    
    if (users.find(user => user.username === username)) {
        document.getElementById('register-message').textContent = 'Username already exists!';
        return;
    }
    users.push({ username, email, password, isAdmin });
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('register-message').textContent = 'Your registration is successful! Please login.';
    displayUsers();
    e.target.reset();
});

// Event listener for submitting user-login data form
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !Email || !password) {
        document.getElementById('login-message').textContent = 'Please fill in all fields.';
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (users) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('logged-in-user').textContent = `Welcome, ${user.username}`;
        document.getElementById('logout-btn').style.display = 'inline';
        document.getElementById('login-message').textContent = 'You have successfully logged in!';
        document.getElementById('manage-tab').style.display = user.isAdmin ? 'inline' : 'none';
        document.querySelector('.tab-btn[data-tab="catalog"]').click();
    } else {
        document.getElementById('login-message').textContent = 'Login failed! Check your credentials.';
    }
    e.target.reset();
});

// Event listener for user logging out
document.getElementById('logout-btn').addEventListener('click', () => {
    console.log('Logging out');
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('logged-in-user').textContent = '';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('manage-tab').style.display = 'none';
    document.querySelector('.tab-btn[data-tab="login"]').click();
});

// func to display registered users
function displayUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.username} (${user.isAdmin ? 'Admin' : 'User'})`;
        userList.appendChild(li);
    });

// Async function for displaying books in catalog fetched from API source
async function displayBooks() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '<p>Loading books...</p>'; 
    const searchTerm = document.getElementById('search-input').value.trim();

    // Setting a default library search (i.e., defaulted the search to fiction books)
    try {
        let apiUrl = `${Books_Library_API}?q=${encodeURIComponent(searchTerm || 'fiction')}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API request failed: ${response.status}');
        const data = await response.json();

        bookList.innerHTML = ""; // Clear loading message

        const booksToDisplay = data.docs.slice(0, 20); // Limit to first 20 book results
        if (booksToDisplay.length === 0) {
            bookList.innerHTML = '<p>No books found.</p>';
        } else {
            booksToDisplay.forEach((book) => {
                const title = book.title || 'Unknown Title';
                const author = book.author_name ? book.author_name[0] : 'Unknown Author';
                const div = document.createElement('div');
                div.className = 'book-item';
                div.innerHTML = `${title} by ${author}`;
                bookList.appendChild(div);
            });
            
        }

        // Add locally managed books by admin
        books.forEach((book) => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `${book.title} by ${book.author} (Available: ${book.quantity})`;
            bookList.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        bookList.innerHTML = '<p>Error loading books. Please try again.</p>'; // Fixed quotation marks
    }
}

// Event listener to submit local books- adding books stored locally by Admin
document.getElementById('add-book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.isAdmin) {
        alert('Only admins can add books.');
        return;
    }

    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const quantity = parseInt(document.getElementById('book-quantity').value);

    if (!title || !author || isNaN(quantity)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const id = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;

    books.push({ id, title, author, quantity, });
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
    displayManageBooks();
    e.target.reset();
});

// fnc to display managed books to admin panel only from books local storage
function displayManageBooks() {
    const manageList = document.getElementById('manage-book-list');
    manageList.innerHTML = " ";

    if (books.length === 0) {
        manageList.innerHTML = '<p>No local books added yet.</p>';
    } else {
        books.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `${book.title} by ${book.author} (Qty: ${book.quantity}) 
                <button onclick="deleteBook(${book.id})">Delete</button>`;
            manageList.appendChild(div);
        });
    }
}

// fnc to delete local storage books 
function deleteBook(id) {
    if (!currentUser || !currentUser.isAdmin) return;
    books = books.filter(book => book.id !== id);
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
    displayManageBooks();
}

// search functionality input
document.getElementById('search-input').addEventListener('input', displayBooks);

// initializing tab
document.querySelector('.tab-btn[data-tab = "registration"]').click();




