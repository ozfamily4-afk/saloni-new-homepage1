(() => {
  if (customElements.get('accordion-item')) {
    return;
  }

  class AccordionItem extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.querySelector('summary').addEventListener(
        'click',
        this.toggle.bind(this)
      );
    }

    toggle(event) {
      event.preventDefault();
      this.querySelector('details').toggleAttribute('is-open');
    }
  }

  customElements.define('accordion-item', AccordionItem);
})();
