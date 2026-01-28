(() => {
  if (customElements.get('slider-reviews')) {
    return;
  }

  class sliderReviews extends HTMLElement {
    constructor() {
      super();
      this.section = this.closest('section');

      this.slider = null;
      this.options = {
        slidesPerView: 1,
        grabCursor: true,
        spaceBetween: 20,
        autoHeight: false,
        navigation: {
          prevEl: this.section.querySelector('[data-arrow-prev]'),
          nextEl: this.section.querySelector('[data-arrow-next]')
        },
        pagination: {
          el: this.section.querySelector('[data-pagination]'),
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="swiper-pagination-bullet"><svg viewBox="0 0 100 100"><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" stroke="#eee" stroke-width="14" fill-opacity="0"></path><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" line stroke="#fff" stroke-width="14" fill-opacity="0" style="stroke-dasharray: 300, 300;"></path></svg></span>`;
          }
        },
        breakpoints: {
          768: {
            slidesPerView: 3
          },
          1024: {
            slidesPerView: this.dataset.perView
          }
        }
      };

      if (this.dataset.autoplay === 'true') {
        this.options.autoplay = {
          delay: this.dataset.autoplayInterval,
          disableOnInteraction: false
        };
      }
    }

    connectedCallback() {
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        this.initSlider();
      };

      new IntersectionObserver(handleIntersection.bind(this), {
        rootMargin: '0px 0px 200px 0px'
      }).observe(this);
    }

    initSlider() {
      this.slider = new Swiper(this, this.options);
    }
  }

  customElements.define('slider-reviews', sliderReviews);
})();
