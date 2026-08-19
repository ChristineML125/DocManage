import { LitElement, html, css } from 'lit';
import { loginUser, requestPasswordReset } from '../../api/userAPI.js';
import { Router } from '@vaadin/router';

export class LoginForm extends LitElement {

  static properties = {
    username: { type: String },
    password: { type: String },
    rememberMe: { type: Boolean },
    loading: { type: Boolean },
    errorMsg: { type: String },
    resetMsg: { type: String },
    showPassword: { type: Boolean }
  };

  static styles = css`
    :host { display: block; }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .form { display: flex; flex-direction: column; gap: 24px; }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-top {
      display: flex; justify-content: space-between;
      align-items: center; margin-left: 4px;
    }
    .field label {
      font-size: 11px; line-height: 14px; font-weight: 500;
      color: #3e4946;
    }

    .input-wrap {
      position: relative; display: flex; align-items: center;
    }
    .input-wrap .icon {
      position: absolute; left: 12px; top: 50%;
      transform: translateY(-50%);
      font-size: 20px; color: #bdc9c5;
      pointer-events: none;
    }
    .input-wrap input {
      width: 100%; height: 48px;
      padding-left: 40px; padding-right: 16px;
      border: 1px solid #bdc9c5; border-radius: 8px;
      background: #e6f6ff; font-size: 14px;
      font-family: inherit; color: #071e27;
      outline: none; transition: all 0.2s;
    }
    .input-wrap input::placeholder { color: #6e7a76; }
    .input-wrap input:focus {
      border-color: #005e53;
      box-shadow: 0 0 0 1px #005e53;
    }

    .pw-toggle {
      position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: #bdc9c5; display: flex; align-items: center;
      transition: color 0.2s;
    }
    .pw-toggle:hover { color: #3e4946; }

    .forgot-link {
      font-size: 11px; line-height: 14px; font-weight: 500;
      color: #005e53; text-decoration: none;
      transition: color 0.2s;
    }
    .forgot-link:hover { color: #00796b; text-decoration: underline; }

    .submit-btn {
      width: 100%; height: 48px; margin-top: 8px;
      border: none; border-radius: 8px;
      font-size: 16px; font-weight: 600; font-family: inherit;
      color: #fff; background: #005e53; cursor: pointer;
      box-shadow: 0px 4px 12px rgba(0,94,83,0.08);
      display: flex; justify-content: center; align-items: center; gap: 8px;
      transition: background 0.2s, transform 0.1s;
    }
    .submit-btn:hover { background: #005047; }
    .submit-btn:active { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-btn .arrow { font-size: 20px; }

    .footer-text {
      text-align: center; margin-top: 8px;
      font-size: 14px; color: #3e4946;
    }
    .footer-text a {
      font-size: 16px; font-weight: 600;
      color: #005e53; text-decoration: none;
    }
    .footer-text a:hover { text-decoration: underline; }

    .error-msg {
      margin-top: 4px; padding: 10px 12px;
      border-radius: 8px; font-size: 14px; text-align: center;
      background: #ffdad6; color: #93000a;
    }
    .reset-msg {
      margin-top: 4px; padding: 10px 12px;
      border-radius: 8px; font-size: 14px; text-align: center;
      background: #dcfce7; color: #166534;
    }

    .forgot-form {
      display: flex; flex-direction: column; gap: 12px;
      margin-top: 8px; padding-top: 12px;
      border-top: 1px solid #bdc9c5;
    }
    .forgot-form input {
      width: 100%; height: 48px; padding: 0 16px;
      border: 1px solid #bdc9c5; border-radius: 8px;
      font-size: 14px; font-family: inherit; background: #e6f6ff;
      outline: none; box-sizing: border-box;
    }
    .forgot-form input:focus {
      border-color: #005e53; box-shadow: 0 0 0 1px #005e53;
    }
    .forgot-actions { display: flex; gap: 8px; }
    .forgot-actions button {
      flex: 1; height: 40px; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
    }
    .btn-send { background: #005e53; color: #fff; }
    .btn-back { background: #e6f6ff; color: #3e4946; }
  `;

  constructor() {
    super();
    this.username = '';
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
    if (!this.username || !this.password) {
      this.errorMsg = 'Please enter email/username and password.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.resetMsg = '';

    try {
      const res = await loginUser(this.username, this.password);

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
    if (!this.username.trim()) {
      this.errorMsg = 'Enter your username or email first, then click Forgot Password.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.resetMsg = '';
    try {
      const result = await requestPasswordReset(this.username.trim());
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
      <form class="form" @submit=${this.handleLogin}>
        <div class="field">
          <label>Email Address</label>
          <div class="input-wrap">
            <span class="icon material-symbols-outlined">mail</span>
            <input type="text" placeholder="dr.smith@hospital.org"
              .value=${this.username} @input=${e => this.username = e.target.value} required>
          </div>
        </div>

        <div class="field">
          <div class="field-top">
            <label>Password</label>
            <a class="forgot-link" href="javascript:void(0)"
              @click=${() => { this._showForgot = !this._showForgot; this.resetMsg = ''; this.errorMsg = ''; }}>
              Forgot Password?
            </a>
          </div>
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

        ${this._showForgot ? html`
          <div class="forgot-form">
            <input type="text" placeholder="Enter your username or email"
              @keydown=${e => { if (e.key === 'Enter') { e.preventDefault(); this.handleForgotPassword(); } }}
              id="forgot-username">
            <div class="forgot-actions">
              <button class="btn-back" type="button"
                @click=${() => { this._showForgot = false; this.resetMsg = ''; }}>Cancel</button>
              <button class="btn-send" type="button"
                @click=${async () => {
                  const uname = this.renderRoot.querySelector('#forgot-username')?.value;
                  if (uname) { this.username = uname; }
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

      <div class="footer-text">
        Don't have an account?
        <a href="/register">Sign Up</a>
      </div>
    `;
  }
}
customElements.define("login-form", LoginForm);
