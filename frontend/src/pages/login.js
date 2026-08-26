import { LitElement, html, css } from 'lit';
import '../component/login-page/login-form.js';

export class LoginPage extends LitElement {

  static styles = css`
    :host {
      display: flex;
      min-height: 100vh;
      background: #f3faff;
      font-family: 'Manrope', sans-serif;
      color: #071e27;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background-image: url('https://lh3.googleusercontent.com/aida/AP1WRLtjY_WdpDiAlhA5N5140tR8pxLQMTwVyKtH2xHCj1w1xOCIb8MxSbLK9fJhdGNSOQi0iiatiy84O4D8biNcfJnDgzjd17PNovABDoeZs1Ikb0-dRUlQ6yaUC3v_i8_u9XX3-G61V6csbw3JLpi9ubNOAl79yAXnU6P-Ljq8ghyHCOry9e9Z5NRW_X-9RXAvbHw3wY928IDUMZ-5pB0PTMAJFlpcP3MTVpjUoRkMp3Wys_EdxKFKjSNzslU');
      background-size: cover;
      background-position: center;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .cards {
      width: 100%; max-width: 1060px;
      display: flex; align-items: stretch;
      gap: 36px;
    }

    .card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    }

    /* ========== Welcome Card ========== */
    .welcome-card {
      flex: 1 1 48%;
      padding: 44px 40px;
      display: flex;
      flex-direction: column;
    }

    .welcome-card h2 {
      font-size: 28px; font-weight: 700; margin: 0 0 6px;
      color: #071e27;
    }
    .welcome-tagline {
      font-size: 15px; font-weight: 600; color: #00685f;
      margin: 0 0 14px;
    }
    .welcome-desc {
      font-size: 13.5px; line-height: 1.6; color: #3e4946;
      margin: 0 0 8px;
    }

    .screenshots {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 20px;
    }
    .shot-slot {
      border: 2px dashed #9db8b3;
      border-radius: 10px;
      background: #eef7fb;
      min-height: 140px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 6px;
      color: #5c7a74;
      overflow: hidden;
    }
    .shot-slot.filled { border-style: solid; border-color: transparent; background: none; }
    .shot-slot .material-symbols-outlined { font-size: 28px; color: #7fa39c; }
    .shot-slot p { margin: 0; font-size: 11px; font-weight: 600; }
    .shot-slot img {
      width: 100%; height: 100%;
      min-height: inherit;
      object-fit: cover; object-position: top center;
      display: block;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-top: 20px;
    }
    .feature { display: flex; gap: 10px; align-items: flex-start; }
    .feature-icon {
      width: 34px; height: 34px; flex-shrink: 0;
      border-radius: 8px;
      background: #e6f6ff; color: #00685f;
      display: flex; align-items: center; justify-content: center;
    }
    .feature-icon .material-symbols-outlined { font-size: 18px; }
    .feature h3 { font-size: 13px; font-weight: 700; margin: 0 0 1px; color: #071e27; }
    .feature p { font-size: 12px; line-height: 1.45; color: #3e4946; margin: 0; }

    .cta-row { margin-top: auto; padding-top: 24px; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 42px; padding: 0 22px;
      border: none; border-radius: 8px;
      background: #00685f; color: #fff;
      font-family: inherit; font-size: 13.5px; font-weight: 700;
      text-decoration: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,94,83,0.18);
      transition: background 0.2s, transform 0.1s;
    }
    .cta-btn:hover { background: #005047; }
    .cta-btn:active { transform: scale(0.98); }
    .cta-btn .material-symbols-outlined { font-size: 18px; }

    /* ========== Login Card ========== */
    .login-card {
      flex: 1 1 48%;
      padding: 44px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .login-inner {
      width: 100%; max-width: 360px;
      display: flex; flex-direction: column; gap: 24px;
    }

    .header {
      display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 12px;
    }
    .header img { height: 56px; width: auto; object-fit: contain; }
    .header h1 { font-size: 22px; font-weight: 700; margin: 0; color: #071e27; }
    .header p { font-size: 13px; margin: 0; color: #3e4946; }

    /* ========== Responsive ========== */
    @media (max-width: 900px) {
      :host { align-items: flex-start; padding-top: 24px; }
      .cards { flex-direction: column; max-width: 480px; margin: 0 auto; }
      .welcome-card { padding: 32px 28px; }
      .login-card { padding: 32px 28px; }
    }

    @media (max-width: 480px) {
      :host { padding: 12px; }
      .welcome-card { padding: 24px 18px; }
      .login-card { padding: 24px 18px; }
      .welcome-card h2 { font-size: 24px; }
      .screenshots { grid-template-columns: 1fr; }
      .shot-slot { min-height: 120px; }
      .features { grid-template-columns: 1fr; }
      .cta-btn { width: 100%; justify-content: center; }
      .login-inner { max-width: none; }
    }
  `;

