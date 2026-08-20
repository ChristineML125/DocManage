import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { getDocuments, getDocumentsList, getFavorites, toggleFavorite } from '../../api/documentAPI.js';
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

    .view-all-btn {
      background: none;
      border: none;
      color: #005e53;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      font-family: inherit;
      text-decoration: none;
    }

    .view-all-btn:hover { text-decoration: underline; }

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
      color: #005e53;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      font-family: inherit;
    }

    .star-btn {
      color: #cbd5e1;
      transition: all 0.2s;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .star-btn:hover {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.08);
    }

    .star-btn.starred { color: #f59e0b; }

    .star-btn .material-symbols-outlined {
      font-size: 18px;
    }

    .empty { text-align: center; padding: 40px; color: #7a8a9a; }
  `;

  static properties = {
    documents: { type: Array },
    stats: { type: Object },
    loading: { type: Boolean },
    favorites: { type: Set }
  };

  constructor() {
    super();
    this.documents = [];
    this.stats = {};
    this.loading = true;
    this.favorites = new Set();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
    this.loadFavorites();
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

  async loadFavorites() {
    try {
      const res = await getFavorites();
      if (res.success) {
        this.favorites = new Set(res.favorites.map(f => f.documentID));
      }
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  }

  async handleToggleFavorite(doc, e) {
    e.stopPropagation();
    try {
      const res = await toggleFavorite(doc.documentID);
      if (res.success) {
        if (res.favorited) {
          this.favorites = new Set([...this.favorites, doc.documentID]);
        } else {
          const next = new Set(this.favorites);
          next.delete(doc.documentID);
          this.favorites = next;
        }
      }
    } catch (err) {
      console.error('Toggle favorite failed', err);
    }
  }

  previewDocument(doc) {
    Router.go(`/personal-documents?preview=${doc.documentID}`);
  }

  goToDocuments() {
    Router.go('/personal-documents');
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
          <button class="view-all-btn" @click=${() => this.goToDocuments()}>View All</button>
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
                  <th style="width:40px"></th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${this.documents.slice(0, 5).map(doc => html`
                  <tr>
                    <td>${doc.documentName}</td>
                    <td>v${doc.versionNum || 1}</td>
                    <td>
                      <span class="badge ${doc.statusName === 'Active' ? 'badge-active' : 'badge-archived'}">
                        ${doc.statusName}
                      </span>
                    </td>
                    <td>${doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '-'}</td>
                    <td style="text-align:center">
                      <button class="star-btn ${this.favorites.has(doc.documentID) ? 'starred' : ''}"
                        @click=${(e) => this.handleToggleFavorite(doc, e)}
                        title="${this.favorites.has(doc.documentID) ? 'Remove from favorites' : 'Add to favorites'}">
                        <span class="material-symbols-outlined">${this.favorites.has(doc.documentID) ? 'star' : 'star_border'}</span>
                      </button>
                    </td>
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
