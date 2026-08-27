import { LitElement, html, css } from 'lit';
import '../component/login-page/login-form.js';

export class LoginPage extends LitElement {

  static styles = css`
    :host {
      display: flex;
      min-height: 100vh;
      font-family: 'Manrope', sans-serif;
      color: #071e27;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ---------- Layout ---------- */
    .layout {
      display: flex;
      width: 100%;
      min-height: 100vh;
    }

    /* ---------- Left: Welcome (60%) — GREEN ---------- */
    .welcome-side {
      flex: 0 0 60%;
      padding: 64px 68px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      background: #00685f;
    }

    .welcome-side h2 {
      font-size: 38px; font-weight: 700; margin: 0 0 10px;
      color: #ffffff;
    }
    .welcome-tagline {
      font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.9);
      margin: 0 0 20px;
    }
    .welcome-desc {
      font-size: 16px; line-height: 1.75; color: rgba(255,255,255,0.85);
      margin: 0 0 12px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 32px;
    }
    .feature { display: flex; gap: 14px; align-items: flex-start; }
    .feature-icon {
      width: 44px; height: 44px; flex-shrink: 0;
      border-radius: 10px;
      background: rgba(255,255,255,0.15); color: #ffffff;
      display: flex; align-items: center; justify-content: center;
    }
    .feature-icon .material-symbols-outlined { font-size: 23px; }
    .feature h3 { font-size: 15.5px; font-weight: 700; margin: 0 0 3px; color: #ffffff; }
    .feature p { font-size: 14px; line-height: 1.55; color: rgba(255,255,255,0.85); margin: 0; }

    .cta-row { margin-top: 36px; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 46px; padding: 0 26px;
      border: 2px solid rgba(255,255,255,0.6); border-radius: 8px;
      background: transparent; color: #ffffff;
      font-family: inherit; font-size: 15px; font-weight: 700;
      text-decoration: none; cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .cta-btn:hover { background: rgba(255,255,255,0.1); }
    .cta-btn:active { transform: scale(0.98); }
    .cta-btn .material-symbols-outlined { font-size: 19px; }

    /* ---------- Divider ---------- */
    .divider {
      width: 1px;
      background: #e0e8e6;
    }

    /* ---------- Right: Login (40%) — WHITE ---------- */
    .login-side {
      flex: 1 1 40%;
      padding: 64px 56px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }

    .login-form-card {
      width: 100%; max-width: 400px;
      border: 1px solid #dce9e6;
      border-radius: 12px;
      padding: 36px 32px;
      display: flex; flex-direction: column; gap: 28px;
      background: #ffffff;
    }

    .header {
      display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 16px;
    }
    .header img { height: 64px; width: auto; object-fit: contain; }
    .header h1 { font-size: 26px; font-weight: 700; margin: 0; color: #071e27; }
    .header p { font-size: 14px; margin: 0; color: #3e4946; }

    /* ---------- Responsive ---------- */
    @media (max-width: 900px) {
      .layout { flex-direction: column; }
      .welcome-side { flex: none; padding: 40px 36px; }
      .login-side { flex: none; padding: 40px 36px; }
      .divider { width: 100%; height: 1px; }
    }

    @media (max-width: 480px) {
      .welcome-side { padding: 28px 20px; }
      .login-side { padding: 28px 20px; }
      .welcome-side h2 { font-size: 28px; }
      .features { grid-template-columns: 1fr; }
      .cta-btn { width: 100%; justify-content: center; }
      .login-form-card { max-width: none; }
    }
  `;

  render() {
    return html`
      <div class="layout">

        <div class="welcome-side">
          <h2>Welcome to Dovra</h2>
          <p class="welcome-tagline">Simple &amp; Organized Document Management</p>
          <p class="welcome-desc">
            Dovra is a document management platform that helps you upload, organize,
            preview, convert, manage versions, and keep track of your documents — all in one place.
          </p>
          <p class="welcome-desc">
            Whether you're managing documents for yourself or for a company,
            Dovra helps make document management simpler and more organized.
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

        <div class="divider" role="presentation"></div>

        <div class="login-side">
          <div class="login-form-card">
            <div class="header">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcAyGyDga-rQyBFfH9X_WgWBO5cp-YZudDaN5XRWOcnivlP-Pc_vUiR3d6sjBr8WhzBsfnAAxj0nAYocyOHrCKVyrzvdCSm8XxrU7H5PmUiydC6UlrqbjjUCUfxiW4qSHeb3C1JLyen6RgeU9NR-zwhEoSIOK_NbxkaW02zL4L6JIZeLaJjzqQvlkv2c5N4BTAJ5J21lx8ZFPWyIc0OHg5tmFTdTOtzENIEzPZBSZMZ0LS0W4rSucdQZdAzxj285Iw0w" alt="Dovra Logo">
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
