const API_URL = "https://dummyjson.com/todos";
const todoContainer = document.getElementById("todoContainer");
const pagination = document.getElementById("pagination");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

let todos = [];
let currentPage = 1;
const todosPerPage = 10;

// Fetch Todos
async function fetchTodos() {
  loading.style.display = "block";
  error.classList.add("d-none");
  try {
    const res = await fetch(`${API_URL}?limit=100`);
    const data = await res.json();
    todos = data.todos.map(todo => ({
      ...todo,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()) // Fake date for demo purposes
    }));
    renderTodos();
  } catch (err) {
    console.error(err);
    error.classList.remove("d-none");
  } finally {
    loading.style.display = "none";
  }
}

// Render Todos
function renderTodos() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const fromDate = new Date(document.getElementById("fromDate").value);
  const toDate = new Date(document.getElementById("toDate").value);
  let filtered = todos.filter(todo =>
    todo.todo.toLowerCase().includes(searchTerm)
  );

  if (!isNaN(fromDate) && !isNaN(toDate)) {
    filtered = filtered.filter(todo => {
      const created = new Date(todo.createdAt);
      return created >= fromDate && created <= toDate;
    });
  }

  const totalPages = Math.ceil(filtered.length / todosPerPage);
  const start = (currentPage - 1) * todosPerPage;
  const currentTodos = filtered.slice(start, start + todosPerPage);

  todoContainer.innerHTML = currentTodos.map(todo => `
    <div class="card mb-2 shadow-sm">
      <div class="card-body d-flex justify-content-between">
        <span>${todo.todo}</span>
        <small class="text-muted">${new Date(todo.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  `).join("");

  renderPagination(totalPages);
}

// Render Pagination
function renderPagination(totalPages) {
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link" onclick="goToPage(${i})">${i}</button>
      </li>
    `;
  }
}

function goToPage(page) {
  currentPage = page;
  renderTodos();
}

// Add Todo
document.getElementById("todoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("todoInput");
  const newTodo = input.value.trim();

  if (!newTodo) return;

  try {
    const res = await fetch(API_URL + "/add", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo: newTodo, completed: false, userId: 5 }),
    });
    const data = await res.json();
    data.createdAt = new Date(); // Fake date
    todos.unshift(data);
    input.value = "";
    renderTodos();
  } catch (err) {
    alert("Failed to add todo.");
    console.error(err);
  }
});

// Random Date Generator (for filtering)
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Filter Button
document.getElementById("filterBtn").addEventListener("click", () => {
  currentPage = 1;
  renderTodos();
});

// Search Input
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  renderTodos();
});

// Load Todos on Start
fetchTodos();
