import { LitElement, html, css } from 'lit';
import { loginUser, requestPasswordReset } from '../../api/userAPI.js';
import { http } from '../../api/http.js';
import { Router } from '@vaadin/router';

export class LoginForm extends LitElement {

  static styles = css`
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  input {
    padding: var(--space-xs);
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
  }

  .form p{
    margin-top: 2px;
    margin-bottom: 2px;
  }

  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
    font-size: 20px;
  }

  .input-groups {
    position: relative;
    width: 100%;
  }

  .input-groups input {
    width: 100%;
    padding: 12px 12px 12px 42px;
    box-sizing: border-box;
    border: 1px solid #c5c6cd;
    border-radius: 8px;
    outline: none;
  }

  .icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    color: #75777d;
    pointer-events: none;
  }

  button {
    margin-top: 5px;
    background: var(--color-secondary);
    color: white;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    border: none;
  }

  button:hover {
    background: var(--color-secondary-container);
  }

  .mode-toggle {
    display: flex;
    gap: 0;
    margin-bottom: 12px;
    border: 1px solid #c5c6cd;
    border-radius: 8px;
    overflow: hidden;
  }

  .mode-toggle button {
    flex: 1;
    margin: 0;
    padding: 10px;
    border: none;
    border-radius: 0;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: #f5f5f5;
    color: #666;
    transition: all 0.2s;
  }

  .mode-toggle button.active {
    background: #00685f;
    color: white;
  }

  .register-section {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
    text-align: center;
  }

  .register-section a {
    color: #00685f;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
  }

  .register-section a:hover {
    text-decoration: underline;
  }

  .register-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .back-link {
    cursor: pointer;
    color: #00685f;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    margin-top: 4px;
    background: none;
    border: none;
    font-family: inherit;
  }
  `;

  static properties = {
    username: {type: String},
    password: {type: String},
    loading: {type: Boolean},
    errorMsg: {type: String},
    resetMsg: {type: String},
    mode: {type: String},
    regUsername: {type: String},
    regPassword: {type: String},
    regEmail: {type: String},
    regLoading: {type: Boolean},
    regError: {type: String},
    regSuccess: {type: String}
  }

  constructor() {
    super();
    this.username = "";
    this.password = "";
    this.loading = false;
    this.resetMsg = '';
    this.mode = 'company';
    this.regUsername = '';
    this.regPassword = '';
    this.regEmail = '';
    this.regLoading = false;
    this.regError = '';
    this.regSuccess = '';
  }

  async handleForgotPassword() {
    if (!this.username.trim()) {
      this.errorMsg = 'Enter your username first, then select Forgot password.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.resetMsg = '';
    try {
      const result = await requestPasswordReset(this.username.trim());
      this.resetMsg = result.message;
    } catch (error) {
      this.errorMsg = error.message || 'Unable to send password-reset request.';
    } finally {
      this.loading = false;
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    if (!this.username || !this.password) {
      alert("Please enter username and password");
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    try {
      const res = await loginUser(this.username, this.password);

      if (res.success) {
        const role = res.user.role;
        const userType = res.user.userType || 'company';

        sessionStorage.removeItem("staffUser");
        sessionStorage.removeItem("adminUser");
        sessionStorage.removeItem("personalUser");

        if (userType === 'personal') {
          sessionStorage.setItem("token", res.token);
          sessionStorage.setItem("personalUser", JSON.stringify(res.user));
          if (res.mustChangePassword) {
            Router.go("/personal-setting");
          } else {
            Router.go("/personal-dashboard");
          }
        } else if (role === "admin") {
          sessionStorage.setItem("token", res.token);
          sessionStorage.setItem("adminUser", JSON.stringify(res.user));
          if (res.mustChangePassword) {
            Router.go("/admin-setting");
          } else {
            Router.go("/admin-dashboard");
          }
        } else {
          sessionStorage.setItem("token", res.token);
          sessionStorage.setItem("staffUser", JSON.stringify(res.user));
          if (res.mustChangePassword) {
            Router.go("/setting");
          } else {
            Router.go("/dashboard");
          }
        }
      } else {
        this.errorMsg = res.message || 'Login failed.';
      }
    } catch (err) {
      console.error(err);
      this.errorMsg = "Unable to connect to server. Please try again.";
    } finally {
      this.loading = false;
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    this.regError = '';
    this.regSuccess = '';

    if (!this.regUsername || !this.regPassword || !this.regEmail) {
      this.regError = 'Please fill in all fields.';
      return;
    }

    this.regLoading = true;
    try {
      const res = await http('/users/register', {
        method: 'POST',
        body: JSON.stringify({
          UserName: this.regUsername,
          Password: this.regPassword,
          Email: this.regEmail
        })
      });

      if (res.success) {
        this.regSuccess = 'Account created! You can now login.';
        this.regUsername = '';
        this.regPassword = '';
        this.regEmail = '';
      } else {
        this.regError = res.message || 'Registration failed.';
      }
    } catch (err) {
      this.regError = 'Unable to connect to server.';
    } finally {
      this.regLoading = false;
    }
  }

  renderLoginForm() {
    return html`
      <form class="form" @submit=${this.handleLogin}>
        <p>${this.mode === 'personal' ? 'Username' : 'Staff Name'}</p>
        <div class="input-groups">
          <span class="material-symbols-outlined icon">person</span>
          <input type="text" placeholder="${this.mode === 'personal' ? 'Username' : 'Staff Name'}"
            .value=${this.username}
            @input=${e => this.username = e.target.value}
          />
        </div>

        <p>Password</p>
        <div class="input-groups">
          <span class="material-symbols-outlined icon">lock</span>
          <input type="password" placeholder="Password"
            .value=${this.password}
            @input=${e => this.password = e.target.value}
          />
        </div>

        <button type="submit" ?disabled=${this.loading}>
          ${this.loading ? 'Logging in...' : 'Login'}
        </button>

        ${this.mode === 'company' ? html`
          <button type="button" class="forgot-password" @click=${() => this.handleForgotPassword()} ?disabled=${this.loading}>
            Forgot password?
          </button>
        ` : ''}

        ${this.errorMsg ? html`<p style="color: red;">${this.errorMsg}</p>` : ''}
        ${this.resetMsg ? html`<p style="color: #12632d;">${this.resetMsg}</p>` : ''}

        ${this.mode === 'personal' ? html`
          <div class="register-section">
            Don't have an account? <a @click=${() => Router.go('/register')}>Register</a>
          </div>
        ` : ''}
      </form>
    `;
  }

  renderRegisterForm() {
    return html``;
  }

  render() {
    return html`
      <div class="mode-toggle">
        <button class="${this.mode === 'company' ? 'active' : ''}"
          @click=${() => { this.mode = 'company'; this.errorMsg = ''; this.resetMsg = ''; }}>
          Company
        </button>
        <button class="${this.mode === 'personal' ? 'active' : ''}"
          @click=${() => { this.mode = 'personal'; this.errorMsg = ''; this.resetMsg = ''; }}>
          Personal
        </button>
      </div>

      ${this.renderLoginForm()}
    `;
  }
}
customElements.define("login-form", LoginForm);
