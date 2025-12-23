const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

const collabLink = document.querySelector('.collab-trigger');
const collabOverlay = document.getElementById('collab-overlay');
const collabDialog = collabOverlay?.querySelector('.collab-dialog');
const collabCloseButtons = collabOverlay?.querySelectorAll('[data-collab-close]');

function openCollabOverlay(event) {
  if (event) event.preventDefault();
  if (!collabOverlay) return;
  collabOverlay.classList.add('open');
  collabOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-active');
}

function closeCollabOverlay() {
  if (!collabOverlay) return;
  collabOverlay.classList.remove('open');
  collabOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-active');
}

if (collabLink) {
  collabLink.addEventListener('click', openCollabOverlay);
}
collabCloseButtons?.forEach((btn) => {
  btn.addEventListener('click', closeCollabOverlay);
});
collabOverlay?.addEventListener('click', (e) => {
  if (!collabDialog) return;
  if (!collabDialog.contains(e.target)) {
    closeCollabOverlay();
  }
});

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
    if (collabOverlay?.classList.contains('open')) {
      closeCollabOverlay();
    } else {
      document.body.classList.remove('overlay-active');
    }
  }
});
