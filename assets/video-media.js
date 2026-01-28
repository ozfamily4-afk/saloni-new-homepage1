(() => {
  if (customElements.get('video-media')) {
    return;
  }

  class VideoMedia extends HTMLElement {
    constructor() {
      super();
      this.video = this.querySelector('video');
      this.button = this.querySelector('button[type="button"]')
    }

    connectedCallback() {
      this.video.addEventListener(
        'click',
        this.togglePlayback.bind(this)
      );
    }

    togglePlayback() {
      this.button?.setAttribute('hidden', '');

      if (this.video.paused) {
        this.video.controls = true
      }

      if (Shopify.designMode) {
        if (this.video.paused) {
          this.video.play();
        } else {
          this.video.pause();
        }
      }
    }
  }

  customElements.define('video-media', VideoMedia);
})();
