import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { http } from '../../api/http.js';
import '../../component/personal/personal-sidebar.js';
import '../../component/personal/personal-top-bar.js';

export class PersonalUploadPage extends LitElement {

  static styles = css`
    :host { display: block; height: 100vh; width: 100%; overflow: hidden; }
    .layout { display: flex; height: 100%; }
    .top { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .scroll-area { flex: 1; overflow-y: auto; padding: 32px; }

    @media (max-width: 767px) {
      .scroll-area { padding: 0 0 84px 0; }
    }

    .upload-card {
      max-width: 600px;
      margin: 0 auto 32px;
      background: white;
      border: 1px solid #bdc9c5;
      border-radius: 12px;
      padding: 32px;
    }

    .upload-card h2 {
      margin: 0 0 20px;
      font-size: 18px; font-weight: 700;
    }

    .drop-zone {
      border: 2px dashed #bdc9c5;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 20px;
    }

    .drop-zone:hover, .drop-zone.dragover {
      border-color: #00685f;
      background: #e6f6ff;
    }

    .drop-zone p { margin: 8px 0; color: #6e7a76; }
    .drop-zone .icon { font-size: 48px; color: #bdc9c5; }

    .file-preview {
      background: #f3faff;
      border: 1px solid #bdc9c5;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .file-preview .name { flex: 1; font-weight: 600; font-size: 14px; }
    .file-preview .remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #ba1a1a;
      font-size: 18px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      width: 100%;
    }

    .btn-primary { background: #00685f; color: white; }
    .btn-primary:hover { background: #005047; }
    .btn-primary:disabled { background: #bdc9c5; cursor: not-allowed; }

    .success-msg { color: #166534; background: #dcfce7; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }
    .error-msg { color: #93000a; background: #ffdad6; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .recent-section {
      max-width: 600px;
      margin: 0 auto;
    }

    .doc-list { display: flex; flex-direction: column; gap: 8px; }

    .doc-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      background: white;
      border: 1px solid #bdc9c5;
      border-radius: 8px;
      transition: background 0.15s;
    }
    .doc-row:hover { background: #f3faff; }

    .doc-icon {
      width: 36px; height: 36px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .doc-icon.pdf { background: #ffdad6; color: #ba1a1a; }
    .doc-icon.docx { background: #d4e3ff; color: #005faf; }
    .doc-icon.xlsx { background: #dcfce7; color: #166534; }
    .doc-icon.txt { background: #e6f6ff; color: #00685f; }
    .doc-icon.other { background: #cfe6f2; color: #3e4946; }

    .doc-info { flex: 1; min-width: 0; }
    .doc-name {
      font-size: 14px; font-weight: 600;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .doc-meta { font-size: 12px; color: #6e7a76; margin-top: 2px; }

    .doc-status {
      font-size: 11px; font-weight: 600;
      padding: 2px 8px; border-radius: 9999px;
    }
    .status-active { background: #dcfce7; color: #166534; }
    .status-pending { background: #ffedd5; color: #9a3412; }
    .status-archived { background: #ffdad6; color: #93000a; }

    .empty-state {
      text-align: center; padding: 32px;
      color: #6e7a76; font-size: 14px;
    }
  `;

  static properties = {
    file: { type: Object },
    uploading: { type: Boolean },
    success: { type: String },
    error: { type: String },
    recentDocs: { type: Array }
  };

  constructor() {
    super();
    this.file = null;
    this.uploading = false;
    this.success = '';
    this.error = '';
    this.recentDocs = [];
  }

  connectedCallback() {
    super.connectedCallback();
    const user = sessionStorage.getItem('personalUser');
    if (!user) Router.go('/login');
    this.loadRecentDocs();
  }

  async loadRecentDocs() {
    try {
      const res = await http('/documents/my?limit=5');
      this.recentDocs = res.documents || res || [];
    } catch (e) {
      this.recentDocs = [];
    }
  }

  handleDrop(e) {
    e.preventDefault();
    this.file = e.dataTransfer.files[0];
  }

