(() => {
  if (customElements.get('price-range')) {
    return;
  }

  class ComponentExample extends HTMLElement {
    constructor() {
      super();
      this.minInput = this.querySelector('[data-min-input]');
      this.maxInput = this.querySelector('[data-max-input]');
      this.minSlider = this.querySelector('[data-min-slider]');
      this.maxSlider = this.querySelector('[data-max-slider]');

      [this.minInput, this.maxInput].forEach(element =>
        element.addEventListener(
          'input',
          debounce(event => {
            this.onRangeInputChange(event);
          }, 300).bind(this)
        )
      );
      if (this.minSlider && this.maxSlider) {
        [this.minSlider, this.maxSlider].forEach(element => {
          element.addEventListener(
            'input',
            this.onRangeSliderChange.bind(this)
          );
        });
      }
    }

    onRangeSliderChange(event) {
      event.target === this.minSlider
        ? (this.minInput.value = this.minSlider.value)
        : (this.maxInput.value = this.maxSlider.value);
    }

    onRangeInputChange(event) {
      event.target === this.minSlider
        ? (this.minSlider.value = this.minInput.value)
        : (this.maxSlider.value = this.maxInput.value);
    }
  }

  customElements.define('price-range', ComponentExample);
})();
