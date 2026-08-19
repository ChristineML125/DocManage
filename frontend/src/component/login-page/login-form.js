import { LitElement, html, css } from 'lit';
import { loginUser, requestPasswordReset } from '../../api/userAPI.js';
import { Router } from '@vaadin/router';

export class LoginForm extends LitElement {

  static properties = {
    loginType: { type: String },
    username: { type: String },
    email: { type: String },
    password: { type: String },
    rememberMe: { type: Boolean },
    loading: { type: Boolean },
    errorMsg: { type: String },
    resetMsg: { type: String },
    showPassword: { type: Boolean }
  };

  static styles = css`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

    :host { display: block; }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .toggle-bar {
      display: flex; padding: 4px;
      background: #dbf1fe; border-radius: 12px;
      margin-bottom: 8px;
    }

    .toggle-btn {
      flex: 1; padding: 8px 16px; border: none; border-radius: 8px;
      font-size: 12px; line-height: 16px; letter-spacing: 0.05em;
      font-weight: 600; font-family: inherit; cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn.active {
      background: #fff; color: #00796b;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .toggle-btn:not(.active) {
      background: transparent; color: #3e4946;
    }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 12px; line-height: 16px; letter-spacing: 0.05em;
      font-weight: 600; color: #3e4946; text-transform: uppercase;
      margin-left: 4px;
    }

    .input-wrap {
      display: flex; align-items: center;
      background: #fff; border-radius: 12px;
      border: 1px solid rgba(189,201,197,0.5);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-wrap:focus-within {
      border-color: #00796b;
      box-shadow: 0 0 0 1px #00796b;
    }
    .input-wrap .icon {
      margin-left: 16px; font-size: 20px; color: #6e7a76;
    }
    .input-wrap input {
      flex: 1; height: 48px; border: none; background: transparent;
      padding: 0 12px; font-size: 16px; font-family: inherit;
      color: #071e27; outline: none;
    }
    .input-wrap input::placeholder { color: rgba(110,122,118,0.6); }
    .pw-toggle {
      padding: 8px 12px; background: none; border: none;
      cursor: pointer; color: #6e7a76;
      display: flex; align-items: center;
      transition: color 0.2s;
    }
    .pw-toggle:hover { color: #00796b; }

    .options {
      display: flex; align-items: center;
      justify-content: space-between; margin-top: 4px;
    }

    .remember {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
    }
    .remember input {
      width: 20px; height: 20px; border: 2px solid #bdc9c5;
      border-radius: 4px; background: #fff; cursor: pointer;
      accent-color: #00796b;
    }
    .remember span {
      font-size: 14px; color: #3e4946;
    }

    .forgot {
      font-size: 11px; line-height: 14px; font-weight: 500;
      color: #00796b; text-decoration: none; text-transform: uppercase;
    }
    .forgot:hover { color: #005e53; }

    .submit-btn {
      width: 100%; height: 56px; margin-top: 16px;
      border: none; border-radius: 12px;
      font-size: 16px; font-weight: 600; font-family: inherit;
      color: #fff; background: #00796b; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,121,107,0.2);
      display: flex; justify-content: center; align-items: center; gap: 8px;
      transition: background 0.2s, transform 0.1s;
    }
    .submit-btn:hover { background: #005e53; }
    .submit-btn:active { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-btn .arrow { font-size: 20px; }

    .error-msg {
      margin-top: 8px; padding: 10px 12px;
      border-radius: 8px; font-size: 14px; text-align: center;
      background: #ffdad6; color: #93000a;
    }
    .reset-msg {
      margin-top: 8px; padding: 10px 12px;
      border-radius: 8px; font-size: 14px; text-align: center;
      background: #dcfce7; color: #166534;
    }

    .forgot-form {
      display: flex; flex-direction: column; gap: 12px;
      margin-top: 12px; padding-top: 12px;
      border-top: 1px solid rgba(189,201,197,0.5);
    }
    .forgot-form input {
      width: 100%; height: 48px; padding: 0 16px;
      border: 1px solid rgba(189,201,197,0.5); border-radius: 12px;
      font-size: 14px; font-family: inherit; background: #fff;
      outline: none; box-sizing: border-box;
    }
    .forgot-form input:focus {
      border-color: #00796b; box-shadow: 0 0 0 1px #00796b;
    }
    .forgot-actions {
      display: flex; gap: 8px;
    }
    .forgot-actions button {
      flex: 1; height: 44px; border: none; border-radius: 10px;
      font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
    }
    .btn-send { background: #00796b; color: #fff; }
    .btn-back { background: #dbf1fe; color: #3e4946; }
  `;

