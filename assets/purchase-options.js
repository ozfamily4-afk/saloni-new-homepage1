(() => {
  if (customElements.get('purchase-options')) {
    return;
  }

  class PurchaseOptions extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('change', this.onChange.bind(this));
    }

    onChange(event) {
      const input = event.target;

      if (event.target.value === 'one-time') {
        Array.from(
          this.querySelectorAll('[name="selling_plan"]')
        ).find(option => option.checked).checked = false;
      } else if (
        input.getAttribute('name') === 'selling_plan_group'
      ) {
        input
          .closest('[data-selling-plan-group]')
          .querySelector('[name="selling_plan"]').checked = true;
      } else {
        input
          .closest('[data-selling-plan-group]')
          .querySelector(
            '[name="selling_plan_group"]'
          ).checked = true;
      }

      this.updatePrice();
    }

    updatePrice() {
      const plan = this.querySelector(
        '[name="selling_plan"]:checked, [data-selling-plan-default]:checked'
      );
      const priceIns = plan.dataset.priceIns;
      const priceDel = plan.dataset.priceDel;
      const product = this.closest('.product');

      if (priceDel) {
        product.querySelector('[data-product-price] del').innerHTML =
          priceDel;
      }

      product.querySelector('[data-product-price] .ins').innerHTML =
        priceIns;
    }
  }

  customElements.define('purchase-options', PurchaseOptions);
})();
