(() => {
  if (customElements.get('predictive-search')) {
    return;
  }

  class PredictiveSearch extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input[type="search"]');
      this.body = document.querySelector('body');
    }

    connectedCallback() {
      if (this.hasAttribute('disable')) return;
      this.input.addEventListener('input', this.search.bind(this));
      this.setOffset();
    }

    setOffset() {
      const searchWrapper = this.querySelector(
        '[data-predictive-search]'
      );
      const barHeight = document.querySelector(
        'announcement-bar'
      )?.offsetHeight;
      const headerHeight = document.querySelector(
        'header[data-header]'
      )?.offsetHeight;
      const searchFieldHeight = this.querySelector(
        '[data-predictive-search-control]'
      )?.offsetHeight;

      const offset = barHeight + headerHeight + searchFieldHeight;
      searchWrapper.style.setProperty('--offset', `${offset}px`);
    }

    search() {
      const predictiveSearchSection =
        this.querySelector('[data-result]');
      const terms = this.input.value;

      if (!terms) {
        predictiveSearchSection.innerHTML = '';
        return;
      }

      fetch(
        window.Shopify.routes.root +
          `search/suggest?q=${terms}&resources[type]=product,article,page,collection,query&section_id=predictive-search`
      )
        .then(response => response.text())
        .then(text => {
          const resultsMarkup = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector(
              '#shopify-section-predictive-search'
            )?.innerHTML;

          if (resultsMarkup == undefined) {
            return;
          }

          predictiveSearchSection.innerHTML = resultsMarkup;
          this.setOffset();
        });
    }
  }

  customElements.define('predictive-search', PredictiveSearch);
})();
