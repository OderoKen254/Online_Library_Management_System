// Create element references

const Books_Library_API = 'https://openlibrary.org/search.json';

let users = JSON.parse(localStorage.getItem('users')) || [];
let books = JSON.parse(localStorage.getItem('books')) || [];
let currentUser = null;

//Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Event listener to initialize the app

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        updateUserInterface();
        document.querySelector('.tab-btn[data-tab="catalog"]').click();
    } else {
        document.querySelector('.tab-btn[data-tab="register"]').click();
    }
    displayUsers();
});


// Event listener for switching tabs (i.e. click on tabs)
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        document.querySelectorAll('.user-content').forEach(content => content.style.display = 'none');
        const targetTab = document.getElementById(button.dataset.tab);
        if (targetTab) {
            targetTab.style.display = 'block';
            if (button.dataset.tab === 'catalog') displayBooks();
            if (button.dataset.tab === 'manage') displayManageBooks();
        } else {
            console.error(`Tab "${button.dataset.tab}" not found`);
        }
    });
});

// Event listener for user registration 
const regForm = document.getElementById('registration-form');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('reg-username')?.value.trim();
        const email = document.getElementById('user-email')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        const isAdmin = document.getElementById('reg-admin')?.checked;

        if (!username || !email || !password) {
            document.getElementById('register-message').textContent = 'Please fill in all fields.';
            return;
        }
        if (users.find(user => user.username === username)) {
            document.getElementById('register-message').textContent = 'Username already exists!';
            return;
        }

        const userData = { username, email, password, isAdmin };
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));

        const mockJsonData = JSON.stringify(userData);
        localStorage.setItem('mockUserJson', mockJsonData); // Mock JSON storage

        document.getElementById('register-message').textContent = 'Registration successful!';
        displayUsers();
        e.target.reset();

// Immediately switch to login tab
        setTimeout(() => {
            document.querySelector('.tab-btn[data-tab="login"]').click();
            document.getElementById('register-message').textContent = ''; // Clear message
        }, 1000);
    });
}


// Event listener for submitting user-login data form
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();

        if (!username || !password) {
            document.getElementById('login-message').textContent = 'Please fill in all fields.';
            return;
        }

        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserInterface();
            document.getElementById('login-message').textContent = 'Login successful!';
            e.target.reset();

            setTimeout(() => {
                document.querySelector('.tab-btn[data-tab="catalog"]').click();
                document.getElementById('login-message').textContent = '';
                displayBooks();
            },1000); //Delay to show success message
        } else {
            document.getElementById('login-message').textContent = 'Invalid credentials!';
        }
    });
} 

// Event listener for user logging out
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('logged-in-user').textContent = '';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('manage-tab').style.display = 'none';
        document.querySelector('.tab-btn[data-tab="login"]').click();
    });
}

// func helper to update UI
function updateUserInterface() {
    const userInfo = document.getElementById('logged-in-user');
    const logoutBtn = document.getElementById('logout-btn');
    const manageTab = document.getElementById('manage-tab');
    if (userInfo && logoutBtn && manageTab) {
        userInfo.textContent = `Welcome, ${currentUser.username}`;
        logoutBtn.style.display = 'inline';
        manageTab.style.display = currentUser.isAdmin ? 'inline' : 'none';
    }
}


// func to display registered users
function displayUsers() {
    const userList = document.getElementById('user-list');
    if (userList) {
        userList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.username} (${user.isAdmin ? 'Admin' : 'User'})`;
            userList.appendChild(li);
        });
    }
}


// Async function for displaying books in catalog fetched from API source
async function displayBooks() {
    const bookList = document.getElementById('book-list');
    if (!bookList) return;
    bookList.innerHTML = '<p>Loading books...</p>'; 
    const searchTerm = document.getElementById('search-input')?.value.trim() || 'fiction';
    // Setting a default library search (i.e., defaulted the search to fiction books)

    try {
        const apiUrl = `${Books_Library_API}?q=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API request failed: ${response.status}');
        const data = await response.json();

        bookList.innerHTML = ""; // Clear loading message

        const booksToDisplay = data.docs.slice(0, 10); // Limit to first 20 book results
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
        books.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `${book.title} by ${book.author} (Available: ${book.quantity})`;
            bookList.appendChild(div);
        });
    } catch (error) {
        bookList.innerHTML = `<p>Error loading books. Please try again.</p>`; 
    }
}

// Event listener to submit local books- adding books stored locally by Admin
const addBookForm = document.getElementById('add-book-form');
if (addBookForm) {
    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser.isAdmin) {
            alert('Only admins can add books.');
            return;
        }

        const title = document.getElementById('book-title')?.value.trim();
        const author = document.getElementById('book-author')?.value.trim();
        const quantity = parseInt(document.getElementById('book-quantity')?.value);

        if (!title || !author || isNaN(quantity)) {
            alert('Please fill in all fields correctly.');
            return;
        }

        const id = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({ id, title, author, quantity });
        localStorage.setItem('books', JSON.stringify(books));
        displayBooks();
        displayManageBooks();
        e.target.reset();
    });
}


// fnc to display managed books to admin panel only from books local storage
function displayManageBooks() {
    const manageList = document.getElementById('manage-book-list');
    if (!manageList) {
        console.error('manage-book-list element not found');
        return;
    }
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
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
        console.log('Search input changed');
        displayBooks();
    }, 300));
}





