// Demo dashboard: selected file metadata is stored locally; file contents are not uploaded.
const SESSION_KEY = 'edusync_demo_session';
let session = null;
try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch {}
if (!session) window.location.replace('login.html');

const $ = id => document.getElementById(id);
if (session) {
  $('userName').textContent = session.name;
  $('welcomeName').textContent = session.name.trim().split(/\s+/)[0];
  $('userInitials').textContent = session.name.trim().charAt(0).toUpperCase();
  $('sideOrg').textContent = session.organization || 'Моё учебное заведение';
}
$('logoutButton').addEventListener('click', () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
});

const categories = [
  { id: 'groupsFile', key: 'groups', title: 'Учебные группы' },
  { id: 'teachersFile', key: 'teachers', title: 'Преподаватели' },
  { id: 'roomsFile', key: 'rooms', title: 'Аудиторный фонд' },
  { id: 'curriculumFile', key: 'curriculum', title: 'Учебные планы' }
];
let files = [];
const maxSize = 20 * 1024 * 1024;
const allowed = /\.(xlsx|xls|csv)$/i;
function showToast(message) {
  $('toastText').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => $('toast').classList.remove('show'), 2800);
}
function addFile(file, category = 'Дополнительный файл') {
  if (!allowed.test(file.name)) { showToast('Поддерживаются только XLSX, XLS и CSV'); return; }
  if (file.size > maxSize) { showToast('Размер файла превышает 20 МБ'); return; }
  const existing = files.findIndex(item => item.name === file.name && item.category === category);
  const item = { name: file.name, size: file.size, category, date: new Date().toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}) };
  if (existing >= 0) files[existing] = item; else files.push(item);
  renderFiles();
  showToast('Файл «' + file.name + '» добавлен в демо-список');
}
function formatSize(bytes) {
  if (!bytes) return 'Пустой файл';
  return bytes < 1024 * 1024 ? (bytes / 1024).toFixed(0) + ' КБ' : (bytes / 1024 / 1024).toFixed(1) + ' МБ';
}
function renderFiles() {
  $('totalFiles').textContent = files.length;
  const categoriesDone = new Set(files.map(file => file.category));
  const requiredCount = categories.filter(category => files.some(file => file.category === category.title)).length;
  $('readyFiles').innerHTML = requiredCount + ' <small>/ 4</small>';
  $('fileNavCount').textContent = files.length;
  $('uploadedCount').textContent = files.length + (files.length === 1 ? ' файл' : files.length < 5 ? ' файла' : ' файлов');
  categories.forEach(category => {
    const found = files.find(file => file.category === category.title);
    const status = $(category.id.replace('File', 'Status'));
    status.textContent = found ? '✓ ' + found.name : 'Файл не загружен';
    status.classList.toggle('file-added', Boolean(found));
    $(category.id).closest('.upload-card').classList.toggle('has-file', Boolean(found));
  });
  const list = $('uploadedList');
  if (!files.length) {
    list.innerHTML = '<div class="empty-files"><span>▤</span><p>Пока нет загруженных файлов</p><small>Выберите категорию выше или перетащите файл в область загрузки.</small></div>';
  } else {
    list.innerHTML = files.map((file, index) => `<div class="uploaded-row"><span class="uploaded-file-icon">XLS</span><span class="uploaded-file-name"><b>${escapeHTML(file.name)}</b><small>${escapeHTML(file.category)} · ${formatSize(file.size)}</small></span><span class="uploaded-file-date">${file.date}</span><button class="remove-file" data-remove="${index}" aria-label="Удалить файл">×</button></div>`).join('');
    list.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
      files.splice(Number(button.dataset.remove), 1); renderFiles(); showToast('Файл удалён из демо-списка');
    }));
  }
  $('startProcess').disabled = requiredCount === 0;
}
function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
categories.forEach(category => {
  $(category.id).addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) addFile(file, category.title);
    event.target.value = '';
  });
});
$('extraFiles').addEventListener('change', event => {
  [...event.target.files].forEach(file => addFile(file));
  event.target.value = '';
});
const dropzone = $('dropzone');
dropzone.addEventListener('click', event => { if (event.target.id !== 'extraFiles') $('extraFiles').click(); });
['dragenter','dragover'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.add('dragover'); }));
['dragleave','drop'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.remove('dragover'); }));
dropzone.addEventListener('drop', event => [...event.dataTransfer.files].forEach(file => addFile(file)));

$('startProcess').addEventListener('click', () => {
  const overlay = $('processOverlay');
  const title = $('processTitle');
  const sub = $('processSub');
  const bar = $('modalProgress');
  const percent = $('modalPercent');
  const stages = [
    ['Проверяем исходные данные', 'Анализируем наличие и формат добавленных файлов...'],
    ['Проверяем структуру файлов', 'Сверяем демонстрационные категории данных...'],
    ['Подготавливаем рабочую область', 'Формируем визуальный статус проекта...'],
    ['Проверка завершена', 'Демонстрационный сценарий успешно выполнен.']
  ];
  overlay.classList.add('show');
  let stage = 0;
  const tick = () => {
    title.textContent = stages[stage][0];
    sub.textContent = stages[stage][1];
    const value = (stage + 1) * 25;
    bar.style.width = value + '%';
    percent.textContent = value + '%';
    stage++;
    if (stage < stages.length) setTimeout(tick, 850);
    else setTimeout(() => {
      overlay.classList.remove('show');
      document.querySelectorAll('.pipeline-step').forEach((item, index) => item.classList.toggle('done', index < 3));
      document.querySelector('.processing-badge').innerHTML = '<i></i> ПРОВЕРКА ЗАВЕРШЕНА';
      $('processMessage').innerHTML = '<span>✓</span><p>Демонстрационная проверка завершена. Исходные файлы отмечены как подготовленные. Генерация реального расписания не выполнялась.</p>';
      $('fakeProgress').style.width = '100%';
      showToast('Демонстрационная проверка завершена');
    }, 700);
  };
  tick();
});
renderFiles();