  static properties = {
    _shotErrors: { state: true },
  };

  constructor() {
    super();
    this._shotErrors = { dashboard: false, detail: false };
  }

  _markShot(key) {
    this._shotErrors = { ...this._shotErrors, [key]: true };
  }

  render() {
    return html`
      <div class="cards">

        <div class="card welcome-card">
          <h2>Welcome to DOCLY</h2>
          <p class="welcome-tagline">Simple &amp; Organized Document Management</p>
          <p class="welcome-desc">
            DOCLY is a document management platform that helps you upload, organize,
            preview, convert, manage versions, and keep track of your documents — all in one place.
          </p>
          <p class="welcome-desc">
            Whether you're managing documents for yourself or for a company,
            DOCLY helps make document management simpler and more organized.
          </p>

          <div class="screenshots">
            ${this._shotErrors.dashboard ? html`
              <div class="shot-slot">
                <span class="material-symbols-outlined">image</span>
                <p>Dashboard Screenshot</p>
              </div>
            ` : html`
              <div class="shot-slot filled">
                <img src="/screenshots/dashboard.png" alt="DOCLY Dashboard"
                  @error=${() => this._markShot('dashboard')}>
              </div>
            `}
            ${this._shotErrors.detail ? html`
              <div class="shot-slot">
                <span class="material-symbols-outlined">image</span>
                <p>Document Detail Screenshot</p>
              </div>
            ` : html`
              <div class="shot-slot filled">
                <img src="/screenshots/document-detail.png" alt="DOCLY Document Detail"
                  @error=${() => this._markShot('detail')}>
              </div>
            `}
          </div>

          <div class="features">
            <div class="feature">
              <div class="feature-icon">
                <span class="material-symbols-outlined">folder</span>
              </div>
              <div>
                <h3>Manage Documents</h3>
                <p>Upload and organize your documents in one place.</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <span class="material-symbols-outlined">sync_alt</span>
              </div>
              <div>
                <h3>Convert Files</h3>
                <p>Convert between supported file formats.</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <span class="material-symbols-outlined">history</span>
              </div>
              <div>
                <h3>Version Control</h3>
                <p>Keep track of different versions.</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <span class="material-symbols-outlined">search</span>
              </div>
              <div>
                <h3>Easy Access</h3>
                <p>Preview, search and quickly find documents.</p>
              </div>
            </div>
          </div>

          <div class="cta-row">
            <a href="/register" class="cta-btn">
              <span>Get Started</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>

        <div class="card login-card">
          <div class="login-inner">
            <div class="header">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcAyGyDga-rQyBFfH9X_WgWBO5cp-YZudDaN5XRWOcnivlP-Pc_vUiR3d6sjBr8WhzBsfnAAxj0nAYocyOHrCKVyrzvdCSm8XxrU7H5PmUiydC6UlrqbjjUCUfxiW4qSHeb3C1JLyen6RgeU9NR-zwhEoSIOK_NbxkaW02zL4L6JIZeLaJjzqQvlkv2c5N4BTAJ5J21lx8ZFPWyIc0OHg5tmFTdTOtzENIEzPZBSZMZ0LS0W4rSucdQZdAzxj285Iw0w" alt="Docly Logo">
              <div>
                <h1>Welcome Back</h1>
                <p>Sign in to access your medical document dashboard</p>
              </div>
            </div>
            <login-form></login-form>
          </div>
        </div>

      </div>
    `;
  }
}
customElements.define("login-page", LoginPage);
