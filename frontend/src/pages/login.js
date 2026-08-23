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

    .login-card {
      width: 100%; max-width: 448px;
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

    .meta-footer {
      text-align: center; margin-top: 32px;
      color: #3e4946; opacity: 0.7;
    }
    .meta-footer p { font-size: 11px; margin: 0; }
  `;

  render() {
    return html`
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
      <div class="meta-footer">
      </div>
    `;
  }
}
customElements.define("login-page", LoginPage);
