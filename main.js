// Create element references

const Books_Library_API = 'https://stephen-king-api.onrender.com/api/books';

let users = JSON.parse(localStorage.getItem('users')) || [];
let books = JSON.parse(localStorage.getItem('books')) || [];
const currentUser = null;

// Event listener to initialize the app

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

// Event listener for switching tabs (i.e. click on tabs)

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

// Event listener for user registration 
document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const userId = document.getElementById('user-id').value;
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('reg-admin').checked;
    

    if (users.find(user => user.username === username)) {
        document.getElementById('register-message').textContent = 'Username already exists!';

        console.log(username);
        return;
    }
    users.push({ username, userId, password, isAdmin });
    console.log(users);

    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('register-message').textContent = 'Your registration is successful! Please login.';
    console.log(username);
    e.target.reset();
});

// Event listener for submitting user-login data form
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

// Event listener for user logging out
document.getElementById('logout-btn').addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('logged-in-user').textContent = '';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('manage-tab').style.display = 'none';
    document.querySelector('.tab-btn[data-tab="login"]').click();
});

// Async function for displaying books in catalog fetched from API source
async function displayBooks() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '<p>Loading books...</p>'; // Fixed quotation marks
    const searchTerm = document.getElementById('search-input').value.trim();

    // Setting a default library search (i.e., defaulted the search to fiction books)
    try {
        let apiUrl = `${Books_Library_API}?q=${searchTerm || 'fiction'}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API request failed!'); // Fixed Error instantiation
        const data = await response.json();

        bookList.innerHTML = ""; // Clear loading message

        const booksToDisplay = data.docs.slice(0, 20); // Limit to first 20 book results

        booksToDisplay.forEach((book) => {
            const title = book.title || 'Unknown Title';
            const author = book.author_name ? book.author_name[0] : 'Unknown Author';
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `${title} by ${author}`;
            bookList.appendChild(div);
        });

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
document.getElementById('add-books-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.isAdmin) return;
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const quantity = parseInt(document.getElementById('book-quantity').value);
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

    books.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-item';
        div.innerHTML = `${book.title} by ${book.author} (Qty: ${book.quantity}) 
            <button onclick="deleteBook(${book.id})">Delete</button>`;
        manageList.appendChild(div);
    });
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
document.querySelector('.tab-btn[data-tab = "register"]').click();




