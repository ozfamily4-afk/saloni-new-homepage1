(() => {
  if (customElements.get('size-guide')) {
    return;
  }

  class SizeGuide extends HTMLElement {
    constructor() {
      super();
      this.data = JSON.parse(
        this.querySelector(
          '[type="application/json"][data-size-guide]'
        ).textContent
      );
      this.toggles = this.querySelectorAll('[data-toggle]');
      this.sizes = this.querySelectorAll('[data-size]');
      this.unit = this.querySelector(
        '[data-toggle][active]'
      ).textContent.toLowerCase();
    }

    connectedCallback() {
      this.toggles.forEach(e => {
        e.addEventListener('click', this.toggleUnit.bind(this));
      });

      this.querySelector('[data-button-calc]').addEventListener(
        'click',
        this.findSize.bind(this)
      );
    }

    findSize(e) {
      e.preventDefault();
      const resultWrapper = this.querySelector(
        '[data-size-result-wrapper]'
      );
      const noResultWrapper = this.querySelector('[data-no-result]');

      this.querySelector('[data-size][active]')?.removeAttribute(
        'active'
      );

      const inputVal_1 = this.querySelector('input[name="column_1"]')?.value ?? 0;
      const inputVal_2 = this.querySelector('input[name="column_2"]')?.value ?? 0;
      const inputVal_3 = this.querySelector('input[name="column_3"]')?.value ?? 0;
      const inputVal_4 = this.querySelector('input[name="column_4"]')?.value ?? 0;

      const index = this.data.map((val) =>
        Number(val[this.unit].column_1) >= Number(inputVal_1) &&
        Number(val[this.unit].column_2) >= Number(inputVal_2) &&
        Number(val[this.unit].column_3) >= Number(inputVal_3) &&
        Number(val[this.unit].column_4) >= Number(inputVal_4)
      ).findIndex(i => i == true )

      let currentSize = this.querySelector(`[data-size="${this.data[index]?.name}"]`)

      if (currentSize) {
        noResultWrapper.setAttribute('hidden', '');
        currentSize.setAttribute('active', '');
        resultWrapper.removeAttribute('hidden');
        resultWrapper.querySelector(
          '[data-size-result]'
        ).textContent = currentSize.dataset.size;
      } else {
        resultWrapper.setAttribute('hidden', '');
        noResultWrapper.removeAttribute('hidden');
      }
    }

    toggleUnit(e) {
      const button = e.currentTarget;
      if (button.hasAttribute('active')) {
        return;
      }

      this.toggles.forEach(button =>
        button.toggleAttribute('active')
      );

      this.unit = this.querySelector(
        '[data-toggle][active]'
      ).textContent.toLowerCase();

      this.querySelectorAll('[data-field-unit]').forEach(
        field => (field.textContent = this.unit)
      );

      this.data.forEach((obj) => {
        const size = this.querySelector(`[data-size="${obj.name}"]`);
        size.querySelectorAll('[data-holder-column]').forEach((holder,index) => {
          const handle = `column_${index + 1}`
          holder.textContent = obj[this.unit][handle]
        })
      });

      this.reset();
    }

    reset() {
      this.querySelectorAll('[data-field]').forEach(
        field => (field.value = 0)
      );
      this.querySelector('[data-size-result-wrapper]').setAttribute(
        'hidden',
        ''
      );
      this.querySelector('[data-size][active]')?.removeAttribute(
        'active'
      );
      this.querySelector('[data-no-result]').setAttribute(
        'hidden',
        ''
      );
    }
  }

  customElements.define('size-guide', SizeGuide);
})();
