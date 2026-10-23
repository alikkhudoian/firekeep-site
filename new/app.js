// FireKeep D "Keep the Fire" prototype. No libraries: scroll position drives a few CSS variables.
(() => {
  const story = document.getElementById('story');
  const stage = story.querySelector('.stage');
  const num = story.querySelector('.num');
  const txt = story.querySelector('.line .txt');
  const ticks = [...story.querySelectorAll('.ticks li')];
  const workoutLabel = story.querySelector('[data-r="workout"] .lbl');
  const finale = story.querySelector('.finale');
  const grid = story.querySelector('.g30');
  const cells = Array.from({ length: 30 }, () => grid.appendChild(document.createElement('i')));
  const sticky = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');
  const nav = document.querySelector('.nav');
  const final = document.getElementById('get');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => 1 - Math.pow(1 - t, 3);

  // a 3-day plan: lift on days 1, 3, 5 of each week, the rest are rest days (they still count as kept)
  const liftDay = d => [1, 3, 5].includes(((d - 1) % 7) + 1);
  const lines = [
    [1, '"Day 1. Small fire, big start."'],
    [4, '"Rest day. It still counts. Go for a walk."'],
    [8, '"Week 2. Same moves, more control."'],
    [12, '"Short day? 15 minutes keeps it lit."'],
    [17, '"Past halfway. Look at those squares."'],
    [23, '"Feed the fire: hit your protein today."'],
    [27, '"Almost there. Don\'t you dare stop now."'],
  ];
  let last = '';

  function render(p) {
    const intro = ease(seg(p, 0, 0.16));          // the single ember becomes the first square of 30
    const walk = seg(p, 0.18, 0.82) * 30;          // 0..30 through the days
    const day = clamp(Math.floor(walk) + 1, 1, 30);
    const within = walk >= 30 ? 1 : walk - Math.floor(walk);
    const kept = walk >= 30 ? 30 : day - 1 + (within > 0.86 ? 1 : 0);
    const done = walk >= 30 ? 6 : Math.min(6, Math.floor(within / 0.86 * 6.999));

    const s = stage.style;
    s.setProperty('--intro', intro.toFixed(3));
    s.setProperty('--warm', seg(p, 0.18, 0.82).toFixed(3));
    s.setProperty('--red', seg(p, 0.84, 0.93).toFixed(3));
    s.setProperty('--fin', seg(p, 0.88, 0.97).toFixed(3));
    finale.classList.toggle('live', p > 0.92);

    const key = day + ':' + kept + ':' + done;
    if (key === last) return;
    last = key;
    num.textContent = day;
    cells.forEach((c, i) => { c.classList.toggle('on', i < kept); c.classList.toggle('now', i === day - 1 && i >= kept); });
    const rest = !liftDay(day);
    workoutLabel.textContent = rest ? 'Rest day' : 'Workout';
    ticks.forEach((t, i) => t.classList.toggle('done', i < done || (i === 0 && rest && done > 0)));
    txt.textContent = lines.filter(l => l[0] <= day).pop()[1];
  }

  function progress() {
    const r = story.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  }

  // scroll events already arrive once per frame, so update right away
  function onScroll() {
    const p = progress();
    if (!reduce) render(p);
    const pastHero = hero.getBoundingClientRect().bottom < 0;
    const atEnd = final.getBoundingClientRect().top < innerHeight;
    const inFinale = !reduce && p > 0.86 && p < 1;
    sticky.classList.toggle('show', pastHero && !atEnd && !inFinale);
    nav.classList.toggle('solid', scrollY > 40);
  }

  if (reduce) render(0.6); else render(0);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // protein demo
  const ring = document.querySelector('.ring');
  const pg = document.querySelector('.pg');
  let total = 0;
  document.querySelectorAll('.pblocks button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('reset')) total = 0;
      else {
        const g = +btn.dataset.g;
        total = Math.min(120, total + g);
        const pop = document.createElement('span');
        pop.className = 'pop';
        pop.textContent = '+' + g + 'g';
        btn.appendChild(pop);
        setTimeout(() => pop.remove(), 800);
        navigator.vibrate?.(12);
      }
      pg.textContent = total;
      ring.style.setProperty('--pct', (total / 120 * 100).toFixed(1));
    });
  });

  // screenshot helper for review: #p=0.5 jumps into the story, #s=protein to a section, #tap=4 pre-fills the demo
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.has('p') || h.has('s') || location.search.includes('shot')) document.documentElement.classList.add('shot');
  if (h.has('tap')) [...document.querySelectorAll('.pblocks button:not(.reset)')].slice(0, +h.get('tap')).forEach(b => b.click()), document.querySelectorAll('.pop').forEach(p => p.remove());
  if (h.has('p')) {
    document.documentElement.style.scrollBehavior = 'auto';
    const top = story.offsetTop + +h.get('p') * (story.offsetHeight - innerHeight);
    scrollTo(0, top); onScroll();
  } else if (h.has('s')) {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.getElementById(h.get('s'));
    if (el) { scrollTo(0, el.offsetTop - 20); onScroll(); }
  }
})();
