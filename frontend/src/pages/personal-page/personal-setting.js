import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { changePassword } from '../../api/userAPI.js';
import '../../component/personal/personal-sidebar.js';
import '../../component/personal/personal-top-bar.js';

export class PersonalSettingPage extends LitElement {

  static styles = css`
    :host { display: block; height: 100vh; width: 100%; overflow: hidden; }
    .layout { display: flex; height: 100%; }
    .top { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .scroll-area { flex: 1; overflow-y: auto; padding: 32px; }

    .setting-card {
      max-width: 450px;
      margin: 0 auto;
      background: white;
      border: 1px solid #eef2f6;
      border-radius: 12px;
      padding: 32px;
    }

    .setting-card h2 { margin: 0 0 20px; }

    label { display: block; font-size: 13px; font-weight: 600; color: #3d4947; margin-bottom: 4px; }

    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #c5c6cd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 16px;
    }

    input:focus { border-color: #6c63ff; }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      width: 100%;
      background: #6c63ff;
      color: white;
    }

    .btn:hover { background: #5b4ed4; }

    .msg { padding: 10px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; font-size: 13px; }
    .msg.success { color: #166534; background: #dcfce7; }
    .msg.error { color: #991b1b; background: #fee2e2; }
  `;

  static properties = {
    currentPassword: { type: String },
    newPassword: { type: String },
    confirmPassword: { type: String },
    msg: { type: String },
    msgType: { type: String }
  };

  constructor() {
    super();
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.msg = '';
    this.msgType = '';
  }

  connectedCallback() {
    super.connectedCallback();
    const user = sessionStorage.getItem('personalUser');
    if (!user) Router.go('/login');
  }

  async handleChangePassword(e) {
    e.preventDefault();
    this.msg = '';

    if (this.newPassword !== this.confirmPassword) {
      this.msg = 'New passwords do not match.';
      this.msgType = 'error';
      return;
    }

    try {
      const user = JSON.parse(sessionStorage.getItem('personalUser'));
      await changePassword({
        userID: user.UserID,
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      });
      this.msg = 'Password changed successfully!';
      this.msgType = 'success';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (err) {
      this.msg = err.message || 'Failed to change password.';
      this.msgType = 'error';
    }
  }

  render() {
    return html`
      <div class="layout">
        <personal-sidebar></personal-sidebar>
        <div class="top">
          <personal-top-bar pageTitle="Settings"></personal-top-bar>
          <div class="scroll-area">
            <div class="setting-card">
              <h2>Change Password</h2>
              ${this.msg ? html`<div class="msg ${this.msgType}">${this.msg}</div>` : ''}
              <form @submit=${this.handleChangePassword}>
                <label>Current Password</label>
                <input type="password" .value=${this.currentPassword}
                  @input=${e => this.currentPassword = e.target.value} />

                <label>New Password</label>
                <input type="password" .value=${this.newPassword}
                  @input=${e => this.newPassword = e.target.value} />

                <label>Confirm New Password</label>
                <input type="password" .value=${this.confirmPassword}
                  @input=${e => this.confirmPassword = e.target.value} />

                <button class="btn" type="submit">Change Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('personal-setting-page', PersonalSettingPage);
