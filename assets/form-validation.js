if (!customElements.get('form-validation')) {
  class FormValidation extends HTMLElement {
    constructor() {
      super();
      this.form = null;
    }

    // İlgili input'un hata span'ını bul (wrapper içinde, form-row içinde veya hemen sonraki kardeşte)
    getErrorSpan(input) {
  // 0) Özel wrapper: .error-slot
  const slot = input.closest('.error-slot');
  if (slot) {
    const s = slot.querySelector('[data-error]');
    if (s) return s;
  }

  // 1) text-input snippet'ının ürettiği wrapper
  const field = input.closest('.form__field') || input.parentElement;
  let span = field ? field.querySelector('[data-error]') : null;

  // 2) wrapper'ın hemen sonraki kardeşi
  if (!span && field && field.nextElementSibling && field.nextElementSibling.matches?.('[data-error]')) {
    span = field.nextElementSibling;
  }

  // 3) aynı satırda varsa
  if (!span) {
    const row = field ? field.closest('.form-row') : input.closest('.form-row');
    if (row) span = row.querySelector('[data-error]');
  }
  return span || null;
}


    setErrorMessage(input) {
      const span = this.getErrorSpan(input);
      if (!span) return;

      let msg = '';
      const v = input.validity;

      if (v.valueMissing) {
        msg = 'This field is required';
      } else if (v.typeMismatch && input.type === 'email') {
        msg = 'Please enter a valid email address';
            } else if (v.patternMismatch) {
        // ZIP ve Phone için özel mesajlar
        if (input.id === 'ContactForm-zip' || input.name === 'contact[Zip]') {
          msg = 'Enter 5 digits or ZIP+4 (e.g., 22102 or 22102-1234)';
        } else if (input.id === 'ContactForm-phone' || input.name === 'contact[Phone]') {
          msg = 'Enter 10-digit US phone number (numbers only, e.g., 5551234567)';
        } else {
          msg = 'Please match the requested format';
        }
      } else if (v.tooShort) {
        msg = `Please lengthen to at least ${input.minLength} characters`;
      } else if (v.tooLong) {
        msg = `Please shorten to ${input.maxLength} characters`;
      }

      span.textContent = msg;
      span.classList.toggle('hidden', input.validity.valid);
      span.classList.toggle('has-error', !input.validity.valid);
    }

    setFieldValidity(input) {
      input.setAttribute('aria-invalid', String(!input.validity.valid));
      input.classList.toggle('has-error', !input.validity.valid);
      this.setErrorMessage(input);
    }

    normalizeBeforeValidate() {
      // Baş/son boşlukları temizle (özellikle email/zip)
      const toTrim = ['text', 'email', 'tel', 'search', 'url', 'password'];
      for (const el of this.form.elements) {
        if (!el || !el.name) continue;
        if (toTrim.includes(el.type)) el.value = el.value.trim();
      }
    }

    handleSubmit = (event) => {
      event.preventDefault();
      this.normalizeBeforeValidate();
      const isValid = this.form.reportValidity();
      if (isValid) this.form.submit();
    };

    setEventHandlers() {
      for (const input of this.form.elements) {
        if (!input || !input.willValidate) continue;
        if (input.hasAttribute('data-no-validate')) continue;

        input.addEventListener('invalid', (e) => {
          e.preventDefault(); // native tooltip'i bastır
          this.setFieldValidity(input);
        });

        ['input', 'blur', 'change'].forEach((evt) => {
          input.addEventListener(evt, () => {
              if (
              input.type === 'email' ||
              input.id?.includes('zip') ||
              input.id?.includes('phone')
            ) {
              input.value = input.value.trim();
            }

            this.setFieldValidity(input);
          });
        });
      }
    }

    connectedCallback() {
      this.form = this.querySelector('form');
      if (!this.form) return;

      this.form.addEventListener('submit', this.handleSubmit);
      this.setEventHandlers();
    }
  }

  customElements.define('form-validation', FormValidation);
}