(() => {
  if (customElements.get('card-product')) {
    return;
  }

  class CardProduct extends HTMLElement {
    constructor() {
      super();
      if (this.hasAttribute('data-placeholder')) return;

      this.form = this.querySelector('form');
      this.form.addEventListener(
        'submit',
        this.onSubmitHandler.bind(this)
      );
      this.submitButton = this.form.querySelector('[name="add"]');
      this.cartDrawer = document.querySelector('cart-drawer');

      this.variants = JSON.parse(
        this.querySelector('[type="application/json"][data-variants]')
          .textContent
      );
      this.variantsUrl = JSON.parse(
        this.querySelector(
          '[type="application/json"][data-variants-url]'
        ).textContent
      );
      this.variantsImages = JSON.parse(
        this.querySelector(
          '[type="application/json"][data-variants-images]'
        ).textContent
      );
      this.addEventListener('change', this.onVariantChange);
      this.filterColors();
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
            console.log(response.description);
            return;
          }

          this.cartDrawer?.renderContents(response);
          if (
            this.dataset.cartType == 'page' ||
            Shopify.template == 'cart'
          ) {
            window.location.reload();
          }
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          this.submitButton.classList.remove('disabled');
        });
    }

    onVariantChange() {
      this.updateOptions();
      this.updateVariant();
      this.updateVariantInput();
      this.updateRegion();
    }

    updateOptions() {
      this.options = Array.from(
        this.querySelectorAll(`input[type="radio"]:checked, select`),
        el => el.value
      );
    }

    updateVariant() {
      this.currentVariant = this.variants.find(variant => {
        return this.options.length == 1
          ? variant.options
              .map(option => option == this.options[0])
              .includes(true)
          : variant.options
              .sort()
              .every(
                (option, index) =>
                  option === this.options.sort()[index]
              );
      });
    }

    updateVariantInput() {
      const input = this.querySelector('[name="id"]');
      input.value = this.currentVariant.id;
    }

    updateRegion() {
      this.updateUrl();
      this.updateImage();
      this.updateBadge();
      this.updateAddButton();
    }

    updateAddButton() {
      if (!this.submitButton) return;

      if (this.currentVariant.available) {
        this.submitButton.removeAttribute('disabled');
        this.submitButton.textContent =
          window.variantStrings.addToCart;
      } else {
        this.submitButton.setAttribute('disabled', 'disabled');
        this.submitButton.textContent = window.variantStrings.soldOut;
      }
    }

    updateImage() {
      const media = this.querySelector('[data-media]');
      const primaryImage = media.querySelector(
        '[data-image-primary]'
      );
      const variantImage = this.variantsImages.find(
        variant => variant.id === this.currentVariant.id
      );

      if (primaryImage.dataset.src === variantImage.image.src) return;

      media.classList.add('is-loading');
      primaryImage.dataset.src = variantImage.image.src;
      primaryImage.srcset = variantImage.image.srcset;
      primaryImage.onload = () => {
        media.classList.remove('is-loading');
      };
    }

    updateBadge() {
      if (!this.querySelector('[data-badges]')) return;

      const badgeSold = this.querySelector('[data-badge-sold]');
      const badgeSale = this.querySelector('[data-badge-sale]');

      this.currentVariant.available
        ? badgeSold.setAttribute('hidden', '')
        : badgeSale.setAttribute('hidden', '');

      if (!this.currentVariant.available) {
        badgeSold.removeAttribute('hidden');
      }

      if (
        this.currentVariant.available &&
        this.currentVariant.compare_at_price >
          this.currentVariant.price
      ) {
        badgeSale.removeAttribute('hidden');
      }
    }

    updateUrl() {
      const url = this.variantsUrl.find(
        variant => variant.id === this.currentVariant.id
      ).url;
      this.querySelector('[data-url]').href = url;
    }

    filterColors() {
      const swatchesPosition = this.querySelector(
        '[data-color-swatch]'
      )?.getAttribute('data-position');

      if (!swatchesPosition) return;

      this.querySelectorAll('[data-color-swatch]').forEach(swatch => {
        const hasAvailableVariants = this.variants.some(
          variant =>
            variant[`option${swatchesPosition}`] === swatch.value &&
            variant.available
        );

        swatch.classList.toggle(
          'is-unavailable',
          !hasAvailableVariants
        );
      });
    }
  }

  customElements.define('card-product', CardProduct);
})();
