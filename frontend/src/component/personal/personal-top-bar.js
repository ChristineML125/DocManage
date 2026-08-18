import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';

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

    .search-box:focus-within { box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.2); }
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

    .avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ede9ff;
      border: 1px solid #bcc9c6;
      color: #6c63ff;
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
  `;

  static properties = {
    searchValue: { type: String },
    username: { type: String },
    pageTitle: { type: String }
  };

  constructor() {
    super();
    this.searchValue = '';
    this.username = '';
    this.pageTitle = '';
  }

  connectedCallback() {
    super.connectedCallback();
    const userStr = sessionStorage.getItem('personalUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.username = user.UserName || 'User';
    }
  }

  _onInput(e) {
    this.searchValue = e.target.value;
  }

  _handleSearch() {
    if (!this.searchValue.trim()) return;
    Router.go(`/personal-documents?keyword=${encodeURIComponent(this.searchValue)}`);
  }

  render() {
    return html`
      <div class="topbar">
        <div class="title-section">
          <h1>${this.pageTitle}</h1>
        </div>
        <div class="search-box">
          <input type="text" placeholder="Search your documents..."
            .value=${this.searchValue}
            @input=${this._onInput}
            @keydown=${(e) => e.key === 'Enter' && this._handleSearch()}
          />
          <button style="background:none;border:none;cursor:pointer;" @click=${this._handleSearch}>
            <span class="material-symbols-outlined icon">search</span>
          </button>
        </div>
        <div class="user-info">
          <div class="user-text">
            <span class="name">Welcome, ${this.username}</span>
          </div>
          <div class="avatar-placeholder">
            ${this.username ? this.username.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('personal-top-bar', PersonalTopBar);