  handleFileSelect(e) {
    this.file = e.target.files[0];
  }

  removeFile() {
    this.file = null;
  }

  async handleUpload() {
    if (!this.file) return;
    this.uploading = true;
    this.success = '';
    this.error = '';

    try {
      const formData = new FormData();
      formData.append('file', this.file);

      const res = await http('/documents/personal/upload', {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        this.success = 'Document uploaded successfully!';
        this.file = null;
        this.loadRecentDocs();
      } else {
        this.error = res.message || 'Upload failed.';
      }
    } catch (err) {
      this.error = 'Upload failed. Please try again.';
    } finally {
      this.uploading = false;
    }
  }

  getFileExt(name) {
    return (name || '').split('.').pop().toLowerCase();
  }

  getDocIconClass(name) {
    const ext = this.getFileExt(name);
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'docx';
    if (['xls', 'xlsx'].includes(ext)) return 'xlsx';
    if (ext === 'txt') return 'txt';
    return 'other';
  }

  getDocIcon(name) {
    const ext = this.getFileExt(name);
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext)) return 'description';
    if (['xls', 'xlsx'].includes(ext)) return 'table_chart';
    if (ext === 'txt') return 'text_snippet';
    return 'insert_drive_file';
  }

  formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusClass(s) {
    if (!s) return '';
    const n = s.toLowerCase();
    if (n === 'active') return 'status-active';
    if (n === 'pending') return 'status-pending';
    if (n === 'archived') return 'status-archived';
    return '';
  }

  render() {
    return html`
      <div class="layout">
        <personal-sidebar></personal-sidebar>
        <div class="top">
          <personal-top-bar pageTitle="Upload Document"></personal-top-bar>
          <div class="scroll-area">
            <div class="upload-card">
              <h2>Upload a Document</h2>

              ${this.success ? html`<div class="success-msg">${this.success}</div>` : ''}
              ${this.error ? html`<div class="error-msg">${this.error}</div>` : ''}

              <div class="drop-zone" @dragover=${e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                @dragleave=${e => e.currentTarget.classList.remove('dragover')}
                @drop=${this.handleDrop}
                @click=${() => this.renderRoot.querySelector('#fileInput').click()}>

                <span class="material-symbols-outlined icon">cloud_upload</span>
                <p><strong>Click or drag a file here</strong></p>
                <p>Supports PDF, DOCX, XLSX, TXT</p>
                <input type="file" id="fileInput" hidden accept=".pdf,.docx,.xlsx,.txt,.doc,.xls"
                  @change=${this.handleFileSelect} />
              </div>

              ${this.file ? html`
                <div class="file-preview">
                  <span class="material-symbols-outlined">description</span>
                  <span class="name">${this.file.name}</span>
                  <button class="remove" @click=${this.removeFile}>&times;</button>
                </div>
              ` : ''}

              <button class="btn btn-primary" @click=${this.handleUpload}
                ?disabled=${!this.file || this.uploading}>
                ${this.uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>

            <div class="recent-section">
              <h3 style="font-size:16px;font-weight:700;margin:0 0 16px;color:#071e27;">Recent Documents</h3>
              ${this.recentDocs.length === 0
                ? html`<div class="empty-state">No documents uploaded yet.</div>`
                : html`
                  <div class="doc-list">
                    ${this.recentDocs.map(doc => html`
                      <div class="doc-row">
                        <div class="doc-icon ${this.getDocIconClass(doc.documentName)}">
                          <span class="material-symbols-outlined">${this.getDocIcon(doc.documentName)}</span>
                        </div>
                        <div class="doc-info">
                          <div class="doc-name">${doc.documentName}</div>
                          <div class="doc-meta">${this.formatDate(doc.uploadDate)}${doc.versionNum ? ' · v' + doc.versionNum : ''}</div>
                        </div>
                        ${doc.statusName ? html`
                          <span class="doc-status ${this.getStatusClass(doc.statusName)}">${doc.statusName}</span>
                        ` : ''}
                      </div>
                    `)}
                  </div>
                `}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('personal-upload-page', PersonalUploadPage);