  constructor() {
    super();
    this.loginType = 'personal';
    this.username = '';
    this.email = '';
    this.password = '';
    this.rememberMe = false;
    this.loading = false;
    this.errorMsg = '';
    this.resetMsg = '';
    this.showPassword = false;
    this._showForgot = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async handleLogin(e) {
    e.preventDefault();
    const loginId = this.email || this.username;
    if (!loginId || !this.password) {
      this.errorMsg = 'Please enter email/username and password.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.resetMsg = '';

    try {
      const res = await loginUser(loginId, this.password);

      if (res.success) {
        const role = res.user.role;
        const userType = res.user.userType || 'company';

        sessionStorage.removeItem("staffUser");
        sessionStorage.removeItem("adminUser");
        sessionStorage.removeItem("personalUser");
        sessionStorage.setItem("token", res.token);

        if (userType === 'personal') {
          sessionStorage.setItem("personalUser", JSON.stringify(res.user));
          Router.go(res.mustChangePassword ? "/personal-setting" : "/personal-dashboard");
        } else if (role === "admin") {
          sessionStorage.setItem("adminUser", JSON.stringify(res.user));
          Router.go(res.mustChangePassword ? "/admin-setting" : "/admin-dashboard");
        } else {
          sessionStorage.setItem("staffUser", JSON.stringify(res.user));
          Router.go(res.mustChangePassword ? "/setting" : "/dashboard");
        }
      } else {
        this.errorMsg = res.message || 'Login failed.';
      }
    } catch (err) {
      this.errorMsg = err.message || 'Unable to connect to server.';
    } finally {
      this.loading = false;
    }
  }

  async handleForgotPassword() {
    const id = this.email || this.username;
    if (!id.trim()) {
      this.errorMsg = 'Enter your email or username first, then click Forgot Password.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.resetMsg = '';
    try {
      const result = await requestPasswordReset(id.trim());
      this.resetMsg = result.message;
      this._showForgot = false;
    } catch (error) {
      this.errorMsg = error.message || 'Unable to send password-reset request.';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <form @submit=${this.handleLogin}>
        <div class="toggle-bar">
          <button type="button" class="toggle-btn ${this.loginType === 'personal' ? 'active' : ''}"
            @click=${() => { this.loginType = 'personal'; this.errorMsg = ''; this.resetMsg = ''; }}>
            Personal
          </button>
          <button type="button" class="toggle-btn ${this.loginType === 'company' ? 'active' : ''}"
            @click=${() => { this.loginType = 'company'; this.errorMsg = ''; this.resetMsg = ''; }}>
            Company
          </button>
        </div>

        <div class="field" style="margin-top:16px;">
          <label>Username</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">person</span>
            <input type="text" placeholder="Enter username"
              .value=${this.username} @input=${e => this.username = e.target.value}>
          </div>
        </div>

        <div class="field" style="margin-top:12px;">
          <label>Email Address</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">mail</span>
            <input type="email" placeholder="admin@docly.health"
              .value=${this.email} @input=${e => this.email = e.target.value}>
          </div>
        </div>

        <div class="field" style="margin-top:12px;">
          <label>Password</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">lock</span>
            <input type=${this.showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              .value=${this.password} @input=${e => this.password = e.target.value} required>
            <button class="pw-toggle" type="button" @click=${this.togglePassword}>
              <span class="material-symbols-outlined" style="font-size:20px;">
                ${this.showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div class="options">
          <label class="remember">
            <input type="checkbox" .checked=${this.rememberMe}
              @change=${e => this.rememberMe = e.target.checked}>
            <span>Remember Me</span>
          </label>
          <a class="forgot" href="javascript:void(0)"
            @click=${() => { this._showForgot = !this._showForgot; this.resetMsg = ''; this.errorMsg = ''; }}>
            Forgot Password?
          </a>
        </div>

        ${this._showForgot ? html`
          <div class="forgot-form">
            <input type="text" placeholder="Enter your username"
              @keydown=${e => { if (e.key === 'Enter') { e.preventDefault(); this.handleForgotPassword(); } }}
              id="forgot-username">
            <div class="forgot-actions">
              <button class="btn-back" type="button"
                @click=${() => { this._showForgot = false; this.resetMsg = ''; }}>Cancel</button>
              <button class="btn-send" type="button"
                @click=${async () => {
                  const uname = this.renderRoot.querySelector('#forgot-username')?.value;
                  if (uname) { this.email = uname; }
                  await this.handleForgotPassword();
                }}>Send Reset</button>
            </div>
          </div>
        ` : ''}

        <button type="submit" class="submit-btn" ?disabled=${this.loading}>
          <span>${this.loading ? 'Signing In...' : 'Sign In'}</span>
          ${!this.loading ? html`<span class="material-symbols-outlined arrow">arrow_forward</span>` : ''}
        </button>

        ${this.errorMsg ? html`<div class="error-msg">${this.errorMsg}</div>` : ''}
        ${this.resetMsg ? html`<div class="reset-msg">${this.resetMsg}</div>` : ''}
      </form>
    `;
  }
}
customElements.define("login-form", LoginForm);
