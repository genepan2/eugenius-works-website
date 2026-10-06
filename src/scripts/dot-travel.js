// The dot travels: the clicked dot of a work grows into the picture of its ad,
// and shrinks back when the visitor returns. The name is set from script, so
// no inline style attribute is needed. A classic script in <head>, so the
// pagereveal listener exists before the first render.
(() => {
  if (!('onpageswap' in window) || !document.startViewTransition) return;

  const NAME = 'work-dot';
  const workSlug = (url) => (url ? new URL(url).pathname.match(/^\/works\/([^/]+)\/$/)?.[1] : undefined);
  const dotOf = (link) => link.closest('.hero-dot, .index-row')?.querySelector('.dot');
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  };
  const name = async (dot, transition) => {
    if (!dot) return;
    dot.style.viewTransitionName = NAME;
    // Clear it afterwards, so a page restored from the back/forward cache has no stale name.
    await transition.finished.catch(() => {});
    dot.style.viewTransitionName = '';
  };

  let clicked = null;
  addEventListener('click', (e) => (clicked = e.target.closest?.('a[data-slug]') ?? null), true);

  addEventListener('pageswap', (e) => {
    if (!e.viewTransition || !clicked) return;
    const target = workSlug(e.activation?.entry?.url);
    if (target && target === clicked.dataset.slug) name(dotOf(clicked), e.viewTransition);
  });

  addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) return;
    // The paused ring travels as a ring (see global.css).
    const ring = (dot) => dot?.dataset.status === 'paused' && e.viewTransition.types?.add('dot-ring');
    const own = document.querySelector('.work-field .dot');
    if (own) return ring(own);
    const from = workSlug(window.navigation?.activation?.from?.url);
    if (!from) return;
    const dots = [...document.querySelectorAll(`a[data-slug="${from}"]`)].map(dotOf).filter(Boolean);
    const dot = dots.find(inView) ?? dots[0];
    if (!dot) return;
    ring(dot);
    name(dot, e.viewTransition);
  });
})();
