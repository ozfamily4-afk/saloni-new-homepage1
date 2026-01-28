(() => {
  if (customElements.get('header-mobile-drawer')) {
    return;
  }

  class HeaderMobileDrawer extends HTMLElement {
    constructor() {
      super();
      this.header = document.querySelector('header[data-header]');
      this.barHeight = 0;
      this.headerHeight = 0;
      this.nav = this.querySelector('nav');
      this.button = this.querySelector('button[type="button"]');
      this.list = this.querySelector('[data-mobile-navigation-list]');
    }

    connectedCallback() {
      this.button.addEventListener('click', this.toggle.bind(this));

      this.querySelectorAll('[data-nav-next]').forEach(element => {
        element.addEventListener('click', this.next.bind(this));
      });

      this.querySelectorAll('[data-nav-prev]').forEach(element => {
        element.addEventListener('click', this.prev.bind(this));
      });

      window.addEventListener(
        'resize',
        this.closeOnDesktop.bind(this)
      );
      window.addEventListener(
        'scroll',
        this.setTopPosition.bind(this)
      );
    }

    setTopPosition() {
      if (this.nav.classList.contains('active')) {
        this.getHeaderHeight();

        const topPosition = this.barHeight + this.headerHeight;
        this.nav.style.top = `${topPosition}px`;
      }
    }

    toggle() {
      this.getHeaderHeight();

      if (this.nav.classList.contains('active')) {
        this.removeAttribute('active');
        this.nav.classList.remove('active');
        document.body.classList.remove('no-scroll');
      } else {
        this.nav.classList.add('active');
        this.setAttribute('active', '');
        this.setTopPosition();
        document.body.classList.add('no-scroll');
      }
    }

    getHeaderHeight() {
      this.barHeight =
        window.pageYOffset > 0
          ? 0
          : document.querySelector('announcement-bar')
              ?.clientHeight || 0;
      this.headerHeight =
        document.querySelector('header[data-header]').clientHeight -
        1;
    }

    closeOnDesktop() {
      if (window.innerWidth >= 1024) {
        this.nav.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    }

    next(event) {
      event.preventDefault();
      const linkShell = event.currentTarget.closest('li');
      const level = linkShell.parentElement.dataset.level;
      linkShell.classList.add('open');
      linkShell.parentElement.classList.remove('is-current');
      linkShell.querySelector('ul').classList.add('is-current');

      switch (level) {
        case '1':
          this.list.classList.add('active-two');
          break;
        case '2':
          this.list.classList.add('active-three');
          break;
      }
    }

    prev(event) {
      event.stopPropagation();
      const level = event.currentTarget.parentElement.dataset.level;

      event.currentTarget.parentElement.classList.remove(
        'is-current'
      );
      event.currentTarget
        .closest('.open')
        .parentElement.classList.add('is-current');
      event.currentTarget.closest('.open').classList.remove('open');

      switch (level) {
        case '2':
          this.list.classList.remove('active-two');
          break;
        case '3':
          this.list.classList.remove('active-three');
          break;
      }
    }
  }

  customElements.define('header-mobile-drawer', HeaderMobileDrawer);
})();
