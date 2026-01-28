class AnnouncementBar extends HTMLElement {
  constructor() {
    super();

    this.sessionStorageKey = 'announcementBarClosed';
    this.closeButton = this.querySelector('[close-button]');
    this.slider = null;
    this.swiper = this.querySelector('.swiper');
    this.header = document.querySelector('header.header');
  }

  connectedCallback() {
    if (sessionStorage.getItem(this.sessionStorageKey) === 'true')
      return;
    this.classList.remove('hidden');

    if (this.swiper) {
      this.initSlider();
      window.addEventListener(
        'resize',
        debounce(this.toggleSlider.bind(this), 100)
      );

      setHeaderHeight.set();
    }

    this.closeButton?.addEventListener(
      'click',
      this.close.bind(this)
    );
  }

  initSlider() {
    this.options = {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: false,
      navigation: {
        prevEl: this.querySelector('[arrow-prev]'),
        nextEl: this.querySelector('[arrow-next]')
      }
    };

    if (this.swiper.dataset.autoplay === 'true') {
      this.options.autoplay = {
        delay: this.swiper.dataset.interval
      };
    }

    if (JSON.parse(this.swiper.dataset.size > 1)) {
      this.options.loop = true;
    }

    this.slider = new Swiper(this.swiper, this.options);
    this.toggleSlider();
  }

  toggleSlider() {
    if (
      window.innerWidth >= 768 &&
      this.swiper.hasAttribute('data-slider-destroy-tablet-up')
    ) {
      this.slider.disable();
    } else {
      this.slider.enable();
    }
  }

  close() {
    this.setTopHeaderMobile();
    this.classList.add('hidden');
    this.setOffset();
    sessionStorage.setItem(this.sessionStorageKey, true);
  }

  setOffset() {
    const hero = document.querySelector('[data-hero]');
    const offset = getOffsetTop(hero);
    hero.style.setProperty('--offset', `${offset}px`);
  }

  setTopHeaderMobile() {
    const headerHeight = this.header.offsetHeight;
    document.querySelector(
      '.header-mobile__nav'
    ).style.top = `${headerHeight}px`;
  }
}

customElements.define('announcement-bar', AnnouncementBar);
