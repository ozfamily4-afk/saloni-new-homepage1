(() => {
  if (customElements.get('slider-blog')) {
    return;
  }

  class SliderBlog extends HTMLElement {
    constructor() {
      super();
      this.slider = null;
      this.options = {
        slidesPerView: 1,
        spaceBetween: 32,
        autoHeight: true,
        pagination: {
          el: this.querySelector('[data-pagination]'),
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="swiper-pagination-bullet"><svg viewBox="0 0 100 100"><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" stroke="#eee" stroke-width="14" fill-opacity="0"></path><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" line stroke="#fff" stroke-width="14" fill-opacity="0" style="stroke-dasharray: 300, 300;"></path></svg></span>`;
          }
        },
        breakpoints: {
          768: {
            slidesPerView: this.dataset.slidesDesktop,
            enabled: false,
            autoHeight: false
          }
        }
      };
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

  customElements.define('slider-blog', SliderBlog);
})();
