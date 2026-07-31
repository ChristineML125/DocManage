import { LitElement, html, css } from 'lit';
import { loginUser, requestPasswordReset } from '../../api/userAPI.js';
import { Router } from '@vaadin/router';
import { state } from 'lit/decorators.js';

export class LoginForm extends LitElement {
  currentPath = window.location.pathname;

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
`;

  static properties = {
    username: {type: String},
    password: {type: String},
    loading: {type: Boolean},
    errorMsg: {type: String},
    resetMsg: {type: String}
  }

  constructor() {
    super();
    this.handleLogin = this.handleLogin.bind(this);
    this.username = "";
    this.password = "";
    this.loading = false;
    this.resetMsg = '';
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
    console.log("🔥 LOGIN CLICKED");

    console.log("LOGIN INPUT:", this.username);

    if (!this.username || !this.password) {
      alert("Please enter username and password");
      return;
    }
    this.loading = true;
    
    try{
      const res= await loginUser(this.username, this.password);

      if(res.success){

          const role = res.user.role;

          sessionStorage.removeItem("staffUser");
          sessionStorage.removeItem("adminUser");

          console.log("Role:", role);

          if(role === "admin"){
              sessionStorage.setItem(
                "token",
                res.token
              );

              sessionStorage.setItem(
                  "adminUser",
                  JSON.stringify(res.user)
              );

              if(res.mustChangePassword){

                  Router.go("/admin-setting");

              }else{
                  Router.go("/admin-dashboard");
              }
          }else{
            sessionStorage.setItem(
                "token",
                res.token
              );

              sessionStorage.setItem(
                  "staffUser",
                  JSON.stringify(res.user)
              );
              
              if(res.mustChangePassword){

                  Router.go("/setting");

              }else{

                  Router.go("/dashboard");

              }

          }

      }
    } catch (err) {
      console.error(err);
      this.errorMsg= "Unable to connect to server. Please try again.";
    } finally{
      this.loading = false;
    }
  }
  

  render() {
    return html`
      <form class = "form" @submit=${this.handleLogin}>
        <p>Staff Name</p>
          <div class="input-groups">
            <span class="material-symbols-outlined icon">
              person
            </span>

            <input type="text" placeholder="Staff Name" 
            .value=${this.username}
            @input=${e => this.username = e.target.value}
            />
          </div>

        <p>Password</p>
        <div class="input-groups">
          <span class="material-symbols-outlined icon">
              lock
          </span>
            <input type="password" placeholder="Password" 
            .value=${this.password}
            @input=${e => this.password = e.target.value}
            />
        </div>

        <button type="submit" ?disabled=${this.loading}>
          ${this.loading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" class="forgot-password" @click=${() => this.handleForgotPassword()} ?disabled=${this.loading}>
          Forgot password?
        </button>
        ${this.errorMsg ? html`<p style="color: red;">${this.errorMsg}</p>` : ''}
        ${this.resetMsg ? html`<p style="color: #12632d;">${this.resetMsg}</p>` : ''}
      </form>
    `;
  }
}
 customElements.define("login-form", LoginForm);
