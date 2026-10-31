CREATE DATABASE expense_tracker;

USE expense_tracker;

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO expenses (title, amount, category, expense_date)
VALUES
('Food', 150, 'Food', '2026-10-01'),
('Transport', 80, 'Transport', '2026-10-02'),
('Shopping', 500, 'Shopping', '2026-10-03'),
('Education', 300, 'Education', '2026-10-04'),
('Entertainment', 200, 'Entertainment', '2026-10-05');
