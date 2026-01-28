(() => {
  if (customElements.get('product-selector')) {
    return;
  }

  class ProductSelector extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form');
      if (this.form === null) return;

      this.form.addEventListener(
        'submit',
        this.onSubmitHandler.bind(this)
      );
      this.submitButton = this.form.querySelector('[name="add"]');
      this.cartDrawer = document.querySelector('cart-drawer');
      this.variants = JSON.parse(
        this.querySelector('[type="application/json"]').textContent
      );
      this.availableVariants = this.variants.filter(
        variant => variant.available
      );
      this.unavailableText = ` - ${window.variantStrings.unavailable}`;
      this.addEventListener('change', this.onVariantChange);

      this.updateOptions();
      this.updateVariant();

      if (!this.currentVariant) {
        return;
      }

      // this.updateMedia();
      this.setUnavailableOptions();
    }

    onSubmitHandler(event) {
      event.preventDefault();

      this.submitButton.classList.add('disabled');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
      const formData = new FormData(this.form);
      if (this.cartDrawer) {
        formData.append(
          'sections',
          this.cartDrawer
            .getSectionsToRender()
            .map(section => section.section)
        );
      }
      formData.append('sections_url', window.location.pathname);
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then(response => response.json())
        .then(response => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            return;
          }

          if (
            this.dataset.cartType == 'page' ||
            Shopify.template == 'cart'
          ) {
            window.location.reload();
          } else if (this.dataset.cartType == 'drawer') {
            this.cartDrawer.renderContents(response);
            document.querySelector('#Product-Quickview-Modal[open]')?.hide();
          }
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          this.submitButton.classList.remove('disabled');
        });
    }

    handleErrorMessage(errorMessage = false) {
      const errorWrapper = this.querySelector('[data-error-wrapper]');
      if (!errorWrapper) return;

      errorWrapper.classList.toggle('hidden', !errorMessage);


      if (typeof errorMessage === 'object') {
        for (const [key, value] of Object.entries(errorMessage)) {
          errorWrapper.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} ${value}`
        }
      } else {
        errorWrapper.textContent = errorMessage || '';
      }
    }

    onVariantChange(event) {
      if (
        event.target.type === 'number' ||
        event.target.name.includes('selling_plan')
      )
        return;
      this.updateOptions();
      this.updateVariant();
      this.toggleAddButton(false, '');
      this.handleErrorMessage();

      if (!this.currentVariant) {
        this.toggleAddButton(true, '');
        this.setUnavailable();
        return;
      }

      if (!this.currentVariant.available) {
        ``;
        this.toggleAddButton(true, window.variantStrings.soldOut);
      }

      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.setUnavailableOptions();
    }

    updateOptions() {
      this.options = Array.from(
        this.querySelectorAll('input[type="radio"]:checked, select'),
        el => ({ name: el.dataset.name, value: el.value })
      );
    }

    updateVariant() {
      this.currentVariant = this.options.length
        ? this.variants.find(variant => {
            return !variant.options
              .map(
                (option, index) =>
                  this.options[index].value === option
              )
              .includes(false);
          })
        : this.variants[0];
    }

    updateMedia() {
      try {
              if (!this.currentVariant || !this.currentVariant.featured_media)
        return;

      const productMedia =
        this.closest('[data-product]').querySelector('product-media');
      productMedia.setActiveMedia(
        this.currentVariant.featured_media.id
      );
      } catch (err) {
        
      }

    }

    updateURL() {
      if (!this.currentVariant || Shopify.template != 'product')
        return;
      const params = new URLSearchParams(window.location.search);
      params[params.has('variant') ? 'set' : 'append'](
        'variant',
        this.currentVariant.id
      );
      window.history.replaceState(
        {},
        '',
        `${this.dataset.url}?${params.toString()}`
      );
    }

    updateVariantInput() {
      const input = this.querySelector('[name="id"]');
      input.value = this.currentVariant.id;
    }

    setUnavailable() {
      const submitButton = this.querySelector('[name="add"]');
      const price = this.querySelector(
        `#price-${this.dataset.sectionId} .price`
      );

      if (!submitButton) return;
      submitButton.textContent = window.variantStrings.unavailable;
      if (price) price.classList.add('visibility-hidden');

      Array.from(this.querySelectorAll('[data-size]')).map(x =>
        x.removeAttribute('disable')
      );
      this.querySelector('[data-size]:checked').setAttribute(
        'disable',
        ''
      );
    }

    toggleAddButton(disable, text) {
      const submitButton = this.querySelector('[name="add"]');

      if (!submitButton) {
        return;
      }

      if (disable) {
        submitButton.setAttribute('disabled', 'disabled');
        if (text) submitButton.textContent = text;
      } else {
        submitButton.removeAttribute('disabled');
        submitButton.textContent = window.variantStrings.addToCart;
      }
    }

    renderProductInfo() {
      const params = new URLSearchParams(window.location.search);
      params[params.has('variant') ? 'set' : 'append'](
        'variant',
        this.currentVariant.id
      );
      params.append('section_id', this.dataset.sectionId);

      fetch(`${this.dataset.url}?${params.toString()}`)
        .then(response => response.text())
        .then(responseText => {
          const html = new DOMParser().parseFromString(
            responseText,
            'text/html'
          );

          if (html.querySelector('purchase-options')) {
            this.querySelector('purchase-options').innerHTML =
              html.querySelector('purchase-options').innerHTML;
          }

          if (
            html.querySelector('[data-purchase-options-notification]')
          ) {
            this.querySelector(
              '[data-purchase-options-notification]'
            ).innerHTML = html.querySelector(
              '[data-purchase-options-notification]'
            ).innerHTML;
          }

          if (html.querySelector('[data-option-selected-value]')) {
            this.querySelector(
              '[data-option-selected-value]'
            ).innerHTML = html.querySelector(
              '[data-option-selected-value]'
            ).innerHTML;
          }

          if (html.querySelector('[data-quantity-input]')) {
            this.querySelector('[data-quantity-input]').innerHTML =
              html.querySelector('[data-quantity-input]').innerHTML;
          }

          if (html.querySelector('[data-pickup-availability]')) {
            this.querySelector(
              '[data-pickup-availability]'
            ).innerHTML = html.querySelector(
              '[data-pickup-availability]'
            ).innerHTML;

            document.querySelector(
              '#Pickup-Availability-Modal [role="dialog"]'
            ).innerHTML = html.querySelector(
              '[data-pickup-availability] [role="dialog"]'
            )?.innerHTML;
          }

          const destinationPrice = document.querySelector(
            `#price-${this.dataset.sectionId}`
          );
          const sourcePrice = html.querySelector(
            `#price-${this.dataset.sectionId}`
          );

          if (destinationPrice && sourcePrice) {
            destinationPrice.classList.remove('visibility-hidden');
            destinationPrice.innerHTML = sourcePrice.innerHTML;
          }
        });
    }

    appendStringToElementHTML(el, string) {
      if (el.innerHTML.includes(string)) return;
      el.innerHTML = `${el.innerHTML}${string}`;
    }

    removeStringFromElementHTML(el, string) {
      el.innerHTML = el.innerHTML.replace(string, '');
    }

    setUnavailableOptions() {
      for (const [key, { name }] of this.options.entries()) {
        const optionElements = this.querySelectorAll(
          `[data-name="${name}"]`
        );

        optionElements.forEach(swatch => {
          const selectOptions = swatch.querySelectorAll('option');
          if (!selectOptions.length) {
            return swatch.classList.toggle(
              'is-unavailable',
              !this.isOptionAvailable(key, swatch.value)
            );
          }

          return selectOptions.forEach(option => {
            if (this.isOptionAvailable(key, option.value)) {
              return this.removeStringFromElementHTML(
                option,
                this.unavailableText
              );
            }

            this.appendStringToElementHTML(
              option,
              this.unavailableText
            );
          });
        });
      }
    }

    isOptionAvailable(index, value) {
      const currentHandle = `option${index + 1}`;
      const valuesToCheck = {};

      for (let i = 0; i < index; i++) {
        const optionHandle = `option${i + 1}`;
        const optionValue = this.options[i].value;
        valuesToCheck[optionHandle] = optionValue;
      }

      valuesToCheck[currentHandle] = value;

      return this.availableVariants.some(variant => {
        return Object.entries(valuesToCheck).every(
          ([handle, value]) => variant[handle] === value
        );
      });
    }
  }

  customElements.define('product-selector', ProductSelector);
})();
