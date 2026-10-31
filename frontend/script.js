const API_URL = "/proxy/3000/api/expenses";

const expenseForm = document.getElementById("expenseForm");
const expenseTable = document.getElementById("expenseTable");
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");
const totalExpense = document.getElementById("totalExpense");
const monthlyExpense = document.getElementById("monthlyExpense");
const totalRecords = document.getElementById("totalRecords");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();

    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error("Server returned an invalid response");
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;
}

function formatDate(date) {
    if (!date) return "";
    const parts = date.substring(0, 10).split("-");
    if (parts.length !== 3) return date;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function loadExpenses() {
    try {
        const expenses = await apiRequest(API_URL);
        displayExpenses(expenses);
        updateSummary(expenses);
    } catch (error) {
        console.error("Load expenses error:", error);
        expenseTable.innerHTML =
            '<tr><td colspan="5">Unable to load expenses. Please refresh.</td></tr>';
    }
}

function displayExpenses(expenses) {
    expenseTable.innerHTML = "";

    if (!Array.isArray(expenses) || expenses.length === 0) {
        expenseTable.innerHTML =
            '<tr><td colspan="5">No expenses found</td></tr>';
        return;
    }

    expenses.forEach(expense => {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;

        const amountCell = document.createElement("td");
        amountCell.textContent = `₹${Number(expense.amount).toFixed(2)}`;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(expense.expense_date);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editExpense(expense.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteExpense(expense.id));

        actionCell.append(editButton, deleteButton);
        row.append(titleCell, amountCell, categoryCell, dateCell, actionCell);
        expenseTable.appendChild(row);
    });
}

function updateSummary(expenses) {
    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0), 0
    );

    totalExpense.textContent = `₹${total.toFixed(2)}`;
    totalRecords.textContent = expenses.length;

    const now = new Date();
    const monthlyTotal = expenses.reduce((sum, expense) => {
        const date = expense.expense_date;
        if (
            date &&
            Number(date.substring(5, 7)) === now.getMonth() + 1 &&
            Number(date.substring(0, 4)) === now.getFullYear()
        ) {
            return sum + Number(expense.amount || 0);
        }
        return sum;
    }, 0);

    monthlyExpense.textContent = `₹${monthlyTotal.toFixed(2)}`;
}

expenseForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("expenseId").value;

    const expense = {
        title: document.getElementById("title").value.trim(),
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        expense_date: document.getElementById("expenseDate").value
    };

    if (
        !expense.title ||
        !Number.isFinite(expense.amount) ||
        expense.amount <= 0 ||
        !expense.category ||
        !expense.expense_date
    ) {
        alert("Please enter valid details in all fields.");
        return;
    }

    submitBtn.disabled = true;

    try {
        await apiRequest(id ? `${API_URL}/${id}` : API_URL, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        alert(id ? "Expense updated successfully!" : "Expense added successfully!");

        expenseForm.reset();
        document.getElementById("expenseId").value = "";
        submitBtn.textContent = "Add Expense";
        cancelBtn.style.display = "none";

        await loadExpenses();
        await searchExpenses();
    } catch (error) {
        console.error("Save expense error:", error);
        alert(`Unable to save expense: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
    }
});

async function editExpense(id) {
    try {
        const expenses = await apiRequest(API_URL);
        const expense = expenses.find(item => Number(item.id) === Number(id));

        if (!expense) {
            alert("Expense not found.");
            return;
        }

        document.getElementById("expenseId").value = expense.id;
        document.getElementById("title").value = expense.title;
        document.getElementById("amount").value = expense.amount;
        document.getElementById("category").value = expense.category;
        document.getElementById("expenseDate").value =
            expense.expense_date.substring(0, 10);

        submitBtn.textContent = "Update Expense";
        cancelBtn.style.display = "inline-block";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("Edit expense error:", error);
        alert(`Unable to edit expense: ${error.message}`);
    }
}

function cancelEdit() {
    expenseForm.reset();
    document.getElementById("expenseId").value = "";
    submitBtn.textContent = "Add Expense";
    cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", cancelEdit);

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
        await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
        alert("Expense deleted successfully!");
        await searchExpenses();
    } catch (error) {
        console.error("Delete expense error:", error);
        alert(`Unable to delete expense: ${error.message}`);
    }
}

async function searchExpenses() {
    const search = searchInput.value;
    const category = filterCategory.value;

    const url = `${API_URL}/search?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`;

    try {
        const expenses = await apiRequest(url);
        displayExpenses(expenses);
        updateSummary(expenses);
    } catch (error) {
        console.error("Search expenses error:", error);
    }
}

searchInput.addEventListener("input", searchExpenses);
filterCategory.addEventListener("change", searchExpenses);

cancelBtn.style.display = "none";
loadExpenses();