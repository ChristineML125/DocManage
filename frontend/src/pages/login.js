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
      padding: 16px;
      background-image: url('https://lh3.googleusercontent.com/aida/AP1WRLtjY_WdpDiAlhA5N5140tR8pxLQMTwVyKtH2xHCj1w1xOCIb8MxSbLK9fJhdGNSOQi0iiatiy84O4D8biNcfJnDgzjd17PNovABDoeZs1Ikb0-dRUlQ6yaUC3v_i8_u9XX3-G61V6csbw3JLpi9ubNOAl79yAXnU6P-Ljq8ghyHCOry9e9Z5NRW_X-9RXAvbHw3wY928IDUMZ-5pB0PTMAJFlpcP3MTVpjUoRkMp3Wys_EdxKFKjSNzslU');
      background-size: cover;
      background-position: center;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ---------- Screen split: two separate cards (left 60% / right 40%) ---------- */
    .layout {
      width: 100%; max-width: 1280px;
      display: flex; align-items: stretch;
      gap: 48px;
    }

    /* ---------- Left: product intro card (60%) ---------- */
    .intro-panel {
      flex: 0 1 60%;
      min-width: 0;
      padding: 44px 48px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0px 4px 18px rgba(0,0,0,0.08);
    }

    .intro-header h2 {
      font-size: 32px; font-weight: 700; margin: 0 0 6px;
      color: #071e27;
    }
    .intro-tagline {
      font-size: 17px; font-weight: 600; color: #00685f;
      margin: 0 0 16px;
    }
    .intro-desc {
      font-size: 14px; line-height: 1.65; color: #3e4946; margin: 0 0 10px;
      max-width: 640px;
    }

    /* screenshots — drop files into frontend/public/screenshots/
       dashboard.png and document-detail.png to show them */
    .screenshots {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
    }
    .shot-slot {
      border: 2px dashed #9db8b3;
      border-radius: 12px;
      background: #eef7fb;
      min-height: 190px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px;
      color: #5c7a74;
      overflow: hidden;
    }
    .shot-slot.filled { border-style: solid; border-color: transparent; background: none; }
    .shot-slot .material-symbols-outlined { font-size: 34px; color: #7fa39c; }
    .shot-slot p { margin: 0; font-size: 13px; font-weight: 600; }
    .shot-slot img {
      width: 100%; height: 100%;
      min-height: inherit;
      object-fit: cover; object-position: top center;
      display: block;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 18px;
      margin-top: 26px;
    }
    .feature { display: flex; gap: 14px; align-items: flex-start; }
    .feature-icon {
      width: 42px; height: 42px; flex-shrink: 0;
      border-radius: 10px;
      background: #e6f6ff; color: #00685f;
      display: flex; align-items: center; justify-content: center;
    }
    .feature-icon .material-symbols-outlined { font-size: 22px; }
    .feature h3 { font-size: 15px; font-weight: 700; margin: 0 0 2px; color: #071e27; }
    .feature p { font-size: 13px; line-height: 1.55; color: #3e4946; margin: 0; }

    .cta-row { margin-top: 28px; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 48px; padding: 0 28px;
      border: none; border-radius: 8px;
      background: #00685f; color: #fff;
      font-family: inherit; font-size: 15px; font-weight: 700;
      text-decoration: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,94,83,0.18);
      transition: background 0.2s, transform 0.1s;
    }
    .cta-btn:hover { background: #005047; }
    .cta-btn:active { transform: scale(0.98); }
    .cta-btn .material-symbols-outlined { font-size: 20px; }

    /* ---------- Right: login card (40%) ---------- */
    .login-side {
      flex: 1 1 40%;
      display: flex; align-items: center; justify-content: center;
      padding: 44px 36px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0px 4px 18px rgba(0,0,0,0.08);
    }
    .login-card {
      width: 100%; max-width: 430px;
      display: flex; flex-direction: column; gap: 32px;
    }

    .header {
      display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 16px;
    }
    .header img { height: 64px; width: auto; object-fit: contain; }
    .header h1 { font-size: 24px; font-weight: 700; margin: 0; color: #071e27; }
    .header p { font-size: 14px; margin: 0; color: #3e4946; }

    /* ---------- Tablet & below: stacks vertically ---------- */
    @media (max-width: 1100px) {
      .layout { gap: 28px; }
      .intro-panel { padding: 36px; }
      .login-side { padding: 36px 28px; }
    }

    @media (max-width: 960px) {
      :host { align-items: flex-start; padding-top: 24px; }
      .layout { flex-direction: column; max-width: 720px; gap: 24px; }
      .intro-panel { flex: none; padding: 30px 26px; }
      .login-side { flex: none; padding: 30px 26px; }
    }

    @media (max-width: 480px) {
      :host { padding: 12px; padding-top: 16px; }
      .intro-panel { padding: 22px 18px; }
      .login-card { gap: 24px; }
      .header img { height: 52px; }
      .header h1 { font-size: 20px; }
      .screenshots { grid-template-columns: 1fr; gap: 12px; }
      .shot-slot { min-height: 150px; }
      .features { grid-template-columns: 1fr; gap: 16px; margin-top: 20px; }
      .cta-row { margin-top: 22px; }
      .cta-btn { width: 100%; justify-content: center; }
      .login-card { max-width: none; }
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
      <div class="layout">

        <aside class="intro-panel">
          <div class="intro-header">
            <h2>Welcome to DOCLY</h2>
            <p class="intro-tagline">Simple &amp; Organized Document Management</p>
            <p class="intro-desc">
              DOCLY is a document management platform that helps you upload, organize,
              preview, convert, manage versions, and keep track of your documents — all in one place.
            </p>
            <p class="intro-desc">
              Whether you're managing documents for yourself or for a company,
              DOCLY helps make document management simpler and more organized.
            </p>
          </div>

          <div class="screenshots">
            ${this._shotErrors.dashboard ? html`
              <div class="shot-slot">
                <span class="material-symbols-outlined">image</span>
                <p>Dashboard Screenshot</p>
              </div>
            ` : html`
              <div class="shot-slot filled">
                <img
                  src="/screenshots/dashboard.png"
                  alt="DOCLY Dashboard"
                  @error=${() => this._markShot('dashboard')}
                >
              </div>
            `}
            ${this._shotErrors.detail ? html`
              <div class="shot-slot">
                <span class="material-symbols-outlined">image</span>
                <p>Document Detail Screenshot</p>
              </div>
            ` : html`
              <div class="shot-slot filled">
                <img
                  src="/screenshots/document-detail.png"
                  alt="DOCLY Document Detail"
                  @error=${() => this._markShot('detail')}
                >
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
                <p>Convert documents between supported file formats.</p>
              </div>
            </div>

            <div class="feature">
              <div class="feature-icon">
                <span class="material-symbols-outlined">history</span>
              </div>
              <div>
                <h3>Version Control</h3>
                <p>Keep track of different versions of your documents.</p>
              </div>
            </div>

            <div class="feature">
              <div class="feature-icon">
                <span class="material-symbols-outlined">search</span>
              </div>
              <div>
                <h3>Easy Access</h3>
                <p>Preview, search and quickly find the documents you need.</p>
              </div>
            </div>
          </div>

          <div class="cta-row">
            <a href="/register" class="cta-btn">
              <span>Get Started</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </aside>

        <div class="login-side">
          <div class="login-card">
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
