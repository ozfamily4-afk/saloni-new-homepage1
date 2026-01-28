class NewsletterPopup extends ModalDialog {
  constructor() {
    super();
    this.delay = this.dataset.delay * 1000;
    this.closed = getCookie('newsletter-closed');
    this.subscribed = getCookie('newsletter-subscribed');
    this.buttonClose = this.querySelector(
      '#newsletter-popup-close-button'
    );

    this.form = this.querySelector('.js-form');

    if (!!this.form) {
      this.form.addEventListener(
        'submit',
        this.onSubscribe.bind(this)
      );
    }
  }

  connectedCallback() {
    this.buttonClose?.addEventListener('click', this.hide.bind(this));

    window.addEventListener('shopify:section:load', e => {
      if (this.dataset.openInDesignMode === 'true') {
        this.show();
        return;
      }
    });

    if (this.dataset.enable === 'true') {
      setTimeout(() => {
        if (this.closed !== null || this.subscribed !== null) return;
        this.show();
      }, this.delay);
    }
  }

  hide() {
    super.hide();
    setCookie('newsletter-closed', 'true');
  }

  onSubscribe() {
    setCookie('newsletter-subscribed', 'true');
    this.hide();
  }
}

customElements.define('newsletter-popup', NewsletterPopup);
