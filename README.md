# Neurolink

A quickstart guide to running the Neurolink project locally.

> **Note on credentials**: Never commit real database usernames/passwords to Git. Use environment variables or a local `.env` file that is **gitignored**. The URI below is shown for setup demonstration only.

---

## Prerequisites

* **Node.js** (LTS recommended)
* **npm** (comes with Node)
* **MongoDB Atlas** account (or a MongoDB instance). The example uses Atlas.
* **VS Code** with the **Live Server** extension (for opening `welcome.html`).

---

## 1) Clone the repository

```bash
git clone https://github.com/<your-username>/neurolink.git
cd neurolink
```

---

## 2) Install dependencies

```bash
npm install
```

---

## 3) Configure MongoDB connection

You can connect using a MongoDB Atlas connection string. Replace `<USERNAME>` and `<PASSWORD>` with your Atlas credentials.

**Template:**

```
mongodb+srv://<USERNAME>:<PASSWORD>@<cluster-address>/
```

> **Recommended**: Store this in a `.env` file and never commit it.

### Create a `.env` file

In the project root, create a file named `.env` with:

```
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<cluster-address>/
PORT=3000
```

Ensure your server code reads from `process.env.MONGODB_URI` and `process.env.PORT` (for example, using `dotenv`).

---

## 4) Run the backend

```bash
npm run dev
```

This should start your backend (typically with nodemon) and connect to MongoDB using the URI above.

---

## 5) Open the main page (frontend)

Open **`welcome.html`** in your editor and start **Live Server**:

1. In VS Code, right‑click `welcome.html` → **Open with Live Server**.
2. Your browser should open a URL like `http://127.0.0.1:5500/.../welcome.html` (port may vary).

---

## Project scripts

* **`npm run dev`**: Starts the backend in development mode.

---

## Troubleshooting

* **Auth failed / bad URI**: Ensure the URI is correctly formatted and the user has the right Atlas role.
* **IP not allowed**: In MongoDB Atlas, add your IP (or `0.0.0.0/0` for testing—use caution) to the Network Access allowlist.
* **`npm run dev` not found**: Confirm `"dev"` exists in `package.json > scripts`.
* **CORS/relative paths**: Use Live Server for `welcome.html` during development.

---

## Contributing

1. Create a new branch: `git switch -c feature/your-feature`.
2. Commit changes: `git commit -m "Add: your feature"`.
3. Push: `git push -u origin feature/your-feature`.
4. Open a Pull Request into `main`.

---

## Security best practices

* Use environment variables; do **not** hardcode credentials.
* Do not commit `.env` (add it to `.gitignore`).
* Rotate credentials in Atlas if they’ve been exposed.
