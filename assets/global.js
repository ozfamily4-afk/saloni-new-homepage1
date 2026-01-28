['load', 'scroll', 'resize'].forEach(eventName => {
  window.addEventListener(eventName, e => {
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.innerHeight}px`
    );
  });
});

const bodyScroll = {
  lock(container) {
    bodyScrollLock.disableBodyScroll(container);
  },
  unlock(container) {
    bodyScrollLock.enableBodyScroll(container);
  },
  clear() {
    bodyScrollLock.clearAllBodyScrollLocks();
  }
};

const spinnerLoader = {
  enable(spinner) {
    spinner.removeAttribute('hidden');
  },
  disable(spinner) {
    spinner.setAttribute('hidden', '');
  }
};

const setHeaderHeight = {
  set() {
    const barHeight = document.querySelector(
      'announcement-bar'
    )?.offsetHeight;
    const headerHeight = document.querySelector(
      'header[data-header]'
    )?.offsetHeight;
    const height = barHeight + headerHeight;

    document.body.style.setProperty('--header-height', `${height}px`);
  }
}

setHeaderHeight.set();
window.addEventListener('resize', () => setHeaderHeight.set());

const onKeyUpEscape = event => {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
};

const getFocusableElements = container => {
  return Array.from(
    container.querySelectorAll(
      'summary, a[href], button:enabled, [tabindex]:not([tabindex^=' -
        ']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe'
    )
  );
};

document
  .querySelectorAll('[id^="Details-"] summary')
  .forEach(summary => {
    summary.setAttribute('role', 'button');
    summary.setAttribute(
      'aria-expanded',
      summary.parentNode.hasAttribute('open')
    );

    if (summary.nextElementSibling.getAttribute('id')) {
      summary.setAttribute(
        'aria-controls',
        summary.nextElementSibling.id
      );
    }

    summary.addEventListener('click', event => {
      event.currentTarget.setAttribute(
        'aria-expanded',
        !event.currentTarget.closest('details').hasAttribute('open')
      );
    });
  });

const trapFocusHandlers = {};

const removeTrapFocus = (elementToFocus = null) => {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener(
    'focusout',
    trapFocusHandlers.focusout
  );
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
};

const trapFocus = (container, elementToFocus = container) => {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = event => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener(
      'keydown',
      trapFocusHandlers.keydown
    );
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
};

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj));
};

const handleize = str => str.replace(/[ /_]/g, '-').toLowerCase();

const decode = str => decodeURIComponent(str).replace(/\+/g, ' ');

const getOffsetTop = element => {
  let offsetTop = 0;

  do {
    if (!isNaN(element.offsetTop)) {
      offsetTop += element.offsetTop;
    }
  } while ((element = element.offsetParent));

  return offsetTop;
};

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach(video => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
      '*'
    );
  });
  document.querySelectorAll('.js-vimeo').forEach(video => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach(video => video.pause());
  document.querySelectorAll('product-model').forEach(model => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function playExternalMedia(media) {
  media
    .querySelector('.js-youtube')
    ?.contentWindow.postMessage(
      '{"event":"command","func":"' + 'playVideo' + '","args":""}',
      '*'
    );

  media
    .querySelector('.js-vimeo')
    ?.contentWindow.postMessage('{"method":"play"}', '*');
}

const debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
};

const fetchConfig = (type = 'json') => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': `application/${type}`,
      'Accept': `application/${type}`
    }
  };
};

class QuantityInput extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach(button =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();

    const previousValue = this.input.value;

    event.target.name === 'increment'
      ? this.input.stepUp()
      : this.input.stepDown();

    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;

    button.addEventListener('click', () => {
      this.onButtonClick(button);
    });
  }

  onButtonClick(button) {
    const modal = document.querySelector(
      this.getAttribute('data-modal')
    );

    if (modal) modal.show(button);
  }
}
customElements.define('modal-opener', ModalOpener);

class ModalDialog extends HTMLElement {
  constructor() {
    super();

    this.dialogHolder = this.querySelector('[role="dialog"]');
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', event => {
      if (event.code?.toUpperCase() === 'ESCAPE') this.hide();
    });
    this.addEventListener('click', event => {
      if (event.target === this) this.hide();
    });
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    bodyScroll.lock(this.dialogHolder);
    this.setAttribute('open', '');
    trapFocus(this, this.dialogHolder);
    window.pauseAllMedia();
    this.querySelector('button')?.focus();
  }

  hide() {
    bodyScroll.unlock(this.dialogHolder);
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    this.deferredVideo = this.querySelector(
      'video, model-viewer, iframe'
    );
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(
        this.querySelector(
          'template'
        ).content.firstElementChild.cloneNode(true)
      );

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(
        content.querySelector('.deferred-media__wrapper')
      );
      this.deferredVideo = deferredElement.querySelector(
        'video, model-viewer, iframe'
      );
    }

    this.deferredVideo.play && this.deferredVideo.play();
  }

  pauseMedia() {
    this.querySelector('.js-youtube')?.contentWindow.postMessage(
      '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
      '*'
    );
    this.querySelector('.js-vimeo')?.contentWindow.postMessage(
      '{"method":"pause"}',
      '*'
    );
    this.querySelector('video')?.pause();
  }
}

customElements.define('deferred-media', DeferredMedia);

const reviewsContainer = document.querySelector(
  '#shopify-product-reviews .spr-container'
);

if (reviewsContainer) {
  let closeElement = document.createElement('span');
  closeElement.textContent = 'x';
  closeElement.classList.add('shopify-product-reviews-close');
  reviewsContainer.appendChild(closeElement);

  document
    .querySelector('.spr-starrating')
    ?.addEventListener('click', reviewToggle);
  document
    .querySelector('.shopify-product-reviews-close')
    ?.addEventListener('click', reviewToggle);
  document.addEventListener('click', reviewClose);

  function reviewToggle() {
    const widget = document.querySelector('#shopify-product-reviews');

    if (widget.hasAttribute('open')) {
      widget.removeAttribute('open');
    } else {
      widget.setAttribute('open', '');
    }
  }

  function reviewClose(e) {
    if (
      !e.target.closest('.spr-container') &&
      e.target.closest('#shopify-product-reviews')
    ) {
      const widget = document.querySelector(
        '#shopify-product-reviews'
      );
      widget.removeAttribute('open');
      bodyScroll.unlock(widget);
    }
  }
}

function initAos() {
  AOS.init({
    duration: 1200
  });
}

initAos();

document.addEventListener('shopify:section:load', () => {
  initAos();
});
window.addEventListener('scroll', () => {
  AOS.refresh();
});