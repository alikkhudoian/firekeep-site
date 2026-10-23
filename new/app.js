// FireKeep "Keep the fire" site. No libraries: scroll position drives a few CSS variables.
(() => {
  const story = document.getElementById('story');
  const stage = story.querySelector('.stage');
  const clips = [...story.querySelectorAll('.clip')];
  const who = story.querySelector('.who');
  const num = story.querySelector('.num');
  const txt = story.querySelector('.line .txt');
  const blocks = [...story.querySelectorAll('.blocks i')];
  const cells = [...story.querySelectorAll('.g30 i')];
  const sticky = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');
  const nav = document.querySelector('.nav');
  const final = document.getElementById('get');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => 1 - Math.pow(1 - t, 3);

  // [from day, clip, move, coach line]
  const lines = [
    [1, 0, 'Sit-to-stand', 'Small fire. Big start.'],
    [7, 0, 'Sit-to-stand', 'Same move, more control.'],
    [11, 1, 'Glute bridge', 'Your legs remember Day 1.'],
    [16, 1, 'Glute bridge', 'Short day? Still counts.'],
    [20, 2, 'Band pull-apart', 'Feed the fire. Protein first.'],
    [26, 2, 'Band pull-apart', "Don't stop now."],
  ];
  let lastDay = -1;

  function render(p) {
    const reveal = seg(p, 0.1, 0.22);
    const day = Math.max(1, Math.round(1 + 29 * seg(p, 0.22, 0.86)));
    const s = stage.style;
    s.setProperty('--grow', (0.09 + 0.91 * ease(seg(p, 0, 0.2))).toFixed(4));
    s.setProperty('--reveal', reveal.toFixed(3));
    s.setProperty('--glow', (1 - reveal * 0.5).toFixed(3));
    s.setProperty('--warm', seg(p, 0.22, 0.86).toFixed(3));
    s.setProperty('--red', seg(p, 0.88, 1).toFixed(3));

    if (day === lastDay) return;
    lastDay = day;
    num.textContent = day;
    cells.forEach((c, i) => c.classList.toggle('on', i < day));
    const [, clip, move, line] = lines.filter(l => l[0] <= day).pop();
    clips.forEach((c, i) => c.classList.toggle('on', i === clip));
    who.textContent = '▶ ' + move;
    txt.textContent = line;
    blocks.forEach((b, i) => b.classList.toggle('in', day >= 20 + i * 2));
  }

  function progress() {
    const r = story.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  }

  // scroll events already arrive once per frame, so update right away
  function onScroll() {
    if (!reduce) render(progress());
    const pastHero = hero.getBoundingClientRect().bottom < 0;
    const atEnd = final.getBoundingClientRect().top < innerHeight;
    sticky.classList.toggle('show', pastHero && !atEnd);
    nav.classList.toggle('solid', scrollY > 40);
  }

  render(reduce ? 0.6 : 0);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // review screenshots: #p=0.5 jumps into the story, #s=<id> to a section
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.has('p') || h.has('s') || location.search.includes('shot')) document.documentElement.classList.add('shot');
  if (h.has('p')) {
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, story.offsetTop + +h.get('p') * (story.offsetHeight - innerHeight)); onScroll();
  } else if (h.has('s')) {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.getElementById(h.get('s')) || document.querySelector('.' + h.get('s'));
    if (el) { scrollTo(0, el.offsetTop - 20); onScroll(); }
  }
})();
