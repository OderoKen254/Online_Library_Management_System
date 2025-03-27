// Element references

const Books_Library_API =
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

// displaying books in catalog fetched from API
async function displayBooks() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = <p>Loading books...</p>;
    const searchTerm = document.getElementById('search-input').value.trim();

    //defaulting search to fiction books
    try {
        let apiUrl = `${Books_Library_API}?q=${searchTerm || 'fiction'}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new ERROR('API request failed!');
        const data = await response.json();

        bookList.innerHTML = " "  //to clear loading msg

        const booksToDisplay = data.docs.slice(0, 20)  //limit to first 20 books results

        booksToDisplay.forEach(book => {
            const title = book.title || 'Unknown Title';
            const author = book.author_name ? book.author_name[0] : 'Unknown Author';
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `${title} by ${author}`;
            bookList.appendChild(div);
        });

        //add locally managed books by admin
        books.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `${book.title} by ${book.author} (Available: ${book.quantity})`;
            bookList.appendChild(div);
        });
    }catch(error) {
        console.error('Error fetching books:', error);
        bookList.innerHTML = '<p>Error loading books. Please try again.</p>';
    }
}

//Submit- adding books stored locally by Admin
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

//fnc Display managed books to admin only in local storage
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



