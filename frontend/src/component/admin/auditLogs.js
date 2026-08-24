import { LitElement, html, css } from 'lit';
import { getAuditLogs } from '../../api/auditLogAPI.js';

export class AuditLog extends LitElement {
  static styles = css`
    /* ----- Global reset & host ----- */
    :host {
      display: block;
      height: 100%;
      width: 100%;
      background: #f7f9fb;
      font-family: 'Inter', sans-serif;
      color: #191c1e;
      padding: 20px;
      box-sizing: border-box;
    }

    /* ----- Main card container ----- */
    .container {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #eef2f6;
      overflow: hidden;
      height: 100%;
      min-height: 0;
    }

    /* ----- Top bar: filters + stats ----- */
    .top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #ffffff;
      border-bottom: 1px solid #eef2f6;
      gap: 12px;
    }

    .filter {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .column {
      display: flex;
      align-items: center;
      background: #f8fafc;
      padding: 4px 12px 4px 8px;
      border-radius: 8px;
      border: 1px solid #dce2ea;
      transition: border-color 0.2s;
    }
    .column:hover {
      border-color: #b0c0d0;
    }

    .column .icon {
      font-size: 20px;
      color: #5a6a7a;
      margin-right: 6px;
    }

    .column select {
      background: transparent;
      border: none;
      padding: 6px 0;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      color: #1e293b;
      outline: none;
      cursor: pointer;
      min-width: 100px;
    }
    .column select:hover {
      color: #0f172a;
    }

    .all-auditLogs {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-right: 8px;
    }

    .filter-bar {
      font-size: 13px;
      font-weight: 500;
      color: #5a6a7a;
      background: #f1f5f9;
      padding: 4px 14px;
      border-radius: 20px;
    }

    /* ----- Left pane (table) ----- */
    .left-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      min-width: 0;
      overflow: hidden;
    }

    .table-wrap {
      flex: 1;
      overflow-y: auto;
      padding: 0 4px 4px 4px;
    }

    /* ----- Table styles ----- */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead th {
      position: sticky;
      top: 0;
      background: #f8fafc;
      padding: 14px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6a7a8a;
      border-bottom: 2px solid #eef2f6;
      z-index: 2;
    }

    tbody td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f3f7;
      color: #1e293b;
      vertical-align: middle;
    }

    tbody tr {
      cursor: pointer;
      transition: background 0.15s;
    }
    tbody tr:hover {
      background: #f8fafc;
    }
    tbody tr.active {
      background: #eef6ff;
      border-left: 4px solid #00685f;
    }

    .badge {
      display: inline-block;
      padding: 2px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      background: #e0e7ff;
      color: #1e40af;
    }

    .view-btn {
      background: transparent;
      border: 1px solid #dce2ea;
      border-radius: 6px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #1e293b;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .view-btn:hover {
      background: #f1f5f9;
      border-color: #b0c0d0;
    }

    /* ----- Pagination ----- */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 14px 20px;
      border-top: 1px solid #eef2f6;
      background: #fafbfc;
    }
    .pagination button {
      background: #ffffff;
      border: 1px solid #dce2ea;
      border-radius: 6px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 500;
      color: #1e293b;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .pagination button:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #b0c0d0;
    }
    .pagination button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .pagination span {
      font-size: 13px;
      color: #5a6a7a;
    }

    /* ----- Right pane (details) ----- */
    .right-pane {
      width: 340px;
      background: #fafbfc;
      border-left: 1px solid #eef2f6;
      padding: 24px 20px;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
    }

    .detail-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 24px;
      border-bottom: 1px solid #eef2f6;
      padding-bottom: 12px;
    }

    .detail-item {
      margin-bottom: 18px;
    }

    .detail-label {
      font-size: 11px;
      color: #6a7a8a;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 14px;
      color: #1e293b;
      word-break: break-word;
    }

    /* ----- Empty state ----- */
    .empty-placeholder {
      text-align: center;
      padding: 40px 20px;
      color: #8a9aa8;
    }
    .empty-placeholder .icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
      color: #c0d0dc;
    }
    .empty-placeholder p {
      font-size: 14px;
      margin: 0;
    }

    /* ----- Material icons adjustment ----- */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      vertical-align: middle;
    }

    /* ----- Responsive ----- */
    .content-row {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    @media (max-width: 1024px) {
      .content-row {
        display: block;
        overflow-y: auto;
      }
      .left-pane { overflow: visible; display: block; }
      .table-wrap { overflow-x: auto; overflow-y: visible; }
      table { min-width: 760px; }
      .right-pane {
        width: 100%;
        border-left: none;
        border-top: 1px solid #eef2f6;
      }
    }

    @media (max-width: 640px) {
      :host { height: auto; min-height: 100%; }
      .top { flex-direction: column; align-items: stretch; gap: 10px; padding: 10px 12px; }
      .filter { flex-wrap: wrap; gap: 8px; }
      .column select { max-width: 100%; font-size: 12px; }
      thead th, tbody td { padding: 9px 8px; font-size: 12px; }
      .badge { font-size: 11px; white-space: nowrap; }
      .right-pane { padding: 16px 14px; }
      .pagination { padding: 10px 8px; gap: 10px; }
    }
  `;

