import { LitElement, html, css } from 'lit';
import { getDepartmentLoad } from '../../api/departmentAPI';

export class RightBar extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .right-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ===== DEPARTMENT LOAD ===== */
    .dept-card {
      background: white;
      border: 1px solid #eef2f6;
      padding: 20px 24px 24px 24px;
      border-radius: 12px;
    }

    .dept-card h3 {
      font-size: 17px;
      font-weight: 600;
      color: #0b1c30;
      margin: 0 0 16px 0;
    }

    .dept-item {
      margin-bottom: 14px;
    }

    .dept-item:last-child {
      margin-bottom: 0;
    }

    .dept-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .dept-row .label {
      color: #4a5a6a;
    }

    .dept-row .value {
      font-weight: 600;
      color: #7a8a9a;
    }

    .dept-bar {
      width: 100%;
      background: #eef2f6;
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
    }

    .dept-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: #dce4ed;
      transition: width 0.6s ease;
    }

    /* ===== STATUS CARD ===== */
    .status-card {
      background: #0a0068;
      color: white;
      padding: 22px 24px;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .status-card .content {
      position: relative;
      z-index: 2;
    }

    .status-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: #6bd8cb;
      border-radius: 50%;
      animation: pulse 1.8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.4;
        transform: scale(0.75);
      }
    }

    .status-tag span {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    .status-card h4 {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .status-card p {
      font-size: 14px;
      opacity: 0.85;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .status-card .btn-white {
      background: white;
      color: #00685f;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .status-card .btn-white:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }

    .status-card .bg-icon {
      position: absolute;
      right: -10px;
      bottom: -20px;
      opacity: 0.08;
      user-select: none;
      pointer-events: none;
    }

    .status-card .bg-icon .icon {
      font-size: 140px;
    }

    /* ===== INSIGHT CARD ===== */
    .insight-card {
      background: #f0f6fe;
      border: 1px solid #e3edfa;
      padding: 20px 22px;
      border-radius: 12px;
    }

    .insight-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #000068;
      margin-bottom: 6px;
    }

    .insight-header .icon {
      font-size: 20px;
    }

    .insight-header span {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }

    .insight-card blockquote {
      font-size: 14px;
      line-height: 1.6;
      color: #1a2a3a;
      font-style: italic;
      margin: 0;
      padding: 0;
    }

    .empty-message {
      color: #7a8a9a;
      font-size: 13px;
      text-align: center;
      padding: 8px 0;
    }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .filled {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `;

  static properties = {
      departments: {type: Array},
      loading: {type: Boolean}
    };
  
    constructor() {
      super();
      this.departments = [];
      this.loading = true;
    }
  
    connectedCallback(){
      super.connectedCallback();
      this.DepartmentLoad();
    }
  
    async DepartmentLoad (){
      try {
        const data = await getDepartmentLoad();
        if(data.success) {
          this.departments = data.departments;
        }
      } catch (err) {
        console.error('Failed to load department load', err);
      } finally {
        this.loading = false;
      }
    }

  render() {
    return html`
      <div class="right-stack">
        <!-- Department Load -->
        <div class="dept-card">
        <h3>Department Load</h3>
          ${this.loading
              ? html`<p class="empty-message">Loading...</p>`
              : this.departments.length === 0
              ? html`<p class="empty-message">No data</p>`
              : this.departments.map(dept => html`
                <div class="dept-item">
                  <div class="dept-row">
                  <span class="label">${dept.departmentName}</span>
                  <span class="value">${dept.documentCount} docs (${dept.percentage}%)</span>
                  </div>

                  <div class="dept-bar">
                    <div class="dept-bar-fill" style="width:${dept.percentage}%"></div>
                  </div>
                </div>
              `)
            }
        </div>

        <!-- Processing Status -->
        <div class="status-card">
          <div class="content">
            <div class="status-tag">
              <span class="pulse-dot"></span>
              <span>Processing Live Status</span>
            </div>
            <h4>--</h4>
            <p>Loading status information...</p>
            <button class="btn-white">Manage Queue</button>
          </div>
          <div class="bg-icon">
            <span class="material-symbols-outlined icon filled">description</span>
          </div>
        </div>

        <!-- Insight -->
        <div class="insight-card">
          <div class="insight-header">
            <span class="material-symbols-outlined icon">lightbulb</span>
            <span>AI Medical Insight</span>
          </div>
          <blockquote>Loading insights...</blockquote>
        </div>
      </div>
    `;
  }
}

customElements.define('admin-right-bar', RightBar);