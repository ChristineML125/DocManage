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

    .layout {
      width: 100%; max-width: 1200px;
      display: flex; align-items: stretch;
    }

    /* ---------- Left: Welcome (60%) ---------- */
    .welcome-side {
      flex: 0 0 60%;
      padding: 56px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .welcome-side h2 {
      font-size: 34px; font-weight: 700; margin: 0 0 8px;
      color: #071e27;
    }
    .welcome-tagline {
      font-size: 17px; font-weight: 600; color: #00685f;
      margin: 0 0 18px;
    }
    .welcome-desc {
      font-size: 15px; line-height: 1.7; color: #3e4946;
      margin: 0 0 10px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
      margin-top: 28px;
    }
    .feature { display: flex; gap: 14px; align-items: flex-start; }
    .feature-icon {
      width: 40px; height: 40px; flex-shrink: 0;
      border-radius: 10px;
      background: #e6f6ff; color: #00685f;
      display: flex; align-items: center; justify-content: center;
    }
    .feature-icon .material-symbols-outlined { font-size: 21px; }
    .feature h3 { font-size: 14.5px; font-weight: 700; margin: 0 0 2px; color: #071e27; }
    .feature p { font-size: 13.5px; line-height: 1.5; color: #3e4946; margin: 0; }

    .cta-row { margin-top: auto; padding-top: 28px; }
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

    /* ---------- Divider ---------- */
    .divider {
      width: 1px;
      background: #c5d6d0;
      box-shadow: 0 0 8px rgba(0,0,0,0.06);
    }

    /* ---------- Right: Login (40%) ---------- */
    .login-side {
      flex: 1 1 40%;
      padding: 56px 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .login-inner {
      width: 100%; max-width: 400px;
      display: flex; flex-direction: column; gap: 28px;
    }

    .header {
      display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 16px;
    }
    .header img { height: 64px; width: auto; object-fit: contain; }
    .header h1 { font-size: 26px; font-weight: 700; margin: 0; color: #071e27; }
    .header p { font-size: 14.5px; margin: 0; color: #3e4946; }

    /* ---------- Responsive ---------- */
    @media (max-width: 900px) {
      .welcome-side { padding: 40px 36px; }
      .login-side { padding: 40px 36px; }
    }

    @media (max-width: 768px) {
      :host { align-items: flex-start; padding-top: 24px; }
      .layout { flex-direction: column; max-width: 560px; margin: 0 auto; }
      .welcome-side { flex: none; padding: 32px 28px; }
      .divider { width: 100%; height: 1px; }
      .login-side { flex: none; padding: 32px 28px; }
    }

    @media (max-width: 480px) {
      :host { padding: 14px; }
      .welcome-side { padding: 26px 20px; }
      .login-side { padding: 26px 20px; }
      .welcome-side h2 { font-size: 26px; }
      .features { grid-template-columns: 1fr; }
      .cta-btn { width: 100%; justify-content: center; }
      .login-inner { max-width: none; }
    }
  `;

  render() {
    return html`
      <div class="layout">

        <div class="login-side">
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

        <div class="divider" role="presentation"></div>

        <div class="welcome-side">
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

          <div class="features">
            <div class="feature">
              <div class="feature-icon"><span class="material-symbols-outlined">folder</span></div>
              <div><h3>Manage Documents</h3><p>Upload and organize your documents in one place.</p></div>
            </div>
            <div class="feature">
              <div class="feature-icon"><span class="material-symbols-outlined">sync_alt</span></div>
              <div><h3>Convert Files</h3><p>Convert between supported file formats.</p></div>
            </div>
            <div class="feature">
              <div class="feature-icon"><span class="material-symbols-outlined">history</span></div>
              <div><h3>Version Control</h3><p>Keep track of different versions.</p></div>
            </div>
            <div class="feature">
              <div class="feature-icon"><span class="material-symbols-outlined">search</span></div>
              <div><h3>Easy Access</h3><p>Preview, search and quickly find documents.</p></div>
            </div>
          </div>

          <div class="cta-row">
            <a href="/register" class="cta-btn">
              <span>Get Started</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>

      </div>
    `;
  }
}
customElements.define("login-page", LoginPage);
