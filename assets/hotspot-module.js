(() => {
  if (customElements.get('hotspot-module')) {
    return;
  }

  class HotspotModule extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.querySelector('button').addEventListener(
        'click',
        this.toggle.bind(this)
      );
      this.querySelector('[data-button-close]')?.addEventListener(
        'click',
        this.close.bind(this)
      );
      document.querySelectorAll('[data-button-close]').forEach(e => {
        e.addEventListener('click', this.close.bind(this));
      });
    }

    toggle() {
      document
        .querySelector('hotspot-module[active]')
        ?.removeAttribute('active');
      document
        .querySelector('.hotspot__content[active]')
        ?.removeAttribute('active');
      this.setAttribute('active', '');
      document
        .getElementById(`hotspot-content-${this.id}`)
        .setAttribute('active', '');
    }

    close(event) {
      this.removeAttribute('active');
      event.currentTarget.parentElement.removeAttribute('active');
    }
  }

  customElements.define('hotspot-module', HotspotModule);
})();
