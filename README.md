# INotebook

Your notebook on the cloud: a MERN app for creating, editing and deleting personal notes behind JWT login.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)

## Overview

INotebook is a full-stack note-taking app. A React frontend talks to an Express REST API that stores users and notes in MongoDB. Each user signs up, logs in and can see and manage only their own notes.

## Features

- Sign up and log in. Passwords are hashed with bcryptjs, and the API returns a JWT that is stored in `localStorage`.
- Request validation with `express-validator`: name of at least 3 characters, a valid email, and a password of at least 5 characters.
- Add notes with a title, a description and an optional tag (the default tag is `General`).
- Edit notes in a Bootstrap modal and delete them from the note card.
- Ownership checks on the server: users can update or delete only their own notes.
- Alerts for actions, a navbar that switches between login/signup and logout, and an About page.

## Tech stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 18, React Router 6, Context API, Bootstrap 5               |
| Backend  | Node.js, Express 4, express-validator, bcryptjs, jsonwebtoken, cors |
| Database | MongoDB with Mongoose 6                                          |

## Project structure

```
INotebook/
├── backend/
│   ├── middleware/fetchuser.js   # verifies the auth-token header
│   ├── models/                   # User, Note
│   ├── routes/                   # auth.js, notes.js
│   ├── db.js                     # MongoDB connection
│   └── index.js                  # Express entry point (port 5000)
├── public/
└── src/
    ├── components/               # Navbar, Home, Notes, Noteitem, AddNote, Login, Signup, About, Alert
    └── context/notes/            # NoteState (API calls) and noteContext
```

## Getting started

### Prerequisites

- Node.js 16 or later and npm
- MongoDB running locally on `mongodb://localhost:27017`

### Install

```bash
git clone https://github.com/VamsiKrishnaThota03/INotebook.git
cd INotebook
npm install
cd backend && npm install
```

### Configuration

The current code has its configuration hard-coded. Move these values into environment variables before you deploy anywhere.

| Setting      | Where it is set                                              | Example placeholder                     |
| ------------ | ------------------------------------------------------------ | --------------------------------------- |
| `MONGO_URI`  | `backend/db.js`                                              | `mongodb://localhost:27017/inotebookDb` |
| `JWT_SECRET` | `backend/routes/auth.js`, `backend/middleware/fetchuser.js`  | `<your-jwt-secret>`                     |
| API host     | `src/context/notes/NoteState.js`, `Login.js`, `Signup.js`    | `http://localhost:5000`                 |

### Run

```bash
# frontend and backend together (from the project root)
npm run both

# or separately
npx nodemon backend/index.js   # API on http://localhost:5000
npm start                      # React app on http://localhost:3000
```

Other scripts: `npm run build` creates a production build, `npm test` runs the test runner, and `npm run deploy` builds and publishes `build/` with `gh-pages`.

## API

The base URL is `http://localhost:5000`. Routes marked "Yes" need an `auth-token` header.

| Method | Path                         | Auth | Purpose                                 |
| ------ | ---------------------------- | ---- | --------------------------------------- |
| POST   | `/api/auth/createuser`       | No   | Register a user and return a JWT        |
| POST   | `/api/auth/login`            | No   | Log in and return a JWT                 |
| POST   | `/api/auth/getuser`          | Yes  | Get the logged-in user (without the password) |
| GET    | `/api/notes/fetchnotes`      | Yes  | List the current user's notes           |
| POST   | `/api/notes/createnote`      | Yes  | Create a note (`title`, `description`, `tag`) |
| PUT    | `/api/notes/updatenote/:id`  | Yes  | Update a note you own                   |
| DELETE | `/api/notes/deletenote/:id`  | Yes  | Delete a note you own                   |

## Notes

The repository includes a GitHub Pages workflow (`.github/workflows/static.yml`), but it uploads the raw repository rather than a React build, and the app needs the backend running. A hosted demo is not available yet.
