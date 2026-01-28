(() => {
  if (customElements.get('quickview-opener')) {
    return;
  }

  class QuickviewOpener extends ModalOpener {
    constructor() {
      super();
    }

    onButtonClick(button) {
      const sectionId = document.querySelector(
        '[data-product-quickview]'
      )?.dataset.id;
      if (!sectionId) return;

      fetch(`${button.dataset.url}&section_id=${sectionId}`)
        .then(response => response.text())
        .then(text => {
          const resultsMarkup = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('[data-content]');

          if (button.hasAttribute('data-in-cart-drawer')) {
            document.querySelector('cart-drawer')?.close();
          }

          document.querySelector(
            `${this.dataset.modal} [data-content]`
          ).innerHTML = resultsMarkup?.innerHTML;
          super.onButtonClick(button);

          if (
            resultsMarkup.querySelector('[data-pickup-availability]')
          ) {
            document.querySelector(
              '#Pickup-Availability-Modal [role="dialog"]'
            ).innerHTML = resultsMarkup.querySelector(
              '[data-pickup-availability] [role="dialog"]'
            )?.innerHTML;
          }
        });
    }
  }

  customElements.define('quickview-opener', QuickviewOpener);
})();
