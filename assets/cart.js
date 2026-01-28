class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', event => {
      event.preventDefault();
      const cartItems =
        this.closest('cart-drawer-items') ||
        this.closest('cart-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.currentItemCount = Array.from(
      this.querySelectorAll('[name="updates[]"]')
    ).reduce(
      (total, quantityInput) => total + parseInt(quantityInput.value),
      0
    );
    this.debouncedOnChange = debounce(event => {
      this.onChange(event);
    }, 300);
    this.addEventListener(
      'change',
      this.debouncedOnChange.bind(this)
    );
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute('name')
    );
  }

  getSectionsToRender() {
    return [
      {
        id: `#shopify-section-${
          document.getElementById('main-cart-items').dataset.id
        }`,
        section:
          document.getElementById('main-cart-items').dataset.id,
        selector: `#shopify-section-${
          document.getElementById('main-cart-items').dataset.id
        }`
      },
      {
        id: '#cart-counter',
        section: 'cart-counter',
        selector: '#shopify-section-cart-counter'
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map(
        section => section.section
      ),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {
      ...fetchConfig(),
      ...{ body }
    })
      .then(response => response.text())
      .then(state => {
        const parsedState = JSON.parse(state);

        this.handleErrorMessage(parsedState.errors);

        if (parsedState.errors) {
          return;
        }

        this.getSectionsToRender().forEach(section => {
          const elementToReplace = document.querySelector(section.id);

          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const lineItem = document.getElementById(`CartItem-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`))
          lineItem.querySelector(`[name="${name}"]`).focus();
      });
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  handleErrorMessage(text) {
    const errorWrapper = document.querySelector(
      '[data-cart-error-wrapper]'
    );

    if (text) {
      errorWrapper.removeAttribute('hidden');
      errorWrapper.textContent = text;
    } else {
      errorWrapper.setAttribute('hidden', '');
    }
  }
}

customElements.define('cart-items', CartItems);
