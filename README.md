# Elite_Library_Services

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology](#technologies)
- [Setup&Installation](#Setup&installation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview
-This is an online library management system that demonstrates fundamental web development concepts using HTML, CSS, and JavaScript. 
-The project simulates a library that allow users to register, log in, view a book catalog, and, if they are administrators, manage (add, issue, return, or delete)  books. 
-It also fetches book data from an external API (Open Library) and uses the browser's `localStorage` as a simple data store.

## Features
1. User Management
- Users can register with username,email and password to create an account in the system. 
- An option to register as an administrator is provided.
- Users can also login with registered credentials upon successfully registering/creating an account in the library system.
- User logout functionality is provided.

2.Book Catalog
- Search and display books fetched from an external API 
- View locally added books with their updated availability.

3.Admin Mgt Features 
- Restricted to admin users only.
- Admin users have access to additional functionalities, including adding books to the local catalog, issuing (borrowing) books, and returning them.
- Delete books from the local inventory.

4.Search & Debounce
- Search functionality is implemented with a debounce to limit the number of API calls.

5.Responsive Design
- The page features a background image in the `<main>` section, and the content is styled to appear in a centered, neatly-contained layout.

6.Responsive Design
- User and book data stored in localStorage.


## Technologies
- ** HTML to structure the content
- ** CSS to style and create web responsive design.
- ** JavaScript to create logic (functions), event handling and API integration.
- ** Open library API; external source to fetch books/ data source.
- ** Local storage for client side data persistence. 


## Installation/setup
- To run the project locally, follow these steps:
-Prerequisites 
- **A modern web browser (e.g., Chrome, Firefox).
- **A local server (e.g. Json, live-server, postman) to handle API requests.

- ** Start by cloning the repository (git clone <repository-url>) or download the ZIP file 
- ** Ensure the following directory structure; /project-folder │ ├── index.html ├── style.css ├── main.js ├── README.md 
- ** Open the Project:**
- Open `index.html` in your favorite web browser.
- Alternatively, use a live server to view the page.

## Usage
1. **Registration:**
- Go to the **Register** tab (default).
- Fill out the registration form (username, email, password).
- If desired, check "Register as Admin" for admin privileges.
- Submit to register; the form clears, a success message appears, and it switches to "Login" after 1 second.
- After registration, only the three most recent user registrations may be displayed (or you can choose to hide the list).

2. **Login:**
- 
- Switch to the **Login** tab if already a previous user and enter credentials.
- If new user, on the "Login" tab, enter your registered username and password.
- Submit to log in; it switches to "Catalog" after showing a success message.
- The logged-in user’s name will appear in the header, and if the user is an admin, the **Manage Catalog** tab will be enabled.

3. **Catalog & Search:**
- In the **Catalog** tab, view the list of books.
- Use the search box to filter books (the search term defaults to "fiction books" if empty).
- In the "Catalog" tab, type a search term (e.g.,by author "Harry Potter", or by genre "Science", "History" or title) to fetch books from the Open Library API.
- The catalog displays books fetched from the Open Library API and locally added books.
- Books are displayed by their quantity records when issued or returned

4. **Admin – Manage Catalog:**
- If logged in as an admin, the "Manage Catalog" tab appears.
- Admin users can add a new book via the form in the **Manage Catalog** tab with title, author, and quantity.
- The system supports issuing (borrowing) books (for regular users) and returning them (admin only).
- Books can also be deleted from the local catalog by admin.

5. **Logout:**
- Click the **Logout** button in the header to log out, which returns to login tab.


## File Structure

Online-Library-Management-System/
├── index.html    # Main HTML structure
├── style.css     # CSS styling and responsiveness
├── main.js       # JavaScript logic and API integration
└── README.md     # Project documentation (this file)


## Customization

- **Background Image:**
- Update `style.css` to change the background image. You can change the path if necessary.

- **Opacity & Container Size:**
- Customize the opacity of the `.Library-container` to adjust background visibility:
 ```css

- **API & Data:**
- The catalog fetches book data from the Open Library API using:
 ```javascript
 const Books_Library_API = 'https://openlibrary.org/search.json';
 ```
- Adjust the API URL if you wish to use a different endpoint or data source.


## Troubleshooting

1. Page Not Loading:
- Ensure all files are in the same folder and correctly named.
- Verify you’re using a local server, not file://.

2. Login/Catalog Not Working:
- Confirm credentials match a registered user.
- If "Loading books..." persists, check network connectivity or API status.

## Contributing
- Fork the repository.
- Create a feature branch (git checkout -b feature-name).
- Commit changes (git commit -m "Add feature").
- Push to the branch (git push origin feature-name).
- Open a pull request.


## License

This project is open-source licensed under the [MIT License].

#git hub link to this app: https://github.com/OderoKen254/Online_Library_Management_System
