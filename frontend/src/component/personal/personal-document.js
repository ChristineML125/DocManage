import { LitElement, html, css } from 'lit';
import { http, getFileUrl, fetchFile } from '../../api/http.js';
import {
  getDocumentsList, getVersionList, generateAISummary, aiService,
  exportPDF, exportDocx, exportXlsx, previewDocument,
  uploadNewVersion, updateDocumentStatus
} from '../../api/documentAPI.js';

export class PersonalDocumentPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-bar {
      flex: 1;
      min-width: 200px;
      padding: 10px 14px;
      border: 1px solid #c5c6cd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }

    .search-bar:focus { border-color: #6c63ff; }

    .doc-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .doc-card {
      background: white;
      border: 1px solid #eef2f6;
      border-radius: 10px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .doc-card:hover { border-color: #6c63ff; box-shadow: 0 2px 8px rgba(108,99,255,0.08); }
    .doc-card.selected { border-color: #6c63ff; background: #f5f3ff; }

    .doc-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .doc-icon.pdf { background: #ef4444; }
    .doc-icon.docx { background: #3b82f6; }
    .doc-icon.xlsx { background: #22c55e; }
    .doc-icon.other { background: #6b7280; }

    .doc-info { flex: 1; min-width: 0; }
    .doc-name { font-size: 14px; font-weight: 600; color: #0b1c30; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-meta { font-size: 12px; color: #7a8a9a; margin: 2px 0 0; }

    .doc-actions {
      display: flex;
      gap: 6px;
    }

    .btn-sm {
      padding: 6px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      color: #3d4947;
      font-family: inherit;
    }

    .btn-sm:hover { background: #f5f3ff; border-color: #6c63ff; color: #6c63ff; }

    /* Detail panel */
    .detail-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 520px;
      max-width: 90vw;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 20px rgba(0,0,0,0.1);
      z-index: 100;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }

    .detail-panel.open { transform: translateX(0); }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eef2f6;
    }

    .detail-header h2 { margin: 0; font-size: 18px; }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 24px;
      color: #7a8a9a;
    }

    .detail-body { flex: 1; overflow-y: auto; padding: 24px; }

    .detail-section { margin-bottom: 20px; }
    .detail-section h3 { font-size: 14px; color: #7a8a9a; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item label { display: block; font-size: 12px; color: #7a8a9a; margin-bottom: 2px; }
    .info-item span { font-size: 14px; font-weight: 600; color: #0b1c30; }

    .version-list { display: flex; flex-direction: column; gap: 8px; }
    .version-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #fafbff;
      border-radius: 8px;
      border: 1px solid #eef2f6;
    }
    .version-item.current { border-color: #6c63ff; background: #f5f3ff; }
    .version-label { font-weight: 600; font-size: 13px; }
    .version-date { font-size: 12px; color: #7a8a9a; }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
    }

    .btn-primary { background: #6c63ff; color: white; }
    .btn-primary:hover { background: #5b4ed4; }
    .btn-outline { background: white; border: 1px solid #ddd; color: #3d4947; }
    .btn-outline:hover { border-color: #6c63ff; }

    .action-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

    .summary-box {
      background: #fafbff;
      border: 1px solid #eef2f6;
      border-radius: 8px;
      padding: 14px;
      font-size: 13px;
      line-height: 1.6;
      color: #3d4947;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 99;
    }

    .pdf-frame {
      width: 100%;
      height: 300px;
      border: 1px solid #eef2f6;
      border-radius: 8px;
      margin-top: 8px;
    }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      font-size: 20px;
    }

    .empty { text-align: center; padding: 60px 20px; color: #7a8a9a; }
  `;

  static properties = {
    documents: { type: Array },
    filteredDocs: { type: Array },
    selectedDoc: { type: Object },
    versions: { type: Array },
    summary: { type: String },
    keyword: { type: String },
    loading: { type: Boolean },
    panelOpen: { type: Boolean }
  };

  constructor() {
    super();
    this.documents = [];
    this.filteredDocs = [];
    this.selectedDoc = null;
    this.versions = [];
    this.summary = '';
    this.keyword = '';
    this.loading = true;
    this.panelOpen = false;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadDocuments();
  }

  async loadDocuments() {
    this.loading = true;
    try {
      const res = await http('/documents/my');
      if (res.success) {
        this.documents = res.documents;
        this.filteredDocs = res.documents;
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  filterDocuments() {
    const kw = this.keyword.toLowerCase();
    if (!kw) {
      this.filteredDocs = this.documents;
    } else {
      this.filteredDocs = this.documents.filter(d =>
        d.documentName.toLowerCase().includes(kw)
      );
    }
  }

  async selectDoc(doc) {
    this.selectedDoc = doc;
    this.panelOpen = true;
    this.versions = [];
    this.summary = '';

    try {
      const [verRes, sumRes] = await Promise.all([
        getVersionList(doc.documentID),
        aiService(doc.documentID)
      ]);
      if (verRes.success) this.versions = verRes.versions;
      if (sumRes.success && sumRes.summary) this.summary = sumRes.summary;
    } catch (err) {
      console.error(err);
    }
  }

  closePanel() {
    this.panelOpen = false;
    this.selectedDoc = null;
  }

  getExt(name) {
    if (!name) return 'other';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
    return 'other';
  }

  async fetchFileBlob(filePath) {
    const base = (http.toString().includes('/api') ? '' : '');
    const url = `/files/${filePath}`;
    const token = sessionStorage.getItem('token');
    const res = await fetch(url, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  }

  async downloadFile(filePath, displayName) {
    try {
      const res = await this.fetchFileBlob(filePath);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = displayName || filePath;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed');
    }
  }

  async handleExport(type) {
    if (!this.selectedDoc) return;
    try {
      let res;
      if (type === 'pdf') res = await exportPDF(this.selectedDoc.documentID);
      else if (type === 'docx') res = await exportDocx(this.selectedDoc.documentID);
      else if (type === 'xlsx') res = await exportXlsx(this.selectedDoc.documentID);

      if (res && res.success && res.downloadUrl) {
        await this.downloadFile(
          res.downloadUrl.split('?')[0].replace('/files/', ''),
          res.downloadUrl.split('name=')[1] || `${this.selectedDoc.documentName}.${type}`
        );
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  async handleGenerateSummary() {
    if (!this.selectedDoc) return;
    try {
      const res = await generateAISummary(this.selectedDoc.documentID);
      if (res.success) this.summary = res.summary;
    } catch (err) {
      console.error(err);
    }
  }

  async previewFile() {
    if (!this.selectedDoc) return;
    try {
      const res = await previewDocument(this.selectedDoc.documentID);
      if (res.success && res.fileUrl) {
        const blobRes = await this.fetchFileBlob(res.fileUrl.replace('/files/', ''));
        const blob = await blobRes.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      }
    } catch (err) {
      console.error('Preview failed:', err);
    }
  }

  render() {
    return html`
      <div class="toolbar">
        <input class="search-bar" type="text" placeholder="Search documents..."
          .value=${this.keyword}
          @input=${e => { this.keyword = e.target.value; this.filterDocuments(); }}
        />
      </div>

      <div class="doc-list">
        ${this.filteredDocs.length === 0
          ? html`<div class="empty">${this.loading ? 'Loading...' : 'No documents found.'}</div>`
          : this.filteredDocs.map(doc => html`
            <div class="doc-card ${this.selectedDoc?.documentID === doc.documentID ? 'selected' : ''}"
              @click=${() => this.selectDoc(doc)}>
              <div class="doc-icon ${this.getExt(doc.filePath)}">
                ${this.getExt(doc.filePath).toUpperCase()}
              </div>
              <div class="doc-info">
                <p class="doc-name">${doc.documentName}</p>
                <p class="doc-meta">v${doc.VersionNum || 1} &middot; ${doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '-'}</p>
              </div>
              <span class="badge ${doc.statusName === 'Active' ? 'badge-active' : 'badge-archived'}"
                style="padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;background:${doc.statusName === 'Active' ? '#dcfce7' : '#fee2e2'};color:${doc.statusName === 'Active' ? '#166534' : '#991b1b'}">
                ${doc.statusName}
              </span>
            </div>
          `)}
      </div>

      ${this.panelOpen ? html`
        <div class="overlay" @click=${this.closePanel}></div>
        <div class="detail-panel open">
          <div class="detail-header">
            <h2>${this.selectedDoc?.documentName || ''}</h2>
            <button class="close-btn" @click=${this.closePanel}>&times;</button>
          </div>
          <div class="detail-body">
            <div class="detail-section">
              <h3>Info</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Status</label>
                  <span>${this.selectedDoc?.statusName || '-'}</span>
                </div>
                <div class="info-item">
                  <label>Version</label>
                  <span>v${this.selectedDoc?.VersionNum || 1}</span>
                </div>
                <div class="info-item">
                  <label>Upload Date</label>
                  <span>${this.selectedDoc?.uploadDate ? new Date(this.selectedDoc.uploadDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Actions</h3>
              <div class="action-row">
                <button class="btn btn-primary" @click=${this.previewFile}>Preview</button>
                <button class="btn btn-outline" @click=${() => this.handleExport('pdf')}>Export PDF</button>
                <button class="btn btn-outline" @click=${() => this.handleExport('docx')}>Export DOCX</button>
                <button class="btn btn-outline" @click=${() => this.handleExport('xlsx')}>Export XLSX</button>
              </div>
            </div>

            <div class="detail-section">
              <h3>Versions</h3>
              <div class="version-list">
                ${(this.versions || []).map(v => html`
                  <div class="version-item ${v.isLatest ? 'current' : ''}">
                    <div>
                      <span class="version-label">Version ${v.VersionNum}</span>
                      <span class="version-date">&nbsp;&middot;&nbsp;${v.uploadDate ? new Date(v.uploadDate).toLocaleDateString() : '-'}</span>
                      ${v.isLatest ? html`<span style="color:#6c63ff;font-size:11px;font-weight:700;margin-left:8px;">CURRENT</span>` : ''}
                    </div>
                    <button class="btn-sm" @click=${() => this.downloadFile(v.filePath, `v${v.VersionNum}_${this.selectedDoc.documentName}.pdf`)}>Download</button>
                  </div>
                `)}
              </div>
            </div>

            <div class="detail-section">
              <h3>AI Summary</h3>
              ${this.summary
                ? html`<div class="summary-box">${this.summary}</div>`
                : html`<button class="btn btn-outline" @click=${this.handleGenerateSummary}>Generate Summary</button>`
              }
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('personal-document-page', PersonalDocumentPage);
