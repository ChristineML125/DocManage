import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { getDocumentsList, getDocuments, deleteDocuments } from '../../api/documentAPI';

export class MainContent extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: white;
      border: 1px solid #eef2f6;
      padding: 18px 20px;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: #dce4ed;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }

    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #0b1c30;
      margin: 0 0 2px 0;
      letter-spacing: -0.5px;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      color: #7a8a9a;
      margin: 0;
      letter-spacing: 0.2px;
    }

    .stat-meta {
      font-size: 12px;
      font-weight: 600;
      margin-top: 6px;
      display: inline-block;
    }

    .stat-meta.green {
      color: #00685f;
    }
    .stat-meta.blue {
      color: #006591;
    }
    .stat-meta.red {
      color: #ba1a1a;
    }
    .stat-meta.gray {
      color: #7a8a9a;
    }

    /* Table */
    .table-card {
      background: white;
      border: 1px solid #eef2f6;
      border-radius: 12px;
      overflow: hidden;
    }

    .table-header {
      padding: 16px 20px;
      border-bottom: 1px solid #eef2f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h3 {
      font-size: 17px;
      font-weight: 600;
      color: #0b1c30;
      margin: 0;
    }

    .table-header button {
      color: #00685f;
      font-size: 13px;
      font-weight: 600;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.15s;
      font-family: inherit;
    }

    .table-header button:hover {
      background: rgba(0, 104, 95, 0.06);
      text-decoration: underline;
    }

    .table-wrap {
      overflow-x: auto;
      padding: 0 4px 4px 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead th {
      padding: 12px 16px 12px 20px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #7a8a9a;
      border-bottom: 1px solid #eef2f6;
      background: #fafbfc;
    }

    tbody td {
      padding: 12px 16px 12px 20px;
      border-bottom: 1px solid #f0f3f7;
      color: #2a3a4a;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover {
      background: #f8fafc;
    }

    .doc-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .doc-avatar {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
      background: #e0e7ff;
      color: #1e40af;
    }

    .doc-title {
      font-weight: 600;
      color: #0b1c30;
    }

    .badge {
      display: inline-block;
      padding: 2px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

     .badge-version {
        display: inline-block;
        padding: 2px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        color: #0c00b4;
        background: #c8fdff;
    }

    .status-badge {
        display: inline-block;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
    }

    .status-active {
        background: #dcfce7;
        color: #166534;
    }

    .status-archived {
        background: #d3d3d3;
        color: #4b4b4b;
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

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      font-size: 30px;
    }

    .filled {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .empty-placeholder {
      padding: 40px 20px;
      text-align: center;
      color: #7a8a9a;
    }

    .empty-placeholder .icon {
      font-size: 48px;
      color: #dce4ed;
      margin-bottom: 12px;
    }

    .empty-placeholder p {
      font-size: 14px;
      margin: 0;
    }

    @media (max-width: 992px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .stat-number {
        font-size: 22px;
      }
    }
  `;

  static properties = {
    totalDocument: {type: Number},
    category: {type: Number},
    active: {type: Number},
    archived: {type: Number},
    loading: {type: Boolean},
    documents: {type: Array}
  }

  constructor(){
    super();
    this.totalDocument= 0;
    this.category = 0;
    this.active = 0;
    this.archived= 0;
    this.loading=true;
    this.documents = [];
  }

 async connectedCallback() {
    super.connectedCallback();
    try {
        const data = await getDocuments();
        console.log('Stats data:', data);
        if (data && data.success) {
            this.totalDocument = data.totalDocument;
            this.category = data.category;
            this.active = data.activeCount;
            this.archived = data.archivedCount;
            this.requestUpdate();
        }
    } catch (err) {
        console.error('Failed to load stats:', err);
    } finally {
        this.loading = false;
    }

    try {
        const listData = await getDocumentsList();
        if (listData && listData.success) {
            this.documents = listData.documents.slice(0, 5);
        }
    } catch (err) {
        console.error('Failed to load documents:', err);
    }
}

  _handleDeleteClick(e) {
    e.stopPropagation();
    const row = e.target.closest('tr');
    if (!row) return;
    const tbody = row.parentElement;
    const rows = Array.from(tbody.children); 
    const index = rows.indexOf(row); 
    const doc = this.documents[index];
    if (doc) {
        const docId = doc.id || doc.documentID;
        console.log('Deleting doc:', docId, doc);
        this.handleDelete(docId);
    } else {
        console.error('Could not find document at row', index);
    }
  }

  getFileType(filePath) {
    if(!filePath) return '--';

    const ext = filePath.split('.').pop().toLowerCase();
    return ext.toUpperCase();
  }

  getStatusClass(statusName) {
    if (!statusName) return '';
      switch(statusName) {
          case "Active":
              return "status-active";
          case "Archived":
              return "status-archived";
          default:
              return "";
    }
  }

  render() {
    return html`
      <div class="stats-grid">
        <div class="stat-card">
          <span class="icon-box">
            <span class="material-symbols-outlined icon">article</span>
          </span>
          <p class="stat-number">${this.totalDocument}</p>
          <p class="stat-label">Total Documents</p>
          
        </div>
        <div class="stat-card">
          <span class="icon-box">
            <span class="material-symbols-outlined icon">category</span>
          </span>
          <p class="stat-number">${this.category}</p>
          <p class="stat-label">Categories</p>
        </div>
        <div class="stat-card">
          <span class="icon-box">
            <span class="material-symbols-outlined icon">description</span>
          </span>
          <p class="stat-number">${this.active}</p>
          <p class="stat-label">Active</p>
        </div>
        <div class="stat-card">
          <span class="icon-box">
            <span class="material-symbols-outlined icon">clinical_notes</span>
          </span>
          <p class="stat-number">${this.archived}</p>
          <p class="stat-label">Archived Files</p>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div class="table-header">
          <h3>Recent Documents</h3>
          <button class= "nav-link" @click=${() => Router.go('/admin-allDocument')}>
              View All →
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Department</th>
                <th>Category</th>
                <th>File Type</th>
                <th>Status</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
    ${this.documents.length === 0
        ? html`
            <tr>
                <td colspan="6">
                    <div class="empty-placeholder">
                        <div class="material-symbols-outlined icon">inbox</div>
                        <p>No documents available</p>
                    </div>
                </td>
            </tr>`
        : this.documents.map(doc => html`
            <tr>
                <td>
                    <div class="doc-info">
                        <div class="doc-avatar">
                            ${doc.documentName?.charAt(0)}
                        </div>
                        <span class="doc-title" title="${doc.documentName}">${doc.documentName}</span>
                    </div>
                </td>
                <td><span>${doc.departmentName || 'N/A'}</span></td>
                <td><span class="badge">${doc.categoriesName || 'N/A'}</span></td>
                <td><span class="badge">${this.getFileType(doc.filePath)}</span></td>
                <td><span class="status-badge ${this.getStatusClass(doc.statusName)}">
                    ${this.editingStatusID === doc.documentID
                    ? html`
                      <button class="action-btn"
                              @click=${() => this.toggleStatus(doc)}
                      >
                        ${doc.statusName}
                      </button>
                    `: html`
                        ${doc.statusName}
                    `}
                </span>
                </td>
                <td><span class="badge-version">V ${doc.versionNum}.0</span></td>
              </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

customElements.define('admin-main-content', MainContent);