(() => {
  if (customElements.get('cart-drawer-upsell')) {
    return;
  }

  class CartDrawerUpsell extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.init();
    }

    init() {
      fetch(this.dataset.url)
        .then(response => response.text())
        .then(text => {
          const innerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('cart-drawer-upsell')?.innerHTML;

          document.querySelector('cart-drawer-upsell').innerHTML =
            innerHTML;
        });
    }
  }

  customElements.define('cart-drawer-upsell', CartDrawerUpsell);
})();
