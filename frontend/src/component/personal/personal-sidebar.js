import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';

export class PersonalSidebar extends LitElement {
  static properties = {
    currentPath: { type: String },
    open: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.currentPath = window.location.pathname;
    this.open = false;
  }

  _onToggle = () => {
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    this.open = !this.open;
  };

  _onKeydown = (e) => {
    if (e.key === 'Escape') this.open = false;
  };

  _ensureBackdrop() {
    if (!this._backdrop) {
      this._backdrop = document.createElement('div');
      this._backdrop.style.cssText =
        'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:1150;' +
        'opacity:0;pointer-events:none;transition:opacity .25s;';
      this._backdrop.addEventListener('click', () => { this.open = false; });
      document.body.appendChild(this._backdrop);
    }
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('open')) {
      if (this.open) {
        this._ensureBackdrop();
        requestAnimationFrame(() => {
          this._backdrop.style.opacity = '1';
          this._backdrop.style.pointerEvents = 'auto';
        });
      } else if (this._backdrop) {
        this._backdrop.style.opacity = '0';
        this._backdrop.style.pointerEvents = 'none';
      }
    }
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

    /* ---- Bottom nav (mobile only, rendered by this component) ---- */
    .bottom-nav { display: none; }

    /* ---- Tablet (768px–1024px): icon-only rail ---- */
    @media (min-width: 768px) and (max-width: 1024px) {
      :host {
        width: 72px;
        padding: 20px 8px;
        align-items: center;
      }
      .brand { justify-content: center; gap: 0; padding: 0; margin-bottom: 28px; }
      .brand-text,
      .nav-link .label,
      .btn-logout .label { display: none; }
      .nav-link { justify-content: center; padding: 12px 0; gap: 0; }
      .footer { padding-top: 12px; }
      .btn-logout { justify-content: center; padding: 12px 0; gap: 0; }
    }

    /* ---- Mobile (≤767px): off-canvas drawer + bottom nav ---- */
    @media (max-width: 767px) {
      :host {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 264px;
        max-width: 82vw;
        padding: 20px 16px;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        z-index: 1200;
        box-shadow: none;
      }
      :host([open]) {
        transform: translateX(0);
        box-shadow: 8px 0 24px rgba(0, 0, 0, 0.2);
      }

      .bottom-nav {
        display: flex;
        position: fixed;
        left: 0; right: 0; bottom: 0;
        height: calc(60px + env(safe-area-inset-bottom));
        padding-bottom: env(safe-area-inset-bottom);
        background: #ffffff;
        border-top: 1px solid #bcc9c6;
        z-index: 1100;
      }
      .bnav-item {
        flex: 1;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 2px;
        background: none; border: none; cursor: pointer;
        color: #3d4947;
        font-family: inherit; font-size: 10px; font-weight: 600;
        padding: 6px 0;
      }
      .bnav-item .material-symbols-outlined { font-size: 22px; }
      .bnav-item.active { color: #008d3f; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.requestUpdate();
    });
    window.addEventListener('toggle-sidebar', this._onToggle);
    window.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('toggle-sidebar', this._onToggle);
    window.removeEventListener('keydown', this._onKeydown);
    if (this._backdrop) {
      this._backdrop.remove();
      this._backdrop = null;
    }
  }

  go(path) {
    this.currentPath = path;
    this.open = false;
    Router.go(path);
  }

  isActive(path) {
    return this.currentPath === path;
  }

  logout() {
    this.open = false;
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
        <button class="btn-logout" @click=${this.logout} title="Logout">
          <span class="material-symbols-outlined icon">logout</span>
          <span class="label">Logout</span>
        </button>
      </div>

      <nav class="bottom-nav">
        <button
          class="bnav-item ${this.isActive('/personal-dashboard') ? 'active' : ''}"
          @click=${() => this.go('/personal-dashboard')}>
          <span class="material-symbols-outlined">dashboard</span><span>Home</span>
        </button>
        <button
          class="bnav-item ${this.isActive('/personal-documents') ? 'active' : ''}"
          @click=${() => this.go('/personal-documents')}>
          <span class="material-symbols-outlined">description</span><span>Docs</span>
        </button>
        <button
          class="bnav-item ${this.isActive('/personal-favorites') ? 'active' : ''}"
          @click=${() => this.go('/personal-favorites')}>
          <span class="material-symbols-outlined">star</span><span>Favorites</span>
        </button>
        <button
          class="bnav-item ${this.isActive('/personal-upload') ? 'active' : ''}"
          @click=${() => this.go('/personal-upload')}>
          <span class="material-symbols-outlined">upload_file</span><span>Upload</span>
        </button>
        <button class="bnav-item" @click=${() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}>
          <span class="material-symbols-outlined">menu</span><span>Menu</span>
        </button>
      </nav>
    `;
  }
}

customElements.define('personal-sidebar', PersonalSidebar);
