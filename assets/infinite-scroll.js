(() => {
  if (customElements.get('infinite-scroll')) {
    return;
  }

  class InfiniteScroll extends HTMLElement {
    constructor() {
      super();

      this.spinner = document.getElementById('spinner');
    }

    connectedCallback() {
      this.init();
    }

    init() {
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);

        if (!this.dataset.next) {
          return;
        }

        spinnerLoader.enable(this.spinner);

        fetch(this.dataset.next)
          .then(response => response.text())
          .then(text => {
            const collection = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('[data-filter-wrapper]');

            collection
              .querySelectorAll('card-product')
              .forEach(cardProduct => {
                document
                  .getElementById('product-grid')
                  .appendChild(cardProduct);
              });

            const infiniteScrollMarkup = collection.querySelector(
              '[data-infinite-scroll]'
            );
            document.querySelector(
              '[data-infinite-scroll]'
            ).innerHTML = infiniteScrollMarkup.innerHTML;

            spinnerLoader.disable(this.spinner);
          });
      };

      new IntersectionObserver(handleIntersection.bind(this), {
        rootMargin: '0px 0px 200px 0px'
      }).observe(this);
    }
  }

  customElements.define('infinite-scroll', InfiniteScroll);
})();
