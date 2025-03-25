const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "syncthreads.db");

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
    if (error) {
        console.log("Error opening database:", error.message);
    } else {
        console.log("Connected to the syncthreads.db database.");
    }

    // Create 'user' and 'dashboard' table if it doesn't exist
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`,
            (err) => {
                if (err) {
                    console.error("Error creating user table:", err.message);
                }
                else {
                    console.log("User table is ready.")
                };
            }
        );

        db.run(`CREATE TABLE IF NOT EXISTS dashboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL
        )`,
            (err) => {
                if (err) {
                    console.error("Error creating dashboard table:", err.message);
                } else {
                    console.log("Dashboard table is ready.")
                };
            }
        );

        db.run(
            `CREATE TABLE IF NOT EXISTS maps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                country_name TEXT UNIQUE NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                zoom INTEGER NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error("Error creating maps table:", err.message);
                } else {
                    console.log("Maps table is ready.");
                }
            }
        );

    });
});

const authenticateToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1];
    }
    if (authHeader === undefined) {
        response.status(401);
        response.send("User not logged in");
    } else {
        jwt.verify(jwtToken, "MY_SECRET_KEY", async (error, payload) => {
            if (error) {
                response.send("Invalid Access Token");
            } else {
                request.username = payload.username;
                next();
            }
        })
    }
};

app.get('/', async (request, response) => {
    try {
        response.send("Welcome!, This is a Syncthreads Company Assignment Backend domain you can access with endpoints.");
    } catch (e) {
        console.error(e.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login API
app.post("/api/login", async (request, response) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return response.status(400).json({ error_msg: "Username or password is invalid" });
    }

    db.get(
        `SELECT * FROM user WHERE username = ?`, [username], async (err, dbUser) => {
            if (err) {
                response.status(500).send("Database Error");
            } else if (!dbUser) {
                response.status(400).json({ error_msg: "Invalid Username" });
            } else {
                const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
                if (isPasswordMatched) {
                    const payload = { username: username, password: password };
                    const jwtToken = jwt.sign(payload, "MY_SECRET_KEY");
                    response.json({ jwtToken });
                } else {
                    response.status(400).json({ error_msg: "Username and password didn't match" })
                }
            }
        }
    )
});

app.get("/api/dashboard", authenticateToken, (request, response) => {
    try {
        const getDashboardQuery = `SELECT * FROM dashboard;`;
        db.all(getDashboardQuery, [], (error, dashboardData) => {
            if (error) {
                response.status(500).json({ error_msg: "Database error" });
                return;
            }
            response.status(200).json(dashboardData);
        })
    } catch (e) {
        response.status(500).json({ error_msg: "Internal Server Error" });
    }
});

app.get("/api/map/", authenticateToken, (request, response) => {
    try {
        const getMapsQuery = `SELECT * FROM maps;`;
        db.all(getMapsQuery, [], (error, mapsData) => {
            if (error) {
                response.status(500).json({ error_msg: "Database error" });
                return;
            }
            response.status(200).json(mapsData);
        })
    } catch (error) {
        response.status(500).json({ error_msg: "Internal Server Error" });
    }
});


process.on("SIGINT", () => {
    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        } else {
            console.log("Database connection closed.");
        }
        process.exit(0);
    });
});

app.listen(3000, () => {
    console.log("Server is Running at http://localhost:3000/");
});

module.exports = app;