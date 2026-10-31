const express = require("express");
const cors = require("cors");
const path = require("path")
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve frontend files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// API routes
app.use("/api/expenses", expenseRoutes);

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
