(() => {
  if (customElements.get('sticky-header')) {
    return;
  }

  class StickyHeader extends HTMLElement {
    constructor() {
      super();
      this.header = this.querySelector('header');
      this.announcementBar = document.querySelector(
        'announcement-bar'
      );
    }

    connectedCallback() {
      if (this.hasAttribute('enable-sticky')) {
        document
          .querySelector('.header-section')
          ?.classList.add('is-scroll');
        window.addEventListener('scroll', this.scroll.bind(this));
      }
    }

    scroll() {
      const barHeight = this.announcementBar
        ? this.announcementBar.clientHeight
        : 0;

      if (window.pageYOffset > barHeight) {
        this.header.classList.remove('header--transparent');
      } else if (
        this.header.hasAttribute('transparent') &&
        !this.header.hasAttribute('is-open')
      ) {
        this.header.classList.add('header--transparent');
      }
    }
  }

  customElements.define('sticky-header', StickyHeader);
})();
