/**
 * Moteur d'animations du site vitrine (GSAP + ScrollTrigger + SplitText + Lenis).
 *
 * Tout se pilote depuis le HTML avec des attributs, sans toucher à ce fichier :
 *   data-split           titre révélé ligne par ligne au défilement
 *   data-reveal          élément qui apparaît en montant (data-reveal="left|right|scale" pour varier)
 *   data-stagger         parent dont les enfants apparaissent l'un après l'autre
 *   data-count="1979"    nombre qui compte jusqu'à sa valeur (data-from="1930" pour le départ)
 *   data-parallax="12"   image qui glisse plus lentement que la page (amplitude en %)
 *   data-clip            image dévoilée par un rideau
 *   data-marquee         bandeau de texte qui défile, accéléré par la vitesse du scroll
 *   data-batch           longue liste (actualités, galeries) : les éléments apparaissent par vagues à mesure qu'on descend
 *
 * Si la personne a réglé « réduire les animations », ou si JavaScript échoue,
 * tout le contenu reste visible et immobile.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const root = document.documentElement;
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduit || !root.classList.contains('motion')) {
  root.classList.remove('motion');
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out', duration: 1.2 });
  demarrer();
}

function demarrer() {
  // 1. Défilement fluide (souris et trackpad uniquement : le tactile garde son défilement natif)
  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -90 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // Le menu mobile ouvert bloque le défilement de la page
  document.getElementById('nav-toggle')?.addEventListener('change', (e) => ((e.target as HTMLInputElement).checked ? lenis.stop() : lenis.start()));

  enTete(lenis);

  // Les découpes de texte attendent les polices pour couper les lignes au bon endroit
  document.fonts.ready.then(() => {
    titres();
    reveals();
    compteurs();
    images();
    bandeaux();
    boutonsAimantes();
    root.classList.add('motion-ready');
    ScrollTrigger.refresh();
  });
}

/** En-tête : barre de progression de lecture, se cache en descendant, revient en remontant. */
function enTete(lenis: Lenis) {
  const header = document.querySelector<HTMLElement>('.site-header');
  const barre = document.querySelector<HTMLElement>('.progression');
  if (!header) return;
  let cache = false;
  lenis.on('scroll', ({ scroll, direction, limit }: { scroll: number; direction: number; limit: number }) => {
    if (barre) barre.style.transform = `scaleX(${limit ? scroll / limit : 0})`;
    const menuOuvert = (document.getElementById('nav-toggle') as HTMLInputElement | null)?.checked;
    const doitCacher = !menuOuvert && scroll > 240 && direction === 1;
    if (doitCacher !== cache) {
      cache = doitCacher;
      header.classList.toggle('cache', cache);
    }
    header.classList.toggle('defile', scroll > 20);
  });
}

/** Titres révélés mot par mot, chaque ligne sortant de derrière un masque. */
function titres() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const immediat = el.dataset.split === 'now';
    SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      linesClass: 'ligne',
      onSplit: (self) =>
        gsap.from(self.words, {
          yPercent: 115,
          rotate: 4,
          duration: 1.3,
          stagger: 0.045,
          delay: immediat ? 0.25 : 0,
          scrollTrigger: immediat ? undefined : { trigger: el, start: 'top 88%', once: true },
          onStart: () => el.classList.add('split-on'),
        }),
    });
  });
}

/** Apparitions au défilement, seules ou en cascade. */
function reveals() {
  const depart = (sens?: string) =>
    sens === 'left' ? { x: -60 } : sens === 'right' ? { x: 60 } : sens === 'scale' ? { scale: 0.92 } : { y: 50 };

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, ...depart(el.dataset.reveal) },
      { autoAlpha: 1, x: 0, y: 0, scale: 1, delay: Number(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: 'top 90%', once: true } },
    );
  });

  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((parent) => {
    const enfants = [...parent.children] as HTMLElement[];
    gsap.fromTo(
      enfants,
      { autoAlpha: 0, y: 70 },
      { autoAlpha: 1, y: 0, stagger: 0.12, delay: Number(parent.dataset.delay ?? 0), scrollTrigger: { trigger: parent, start: 'top 85%', once: true } },
    );
  });

  // Longues listes : apparition par vagues, au fil du défilement
  document.querySelectorAll<HTMLElement>('[data-batch]').forEach((parent) => {
    const enfants = [...parent.children] as HTMLElement[];
    gsap.set(enfants, { autoAlpha: 0, y: 50 });
    ScrollTrigger.batch(enfants, {
      start: 'top 92%',
      once: true,
      onEnter: (lot) => gsap.to(lot, { autoAlpha: 1, y: 0, stagger: 0.08, overwrite: true }),
    });
  });
  // Après un filtre (actualités par année…), les positions changent
  document.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.filters button, details summary')) requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  // Le filet des libellés « 01 — … » se trace
  document.querySelectorAll<HTMLElement>('.label').forEach((el) => {
    gsap.fromTo(el, { '--trait': 0 }, { '--trait': 1, duration: 1.4, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
}

/** Chiffres qui défilent jusqu'à leur valeur. */
function compteurs() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const fin = Number(el.dataset.count);
    const debut = Number(el.dataset.from ?? 0);
    const suffixe = el.dataset.suffix ?? '';
    const v = { n: debut };
    el.textContent = debut + suffixe;
    gsap.to(v, {
      n: fin,
      duration: 2.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = Math.round(v.n) + suffixe),
    });
  });
}

/** Parallaxe et rideaux sur les images (désactivés sur petit écran, où ça fatigue plus que ça n'embellit). */
function images() {
  const mm = gsap.matchMedia();

  document.querySelectorAll<HTMLElement>('[data-clip]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0% round 20px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
    );
  });

  mm.add('(min-width: 701px)', () => {
    document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      const amp = Number(el.dataset.parallax || 10);
      gsap.fromTo(
        el,
        { yPercent: -amp, scale: 1 + amp / 50 },
        { yPercent: amp, scale: 1 + amp / 50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
  });
}

/** Bandeaux de texte qui défilent en boucle ; le scroll les accélère et change leur sens. */
function bandeaux() {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
    const piste = el.querySelector<HTMLElement>('.piste');
    if (!piste) return;
    piste.append(...[...piste.children].map((c) => c.cloneNode(true)));
    const boucle = gsap.to(piste, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    let sens = 1;
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const vitesse = self.getVelocity();
        if (vitesse) sens = Math.sign(vitesse);
        gsap.to(boucle, { timeScale: sens * (1 + Math.min(Math.abs(vitesse) / 250, 6)), duration: 0.3, overwrite: true });
        gsap.to(boucle, { timeScale: sens, duration: 1.2, delay: 0.3 });
      },
    });
  });
}

/** Boutons légèrement attirés par la souris (pas sur écran tactile). */
function boutonsAimantes() {
  if (!matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
    const x = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
    const y = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    btn.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}
