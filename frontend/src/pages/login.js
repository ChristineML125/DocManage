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

    .layout {
      width: 100%; max-width: 1280px;
      display: flex; align-items: center; justify-content: center;
      gap: 40px;
    }

    /* ---------- Left: product intro (landing) ---------- */
    .intro-panel {
      flex: 2 1 520px;
      min-width: 0;
      max-width: 820px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0px 2px 12px rgba(0,0,0,0.06);
      padding: 40px;
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

    /* screenshot placeholders — replace inner slot content with <img> when real shots arrive */
    .screenshots {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
    }
    .shot-slot {
      border: 2px dashed #9db8b3;
      border-radius: 12px;
      background: rgba(230, 246, 255, 0.55);
      min-height: 190px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px;
      color: #5c7a74;
      overflow: hidden;
    }
    .shot-slot .material-symbols-outlined { font-size: 34px; color: #7fa39c; }
    .shot-slot p { margin: 0; font-size: 13px; font-weight: 600; }
    .shot-slot img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 18px;
      margin-top: 24px;
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

    /* ---------- Right: login card ---------- */
    .login-card {
      flex: 1 1 400px;
      max-width: 480px;
      background: #fff; border-radius: 12px;
      box-shadow: 0px 2px 8px rgba(0,0,0,0.04);
      padding: 40px 32px;
      display: flex; flex-direction: column; gap: 32px;
      position: relative; overflow: hidden;
    }

    .accent-bar {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 4px; background: #00685f;
    }

    .header {
      display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 16px;
    }
    .header img { height: 64px; width: auto; object-fit: contain; }
    .header h1 { font-size: 24px; font-weight: 700; margin: 0; color: #071e27; }
    .header p { font-size: 14px; margin: 0; color: #3e4946; }

    /* ---------- Tablet & below: intro stacks above login form ---------- */
    @media (max-width: 960px) {
      :host { align-items: flex-start; padding-top: 24px; }
      .layout { flex-direction: column; gap: 24px; }
      .intro-panel,
      .login-card { width: 100%; max-width: 560px; }
    }

    @media (max-width: 480px) {
      :host { padding: 12px; padding-top: 16px; }
      .layout { gap: 16px; }
      .login-card { padding: 28px 20px; gap: 24px; }
      .header img { height: 52px; }
      .header h1 { font-size: 20px; }
      .intro-panel { padding: 22px 18px; border-radius: 12px; }
      .intro-header h2 { font-size: 24px; }
      .intro-tagline { font-size: 15px; }
      .screenshots { grid-template-columns: 1fr; gap: 12px; }
      .shot-slot { min-height: 150px; }
      .features { grid-template-columns: 1fr; gap: 16px; margin-top: 20px; }
      .cta-row { margin-top: 22px; }
      .cta-btn { width: 100%; justify-content: center; }
    }
  `;

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
            <div class="shot-slot">
              <span class="material-symbols-outlined">image</span>
              <p>Dashboard Screenshot</p>
            </div>
            <div class="shot-slot">
              <span class="material-symbols-outlined">image</span>
              <p>Document Detail Screenshot</p>
            </div>
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

        <div class="login-card">
          <div class="accent-bar"></div>
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
    `;
  }
}
customElements.define("login-page", LoginPage);
