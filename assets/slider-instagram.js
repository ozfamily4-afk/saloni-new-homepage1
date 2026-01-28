(() => {
  if (customElements.get('slider-instagram')) {
    return;
  }

  class SliderInstagram extends HTMLElement {
    constructor() {
      super();
      this.slider = null;
      this.options = {
        enabled: this.dataset.enabled === 'true' ? true : false,
        slidesPerView: 2.2,
        grabCursor: true,
        spaceBetween: this.dataset.enabled === 'true' ? 16 : 0,
        breakpoints: {
          768: {
            enabled: false,
            spaceBetween: 0
          }
        }
      };
    }

    connectedCallback() {
      this.initSlider();
    }

    initSlider() {
      this.slider = new Swiper(this, this.options);
    }
  }

  customElements.define('slider-instagram', SliderInstagram);
})();
