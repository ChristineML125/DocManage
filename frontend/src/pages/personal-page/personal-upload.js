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

    .upload-card {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 1px solid #eef2f6;
      border-radius: 12px;
      padding: 32px;
    }

    .upload-card h2 { margin: 0 0 20px; }

    .drop-zone {
      border: 2px dashed #c5c6cd;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 20px;
    }

    .drop-zone:hover, .drop-zone.dragover {
      border-color: #6c63ff;
      background: #f5f3ff;
    }

    .drop-zone p { margin: 8px 0; color: #7a8a9a; }
    .drop-zone .icon { font-size: 48px; color: #c5c6cd; }

    .file-preview {
      background: #fafbff;
      border: 1px solid #eef2f6;
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
      color: #ef4444;
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

    .btn-primary { background: #6c63ff; color: white; }
    .btn-primary:hover { background: #5b4ed4; }
    .btn-primary:disabled { background: #c5c6cd; cursor: not-allowed; }

    .success-msg { color: #166534; background: #dcfce7; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }
    .error-msg { color: #991b1b; background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }

    .material-symbols-outlined {
      font-family: "Material Symbols Outlined";
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `;

  static properties = {
    file: { type: Object },
    uploading: { type: Boolean },
    success: { type: String },
    error: { type: String }
  };

  constructor() {
    super();
    this.file = null;
    this.uploading = false;
    this.success = '';
    this.error = '';
  }

  connectedCallback() {
    super.connectedCallback();
    const user = sessionStorage.getItem('personalUser');
    if (!user) Router.go('/login');
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
      } else {
        this.error = res.message || 'Upload failed.';
      }
    } catch (err) {
      this.error = 'Upload failed. Please try again.';
    } finally {
      this.uploading = false;
    }
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
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('personal-upload-page', PersonalUploadPage);
