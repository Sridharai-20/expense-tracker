const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const router = express.Router();

const db = new sqlite3.Database(
    path.join(__dirname, "../../database/expenses.db")
);

db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        expense_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

router.get("/", (req, res) => {
    db.all(
        "SELECT * FROM expenses ORDER BY expense_date DESC",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

router.get("/search", (req, res) => {
    const { search, category } = req.query;
    let sql = "SELECT * FROM expenses WHERE 1=1";
    const values = [];

    if (search) {
        sql += " AND title LIKE ?";
        values.push(`%${search}%`);
    }

    if (category && category !== "All") {
        sql += " AND category = ?";
        values.push(category);
    }

    sql += " ORDER BY expense_date DESC";

    db.all(sql, values, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post("/", (req, res) => {
    const { title, amount, category, expense_date } = req.body;

    if (!title || !amount || !category || !expense_date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.run(
        `INSERT INTO expenses (title, amount, category, expense_date)
         VALUES (?, ?, ?, ?)`,
        [title, amount, category, expense_date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                message: "Expense added successfully",
                id: this.lastID
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { title, amount, category, expense_date } = req.body;

    db.run(
        `UPDATE expenses
         SET title = ?, amount = ?, category = ?, expense_date = ?
         WHERE id = ?`,
        [title, amount, category, expense_date, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Expense updated successfully" });
        }
    );
});

router.delete("/:id", (req, res) => {
    db.run(
        "DELETE FROM expenses WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Expense deleted successfully" });
        }
    );
});

module.exports = router;
