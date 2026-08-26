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

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ===== Screen split: two separate cards (left 60% / right 40%) ===== */
    .layout {
      width: 100%; max-width: 1280px;
      display: flex; align-items: stretch;
      gap: 0;
    }

    /* ===== Left: workspace intro card (60%) ===== */
    .intro-panel {
      flex: 0 1 60%;
      min-width: 0;
      padding: 44px 48px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0px 4px 18px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      justify-content: center;
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
    .ws-features li .material-symbols-outlined {
      font-size: 15px; color: #00685f; flex-shrink: 0; margin-top: 1px;
    }

    .cta-row { margin-top: 26px; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 46px; padding: 0 24px;
      border: none; border-radius: 8px;
      background: #e6f6ff; color: #00685f;
      font-family: inherit; font-size: 14px; font-weight: 700;
      text-decoration: none; cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .cta-btn:hover { background: #d3edfa; }
    .cta-btn:active { transform: scale(0.98); }
    .cta-btn .material-symbols-outlined { font-size: 19px; }

    /* ===== Divider ===== */
    .divider {
      flex: 0 0 1px;
      align-self: stretch;
      border-left: 1px solid #c5d6d0;
    }

    /* ===== Right: register form card (40%) ===== */
    .form-side {
      flex: 1 1 40%;
      display: flex; align-items: center; justify-content: center;
      padding: 40px 36px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0px 4px 18px rgba(0,0,0,0.08);
    }
    .form-card {
      width: 100%; max-width: 430px;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header img { height: 56px; width: auto; object-fit: contain; margin-bottom: 10px; }
    .header h1 { font-size: 23px; font-weight: 700; margin: 0 0 6px; color: #071e27; }
    .header p { font-size: 13.5px; margin: 0; color: #3e4946; }

    /* ===== Workspace selection (compact) ===== */
    .choose-label {
      font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
      color: #071e27; margin-bottom: 10px;
    }

    .type-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .type-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 14px 12px;
      border: 2px solid #dce9e6;
      border-radius: 10px;
      background: #fff;
      font-family: inherit;
      color: #071e27;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .type-card:hover { border-color: #9ccfc7; }
    .type-card.selected {
      border-color: #00685f;
      background: #f2fbf9;
      box-shadow: 0 0 0 3px rgba(0,104,95,0.12);
    }
    .type-card .check {
      position: absolute; top: 8px; right: 8px;
      font-size: 18px; color: #00685f;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .type-card.selected .check { opacity: 1; }
    .type-card .type-icon { font-size: 26px; color: #00685f; margin-bottom: 4px; }
    .type-card h3 { margin: 0 0 3px; font-size: 14px; font-weight: 700; }
    .type-card p { margin: 0; font-size: 11.5px; line-height: 1.45; color: #3e4946; }

    .type-note {
      display: flex; align-items: flex-start; gap: 6px;
      font-size: 11.5px; line-height: 1.5; color: #5c7a74;
      margin-bottom: 18px;
    }
    .type-note .material-symbols-outlined { font-size: 15px; flex-shrink: 0; margin-top: 1px; color: #00796b; }

    /* ===== FORM ===== */
    .section-heading {
      font-size: 15px; font-weight: 600; color: #00685f;
      border-bottom: 1px solid #bdc9c5;
      padding-bottom: 8px;
      margin: 16px 0 12px;
    }
    .section-heading:first-of-type { margin-top: 0; }

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
      height: 46px;
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
    .pw-toggle:hover { color: #00685f; }

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
      color: #fff; background: #00685f;
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
      font-size: 15px; font-weight: 600;
      color: #00685f; text-decoration: none;
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

    /* ===== Tablet & below: stacks vertically ===== */
    @media (max-width: 1100px) {
      .intro-panel { padding: 36px; }
      .form-side { padding: 36px 28px; }
    }

    @media (max-width: 960px) {
      :host { align-items: flex-start; padding-top: 24px; }
      .layout { flex-direction: column; max-width: 720px; }
      .intro-panel { flex: none; padding: 30px 26px; }
      .divider { flex: 0 0 1px; width: 100%; align-self: auto; border-left: none; border-top: 1px solid #c5d6d0; }
      .form-side { flex: none; padding: 30px 26px; }
    }

    @media (max-width: 640px) {
      .workspaces { grid-template-columns: 1fr; gap: 14px; }
      .intro-header h2 { font-size: 23px; }
      .intro-tagline { font-size: 15px; }
    }

    @media (max-width: 480px) {
      :host { padding: 12px; padding-top: 16px; }
      .intro-panel { padding: 22px 18px; }
      .form-card { max-width: none; }
      .header img { height: 50px; }
      .header h1 { font-size: 20px; }
      .type-cards { grid-template-columns: 1fr; }
      .field-row { grid-template-columns: 1fr; gap: 0; }
      .cta-btn { width: 100%; justify-content: center; }
    }
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
      <div class="section-heading">Personal Workspace</div>
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
          <input type="text" name="companyName" placeholder="Enter company name" required>
        </div>
      </div>
      <div class="field">
        <label>Company Email</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">mail</span>
          <input type="email" name="companyEmail" placeholder="company@email.com">
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Phone (Optional)</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">call</span>
            <input type="tel" name="companyPhone" placeholder="Phone number">
          </div>
        </div>
        <div class="field">
          <label>Address (Optional)</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">location_on</span>
            <input type="text" name="companyAddress" placeholder="Company address">
          </div>
        </div>
      </div>

      <div class="section-heading">Admin Account</div>
      <div class="field">
        <label>Admin Name (Required)</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">person</span>
          <input type="text" name="adminName" placeholder="Admin full name" required>
        </div>
      </div>
      <div class="field">
        <label>Admin Email (Required)</label>
        <div class="input-wrap">
          <span class="icon material-symbols-outlined">work</span>
          <input type="email" name="adminEmail" placeholder="admin@email.com" required>
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

  renderPersonalWorkspaceCard() {
    return html`
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
    `;
  }

  renderCompanyWorkspaceCard() {
    return html`
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
    `;
  }

  render() {
    return html`
      <div class="layout">

        <aside class="intro-panel">
          <div class="intro-header">
            <h2>DOCLY — Document Management Made Simple</h2>
            <p class="intro-tagline">Manage, organize and access your documents in one place.</p>
          </div>

          <div class="workspaces">
            ${this.renderPersonalWorkspaceCard()}
            ${this.renderCompanyWorkspaceCard()}
          </div>

          <div class="cta-row">
            <a href="/login" class="cta-btn">
              <span>Already have an account? Sign In</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </aside>

        <div class="divider" role="presentation"></div>

        <div class="form-side">
          <div class="form-card">
            <div class="header">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcAyGyDga-rQyBFfH9X_WgWBO5cp-YZudDaN5XRWOcnivlP-Pc_vUiR3d6sjBr8WhzBsfnAAxj0nAYocyOHrCKVyrzvdCSm8XxrU7H5PmUiydC6UlrqbjjUCUfxiW4qSHeb3C1JLyen6RgeU9NR-zwhEoSIOK_NbxkaW02zL4L6JIZeLaJjzqQvlkv2c5N4BTAJ5J21lx8ZFPWyIc0OHg5tmFTdTOtzENIEzPZBSZMZ0LS0W4rSucdQZdAzxj285Iw0w" alt="Docly Logo">
              <h1>Create your DOCLY account</h1>
              <p>Choose your workspace to get started.</p>
            </div>

            <div class="choose-label">Choose your workspace</div>
            <div class="type-cards">
              <button type="button"
                class="type-card ${this.accountType === 'personal' ? 'selected' : ''}"
                @click=${() => this.switchType('personal')}>
                <span class="check material-symbols-outlined">check_circle</span>
                <span class="type-icon material-symbols-outlined">person</span>
                <h3>Personal Workspace</h3>
                <p>For managing your own documents.</p>
              </button>
              <button type="button"
                class="type-card ${this.accountType === 'company' ? 'selected' : ''}"
                @click=${() => this.switchType('company')}>
                <span class="check material-symbols-outlined">check_circle</span>
                <span class="type-icon material-symbols-outlined">business</span>
                <h3>Company Workspace</h3>
                <p>For managing documents within a team or organization.</p>
              </button>
            </div>
            <div class="type-note">
              <span class="material-symbols-outlined">info</span>
              <span>Your account type determines the features and document environment available to you.</span>
            </div>

            <form @submit=${this.handleSubmit}>
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
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('register-page', RegisterPage);
