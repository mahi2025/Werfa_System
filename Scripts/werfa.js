// ===================== DATABASE =====================
function initDB() {
  if (!localStorage.getItem("werfaDB")) {
    localStorage.setItem(
      "werfaDB",
      JSON.stringify({
        queue: [],
        currentServing: 0,
        avgServiceMinutes: 3
      })
    );
  }
}

function getDB() {
  return JSON.parse(localStorage.getItem("werfaDB"));
}

function saveDB(db) {
  localStorage.setItem("werfaDB", JSON.stringify(db));
}

// ===================== STUDENT =====================
function takeNumber() {
  const name = fullname.value.trim();
  const id = studentId.value.trim();
  if (!name || !id) return alert("Fill all fields");

  const db = getDB();
  const ticket = db.queue.length + 1;

  db.queue.push({
    ticket,
    name,
    studentId: id,
    joinedAt: Date.now(),
    status: "waiting"
  });

  saveDB(db);
  localStorage.setItem("myTicket", ticket);

  renderStudent();
}

function renderStudent() {
  const myTicket = parseInt(localStorage.getItem("myTicket"));
  if (!myTicket) return;

  const db = getDB();

  ticketNumber.innerText = "Your Ticket #" + myTicket;

  nowServing.innerText =
    db.currentServing === 0
      ? "Now serving: Not started"
      : "Now serving: #" + db.currentServing;

  const ahead = myTicket - db.currentServing - 1;
  const waitMin = Math.max(ahead, 0) * db.avgServiceMinutes;

  waitTime.innerText = "Estimated wait: " + waitMin + " minutes";

  startCountdown(ahead);
}

let timer;

function startCountdown(ahead) {
  clearInterval(timer);

  const db = getDB();
  const targetTime =
    Date.now() + ahead * db.avgServiceMinutes * 60 * 1000;

  timer = setInterval(() => {
    const remaining = Math.floor((targetTime - Date.now()) / 1000);

    if (remaining <= 0) {
      countdown.innerText = "✅ Your turn is now!";
      clearInterval(timer);
      return;
    }

    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    countdown.innerText = `⏳ ${m}:${s.toString().padStart(2, "0")}`;
  }, 1000);
}

function backToQueue() {
  renderStudent();
}

// ===================== ADMIN =====================
function serveNext() {
  const db = getDB();
  if (db.currentServing >= db.queue.length) {
    alert("No students waiting");
    return;
  }

  db.currentServing++;

  db.queue.forEach((s) => {
    if (s.ticket < db.currentServing) s.status = "done";
    else if (s.ticket === db.currentServing) s.status = "serving";
  });

  saveDB(db);
  renderAdmin();
}

function renderAdmin() {
  const db = getDB();
  studentTable.innerHTML = "";

  db.queue.forEach((s) => {
    studentTable.innerHTML += `
      <tr>
        <td>${s.ticket}</td>
        <td>${s.name}</td>
        <td>#${s.ticket}</td>
        <td>${s.status}</td>
      </tr>`;
  });

  adminNowServing.innerText =
    db.currentServing === 0
      ? "Now Serving: Not started"
      : "Now Serving #" + db.currentServing;

  totalWaiting.innerText =
    "Total waiting: " + (db.queue.length - db.currentServing);
}

function clearQueue() {
  if (!confirm("Clear entire queue?")) return;
  saveDB({ queue: [], currentServing: 0, avgServiceMinutes: 3 });
  localStorage.removeItem("myTicket");
  renderAdmin();
}

// ===================== AUTH =====================
const ADMIN_EMAIL = "admin@werfa.com";
const ADMIN_PASSWORD = "admin123";

function adminLogin(e) {
  e.preventDefault();
  if (
    adminEmail.value === ADMIN_EMAIL &&
    adminPassword.value === ADMIN_PASSWORD
  ) {
    localStorage.setItem("adminLoggedIn", "true");
    window.location.href = "admindashboard.html";
  } else {
    alert("Invalid credentials");
  }
}

function adminLogout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "adminlogin.html";
}
