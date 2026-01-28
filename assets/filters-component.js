(() => {
  if (customElements.get('filters-component')) {
    return;
  }

  class FiltersComponent extends HTMLElement {
    constructor() {
      super();
      this.debouncedOnSubmit = debounce(event => {
        this.onChange(event);
      }, 500);

      this.querySelector('[data-form]')?.addEventListener(
        'input',
        this.debouncedOnSubmit.bind(this)
      );

      this.querySelector('[data-filter-sort]')?.addEventListener(
        'input',
        this.debouncedOnSubmit.bind(this)
      );

      this.spinner = document.getElementById('spinner');
    }

    connectedCallback() {
      this.querySelector('[data-opener]')?.addEventListener(
        'click',
        this.toggle.bind(this)
      );
      this.querySelector('[data-close]')?.addEventListener(
        'click',
        this.toggle.bind(this)
      );
      this.querySelector(
        '[data-button-mobile-apply]'
      )?.addEventListener('click', this.toggle.bind(this));
      this.querySelector('[data-clear]')?.addEventListener(
        'click',
        this.clear.bind(this)
      );

      this.querySelector(
        '[data-button-mobile-clear]'
      )?.addEventListener('click', this.clear.bind(this));

      this.querySelectorAll('[data-active]').forEach(e => {
        e.addEventListener('click', this.onRemove.bind(this));
      });

      this.querySelectorAll('[data-group]').forEach(e => {
        e.addEventListener('click', this.groupToggle.bind(this));
      });

      if(this.hasAttribute('open-desktop')) {
        this.expandedDesktop();

        window.addEventListener('resize', () => {
          this.expandedDesktop();
        })
      }
    }

    expandedDesktop() {
      if(window.innerWidth > 767) {
        this.setAttribute('open', '');
      } else {
        this.removeAttribute('open');
      }
    }

    toggle() {
      if (this.hasAttribute('empty')) return;
      this.toggleAttribute('open');
      document.body.classList.toggle('no-scroll-mobile');
    }

    groupToggle(event) {
      event.currentTarget.toggleAttribute('close');
    }

    onChange(event) {
      event.preventDefault();
      const form = this.querySelector('[data-form]');
      let searchParams = '';
      if (form) {
        const formData = new FormData(form);
        searchParams = new URLSearchParams(formData).toString();
      }

      const sortSelect = this.querySelector('[data-filter-sort]');
      if (sortSelect) {
        searchParams += `&sort_by=${sortSelect.value}`;
      }

      this.renderHtml(searchParams);
    }

    onRemove(event) {
      event.preventDefault();
      const searchParams = event.currentTarget.search.replace(
        '?',
        ''
      );
      this.renderHtml(searchParams);
    }

    renderHtml(searchParams) {
      const query = new URLSearchParams(window.location.search).get(
        'q'
      );
      if (query && !searchParams.includes('q=')) {
        searchParams
          ? (searchParams = `q=${query}&${searchParams}`)
          : (searchParams = `q=${query}`);
      }

      this.updateURL(searchParams);

      const url = `${window.location.pathname}?section_id=${this.dataset.id}&${searchParams}`;

      spinnerLoader.enable(this.spinner);

      fetch(url)
        .then(response => response.text())
        .then(text => {
          const innerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('[data-filter-wrapper]').innerHTML;

          document.querySelector('[data-filter-wrapper]').innerHTML =
            innerHTML;

          if (this.hasAttribute('open'))
            document
              .querySelector('filters-component[data-enable-filters]')
              ?.setAttribute('open', '');
          spinnerLoader.disable(this.spinner);
        });
    }

    updateURL(searchParams) {
      history.pushState(
        { searchParams },
        '',
        `${window.location.pathname}${
          searchParams && '?'.concat(searchParams)
        }`
      );
    }

    clear() {
      let searchParams = '';
      const sortParam = window.location.search.split('&sort_by')[1];
      if (sortParam) searchParams = `sort_by${sortParam}`;

      this.renderHtml(searchParams);
    }
  }

  customElements.define('filters-component', FiltersComponent);
})();
