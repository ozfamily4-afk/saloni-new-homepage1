const sectionsToRender = [
  {
    id: '#CartDrawer-Header',
    section: 'cart-drawer',
    selector: '#shopify-section-cart-drawer #CartDrawer-Header'
  },
  {
    id: '#cart-counter',
    section: 'cart-counter',
    selector: '#shopify-section-cart-counter'
  },
  {
    id: '#CartDrawer-Body',
    section: 'cart-drawer',
    selector: '#shopify-section-cart-drawer #CartDrawer-Body'
  },
  {
    id: '#CartDrawer-Summary',
    section: 'cart-drawer',
    selector: '#shopify-section-cart-drawer #CartDrawer-Summary'
  }
];

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      'keyup',
      event => event.code.toUpperCase() === 'ESCAPE' && this.close()
    );
    this.querySelector('#CartDrawer-Overlay').addEventListener(
      'click',
      this.close.bind(this)
    );
    this.setCartLink();
  }

  setCartLink() {
    const cartLink = document.querySelector('[data-cart-link]');
    if (!cartLink) return;
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', event => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', event => {
      if (event.code.toUpperCase() !== 'SPACE') return;
      event.preventDefault();
      this.open(cartLink);
    });
  }

  open(opener) {
    if (opener) this.setActiveElement(opener);
    this.style.visibility = 'visible';
    this.classList.add('is-visible');
    this.addEventListener(
      'transitionend',
      () => {
        this.focusOnCartDrawer();
      },
      { once: true }
    );
    bodyScroll.lock(this.querySelector('#CartDrawer-Body'));
  }

  close() {
    this.classList.remove('is-visible');
    this.addEventListener(
      'transitionend',
      () => {
        this.style.visibility = 'hidden';
      },
      { once: true }
    );
    removeTrapFocus(this.activeElement);
    bodyScroll.unlock(this.querySelector('#CartDrawer-Body'));
    this.querySelector('#CartDrawer-Body').scrollTop = 0;
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  focusOnCartDrawer() {
    const containerToTrapFocusOn = this.querySelector('#CartDrawer');
    const focusElement = this.querySelector('[data-drawer-close]');
    trapFocus(containerToTrapFocusOn, focusElement);
  }

  renderContents(response) {
    this.getSectionsToRender().forEach(section => {
      const sectionElement = document.querySelector(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(
        response.sections[section.section],
        section.selector
      );
    });
    this.open();
  }

  getSectionsToRender() {
    return sectionsToRender;
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return sectionsToRender;
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
