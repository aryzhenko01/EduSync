// Front-end demo authentication. No server, password hashing or real access control.
const USERS_KEY = 'edusync_demo_users';
const SESSION_KEY = 'edusync_demo_session';
function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } }
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function goDashboard(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, organization: user.organization }));
  window.location.href = 'dashboard.html';
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(loginForm);
    const email = String(data.get('email')).trim().toLowerCase();
    const password = String(data.get('password'));
    const user = getUsers().find(item => item.email === email && item.password === password);
    const error = document.getElementById('loginError');
    if (!user) { error.textContent = 'Не удалось найти аккаунт с такими данными. Проверьте email и пароль или создайте аккаунт.'; return; }
    error.textContent = '';
    goDashboard(user);
  });
}
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(registerForm);
    const name = String(data.get('name')).trim();
    const organization = String(data.get('organization')).trim();
    const email = String(data.get('email')).trim().toLowerCase();
    const password = String(data.get('password'));
    const confirm = String(data.get('confirm'));
    const error = document.getElementById('registerError');
    if (password !== confirm) { error.textContent = 'Пароли не совпадают.'; return; }
    const users = getUsers();
    if (users.some(user => user.email === email)) { error.textContent = 'Аккаунт с таким email уже существует. Попробуйте войти.'; return; }
    const user = { name, organization, email, password };
    users.push(user);
    saveUsers(users);
    goDashboard(user);
  });
}
