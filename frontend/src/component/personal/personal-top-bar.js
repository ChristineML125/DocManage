import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { getFileUrl } from '../../api/http.js';

export class PersonalTopBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      background: #f8f9ff;
      border-bottom: 1px solid #bcc9c6;
      box-sizing: border-box;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 24px;
      gap: 24px;
    }

    .title-section h1 { margin: 0; line-height: 20px; }

    .search-box {
      display: flex;
      align-items: center;
      background: #e5eeff;
      border-radius: 20px;
      padding: 4px 14px;
      width: 50%;
      transition: box-shadow 0.2s;
    }

    .search-box:focus-within { box-shadow: 0 0 0 2px rgba(0, 94, 83, 0.2); }
    .search-box .icon { color: #3d4947; margin-right: 8px; font-size: 20px; }

    .search-box input {
      background: transparent;
      border: none;
      outline: none;
      font-size: 16px;
      line-height: 24px;
      font-weight: 400;
      width: 100%;
      font-family: inherit;
      color: #0b1c30;
    }

    .search-box input::placeholder { color: #3d4947; }

    .action-btn {
      padding: 4px 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #8a9aa8;
      transition: color 0.2s;
      border-radius: 6px;
    }
    .action-btn:hover {
      color: #00685f;
      background: rgba(0, 94, 83, 0.06);
    }
    .action-btn .icon { font-size: 18px; }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 16px;
      border-left: 1px solid #bcc9c6;
    }

    .user-text { text-align: right; }

    .user-text .name {
      font-size: 14px;
      line-height: 20px;
      font-weight: 700;
      color: #0b1c30;
      margin: 0;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      object-fit: cover;
      border: 1px solid #bcc9c6;
      flex-shrink: 0;
    }

    .avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #d5ecf8;
      border: 1px solid #bdc9c5;
      color: #00685f;
      font-weight: 700;
    }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    @media (max-width: 768px) {
      .search-box { width: 180px; }
      .user-text { display: none; }
    }

    @media (max-width: 640px) {
      .topbar {
        flex-wrap: wrap;
        padding: 8px 14px;
        gap: 8px;
      }
      .title-section h1 { font-size: 17px !important; }
      .search-box {
        order: 3;
        width: 100%;
        padding: 6px 12px;
      }
      .search-box input { font-size: 14px; }
      .user-info { padding-left: 10px; }
      .avatar, .avatar-placeholder { width: 34px; height: 34px; }
    }

    /* ---- Sidebar drawer toggle ---- */
    .menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #334155;
      padding: 4px;
      border-radius: 8px;
    }
    .menu-btn:hover { background: rgba(0, 104, 95, 0.08); }
    .menu-btn .material-symbols-outlined { font-size: 26px; }

    @media (max-width: 767px) {
      .menu-btn { display: inline-flex; margin-right: 10px; }
    }
  `;

  static properties = {
    searchValue: { type: String },
    username: { type: String },
    pageTitle: { type: String },
    avatarPath: { type: String }
  };

  constructor() {
    super();
    this.searchValue = '';
    this.username = '';
    this.pageTitle = '';
    this.avatarPath = '';
  }

  connectedCallback() {
    super.connectedCallback();
    const userStr = sessionStorage.getItem('personalUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.username = user.UserName || 'User';
      this.avatarPath = user.AvatarPath || '';
    }
  }

  _onInput(e) {
    this.searchValue = e.target.value;
  }

  _handleSearch() {
    if (!this.searchValue.trim()) return;
    Router.go(`/personal-documents?keyword=${encodeURIComponent(this.searchValue)}`);
  }

  renderAvatar() {
    if (this.avatarPath) {
      return html`
        <img
          class="avatar"
          src="${getFileUrl(this.avatarPath)}"
          alt="Profile photo"
        >
      `;
    }
    return html`
      <div class="avatar-placeholder">
        ${this.username ? this.username.charAt(0).toUpperCase() : 'U'}
      </div>
    `;
  }

  render() {
    return html`
      <div class="topbar">
        <button class="menu-btn" aria-label="Toggle navigation"
          @click=${() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}>
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="title-section">
          <h1>${this.pageTitle}</h1>
        </div>
        <div class="search-box">
          <input type="text" placeholder="Search files, ID, or department..."
            .value=${this.searchValue}
            @input=${this._onInput}
            @keydown=${(e) => e.key === 'Enter' && this._handleSearch()}
          />
          <button class="action-btn" @click=${this._handleSearch}>
            <span class="material-symbols-outlined icon">search</span>
          </button>
        </div>
        <div class="user-info">
          <div class="user-text">
            <span class="name">Welcome, ${this.username}</span>
          </div>
          ${this.renderAvatar()}
        </div>
      </div>
    `;
  }
}

customElements.define('personal-top-bar', PersonalTopBar);
