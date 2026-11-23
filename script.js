// EduSync landing interactions
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(opened));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Cursor glow on desktop
const glow = document.querySelector('.cursor-glow');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';
  });
}

// Interactive workflow
const steps = [...document.querySelectorAll('.step')];
const captions = [
  ['Загрузка исходных данных', 'Добавьте списки учебных групп, преподавателей, аудиторий и учебные планы.'],
  ['Проверка и настройка правил', 'Проверьте качество исходных данных и задайте ограничения: нагрузку, обеденные окна и запрещённые дни.'],
  ['Автоматическая генерация', 'Алгоритм подбирает время и аудитории, учитывает ограничения и исключает пересечения.'],
  ['Публикация расписания', 'При необходимости скорректируйте пары и выгрузите результат в Excel или PDF.']
];
let currentStep = 0;
const stepCount = document.getElementById('stepCount');
const caption = document.getElementById('processCaption');
const description = document.getElementById('processDescription');
const progress = document.getElementById('processProgress');
const prev = document.getElementById('prevStep');
const next = document.getElementById('nextStep');
const visual = document.getElementById('processVisual');
function setStep(index) {
  currentStep = Math.max(0, Math.min(3, index));
  steps.forEach((step, i) => step.classList.toggle('active', i === currentStep));
  stepCount.textContent = String(currentStep + 1).padStart(2, '0');
  caption.textContent = captions[currentStep][0];
  description.textContent = captions[currentStep][1];
  progress.style.width = ((currentStep + 1) * 25) + '%';
  prev.disabled = currentStep === 0;
  next.innerHTML = currentStep === 3 ? 'Сначала <span>↻</span>' : 'Следующий этап <span>→</span>';
  visual.dataset.stage = currentStep;
  visual.classList.remove('stage-change');
  void visual.offsetWidth;
  visual.classList.add('stage-change');
}
steps.forEach((step, i) => step.addEventListener('click', () => setStep(i)));
prev.addEventListener('click', () => setStep(currentStep - 1));
next.addEventListener('click', () => setStep(currentStep === 3 ? 0 : currentStep + 1));

// Count-up stats when the metrics section enters view
const metricObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1300;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    metricObserver.unobserve(el);
  });
}, { threshold: .65 });
document.querySelectorAll('[data-count]').forEach(el => metricObserver.observe(el));

// Demo request modal (front-end prototype)
const modal = document.getElementById('demoModal');
const openModal = document.getElementById('openModal');
const closeModal = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
openModal.addEventListener('click', () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('input').focus(), 250);
});
modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
document.getElementById('demoForm').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('demoForm').style.display = 'none';
  document.querySelector('.form-hint').style.display = 'none';
  document.getElementById('formSuccess').classList.add('show');
});
