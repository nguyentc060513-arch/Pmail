// Pmail (Web) – lưu localStorage, không cần server
const K_USERS = "pmail_users";
const K_MAILS = "pmail_mails";
let users = JSON.parse(localStorage.getItem(K_USERS) || "{}");
let mails = JSON.parse(localStorage.getItem(K_MAILS) || "[]");
let me = null;

function save() {
  localStorage.setItem(K_USERS, JSON.stringify(users));
  localStorage.setItem(K_MAILS, JSON.stringify(mails));
}

function register() {
  const u = document.getElementById("register-username").value.trim();
  const p = document.getElementById("register-password").value;
  if (!u || !p) return alert("Nhập đầy đủ thông tin.");
  if (users[u]) return alert("Tài khoản đã tồn tại.");
  users[u] = { password: p, createdAt: Date.now() };
  save();
  alert("Đăng ký thành công! Hãy đăng nhập.");
}

function login() {
  const u = document.getElementById("login-username").value.trim();
  const p = document.getElementById("login-password").value;
  if (!users[u] || users[u].password !== p) return alert("Sai tài khoản hoặc mật khẩu.");
  me = u;
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("me").textContent = me;
  render();
}

function logout() {
  me = null;
  document.getElementById("auth").style.display = "block";
  document.getElementById("app").style.display = "none";
}

function sendMail() {
  if (!me) return;
  const to = document.getElementById("to").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const body = document.getElementById("body").value.trim();
  if (!users[to]) return alert("Không tìm thấy người nhận.");
  mails.push({ id: crypto.randomUUID(), from: me, to, subject, body, ts: Date.now() });
  save();
  document.getElementById("to").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("body").value = "";
  alert("Đã gửi!");
  render();
}

function render() {
  // Inbox
  const inbox = mails.filter(m => m.to === me).sort((a,b)=>b.ts-a.ts);
  const sent  = mails.filter(m => m.from === me).sort((a,b)=>b.ts-a.ts);
  const fmt = t => new Date(t).toLocaleString();
  document.getElementById("inbox").innerHTML = inbox.map(m => (
    `<li><strong>${m.subject||"(Không tiêu đề)"}</strong><br>`+
    `<small>${fmt(m.ts)} • từ <b>${m.from}</b></small><br>`+
    `${escapeHtml(m.body)}</li>`
  )).join("");
  document.getElementById("sent").innerHTML = sent.map(m => (
    `<li><strong>${m.subject||"(Không tiêu đề)"}</strong><br>`+
    `<small>${fmt(m.ts)} • tới <b>${m.to}</b></small><br>`+
    `${escapeHtml(m.body)}</li>`
  )).join("");
}

function escapeHtml(str=""){
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// Tự động hiển thị nếu đã từng đăng nhập
(function boot(){
  const last = sessionStorage.getItem("pmail_last_user");
  if (last && users[last]) {
    document.getElementById("login-username").value = last;
  }
})();