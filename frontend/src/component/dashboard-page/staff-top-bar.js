import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import '../../api/documentAPI.js';
import { getDocuments, getDocumentsList } from '../../api/documentAPI.js';
import { getFileUrl } from '../../api/http.js';

export class TopBar extends LitElement {

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

    .title-section h1{
      margin: 0;
      line-height: 20px;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #e6f6ff;
      border-radius: 20px;
      padding: 4px 14px;
      width: 60%;
      transition: box-shadow 0.2s;
    }

    .search-box:focus-within {
      box-shadow: 0 0 0 2px rgba(0, 94, 83, 0.2);
    }

    .search-box .icon {
      color: #3d4947;
      margin-right: 8px;
      font-size: 20px;
    }

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

    .search-box input::placeholder {
      color: #3d4947;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-btn {
      padding: 8px;
      background: transparent;
      border: none;
      color: #3d4947;
      cursor: pointer;
      transition: color 0.2s;
      position: relative;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

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
      background: rgba(0, 104, 95, 0.06);
    }

    .action-btn .icon {
      font-size: 18px;
    }

    .icon-btn:hover {
      color: #00685f;
    }

    .icon-btn .icon {
      font-size: 20px;
    }

    .badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      background: #ba1a1a;
      border-radius: 9999px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 16px;
      border-left: 1px solid #bcc9c6;
    }

    .user-text {
      text-align: right;
    }

    .user-text .name {
      font-size: 14px;
      line-height: 20px;
      font-weight: 700;
      color: #0b1c30;
      margin: 0;
      letter-spacing: 0.01em;
    }

    .user-text .role {
      font-size: 12px;
      line-height: 16px;
      font-weight: 600;
      color: #3d4947;
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
      color: #005e53;
      font-weight: 700;
    }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    
    .user-info .material-symbols-outlined {
      font-size: 40px;
      color: grey;
    }

    @media (max-width: 1190px) {
      .title-section h1 {
        font-size: 18px;
      }
    }

    @media (max-width: 768px) {
      .search-box {
        width: 180px;
      }
      .user-text {
        display: none;
      }

      .title-section h1 {
        font-size: 15px;
      }
    }
  `;

  static properties = {
    searchValue: { type: String },
    username: {type : String},
    pageTitle: {type : String},
    avatarPath: {type : String}
  };

  constructor() {
    super();
    this.searchValue = '';
    this.username = '';
    this.pageTitle = '';
    this.avatarPath = '';
  }

  connectedCallback(){
    super.connectedCallback();

    const userStr = sessionStorage.getItem('staffUser');

    if(userStr){
      const user = JSON.parse(userStr);
      this.username = user.UserName || 'Staff';
      this.avatarPath = user.AvatarPath || '';
    }
  }

  _onInput(e) {
    this.searchValue = e.target.value;
  }

  async _handleSearch(){
    if(!this.searchValue.trim()) return;

    this.dispatchEvent(new CustomEvent('search-documents', {
        detail: {keyword: this.searchValue },
        bubbles: true,
        composed: true
      }));
  } 

  renderAvatar() {
    if(this.avatarPath){
      return html`
        <img
          class="avatar"
          src="${this.avatarPath ? getFileUrl(this.avatarPath) : ''}"
          alt="Profile photo"
        >
      `;
    }

    return html`
      <div class="avatar-placeholder">
        ${this.username ? this.username.charAt(0).toUpperCase() : 'A'}
      </div>
    `;
  }

  render() {
    return html`
      <div class="topbar">
        <div class="title-section">
          <h1>${this.pageTitle}</h1>
        </div>
        <div class="search-box">
          <input
            type="text"
            placeholder="Search files, ID, or department..."
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
              <span>Welcome, ${this.username}</span>
            </div>
            <div class="avatar-row">
              ${this.renderAvatar()}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('staff-top-bar', TopBar);
