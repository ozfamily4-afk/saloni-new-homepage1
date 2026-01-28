(() => {
  if (customElements.get('products-recommendations')) {
    return;
  }

  class ProductRecommendations extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.setupIntersectionObserver();
    }

    loadRecommendations() {
      fetch(this.dataset.url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector(
            'product-recommendations'
          );

          this.innerHTML = recommendations.innerHTML;
        });
    }

    setupIntersectionObserver() {
      new IntersectionObserver(
        (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          observer.unobserve(this);

          this.loadRecommendations();
        },
        {
          rootMargin: '0px 0px 200px 0px'
        }
      ).observe(this);
    }
  }

  customElements.define(
    'product-recommendations',
    ProductRecommendations
  );
})();
