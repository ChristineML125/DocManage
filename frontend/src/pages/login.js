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

    /* ---------- Main panel ---------- */
    .main-panel {
      width: 100%; max-width: 1280px;
      display: flex; align-items: stretch;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0px 4px 18px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    /* ---------- Left: product intro (60%) ---------- */
    .intro-panel {
      flex: 0 1 60%;
      min-width: 0;
      padding: 44px 48px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .intro-header h2 {
      font-size: 28px; font-weight: 700; margin: 0 0 6px;
      color: #071e27;
    }
    .intro-tagline {
      font-size: 16px; font-weight: 600; color: #00685f;
      margin: 0 0 22px;
    }

    .workspaces {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .ws-card {
      border: 1px solid #d9e5e2;
      border-radius: 14px;
      padding: 20px;
      display: flex; flex-direction: column;
      background: #fff;
    }

    .ws-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .ws-icon {
      width: 40px; height: 40px; flex-shrink: 0;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .ws-icon.personal { background: #e6f6ff; color: #00796b; }
    .ws-icon.company { background: #eef7ee; color: #2e7d32; }
    .ws-head h3 { margin: 0; font-size: 17px; font-weight: 700; }

    .ws-tagline {
      font-size: 13.5px; font-weight: 600; color: #00685f;
      margin: 8px 0 4px;
    }
    .ws-desc {
      font-size: 12.5px; line-height: 1.55; color: #3e4946;
      margin: 0 0 12px;
    }

    .ws-features {
      list-style: none;
      margin: 0; padding: 0;
      display: flex; flex-direction: column; gap: 6px;
    }
    .ws-features li {
      display: flex; align-items: flex-start; gap: 7px;
      font-size: 12.5px; line-height: 1.45; color: #071e27;
    }
    .ws-features li .material-symbols-outlined { font-size: 16px; color: #00685f; margin-top: 1px; }

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

    /* ---------- Divider ---------- */
    .divider {
      width: 1px;
      background: #c5d6d0;
    }

    /* ---------- Right: login (40%) ---------- */
    .login-side {
      flex: 1 1 40%;
      display: flex; align-items: center; justify-content: center;
      padding: 44px 36px;
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
      .intro-panel { padding: 36px; }
      .login-side { padding: 36px 28px; }
    }

    @media (max-width: 960px) {
      :host { align-items: flex-start; padding-top: 24px; }
      .main-panel { flex-direction: column; max-width: 720px; }
      .intro-panel { flex: none; padding: 30px 26px; }
      .divider { width: 100%; height: 1px; }
      .login-side { flex: none; padding: 30px 26px; }
    }

    @media (max-width: 480px) {
      :host { padding: 12px; padding-top: 16px; }
      .intro-panel { padding: 22px 18px; }
      .login-card { gap: 24px; max-width: none; }
      .header img { height: 52px; }
      .header h1 { font-size: 20px; }
      .workspaces { grid-template-columns: 1fr; }
      .cta-row { margin-top: 22px; }
      .cta-btn { width: 100%; justify-content: center; }
    }
  `;

  render() {
    return html`
      <div class="main-panel">

        <aside class="intro-panel">
          <div class="intro-header">
            <h2>DOCLY — Document Management Made Simple</h2>
            <p class="intro-tagline">Manage, organize and access your documents in one place.</p>
          </div>

          <div class="workspaces">
            <div class="ws-card">
              <div class="ws-head">
                <div class="ws-icon personal">
                  <span class="material-symbols-outlined">person</span>
                </div>
                <h3>Personal Workspace</h3>
              </div>
              <p class="ws-tagline">Manage your documents your way.</p>
              <p class="ws-desc">For individuals who want to keep, organize and access their own documents.</p>
              <ul class="ws-features">
                <li><span class="material-symbols-outlined">folder</span>Personal document management</li>
                <li><span class="material-symbols-outlined">star</span>Favorites</li>
                <li><span class="material-symbols-outlined">sync_alt</span>File conversion</li>
                <li><span class="material-symbols-outlined">history</span>Document versions</li>
                <li><span class="material-symbols-outlined">auto_awesome</span>AI document summary</li>
              </ul>
            </div>

            <div class="ws-card">
              <div class="ws-head">
                <div class="ws-icon company">
                  <span class="material-symbols-outlined">business</span>
                </div>
                <h3>Company Workspace</h3>
              </div>
              <p class="ws-tagline">Manage documents across your organization.</p>
              <p class="ws-desc">For companies and teams that need one centralized place for shared documents.</p>
              <ul class="ws-features">
                <li><span class="material-symbols-outlined">folder_shared</span>Centralized document management</li>
                <li><span class="material-symbols-outlined">sell</span>Categories &amp; departments</li>
                <li><span class="material-symbols-outlined">group</span>Team document management</li>
                <li><span class="material-symbols-outlined">history</span>Version control</li>
                <li><span class="material-symbols-outlined">receipt_long</span>Document activity / audit logs</li>
                <li><span class="material-symbols-outlined">auto_awesome</span>AI document assistance</li>
              </ul>
            </div>
          </div>

          <div class="cta-row">
            <a href="/register" class="cta-btn">
              <span>Get Started</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </aside>

        <div class="divider" role="presentation"></div>

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
