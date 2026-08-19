import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { registerPersonal, registerCompany } from '../api/userAPI.js';

export class RegisterPage extends LitElement {

  static properties = {
    accountType: { type: String },
    message: { type: String },
    isError: { type: Boolean },
    isSaving: { type: Boolean }
  };

  static styles = css`
    :host {
      display: flex;
      min-height: 100vh;
      background: #f3faff;
      font-family: 'Manrope', sans-serif;
      color: #071e27;
      justify-content: center;
      align-items: center;
      padding: 16px;
    }

    .main-card {
      width: 100%;
      max-width: 1100px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      display: flex;
      overflow: hidden;
      min-height: 600px;
    }

    /* ===== LEFT PANEL (desktop only) ===== */
    .left-panel {
      display: none;
      width: 50%;
      background: #e6f6ff;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px;
      position: relative;
      overflow: hidden;
      border-right: 4px solid #00796b;
    }
    @media (min-width: 1024px) {
      .left-panel { display: flex; }
    }
    .left-content { position: relative; z-index: 1; }
    .brand-title { font-size: 20px; font-weight: 600; margin: 0 0 16px; }
    .brand-desc { font-size: 16px; line-height: 24px; color: #3e4946; max-width: 400px; margin: 0; }
    .brand-footer { display: flex; align-items: center; gap: 12px; color: #3e4946; position: relative; z-index: 1; }
    .brand-footer .label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
    .brand-bg { position: absolute; inset: 0; z-index: 0; opacity: 0.15; background: linear-gradient(135deg, #d5ecf8, #c7dde9, #dbf1fe); }

    /* ===== RIGHT PANEL ===== */
    .right-panel {
      width: 100%;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
    }
    @media (min-width: 640px) {
      .right-panel { padding: 32px 48px; }
    }
    @media (min-width: 1024px) {
      .right-panel { width: 50%; padding: 48px; justify-content: center; }
    }

    /* ===== MOBILE HEADER (hidden on desktop) ===== */
    .mobile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 0;
      margin-bottom: 8px;
      border-bottom: 4px solid #00796b;
    }
    @media (min-width: 1024px) {
      .mobile-header { display: none; }
    }
    .mobile-header .logo {
      width: 64px; height: 64px; border-radius: 50%;
      background: #e6f6ff; display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .mobile-header h1 { font-size: 24px; font-weight: 700; color: #005e53; margin: 0; }
    .mobile-header p { font-size: 14px; color: #3e4946; margin: 4px 0 0; }

    /* ===== DESKTOP HEADER (hidden on mobile) ===== */
    .desktop-header {
      display: none;
      margin-bottom: 32px;
    }
    @media (min-width: 1024px) {
      .desktop-header { display: block; }
    }
    .desktop-header h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 8px; }
    .desktop-header p { font-size: 14px; line-height: 20px; color: #3e4946; margin: 0; }

    /* ===== TOGGLE ===== */
    .toggle-wrap {
      display: flex;
      padding: 4px;
      background: #d5ecf8;
      border-radius: 9999px;
      margin-bottom: 24px;
      position: relative;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
    }
    .toggle-indicator {
      position: absolute;
      top: 4px; bottom: 4px;
      width: calc(50% - 4px);
      background: #fff;
      border-radius: 9999px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
      z-index: 0;
    }
    .toggle-indicator.personal { transform: translateX(4px); }
    .toggle-indicator.company { transform: translateX(calc(100% + 4px)); }
    .toggle-btn {
      flex: 1;
      padding: 8px 16px;
      border: none;
      border-radius: 9999px;
      font-size: 16px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      background: transparent;
      color: #3e4946;
      position: relative;
      z-index: 1;
      transition: color 0.3s;
    }
    .toggle-btn.active { color: #005e53; }

    /* ===== FORM ===== */
    .form-body { flex: 1; display: flex; flex-direction: column; }

    .section-heading {
      font-size: 16px; font-weight: 600; color: #005e53;
      border-bottom: 1px solid #bdc9c5;
      padding-bottom: 8px;
      margin: 16px 0 12px;
    }
    .section-heading:first-child { margin-top: 0; }

    .field { margin-bottom: 12px; }
    .field label {
      display: block;
      font-size: 11px; line-height: 16px; letter-spacing: 0.05em;
      font-weight: 600; color: #3e4946; margin-bottom: 4px;
    }
    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrap .icon {
      position: absolute; left: 12px;
      font-size: 20px; color: #bdc9c5;
      pointer-events: none;
    }
    .input-wrap input {
      width: 100%;
      height: 48px;
      padding: 0 12px 0 44px;
      border: 1px solid #bdc9c5;
      border-radius: 6px;
      font-size: 14px; font-family: inherit;
      color: #071e27;
      background: #fff;
      box-sizing: border-box;
      outline: none;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .input-wrap input::placeholder { color: #6e7a76; }
    .input-wrap input:focus {
      border-color: #00796b;
      box-shadow: 0 0 0 3px rgba(0,121,107,0.12);
    }
    .pw-toggle {
      position: absolute; right: 12px;
      background: none; border: none; cursor: pointer;
      color: #bdc9c5; padding: 4px;
    }
    .pw-toggle:hover { color: #005e53; }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ===== SUBMIT ===== */
    .submit-btn {
      width: 100%; height: 48px;
      margin-top: 16px;
      border: none; border-radius: 6px;
      font-size: 16px; font-weight: 600; font-family: inherit;
      color: #fff; background: #005e53;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,94,83,0.15);
      transition: background 0.2s, transform 0.1s;
      display: flex; justify-content: center; align-items: center; gap: 8px;
    }
    .submit-btn:hover { background: #006b5e; }
    .submit-btn:active { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-btn .arrow { font-size: 20px; }

    .signin-link {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #3e4946;
    }
    .signin-link a {
      font-size: 16px; font-weight: 600;
      color: #005e53; text-decoration: none;
      margin-left: 4px;
      transition: color 0.2s;
    }
    .signin-link a:hover { color: #006b5e; }

    .message {
      margin-top: 12px; padding: 12px;
      border-radius: 8px; font-size: 14px; text-align: center;
    }
    .message.error { background: #ffdad6; color: #93000a; }
    .message.success { background: #dcfce7; color: #166534; }
  `;