  static properties = {
    auditLog: { type: Array },
    selectedLogs: { type: Object },
    loading: { type: Boolean },
    filterTime: { type: String },
    filterAction: { type: String },
    filterEntity: {type: String},
    currentPage: { type: Number },
    pageSize: { type: Number },
    showDetail: {type: Boolean}
  };

  constructor() {
    super();
    this.auditLog = [];
    this.selectedLogs = null;
    this.loading = true;
    this.filterTime = 'all';
    this.filterAction = 'all';
    this.filterEntity = 'all';
    this.currentPage = 1;
    this.pageSize = 30;
    this.showDetail = false;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async fetchAuditLogs() {
    this.loading = true;
    try {
      const data = await getAuditLogs();
      console.log('Audit API:', data);
      if (data.success) {
        this.auditLog = data.auditLog || [];
        if (this.auditLog.length > 0 && !this.selectedLogs) {
          this.selectedLogs = this.auditLog[0];
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      this.loading = false;
    }
  }

  selectAuditLogs(log) {
    this.selectedLogs = log;
  }

  firstUpdated() {
    this.fetchAuditLogs();
  }

  handleTimeFilter(e) {
    this.filterTime = e.target.value;
  }

  handleActionFilter(e) {
    this.filterAction = e.target.value;
  }

  handleTargetFilter(e) {
    this.filterEntity = e.target.value;
  }

  getEntityTypeFromAction(action) {
      if (!action) return 'Unknown';
      const lower = action.toLowerCase();
      if (lower.includes('document')) return 'Document';
      if (lower.includes('user')) return 'User';

      return 'Unknown';
  }

  get filteredlogs() {
    let logs = [...this.auditLog];
    if (this.filterTime && this.filterTime !== 'all') {
        const now = new Date();
        logs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            if (this.filterTime === 'today') {
                return logDate.toDateString() === now.toDateString();
            } else if (this.filterTime === 'last7') {          // 与 option value 一致
                const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            } else if (this.filterTime === 'last30') {         // 与 option value 一致
                const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
                return diffDays <= 30;
            }
            return true;
        });
    }

      if (this.filterAction && this.filterAction !== 'all') {
        const keyword = this.filterAction.toLowerCase();
        logs = logs.filter(log =>
          (log.Action || '').toLowerCase().includes(keyword)
        );
      }

      if (this.filterEntity && this.filterEntity !== 'all') {
        const keyword = this.filterEntity.toLowerCase();
        logs = logs.filter(log => {
          const type = this.getEntityTypeFromAction(log.Action);
          return type === this.filterEntity;
        }
        );
      }

    return logs; 
    
  }

  get paginatedLogs() {
    const filtered = this.filteredlogs;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return filtered.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredlogs.length / this.pageSize);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  render() {
    if (this.loading) {
      return html`<p>Loading...</p>`;
    }

    return html`
      <div class="container">
        <!-- Top bar: filters and stats -->
        <div class="top">
          <div class="filter">
            <div class="column">
              <span class="material-symbols-outlined icon">calendar_today</span>
              <select id="filter-time" @change="${this.handleTimeFilter}">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
              </select>
            </div>
            <div class="column">
              <span class="material-symbols-outlined icon">bolt</span>
              <select id="action" @change="${this.handleActionFilter}">
                <option value="action">All Action</option>
                <option value="upload">Upload</option>
                <option value="delete">Delete</option>
                <option value="create">Create</option>
                <option value="block">Block</option>
                <option value="preview">Preview</option>
                <option value="update">Update</option>
                <option value="export">Export</option>
                <option value="download">Download</option>
              </select>
            </div>
            <div class="column">
              <span class="material-symbols-outlined icon">bolt</span>
              <select id="action" @change="${this.handleTargetFilter}">
                <option value="Entity">All Entity</option>
                <option value="Document">Document</option>
                <option value="User">User</option>
              </select>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="all-auditLogs">All Audit Logs</span>
            <span class="filter-bar">${this.auditLog.length} Audit Logs</span>
          </div>
        </div>

        <!-- Main area: table + details side by side -->
        <div class="content-row">
          <!-- Left table pane -->
          <div class="left-pane">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Username</th>
                    <th>Action</th>
                    <th>Target ID</th>
                    <th>Target Entity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${this.auditLog.length === 0
                    ? html`
                        <tr>
                          <td colspan="7">
                            <div class="empty-placeholder">
                              <span class="material-symbols-outlined icon">inbox</span>
                              <p>No audit logs available</p>
                            </div>
                          </td>
                        </tr>
                      `
                    : this.paginatedLogs.map(
                        (log) => html`
                          <tr
                            class="${this.selectedLogs && this.selectedLogs.id === log.id ? 'active' : ''}"
                            @click="${() => this.selectAuditLogs(log)}"
                          >
                            <td>${log.timestamp ? new Date(log.timestamp).toLocaleString() : '--'}</td>
                            <td><span>${log.UserName || 'Unknown'}</span></td>
                            <td><span class="badge">${log.Action || '--'}</span></td>
                            <td>${log.targetID || '--'}</td>
                            <td>${log.targetEntity || '--'}</td>
                            <td> 
                              <button
                                @click=${
                                    async ()=>{this.showDetail = true;
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        `
                      )}
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div class="pagination">
              <button ?disabled="${this.currentPage === 1}" @click="${this.previousPage}"><</button>
              <span>Page ${this.currentPage} of ${this.totalPages}</span>
              <button ?disabled="${this.currentPage === this.totalPages}" @click="${this.nextPage}">></button>
            </div>
          </div>

          ${this.showDetail ? html`
            <div class="right-pane">
                
            ${this.selectedLogs
              ? html`
                <div class="header">
                    <div class="detail-title">Audit Log Details</div>
                    <button @click=${ async ()=>{this.showDetail = false;}}>
                        <span class="material-symbols-outlined icon">close</span>
                    </button>
                </div>

                  <div class="detail-item">
                    <div class="detail-label">Username</div>
                    <div class="detail-value">${this.selectedLogs.UserName || '--'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Action</div>
                    <div class="detail-value">${this.selectedLogs.Action || '--'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Target Entity</div>
                    <div class="detail-value">${this.selectedLogs.targetEntity || '--'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Timestamp</div>
                    <div class="detail-value">${this.selectedLogs.timestamp ? new Date(this.selectedLogs.timestamp).toLocaleString() : '--'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${this.selectedLogs.description || '--'}</div>
                  </div>
                `
              : html`
                  <div class="detail-title">Audit Log Details</div>
                  <p style="color: #6a7a8a; font-size: 14px;">Select an audit log to view details.</p>
                `}
            </div>
            `: ''
          }
          
        </div>
      </div>
    `;
  }
}

customElements.define('auditlog-page', AuditLog);