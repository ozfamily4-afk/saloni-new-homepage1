(() => {
  if (customElements.get("gift-card-recipient-form")) {
    return;
  }

  class GiftCardRecipientForm extends HTMLElement {
    constructor() {
      super();
      this.querySelector("[data-checker]").addEventListener(
        "click",
        this.cleanFields.bind(this)
      );
    }

    cleanFields() {
      this.querySelector("[data-recipient-fields]")
        .querySelectorAll("*[id^=Recipient]")
        .forEach((field) => (field.value = ""));
    }
  }

  customElements.define("gift-card-recipient-form", GiftCardRecipientForm);
})();