  constructor() {
    super();
    this.accountType = 'company';
    this.message = '';
    this.isError = false;
    this.isSaving = false;
  }

  switchType(type) {
    this.accountType = type;
    this.message = '';
  }

  togglePw(inputId) {
    const input = this.renderRoot.querySelector(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.message = '';
    this.isSaving = true;
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));

    try {
      let result;
      if (this.accountType === 'personal') {
        if (!data.userName || !data.email || !data.password) {
          this.message = 'Please fill in all fields.'; this.isError = true; this.isSaving = false; return;
        }
        if (data.password !== data.confirmPassword) {
          this.message = 'Passwords do not match.'; this.isError = true; this.isSaving = false; return;
        }
        result = await registerPersonal({ UserName: data.userName, Email: data.email, Password: data.password });
      } else {
        if (!data.companyName || !data.adminName || !data.adminEmail || !data.password) {
          this.message = 'Please fill in all required fields.'; this.isError = true; this.isSaving = false; return;
        }
        if (data.password !== data.confirmPassword) {
          this.message = 'Passwords do not match.'; this.isError = true; this.isSaving = false; return;
        }
        result = await registerCompany({
          CompanyName: data.companyName,
          CompanyEmail: data.companyEmail || null,
          CompanyPhone: data.companyPhone || null,
          CompanyAddress: data.companyAddress || null,
          AdminName: data.adminName,
          AdminEmail: data.adminEmail,
          Password: data.password
        });
      }

      if (result.success) {
        this.message = result.message || 'Account created! Redirecting to login...';
        this.isError = false;
        setTimeout(() => Router.go('/login'), 2000);
      } else {
        this.message = result.message || 'Registration failed.';
        this.isError = true;
      }
    } catch (err) {
      this.message = err.message || 'Registration failed.';
      this.isError = true;
    } finally {
      this.isSaving = false;
    }
  }

  renderPersonalForm() {
    return html`
      <div class="section-heading">Personal Account</div>
      <div class="field">
        <label>Full Name</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">person</span>
          <input type="text" name="userName" placeholder="Dr. Jane Doe" required>
        </div>
      </div>
      <div class="field">
        <label>Email Address</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">mail</span>
          <input type="email" name="email" placeholder="jane.doe@email.com" required>
        </div>
      </div>
      <div class="field">
        <label>Password</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">lock</span>
          <input type="password" name="password" id="personal-pw" placeholder="••••••••" required>
          <button class="pw-toggle" type="button" @click=${() => this.togglePw('#personal-pw')}>
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
      <div class="field">
        <label>Confirm Password</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">lock_reset</span>
          <input type="password" name="confirmPassword" placeholder="••••••••" required>
        </div>
      </div>
    `;
  }

  renderCompanyForm() {
    return html`
      <div class="section-heading">Company Information</div>
      <div class="field">
        <label>Company Name (Required)</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">business</span>
          <input type="text" name="companyName" placeholder="MedHealth Partners" required>
        </div>
      </div>
      <div class="field">
        <label>Company Email</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">mail</span>
          <input type="email" name="companyEmail" placeholder="contact@medhealth.com">
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Phone (Optional)</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">call</span>
            <input type="tel" name="companyPhone" placeholder="+60 12-345 6789">
          </div>
        </div>
        <div class="field">
          <label>Address (Optional)</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">location_on</span>
            <input type="text" name="companyAddress" placeholder="City, State">
          </div>
        </div>
      </div>

      <div class="section-heading">Admin Account</div>
      <div class="field">
        <label>Admin Name (Required)</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">person</span>
          <input type="text" name="adminName" placeholder="John Smith" required>
        </div>
      </div>
      <div class="field">
        <label>Admin Email (Required)</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">work</span>
          <input type="email" name="adminEmail" placeholder="admin@medhealth.com" required>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Password (Required)</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">lock</span>
            <input type="password" name="password" id="company-pw" placeholder="••••••••" required>
            <button class="pw-toggle" type="button" @click=${() => this.togglePw('#company-pw')}>
              <span class="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </div>
        <div class="field">
          <label>Confirm (Required)</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">lock_reset</span>
            <input type="password" name="confirmPassword" placeholder="••••••••" required>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="main-card">
        <section class="left-panel">
          <div class="left-content">
            <h2 class="brand-title">Docly</h2>
            <p class="brand-desc">Organize, manage, and secure all your important documents in one centralized platform. Upload, track versions, and access files anytime, anywhere.</p>
          </div>
          <div class="brand-bg"></div>
          <div class="brand-footer">
            <span class="material-symbols-outlined">shield</span>
            <span class="label">Secure & Reliable Document Management</span>
          </div>
        </section>

        <section class="right-panel">
          <div class="mobile-header">
            <div class="logo">
              <span class="material-symbols-outlined" style="font-size:36px;color:#00796b;">description</span>
            </div>
            <h1>Docly</h1>
            <p>Secure Document Management</p>
          </div>

          <div class="desktop-header">
            <h2>Create Account</h2>
            <p>Join Docly to manage your clinical workflow securely.</p>
          </div>

          <div class="toggle-wrap">
            <div class="toggle-indicator ${this.accountType}"></div>
            <button type="button" class="toggle-btn ${this.accountType === 'personal' ? 'active' : ''}"
              @click=${() => this.switchType('personal')}>Personal</button>
            <button type="button" class="toggle-btn ${this.accountType === 'company' ? 'active' : ''}"
              @click=${() => this.switchType('company')}>Company</button>
          </div>

          <form class="form-body" @submit=${this.handleSubmit}>
            ${this.accountType === 'personal' ? this.renderPersonalForm() : this.renderCompanyForm()}

            <button type="submit" class="submit-btn" ?disabled=${this.isSaving}>
              <span>${this.isSaving ? 'Creating Account...' : 'Create Account'}</span>
              ${!this.isSaving ? html`<span class="material-symbols-outlined arrow">arrow_forward</span>` : ''}
            </button>

            ${this.message ? html`<div class="message ${this.isError ? 'error' : 'success'}">${this.message}</div>` : ''}

            <div class="signin-link">
              Already registered?<a href="/login">Sign In</a>
            </div>
          </form>
        </section>
      </div>
    `;
  }
}

customElements.define('register-page', RegisterPage);
