/**
 * Uses Swiper package to create a carousel for product media
 * More info: https://swiperjs.com/
 */
(() => {
  if (customElements.get('product-media')) {
    return;
  }

  class ProductMedia extends HTMLElement {
    constructor() {
      super();
      this.sliderElement = this.querySelector('[data-slider]');
      this.thumbsElement = this.querySelector('[data-thumbs]');
      this.slides = Array.from(
        this.querySelectorAll('[data-media-id]')
      );
    }

    connectedCallback() {
      if (this.hasAttribute('data-placeholder')) return;

      this.initSwiper();
      let viewportWidth = window.outerWidth;
      if (this.dataset.layout === 'grid') {
        window.addEventListener('resize', () => {
          if (Shopify.designMode) {
            viewportWidth = window.innerWidth;
          } else {
            viewportWidth = window.outerWidth;
          }

          if (viewportWidth <= 1023 && this.slider.destroyed) {
            this.initSwiper();
          } else if (viewportWidth > 1023) {
            this.slider.destroy(false, true);
          }
        });

        if (viewportWidth > 1023) {
          this.slider.destroy(false, true);
        }
      }

      if (this.dataset.enableZoom === 'true') {
        this.initPhotoSwipe();
      }

      const deferredMedia = this.querySelector(
        'deferred-media[data-autoplay]'
      );

      if (deferredMedia) deferredMedia.loadContent();
    }

    initPhotoSwipe() {
      const lightbox = new PhotoSwipeLightbox({
        gallery: this,
        children: 'a[data-pswp-image]',
        pswpModule: PhotoSwipe,
        padding: { top: 20, bottom: 20, left: 20, right: 20 },
        preloadFirstSlide: true
      });

      lightbox.init();
    }

    initSwiper() {
      this.thumbs = new Swiper(this.thumbsElement, {
        slidesPerView: 3,
        spaceBetween: this.dataset.original === 'true' ? 10 : 35,
        navigation: {
          nextEl: this.querySelector('[data-thumbs-arrow-next]'),
          prevEl: this.querySelector('[data-thumbs-arrow-prev]')
        },
        watchSlidesProgress: true,
        autoHeight: true,
        breakpoints: {
          768: {
            direction:
              this.dataset.thumbsPosition === 'bottom'
                ? 'horizontal'
                : 'vertical',
            spaceBetween: this.dataset.mediaSquare === 'true' ? 28 : 10
          },
          1401: {
            direction:
              this.dataset.thumbsPosition === 'bottom'
                ? 'horizontal'
                : 'vertical',
            spaceBetween:
              this.dataset.thumbsPosition === 'bottom' ||
              this.dataset.original === 'true'
                ? 10
                : 35
          }
        }
      });

      const options = {
        spaceBetween: 10,
        autoHeight: true,
        navigation: {
          nextEl: this.querySelector('[data-arrow-next]'),
          prevEl: this.querySelector('[data-arrow-prev]')
        },
        thumbs: {
          swiper: this.thumbs
        },
        pagination: {
          el: this.querySelector('[data-pagination]'),
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 1,
          renderBullet: function (index, className) {
            return `<span class="swiper-pagination-bullet"><svg viewBox="0 0 100 100"><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" stroke="#eee" stroke-width="14" fill-opacity="0"></path><path d="M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94" line stroke="#fff" stroke-width="14" fill-opacity="0" style="stroke-dasharray: 300, 300;"></path></svg></span>`;
          }
        }
      };

      if (this.dataset.autoplay === 'true') {
        options.autoplay = {
          delay: this.dataset.autoplayInterval,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        };
      }

      this.slider = new Swiper(this.sliderElement, options);

      this.slider.on('slideChange', e => {
        const isModel =
          e.slides[e.activeIndex].querySelector('model-viewer');

        if (isModel) {
          this.slider.allowTouchMove = false;
        } else {
          this.slider.allowTouchMove = true;
        }

        const deferredMedia =
          e.slides[e.previousIndex].querySelector('deferred-media');

        if (deferredMedia) {
          deferredMedia.pauseMedia();
        }
      });

      this.querySelector(
        '[data-thumbs-arrow-prev]'
      )?.addEventListener('click', () => {
        this.slider.slidePrev();
      });

      this.querySelector(
        '[data-thumbs-arrow-next]'
      )?.addEventListener('click', () => {
        this.slider.slideNext();
      });
    }

    setActiveMedia(id) {
      const index = this.slides.find(
        slide => slide.dataset.mediaId === `${id}`
      ).dataset.index;
      if (this.slider && index) this.slider.slideTo(index);
      if (this.dataset.layout == 'grid' && this.slider?.destroyed) {
        const currentMedia = this.querySelector(`[data-media-id="${id}"`);
        let top = currentMedia.getBoundingClientRect().top;
        const header = document.querySelector('sticky-header');
        if(header.hasAttribute('enable-sticky')) top = top +  window.scrollY - header.offsetHeight;
        window.scroll({
          top: top,
          behavior: 'smooth'
        });
      }
    }
  }

  customElements.define('product-media', ProductMedia);
})();
