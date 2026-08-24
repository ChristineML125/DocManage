import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';

export class PersonalSidebar extends LitElement {
  static properties = {
    currentPath: { type: String }
  };

  constructor() {
    super();
    this.currentPath = window.location.pathname;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 256px;
      height: 100vh;
      background: #eff4ff;
      border-right: 1px solid #bcc9c6;
      padding: 24px;
      box-sizing: border-box;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      overflow-y: auto;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
      padding: 0 8px;
    }

    .brand-icon {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-icon img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    .brand-icon .icon { color: #ffffff; font-size: 24px; }

    .brand-text { display: flex; flex-direction: column; }
    .brand-name { font-size: 20px; font-weight: 600; line-height: 28px; color: #008d3f; }

    .mode-badge {
      font-size: 10px;
      font-weight: 700;
      color: #00685f;
      background: #d5ecf8;
      padding: 2px 8px;
      border-radius: 12px;
      margin-top: 2px;
      width: fit-content;
    }

    nav { display: flex; flex-direction: column; gap: 8px; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #3d4947;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.15s;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-family: inherit;
    }

    .nav-link:hover { background: #e6f6ff; }

    .nav-link.active {
      background: #00685f;
      color: #f4fffc;
      font-weight: 700;
      transform: scale(0.98);
    }

    .nav-link .icon { font-size: 24px; }
    .nav-link.active .icon { color: #f4fffc; }

    .footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid #bcc9c6;
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      margin-top: 8px;
      color: #3d4947;
      background: transparent;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      font-family: inherit;
    }

    .btn-logout:hover { background: #d3e4fe; }
    .btn-logout .icon { font-size: 20px; }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ---- Responsive: tablet and below -> icon-only rail ---- */
    @media (max-width: 1024px) {
      :host {
        width: 72px;
        padding: 16px 8px;
      }
      .brand { justify-content: center; padding: 0; margin-bottom: 24px; }
      .brand-text,
      .nav-link .label,
      .btn-logout .label { display: none; }
      .nav-link, .btn-logout {
        justify-content: center;
        padding: 12px 0;
        gap: 0;
      }
    }

    @media (max-width: 480px) {
      :host { width: 60px; padding: 12px 6px; }
      .brand-icon { width: 40px; height: 40px; }
      .nav-link .icon { font-size: 20px; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.requestUpdate();
    });
  }

  go(path) {
    this.currentPath = path;
    Router.go(path);
  }

  isActive(path) {
    return this.currentPath === path;
  }

  logout() {
    sessionStorage.clear();
    Router.go('/login');
  }

  render() {
    return html`
      <div class="brand">
        <div class="brand-icon">
           <img src="/img/docly-logo.png">
        </div>
        <div class="brand-text">
          <span class="brand-name">Docly</span>
          <span class="mode-badge">Personal</span>
        </div>
      </div>

      <nav>
        <button class="nav-link ${this.isActive('/personal-dashboard') ? 'active' : ''}"
          @click=${() => this.go('/personal-dashboard')}>
          <span class="material-symbols-outlined icon">dashboard</span>
          <span class="label">Dashboard</span>
        </button>

        <button class="nav-link ${this.isActive('/personal-documents') ? 'active' : ''}"
          @click=${() => this.go('/personal-documents')}>
          <span class="material-symbols-outlined icon">description</span>
          <span class="label">My Documents</span>
        </button>

        <button class="nav-link ${this.isActive('/personal-favorites') ? 'active' : ''}"
          @click=${() => this.go('/personal-favorites')}>
          <span class="material-symbols-outlined icon">star</span>
          <span class="label">Favorites</span>
        </button>

        <button class="nav-link ${this.isActive('/personal-upload') ? 'active' : ''}"
          @click=${() => this.go('/personal-upload')}>
          <span class="material-symbols-outlined icon">upload_file</span>
          <span class="label">Upload</span>
        </button>

        <button class="nav-link ${this.isActive('/personal-setting') ? 'active' : ''}"
          @click=${() => this.go('/personal-setting')}>
          <span class="material-symbols-outlined icon">settings</span>
          <span class="label">Setting</span>
        </button>
      </nav>

      <div class="footer">
        <button class="btn-logout" @click=${this.logout}>
          <span class="material-symbols-outlined icon">logout</span>
          <span class="label">Logout</span>
        </button>
      </div>
    `;
  }
}

customElements.define('personal-sidebar', PersonalSidebar);
