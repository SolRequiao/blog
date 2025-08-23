# Blog (EJS + Express + Sequelize)

A blog application built with **Node.js**, **Express**, **EJS** for server-side rendering, and **Sequelize** with **MySQL** as the database. It also uses **Bootstrap** for styling and includes authentication with sessions and password hashing.

---

## Features
- User registration and authentication (`bcryptjs`, `express-session`)
- Post creation and editing with SEO-friendly slugs (`slugify`)
- Server-side rendering using **EJS**
- Styled with **Bootstrap 5**
- Session-based authentication
- Persistent data management with **Sequelize** and **MySQL**

---

## Technologies

- **Node.js** 18+
- **Express 5**
- **EJS** – server-side templating
- **Sequelize 6** + **mysql2**
- **express-session** – session management
- **bcryptjs** – password hashing
- **body-parser**
- **dotenv** – environment variable management
- **slugify**
- **Bootstrap 5**

---

# Run Application

```bash
cp .env.example .env   # configure environment variables
```

---

## Run the containers

```bash
mkdir mysql-volume
docker compose up --build
```

---

## Running Locally (without Docker)

In this case, you also have to install **MySQL database** manually on your machine.
```bash
npm install
node index.js
```

---

## Default Login for Testing

When accessing the app for the first time at the route `/`, a default admin user is available for testing the application features.  

Use the following credentials to log in:

```
Email: admin@mail.com
Password: admin123!@#
```