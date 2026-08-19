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
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ===== MOBILE (default) ===== */
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

    .mobile-wrapper {
      flex: 1; display: flex; flex-direction: column;
      padding: 24px 16px; position: relative; z-index: 1;
    }

    .mobile-header {
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
    .mobile-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
    .mobile-header p { font-size: 14px; color: #3e4946; margin: 0; }

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

    .mobile-footer {
      margin-top: 32px; text-align: center;
      font-size: 14px; color: #3e4946;
    }
    .mobile-footer a {
      font-size: 16px; font-weight: 600;
      color: #00796b; text-decoration: none;
    }
    .mobile-footer a:hover { text-decoration: underline; }

    /* ===== DESKTOP ===== */
    .desktop-wrapper {
      display: none;
      flex: 1; min-height: 100vh;
    }

    @media (min-width: 768px) {
      .mobile-wrapper { display: none; }
      .desktop-wrapper { display: flex; }
    }

    .left-panel {
      width: 60%; background: #e6f6ff;
      display: flex; flex-direction: column;
      justify-content: space-between;
      padding: 48px; position: relative;
      overflow: hidden;
    }
    .left-bg {
      position: absolute; inset: 0; z-index: 0;
      opacity: 0.15;
      background: linear-gradient(135deg, #d5ecf8, #c7dde9, #dbf1fe);
    }
    .left-content { position: relative; z-index: 1; max-width: 520px; }
    .left-content h1 {
      font-size: 24px; font-weight: 700;
      color: #005e53; margin: 0 0 24px;
      line-height: 1.3;
    }
    .left-content p {
      font-size: 16px; line-height: 24px;
      color: #3e4946; margin: 0;
    }
    .left-logo {
      height: 64px; width: auto; margin-bottom: 32px;
      object-fit: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
    }
    .left-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(243,250,255,0.8);
      backdrop-filter: blur(8px);
      border: 1px solid #bdc9c5;
      border-radius: 9999px;
      padding: 8px 16px;
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #3e4946;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .right-panel {
      width: 40%;
      background: #fff;
      display: flex; flex-direction: column;
      justify-content: center;
      padding: 64px;
      box-shadow: -12px 0 24px -12px rgba(0,0,0,0.05);
      z-index: 20; position: relative;
    }
    .right-inner { width: 100%; max-width: 448px; margin: 0 auto; }
    .right-header { margin-bottom: 40px; }
    .right-header h2 {
      font-size: 24px; font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 8px;
    }
    .right-header p {
      font-size: 14px; line-height: 20px;
      color: #3e4946; margin: 0;
    }
    .desktop-footer {
      margin-top: 32px; text-align: center;
      font-size: 14px; color: #3e4946;
    }
    .desktop-footer a {
      font-weight: 600; color: #005e53;
      text-decoration: none; margin-left: 4px;
    }
    .desktop-footer a:hover { text-decoration: underline; }
  `;

  render() {
    return html`
      <div class="blob-1"></div>
      <div class="blob-2"></div>

      <!-- ===== MOBILE LAYOUT ===== -->
      <div class="mobile-wrapper">
        <header class="mobile-header">
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
          <div class="mobile-footer">
            Don't have an account?
            <a href="/register">Register Now</a>
          </div>
        </section>
      </div>

      <!-- ===== DESKTOP LAYOUT ===== -->
      <div class="desktop-wrapper">
        <section class="left-panel">
          <div class="left-bg"></div>
          <div class="left-content" style="position:relative;z-index:1;">
            <img class="left-logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHFBTj1EpVktIZuBIovkZaJe7_3HrtW24UrtV8rXcM3YRYUNKAlvXL_WX-olhz1J172aEKxy2mApsWHZKHW0PSINZCEKxqZE84y20KdW-bIraT93aLJdNMI0VxArjVOq4HHNfl9IFMOEGF6kAJ7EWv6UCqeEQTZIsGr2TSBBwEqau6cTqKVCRaj4B8PXYZ5wwvBLziGcgwxRn_BxPRsJVeTyDmaP7mYRCViFi_YwKWUNSISkoKfiYXPNUXjwNE1e0Ufg" alt="Docly Logo">
            <h1>Secure Medical Archiving.</h1>
            <p>Streamline your administrative workflow with our professional platform designed for high-stakes clinical data management.</p>
          </div>
          <div style="position:relative;z-index:1;">
            <div class="left-badge">
              <span class="material-symbols-outlined" style="font-size:18px;">health_and_safety</span>
              HIPAA Compliant Infrastructure
            </div>
          </div>
        </section>

        <section class="right-panel">
          <div class="right-inner">
            <div class="right-header">
              <h2>Sign In to Docly</h2>
              <p>Manage your clinical workflow securely.</p>
            </div>
            <login-form></login-form>
            <div class="desktop-footer">
              Don't have an account?<a href="/register">Register Now</a>
            </div>
          </div>
        </section>
      </div>
    `;
  }
}
customElements.define("login-page", LoginPage);
