import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';

export class AdminSidebar extends LitElement {
  static properties = {
    currentPath: { type: String },
    username: { type: String },
    role: { type: String }
  };

  constructor() {
    super();
    this.currentPath = window.location.pathname;
    this.username = '';
    this.role = '';
  }

  connectedCallback() {
    super.connectedCallback();
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.username = user.UserName || 'Admin';
      this.role = user.role || 'Administrator';
    }
    window.addEventListener('popstate', this._updatePath);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this._updatePath);
  }

  _updatePath = () => {
    this.currentPath = window.location.pathname;
  };

  go(path) {
    this.currentPath = path;
    Router.go(path);
  }

  isActive(path) {
    return this.currentPath === path;
  }

  logout() {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('staffUser');
    Router.go('/login');
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 260px;
      height: 100vh;
      background-color: #091426; /* primary */
      border-right: 1px solid #45474c; /* outline-variant */
      padding: 24px 8px;
      box-sizing: border-box;
      position: sticky;
      top: 0;
      overflow-y: auto;
      color: #ffffff;
      font-family: 'Inter', sans-serif;
    }
      
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
      padding: 0 8px;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background-color: #2170e4; /* secondary-container */
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-icon img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .brand-icon .icon {
      color: #fefcff; /* on-secondary-container */
      font-size: 24px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 20px;
      font-weight: 600;
      line-height: 28px;
      color: #ffffff;
    }

    .brand-sub {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-family: inherit;
    }

    .nav-link:hover {
      color: #ffffff;
      background-color: rgba(255,255,255,0.1);
    }

    .nav-link.active {
      background-color: #2170e4;
      color: #ffffff;
      font-weight: 700;
      transform: scale(0.98);
    }

    .nav-link .icon {
      font-size: 20px;
    }

    .divider {
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 12px 0;
    }

    .footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .btn-new {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #0058be; /* secondary */
      color: #ffffff;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
      margin-bottom: 16px;
    }

    .btn-new:hover {
      background-color: #2170e4;
      transform: scale(0.98);
    }

    .btn-new .icon {
      font-size: 20px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background-color: rgba(255,255,255,0.05);
      margin-bottom: 8px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      object-fit: cover;
      background-color: #ccc; /* placeholder */
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255,255,255,0.7);
      background: transparent;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }

    .btn-logout:hover {
      color: #ffffff;
      background-color: rgba(255,255,255,0.1);
    }

    .btn-logout .icon {
      font-size: 20px;
    }

    /* Material Symbols */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `;

  render() {
    return html`
      <div class="brand">
        <div class="brand-icon">
          <img src="/img/docly-logo.png">
        </div>
        <div class="brand-text">
          <span class="brand-name">Docly</span>
          <span class="brand-sub">Admin</span>
        </div>
      </div>

      <nav>
        <button
          class="nav-link ${this.isActive('/admin-dashboard') ? 'active' : ''}"
          @click=${() => this.go('/admin-dashboard')}
        >
          <span class="material-symbols-outlined icon">dashboard</span>
          Dashboard
        </button>

        <button
          class="nav-link ${this.isActive('/admin-allDocument') ? 'active' : ''}"
          @click=${() => this.go('/admin-allDocument')}
        >
          <span class="material-symbols-outlined icon">description</span>
          All Documents
        </button>

        <button
          class="nav-link ${this.isActive('/admin-upload') ? 'active' : ''}"
          @click=${() => this.go('/admin-upload')}
        >
          <span class="material-symbols-outlined icon">upload_file</span>
          Upload Files
        </button>

        <button
          class="nav-link ${this.isActive('/admin-category') ? 'active' : ''}"
          @click=${() => this.go('/admin-category')}
        >
          <span class="material-symbols-outlined icon">grid_view</span>
          Categories
        </button>

        <div class="divider"></div>

        <button
          class="nav-link ${this.isActive('/UserManagement') ? 'active' : ''}"
          @click=${() => this.go('/UserManagement')}
        >
          <span class="material-symbols-outlined icon">group</span>
          User Management
        </button>

        <button
          class="nav-link ${this.isActive('/AuditLogs') ? 'active' : ''}"
          @click=${() => this.go('/AuditLogs')}
        >
          <span class="material-symbols-outlined icon">history_edu</span>
          Audit Logs
        </button>
        
        <button 
          class= "nav-link ${this.isActive('/admin-setting') ? 'active' : ''}"
          @click=${() => this.go('/admin-setting')}
        >
          <span class="material-symbols-outlined icon">settings</span>
          Setting
        </button>
      </nav>

        <button class="btn-logout" @click=${this.logout}>
          <span class="material-symbols-outlined icon">logout</span>
          Logout
        </button>
      </div>
    `;
  }
}

customElements.define('admin-side-bar', AdminSidebar);