import { LitElement, html } from 'lit';

// A web-only AdSense slot. It stays invisible until VITE_ADSENSE_PERSONAL_SLOT_ID
// is configured during the frontend build.
export class PersonalAdSlot extends LitElement {
  constructor() {
    super();
    this.slotId = import.meta.env.VITE_ADSENSE_PERSONAL_SLOT_ID || '';
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    if (!this.slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn('AdSense slot could not be loaded.', error);
    }
  }

  render() {
    if (!this.slotId) return html``;

    return html`
      <section aria-label="Advertisement" style="margin: 20px auto; max-width: 1120px; padding: 0 20px;">
        <p style="margin: 0 0 6px; color: #6e7a76; font-size: 11px; text-transform: uppercase; letter-spacing: .08em;">Advertisement</p>
        <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-6223607534334902"
          data-ad-slot="${this.slotId}"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      </section>
    `;
  }
}

customElements.define('personal-ad-slot', PersonalAdSlot);
