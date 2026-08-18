import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { getDocuments, getDocumentsList } from '../../api/documentAPI.js';
import { getFileUrl, fetchFile } from '../../api/http.js';

export class PersonalMainContent extends LitElement {
  static styles = css`
    :host { display: block; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: white;
      border: 1px solid #eef2f6;
      padding: 18px 20px;
      border-radius: 12px;
    }

    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #0b1c30;
      margin: 0 0 2px 0;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      color: #7a8a9a;
      margin: 0;
    }

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

    .table-header h2 { margin: 0; font-size: 16px; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: 12px 20px;
      font-size: 12px;
      font-weight: 600;
      color: #7a8a9a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #eef2f6;
    }
    td {
      padding: 12px 20px;
      font-size: 14px;
      color: #3d4947;
      border-bottom: 1px solid #f5f6f8;
    }
    tr:hover { background: #fafbff; }

    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-active { background: #dcfce7; color: #166534; }
    .badge-archived { background: #fee2e2; color: #991b1b; }

    .preview-btn {
      background: none;
      border: none;
      color: #6c63ff;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      font-family: inherit;
    }

    .empty { text-align: center; padding: 40px; color: #7a8a9a; }
  `;

  static properties = {
    documents: { type: Array },
    stats: { type: Object },
    loading: { type: Boolean }
  };

  constructor() {
    super();
    this.documents = [];
    this.stats = {};
    this.loading = true;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
  }

  async loadData() {
    try {
      const [docRes, countRes] = await Promise.all([
        http('/documents/my'),
        http('/documents/my/count')
      ]);
      if (docRes.success) this.documents = docRes.documents;
      if (countRes.success) this.stats = countRes;
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  previewDocument(doc) {
    Router.go(`/personal-documents?preview=${doc.documentID}`);
  }

  render() {
    return html`
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-number">${this.stats.totalDocument || 0}</p>
          <p class="stat-label">Total Documents</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">${this.stats.activeCount || 0}</p>
          <p class="stat-label">Active</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">${this.stats.archivedCount || 0}</p>
          <p class="stat-label">Archived</p>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h2>Recent Documents</h2>
        </div>
        ${this.documents.length === 0
          ? html`<div class="empty">No documents yet. Upload your first document!</div>`
          : html`
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${this.documents.slice(0, 5).map(doc => html`
                  <tr>
                    <td>${doc.documentName}</td>
                    <td>v${doc.VersionNum || 1}</td>
                    <td>
                      <span class="badge ${doc.statusName === 'Active' ? 'badge-active' : 'badge-archived'}">
                        ${doc.statusName}
                      </span>
                    </td>
                    <td>${doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <button class="preview-btn" @click=${() => this.previewDocument(doc)}>View</button>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          `}
      </div>
    `;
  }
}

import { http } from '../../api/http.js';
customElements.define('personal-main-content', PersonalMainContent);
