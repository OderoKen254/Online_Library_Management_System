// Create element references

const Books_Library_API = 'https://openlibrary.org/search.json';

let users = JSON.parse(localStorage.getItem('users')) || [];
let books = JSON.parse(localStorage.getItem('books')) || [];
let currentUser = null; // we use let because it will be reassigned later to other users

//Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength validation function
function isStrongPassword(password) {
    const minLength = 8;
    const maxLength =12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && maxLength && hasUpperCase && hasLowerCase && 
           hasNumbers && hasSpecial;
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
        if (!isValidEmail(email)) {
            document.getElementById('register-message').textContent = 'Please enter a valid email address.';
            return;
        }

        if (!isStrongPassword(password)) {
            document.getElementById('register-message').textContent = 
                'Password must have 8-12 characters of uppercase, lowercase, numbers, and special characters.';
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

    // Switch to login tab after registration
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

// func helper to update UI based on current user status
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
        const recentUsers = users.slice(-3);
        recentUsers.forEach(user => {
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
    bookList.innerHTML = '<p>Loading available books...</p>';
    const searchTerm = document.getElementById('search-input')?.value.trim() || 'fiction';
    
    // Setting a default library search (i.e., defaulted the search to fiction books)
    try {
        const apiUrl = `${Books_Library_API}?q=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();

        bookList.innerHTML = ''; // Clear loading message

        const booksToDisplay = data.docs.slice(0, 15); // Limit to first 15 API results
        if (booksToDisplay.length === 0) {
            bookList.innerHTML = '<p>No available books found.</p>';
        } else {
            booksToDisplay.forEach(book => {
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
            // Add a "Borrow" button if the book is available and a user is logged in.
            const borrowButton = currentUser && book.quantity > 0 
                ? `<button onclick="borrowBook(${book.id})">Borrow</button>` 
                : '';
            div.innerHTML = `${book.title} by ${book.author} (Available: ${book.quantity}) ${borrowButton}`;
            bookList.appendChild(div);
        });
    } catch (error) {
        bookList.innerHTML = `<p>Error loading books. Please try again.</p>`;
        console.error('Error fetching books:', error);
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
            // Create a delete button with an event listener.
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteBook(book.id));

            div.innerHTML = `${book.title} by ${book.author} (Qty: ${book.quantity}) `;
            div.appendChild(deleteButton);
            manageList.appendChild(div);
        });

        // Display borrowed books with return option
        if (currentUser && currentUser.isAdmin) {
            const borrowedSection = document.createElement('div');
            borrowedSection.innerHTML = '<h3>All Borrowed Books</h3>';
        // Loop through all users and list out borrowed books
            users.forEach(user => {
                if (user.borrowedBooks && user.borrowedBooks.length > 0) {
                    user.borrowedBooks.forEach(bookId => {
                        const book = books.find(b => b.id === bookId);
                        if (book) {
                            const div = document.createElement('div');
                            div.className = 'book-item';
                            div.textContent = `${book.title} borrowed by ${user.username}`;
                            const returnButton = document.createElement('button');
                            returnButton.textContent = 'Return';
                            returnButton.addEventListener('click', () => returnBook(book.id, user.username));
                            div.appendChild(returnButton);
                            borrowedSection.appendChild(div);
                        }
                    });
                }
            });
            manageList.appendChild(borrowedSection);
        }
    }
}

// New function to handle book borrowing (Issue-books)
function borrowBook(bookId) {
    if (!currentUser) return;
    
    const book = books.find(b => b.id === bookId);
    if (book && book.quantity > 0) {
        book.quantity--;
        currentUser.borrowedBooks = currentUser.borrowedBooks || [];
        currentUser.borrowedBooks.push(bookId);
        
        // Update storage
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        displayBooks();
        if (currentUser.isAdmin) displayManageBooks();
        alert('Book borrowed successfully!');
    } else {
        alert('Book is not available to borrow.');
    }
}

// New function to handle book returning
function returnBook(bookId, username) {
    // Only admins are authorized to return books to library catalog
    if (!currentUser || !currentUser.isAdmin) return;
    
    const book = books.find(b => b.id === bookId);
    const user = users.find(u => u.username === username);
    
    if (book && user && user.borrowedBooks) {
        const bookIndex = user.borrowedBooks.indexOf(bookId);
        if (bookIndex > -1) {
            user.borrowedBooks.splice(bookIndex, 1);
            book.quantity++;
            
            // Update storage
            localStorage.setItem('books', JSON.stringify(books));
            localStorage.setItem('users', JSON.stringify(users));
            if (currentUser.username === username) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            displayBooks();
            displayManageBooks();
            alert('Book returned successfully!');
        }
    }
}

// fnc to delete local storage books 
function deleteBook(id) {
    if (!currentUser || !currentUser.isAdmin) return;
    books = books.filter(book => book.id !== id);
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
