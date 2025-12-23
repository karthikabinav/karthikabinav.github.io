const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

const overlays = [
  {
    triggerSelector: '.collab-trigger',
    overlayId: 'collab-overlay',
    closeAttr: 'data-collab-close',
  },
  {
    triggerSelector: '.service-trigger',
    overlayId: 'service-overlay',
    closeAttr: 'data-service-close',
  },
];

function wireOverlay({ triggerSelector, overlayId, closeAttr }) {
  const trigger = document.querySelector(triggerSelector);
  const overlay = document.getElementById(overlayId);
  const dialog = overlay?.querySelector('.collab-dialog');
  const closeButtons = overlay?.querySelectorAll(`[${closeAttr}]`);

  function openOverlay(event) {
    if (event) event.preventDefault();
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-active');
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-active');
  }

  trigger?.addEventListener('click', openOverlay);
  closeButtons?.forEach((btn) => btn.addEventListener('click', closeOverlay));
  overlay?.addEventListener('click', (e) => {
    if (!dialog) return;
    if (!dialog.contains(e.target)) {
      closeOverlay();
    }
  });

  return { closeOverlay, overlay };
}

const wiredOverlays = overlays.map(wireOverlay);

function wireCollapses(scope = document) {
  const buttons = scope.querySelectorAll('[data-toggle="collapse"]');
  buttons.forEach((btn) => {
    const targetSelector = btn.getAttribute('data-target');
    if (!targetSelector) return;
    const target = scope.querySelector(targetSelector) || document.querySelector(targetSelector);
    if (!target) return;
    btn.addEventListener('click', () => {
      const isOpen = target.classList.contains('show');
      target.classList.toggle('show', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function ensureCloseButton(det, content) {
  if (!content || content.querySelector('.close-overlay')) return;
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'close-overlay';
  closeBtn.textContent = 'Close ✕';
  closeBtn.addEventListener('click', () => {
    det.open = false;
    content.style.display = 'none';
    document.body.classList.remove('overlay-active');
  });
  content.prepend(closeBtn);
}

const detailBlocks = Array.from(document.querySelectorAll('.legacy-card details'));
detailBlocks.forEach((det) => {
  const content = det.querySelector('.legacy-content');
  if (content) {
    det.open = false;
    content.style.display = 'none';
    ensureCloseButton(det, content);
  }

  function loadContent() {
    if (!content || content.dataset.loaded === 'true') return;
    const template = document.getElementById('publication-template');
    if (template && content.id === 'publication-list') {
      content.innerHTML = template.innerHTML;
    }
    ensureCloseButton(det, content);
    content.dataset.loaded = 'true';
    wireCollapses(content);
  }

  det.addEventListener('toggle', () => {
    if (det.open) {
      detailBlocks.forEach((other) => {
        if (other !== det) {
          other.open = false;
          const otherContent = other.querySelector('.legacy-content');
          if (otherContent) otherContent.style.display = 'none';
        }
      });
      loadContent();
    }
    if (content) {
      content.style.display = det.open ? 'block' : 'none';
    }
    document.body.classList.toggle('overlay-active', det.open);
  });
});

// Close overlay when clicking outside content
document.addEventListener('click', (e) => {
  if (!document.body.classList.contains('overlay-active')) return;
  const openDetail = detailBlocks.find((d) => d.open);
  if (!openDetail) return;
  const content = openDetail.querySelector('.legacy-content');
  if (!content) return;
  const clickedInsideContent = content.contains(e.target);
  if (!clickedInsideContent) {
    openDetail.open = false;
    content.style.display = 'none';
    document.body.classList.remove('overlay-active');
  }
});

// Lightweight collapse handling for legacy accordions
wireCollapses(document);

// Smooth scroll for in-page anchors
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const section = document.querySelector(targetId);
    if (section) {
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth' });
      navLinks?.classList.remove('open');
    }
  });
});

// Close overlays on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    detailBlocks.forEach((det) => {
      det.open = false;
      const content = det.querySelector('.legacy-content');
      if (content) content.style.display = 'none';
    });
    const openOverlay = wiredOverlays.find(({ overlay }) => overlay?.classList.contains('open'));
    if (openOverlay) {
      openOverlay.closeOverlay();
    }
    document.body.classList.remove('overlay-active');
  }
});
