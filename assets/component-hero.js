(() => {
  if (customElements.get('hero-slider')) {
    return;
  }

  class HeroSlider extends HTMLElement {
    constructor() {
      super();
      this.slider = null;
      this.options = {
        slidesPerView: 1,
        loop:
          this.dataset.slides != '1'
            ? JSON.parse(this.dataset.loop)
            : false,
        rewind: false,
        navigation: {
          prevEl: this.querySelector('[data-arrow-prev]'),
          nextEl: this.querySelector('[data-arrow-next]')
        }
      };

      if (
        this.dataset.autoplay === 'true' &&
        this.dataset.slides != '1'
      ) {
        this.options.autoplay = {
          loop: true,
          delay: this.dataset.autoplayInterval,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          waitForTransition: false
        };
      }

      if (this.dataset.pagination === 'true') {
        this.options.pagination = {
          el: this.querySelector('[data-pagination]'),
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="swiper-pagination-bullet"><svg viewBox="0 0 100 100"><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" stroke="#eee" stroke-width="14" fill-opacity="0"></path><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" line stroke="#fff" stroke-width="14" fill-opacity="0" style="stroke-dasharray: 300, 300;"></path></svg></span>`;
          }
        };
      }

      if (this.dataset.fade === 'true') {
        this.options.effect = 'fade';
      }

      window.addEventListener('resize', this.onResize.bind(this));
    }

    connectedCallback() {
      this.initSlider();
      this.setOffset();

      if (Shopify.designMode) {
        // This will only render in the theme editor
        this.addHandlers();
      }
    }

    initSlider() {
      this.slider = new Swiper(this, this.options);

      this.slider.on('slideChangeTransitionEnd', () => {
        const video = this.querySelector(
          '.swiper-slide-active video'
        );

        if (video) {
          video.play();
        } else {
          this.querySelectorAll('video').forEach(video => {
            video.pause();
          });
        }
      });
    }

    setOffset() {
      const hero = this.closest('[data-hero]');
      const offset = getOffsetTop(hero);
      hero.style.setProperty('--offset', `${offset}px`);
    }

    onResize() {
      this.setOffset();
    }

    addHandlers() {
      document.addEventListener(
        'shopify:block:select',
        this.onShopifyBlockSelect.bind(this)
      );

      window.addEventListener('shopify:section:load', () => {
        // delay until styles are loaded
        setTimeout(() => {
          this.setOffset();
        }, 1000);
      });

      document.addEventListener('DOMContentLoaded', () => {
        this.setOffset();
      });
    }

    onShopifyBlockSelect(event) {
      const slideId = event.target.dataset.id;
      this.slider.slideToLoop(Number(slideId));
    }
  }

  customElements.define('hero-slider', HeroSlider);
})();
