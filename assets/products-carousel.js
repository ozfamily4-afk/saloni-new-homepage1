(() => {
  if (customElements.get('products-carousel')) {
    return;
  }

  class ProductsCarousel extends HTMLElement {
    constructor() {
      super();
      this.section = this.closest('section');
      this.slider = null;

      this.options = {
        slidesPerView: this.hasAttribute('data-slides-mobile')
          ? this.dataset.slidesMobile
          : 2,
        grabCursor: true,
        autoHeight: this.hasAttribute('data-auto-height'),
        spaceBetween: this.hasAttribute('data-carousel-mini')
          ? 32
          : 16,
        navigation: {
          prevEl: this.section.querySelector('[data-arrow-prev]'),
          nextEl: this.section.querySelector('[data-arrow-next]')
        }
      };

      if (this.dataset.autoplay === 'true') {
        this.options.autoplay = {
          delay: this.dataset.autoplaySpeed,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          waitForTransition: false
        };
      }

      if (this.dataset.loop === 'true') {
        this.options.loop = true;
      }

      if (this.hasAttribute('data-breakpoints')) {
        this.options.breakpoints = {
          768: {
            slidesPerView: this.dataset.slidesTablet,
            spaceBetween: 32
          },
          1024: {
            slidesPerView: this.dataset.slidesDesktop
          }
        };
      }

      if (this.hasAttribute('data-carousel-mini')) {
        this.options.pagination = {
          el: this.section.querySelector('[data-pagination]'),
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="swiper-pagination-bullet"><svg viewBox="0 0 100 100"><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" stroke="#eee" stroke-width="14" fill-opacity="0"></path><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" line stroke="#fff" stroke-width="14" fill-opacity="0" style="stroke-dasharray: 300, 300;"></path></svg></span>`;
          }
        };
      }
    }

    connectedCallback() {
      this.initSlider();
    }

    initSlider() {
      this.slider = new Swiper(this, this.options);
    }
  }

  customElements.define('products-carousel', ProductsCarousel);
})();
