let editingId = null;

async function loadStudents() {
  const search = encodeURIComponent(document.getElementById("search").value);
  const res = await fetch(`/api/students?search=${search}`);
  const students = await res.json();

  document.getElementById("studentTable").innerHTML = students.map(s => `
    <tr>
      <td>${s.studentId}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.branch)}</td>
      <td>${s.semester}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.city)}</td>
      <td>${s.marks}</td>
      <td class="actions">
        <button onclick="editStudent(${s.studentId})">Edit</button>
        <button class="danger" onclick="deleteStudent(${s.studentId})">Delete</button>
      </td>
    </tr>
  `).join("");
}

async function loadStats() {
  const res = await fetch("/api/stats");
  const data = await res.json();

  document.getElementById("total").textContent = data.summary.totalStudents;
  document.getElementById("average").textContent =
    Number(data.summary.averageMarks || 0).toFixed(2);
  document.getElementById("highest").textContent = data.summary.highestMarks || 0;
  document.getElementById("lowest").textContent = data.summary.lowestMarks || 0;

  document.getElementById("branchTable").innerHTML = data.branchStats.map(b => `
    <tr>
      <td>${escapeHtml(b._id)}</td>
      <td>${b.totalStudents}</td>
      <td>${Number(b.averageMarks).toFixed(2)}</td>
    </tr>
  `).join("");
}

document.getElementById("studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    studentId: Number(document.getElementById("studentId").value),
    name: document.getElementById("name").value,
    branch: document.getElementById("branch").value,
    semester: Number(document.getElementById("semester").value),
    email: document.getElementById("email").value,
    city: document.getElementById("city").value,
    marks: Number(document.getElementById("marks").value)
  };

  const url = editingId ? `/api/students/${editingId}` : "/api/students";
  const method = editingId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const msg = document.getElementById("message");

  if (!res.ok) {
    msg.textContent = data.message || "Operation failed";
    return;
  }

  msg.textContent = editingId ? "Student updated successfully." : "Student added successfully.";
  resetForm();
  await refresh();
});

async function editStudent(id) {
  const res = await fetch(`/api/students/${id}`);
  const s = await res.json();

  editingId = id;
  document.getElementById("studentId").value = s.studentId;
  document.getElementById("studentId").disabled = true;
  document.getElementById("name").value = s.name;
  document.getElementById("branch").value = s.branch;
  document.getElementById("semester").value = s.semester;
  document.getElementById("email").value = s.email;
  document.getElementById("city").value = s.city;
  document.getElementById("marks").value = s.marks;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteStudent(id) {
  if (!confirm(`Delete student ${id}?`)) return;

  const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
  const data = await res.json();
  document.getElementById("message").textContent = data.message;
  await refresh();
}

function resetForm() {
  editingId = null;
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").disabled = false;
}

async function refresh() {
  await Promise.all([loadStudents(), loadStats()]);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

refresh();
