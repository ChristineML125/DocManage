import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';

export class Sidebar extends LitElement {
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

    .brand-icon img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .brand-icon .icon {
      color: #ffffff;
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
      color: #008d3f;
    }
    
    nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

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

    .nav-link:hover {
      background: #d3e4fe;
    }

    .nav-link.active {
      background: #008378;
      color: #f4fffc;
      font-weight: 700;
      transform: scale(0.98);
    }

    .nav-link .icon {
      font-size: 24px;
    }

    .nav-link.active .icon {
      color: #f4fffc;
    }

    .footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid #bcc9c6;
    }

    .btn-new {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #00685f;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s;
      font-family: inherit;
    }

    .btn-new:hover {
      opacity: 0.9;
    }

    .btn-new .icon {
      font-size: 20px;
      color: white;
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

    .btn-logout:hover {
      background: #d3e4fe;
    }

    .btn-logout .icon {
      font-size: 20px;
    }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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
    localStorage.clear("staffUser");
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
        </div>
      </div>

      <nav>
        <button
          class="nav-link ${this.isActive('/dashboard') ? 'active' : ''}"
          @click=${() => this.go('/dashboard')}
        >
          <span class="material-symbols-outlined icon">dashboard</span>
          Dashboard
        </button>

        <button
          class="nav-link ${this.isActive('/allDocument') ? 'active' : ''}"
          @click=${() => this.go('/allDocument')}
        >
          <span class="material-symbols-outlined icon">description</span>
          All Documents
        </button>

        <button
          class="nav-link ${this.isActive('/upload') ? 'active' : ''}"
          @click=${() => this.go('/upload')}
        >
          <span class="material-symbols-outlined icon">upload_file</span>
          Upload Files
        </button>

        <button
          class="nav-link ${this.isActive('/categories') ? 'active' : ''}"
          @click=${() => this.go('/categories')}
        >
          <span class="material-symbols-outlined icon">grid_view</span>
          Categories
        </button>

        <button 
          class= "nav-link ${this.isActive('/setting') ? 'active' : ''}"
          @click=${() => this.go('/setting')}
        >
          <span class="material-symbols-outlined icon">settings</span>
          Setting
        </button>
      </nav>

      <div class="footer">
        <button class="btn-logout" @click=${this.logout}>
          <span class="material-symbols-outlined icon">logout</span>
          Logout
        </button>
      </div>
    `;
  }
}

customElements.define('staff-side-bar', Sidebar);