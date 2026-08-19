import { LitElement, html, css } from 'lit';
import '../component/login-page/login-form.js';

export class LoginPage extends LitElement {

  static styles = css`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

    :host {
      display: flex;
      min-height: 100vh;
      background: #f3faff;
      font-family: 'Manrope', sans-serif;
      color: #071e27;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .blob-1 {
      position: absolute; top: -10%; left: -10%;
      width: 60vw; height: 60vw; border-radius: 50%;
      background: rgba(151, 243, 226, 0.2);
      filter: blur(80px); pointer-events: none;
    }
    .blob-2 {
      position: absolute; bottom: -10%; right: -10%;
      width: 70vw; height: 70vw; border-radius: 50%;
      background: rgba(212, 227, 255, 0.2);
      filter: blur(100px); pointer-events: none;
    }

    main {
      flex: 1; display: flex; flex-direction: column;
      padding: 24px 16px; position: relative; z-index: 1;
    }

    header {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      margin: 48px 0 32px;
    }

    .logo-box {
      width: 96px; height: 96px; margin-bottom: 24px;
      border-radius: 16px; background: #dbf1fe;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(189, 201, 197, 0.3);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    header h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
    header p { font-size: 14px; color: #3e4946; margin: 0; }

    .form-section {
      width: 100%; max-width: 448px;
      margin: 0 auto; flex: 1;
      display: flex; flex-direction: column;
      justify-content: center;
    }

    .glass-card {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.4);
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.04);
      border-top: 4px solid #00796b;
    }

    .footer-text {
      margin-top: 32px; text-align: center;
      font-size: 14px; color: #3e4946;
    }
    .footer-text a {
      font-size: 16px; font-weight: 600;
      color: #00796b; text-decoration: none;
    }
    .footer-text a:hover { text-decoration: underline; }
  `;

  render() {
    return html`
      <div class="blob-1"></div>
      <div class="blob-2"></div>
      <main>
        <header>
          <div class="logo-box">
            <span class="material-symbols-outlined" style="font-size:48px;color:#00796b;">description</span>
          </div>
          <h1>Docly</h1>
          <p>Secure Document Management</p>
        </header>

        <section class="form-section">
          <div class="glass-card">
            <login-form></login-form>
          </div>
          <div class="footer-text">
            Don't have an account?
            <a href="/register">Register Now</a>
          </div>
        </section>
      </main>
    `;
  }
}
customElements.define("login-page", LoginPage);
