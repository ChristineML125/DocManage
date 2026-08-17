import { LitElement, html, css } from 'lit';
import { getAllLookUp } from '../../api/lookupAPI.js'
import { getDocumentsList, uploadDocument } from '../../api/documentAPI.js';
import { createCategory, getCategory } from '../../api/categoryAPI.js';


export class StaffUpload extends LitElement {
  static properties = {
    formData: { type: Object },
    selectedFile: { type: Object },
    categories: { type: Array },
    departments: { type: Array },
    recentUploads: { type: Array },
    loading: { type: Boolean },
    uploading: { type: Boolean },
    dragOver: { type: Boolean },
    uploadSuccess: {type: Boolean},
    lastUploadedFiles: {type: Array},
    showModal: { type: Boolean },
    newCategoryName: { type: String },
    newCategoryDescription: { type: String }
  };

  constructor() {
    super();
    this.formData = {
      categoryId: '',
      departmentId: '',
    };
    this.selectedFile = null;
    this.categories = [];
    this.departments = [];
    this.recentUploads = [];
    this.loading = true;
    this.uploading = false;
    this.dragOver = false;
    this.uploadSuccess = false;
    this.lastUploadedFiles = [];
    this.showModal = false;
    this.newCategoryName = '';
    this.newCategoryDescription = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchOptions();
    this.fetchRecentUploads();

    const userStr = sessionStorage.getItem('adminUser') || sessionStorage.getItem('staffUser');
    if(userStr) {
      const user = JSON.parse(userStr);
      if(user.departmentId){
        this.formData.departmentId = user.departmentId.toString();
      }
    }
  }

  async fetchOptions() {
    try {
      const data = await getAllLookUp();
      if (data.success) {
        this.categories = data.categories || data.category || [];
        this.departments = data.departments || data.department || [];
      }
    } catch (err) {
      console.error('Failed to load options', err);
    } finally {
      this.loading = false;
    }
  }

  async fetchRecentUploads() {
    try {
      const data = await getDocumentsList();
      if (data.success) {
        this.recentUploads = data.documents.slice(0, 5);
      }
    } catch (err) {
      console.error('Failed to load recent uploads', err);
    }
  }

  _onFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  _onDragOver(e) {
    e.preventDefault();
    this.dragOver = true;
  }

  _onDragLeave() {
    this.dragOver = false;
  }

  _onDrop(e) {
    e.preventDefault();
    this.dragOver = false;
    const file = e.dataTransfer.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  _updateFormField(field, value) {
    this.formData = { ...this.formData, [field]: value };
  }

  async _handleUpload() {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }
    if (!this.formData.categoryId) {
      alert('Please select a document category');
      return;
    }
    if (!this.formData.departmentId) {
      alert('Please select a department');
      return;
    }

    const userStr = sessionStorage.getItem('adminUser') || sessionStorage.getItem('staffUser');
    if(!userStr){
      alert ('User not logged in');
      return;
    }
    const user = JSON.parse(userStr);
    const branchId = user.branchId || user.BranchID || 1;

    this.uploading = true;
    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('categoryId', this.formData.categoryId);
      formData.append('departmentId', this.formData.departmentId);
      formData.append('branchId', branchId);

      // Use the shared API client so the request includes the current login token
      // and uses the configured API address instead of a hard-coded localhost URL.
      const data = await uploadDocument(formData);
      if (data.success) {
        alert('Document uploaded successfully!');

        this.formData = { title: '', categoryId: '', departmentId: '' };
        this.selectedFile = null;

        this.fetchRecentUploads();
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed');
    } finally {
      this.uploading = false;
    }
  }

  resetUpload(){
    this.uploadSuccess = false;
    this.lastUploadedFiles = [];
    this.selectedFile = null;
    this.formData = {categoryId: '', departmentId: ''}
  }

  async handleCreate() {
    const name = this.newCategoryName.trim();
    if (!name) {
      alert('Please enter a category name');
      return;
    }

    const data = await createCategory(name);
    if (data.success) {
      await this.fetchOptions();
      this.formData = { ...this.formData, categoryId: String(data.id) };
      this.closeModal();
    } else {
      alert(data.message);
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newCategoryName = '';
    this.newCategoryDescription = '';
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: #f8f9ff;
      font-family: 'Hanken Grotesk', sans-serif;
      color: #0b1c30;
      padding: 24px;
      box-sizing: border-box;
      overflow-y: auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
    }

    .page-header h2 {
      font-size: 24px;
      font-weight: 600;
      color: #00685f;
      margin: 0;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #00685f;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #00685f;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .bento-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }

    @media (max-width: 768px) {
      .bento-grid {
        grid-template-columns: 1fr;
      }
    }

    .upload-zone {
      display: flex;
      flex-direction: row;
      gap: 20px;
      align-items: flex-start;
      margin-top: 28px;
    }

    .upload-zone form-group {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
    }

    .upload-zone > form-group {
      flex: 1;               
      min-width: 0;
    }

    .upload-zone > form-group {
      width: 350px;        
      flex-shrink: 0;
    }

    .bento-card {
      background: #ffffff;
      border: 1px solid #d3e4fe;
      border-radius: 12px;
      padding: 24px;
      transition: all 0.2s ease;
    }

    .upload-zone {
      border: 2px dashed #bcc9c6;
      border-radius: 12px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-zone.drag-over {
      border-color: #00685f;
      background: #f4fffc;
    }

    .upload-zone .icon {
      font-size: 48px;
      color: #00685f;
      margin-bottom: 16px;
    }

    .upload-zone h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px;
    }

    .browse-btn {
      margin-top: 16px;
      padding: 8px 24px;
      border: 1px solid #00685f;
      color: #00685f;
      border-radius: 8px;
      background: transparent;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .browse-btn:hover {
      background: #00685f;
      color: white;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #3d4947;
      margin-bottom: 4px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #bcc9c6;
      border-radius: 8px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      border-color: #00685f;
      box-shadow: 0 0 0 2px rgba(0,104,95,0.2);
    }

    .category-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
    }

    .icon-btn {
      height: 38px;
      width: 42px;
      border: 1px solid #00685f;
      border-radius: 8px;
      background: #ffffff;
      color: #00685f;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: #00685f;
      color: #ffffff;
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      background: #00685f;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .submit-btn:hover {
      background: #008378;
    }

    .recent-list {
      margin-top: 32px;
    }

    .recent-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      background: white;
      border: 1px solid #eef2f6;
      transition: box-shadow 0.2s;
    }

    .recent-item:hover {
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }

    .recent-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-icon {
      width: 40px;
      height: 40px;
      background: #e0e7ff;
      color: #1e40af;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .success-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #ffffff;
      border: 1px solid #c8eadf;
      border-left: 6px solid #00685f;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 8px 24px rgba(11, 28, 48, 0.06);
    }

    .icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #e4f7f1;
      color: #00685f;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-circle .material-symbols-outlined {
      font-size: 34px;
    }

    .success-banner h2 {
      margin: 0 0 4px;
      font-size: 24px;
      color: #00685f;
    }

    .success-banner p {
      margin: 0;
      color: #3d4947;
    }

    .batch-list {
      background: #ffffff;
      border: 1px solid #d3e4fe;
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
    }

    .batch-header {
      padding: 14px 18px;
      font-weight: 700;
      border-bottom: 1px solid #eef2f6;
      background: #f7fbff;
    }

    .batch-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 18px;
      border-bottom: 1px solid #eef2f6;
    }

    .batch-item:last-child {
      border-bottom: none;
    }

    .file-name {
      min-width: 0;
      overflow-wrap: anywhere;
      font-weight: 600;
    }

    .status {
      color: #00685f;
      font-weight: 700;
      flex-shrink: 0;
    }

    .actions-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      border: none;
      border-radius: 10px;
      padding: 11px 16px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
    }

    .btn-primary {
      background: #00685f;
      color: #ffffff;
    }

    .btn-outline {
      background: #ffffff;
      color: #00685f;
      border: 1px solid #00685f;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 28, 48, 0.42);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 20;
    }

    .modal {
      width: min(420px, 100%);
      background: #ffffff;
      border-radius: 12px;
      padding: 22px;
      box-shadow: 0 24px 60px rgba(11, 28, 48, 0.24);
    }

    .modal h3 {
      margin: 0 0 16px;
      color: #0b1c30;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }

    .btn-cancel,
    .btn-save {
      border-radius: 8px;
      border: 1px solid #bcc9c6;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-cancel {
      background: #ffffff;
      color: #3d4947;
    }

    .btn-save {
      background: #00685f;
      border-color: #00685f;
      color: #ffffff;
    }
  `;

  render(){
    return html`
      ${this.renderUploadForm()};
      ${this.uploadSuccess ? this.renderSuccessView() :""}
    `;
  }

  renderUploadForm() {
    return html`
      <div class="page-header">
        <h2>Document Intake</h2>
        
        <div class="status-badge">
          <span class="pulse-dot"></span>
          Ready for Upload
        </div>
      </div>

      <div class="bento-grid">
        <!-- Upload Zone -->
        <div class="bento-card">
        <div class = "left">
          <div
            class="upload-zone ${this.dragOver ? 'drag-over' : ''}"
            @dragover=${this._onDragOver}
            @dragleave=${this._onDragLeave}
            @drop=${this._onDrop}
            @click=${() => this.shadowRoot.querySelector('#fileInput').click()}
          >
            <span class="material-symbols-outlined icon">cloud_upload</span>
            <h3>Drag and drop file here</h3>
            <p style="font-size:14px; color:#3d4947;">Supports PDF, Office files, PNG, JPG, WebP and HEIC (Max 25MB)</p>
            <input
              type="file"
              id="fileInput"
              accept=".pdf,.docx,.doc,.txt,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.heic,.heif"
              style="display: none"
              @change=${this._onFileChange}
            />
            ${this.selectedFile
              ? html`<p style="margin-top:8px; color:#00685f; font-weight:600;">${this.selectedFile.name}</p>`
              : ''}
          </div>
          </div>
        </div>

        <!-- Metadata Form -->
        <div class="bento-card">
          <h3 style="font-size:20px; font-weight:600; margin:0 0 16px; display:flex; align-items:center; gap:8px;">
            <span class="material-symbols-outlined">assignment</span>
            Document Details
          </h3>
         
          <div class="form-group">
            <label>Document Category</label>
            <div class="category-row">
              <select
                .value=${this.formData.categoryId}
                @change=${(e) => this._updateFormField('categoryId', e.target.value)}
              >
                <option value="">Select Category</option>
                ${this.categories.map(
                  (cat) => html`<option value="${cat.id}">${cat.name}</option>`
                )}
              </select>
              <button class="icon-btn" type="button" title="Create category" @click=${this.openModal}>
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Assign to Department</label>
            <select
              .value=${this.formData.departmentId}
              @change=${(e) => this._updateFormField('departmentId', e.target.value)}
            >
              <option value="">Select Department</option>
              ${this.departments.map(
                (dept) => html`<option value="${dept.id}">${dept.name}</option>`
              )}
            </select>
          </div>
          <button
            class="submit-btn"
            @click=${this._handleUpload}
            ?disabled=${this.uploading}
          >
            ${this.uploading ? 'Uploading...' : html`Finalize and Store <span class="material-symbols-outlined">save</span>`}
          </button>
        </div>
      </div>

      <div class="recent-list">
        <h3 style="font-size:20px; font-weight:600; color:#0b1c30; margin-bottom:16px;">Recent Staff Uploads</h3>
        ${this.recentUploads.length === 0
          ? html`<p style="color:#7a8a9a;">No recent uploads</p>`
          : this.recentUploads.map(
              (doc) => html`
                <div class="recent-item">
                  <div class="recent-info">
                    <div class="file-icon">
                      <span class="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <p style="font-weight:600; margin:0;">${doc.documentName}</p>
                      <p style="font-size:12px; color:#3d4947;">${doc.statusName || 'Uploaded'} • ${this.formatDate(doc.uploadDate)}</p>
                    </div>
                  </div>
                  <span class="material-symbols-outlined" style="color:#7a8a9a;">more_vert</span>
                </div>
              `
            )}
      </div>

      ${this.showModal ? html`
        <div class="modal-backdrop" @click=${this.closeModal}>
          <div class="modal" @click=${(e) => e.stopPropagation()}>
            <h3>Create Category</h3>
            <div class="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g., Pediatrics, Neurology"
                .value=${this.newCategoryName}
                @input=${(e) => this.newCategoryName = e.target.value}
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea
                rows="3"
                placeholder="Define what documents belong here..."
                .value=${this.newCategoryDescription}
                @input=${(e) => this.newCategoryDescription = e.target.value}
              ></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" type="button" @click=${this.closeModal}>Cancel</button>
              <button class="btn-save" type="button" @click=${this.handleCreate}>Save Category</button>
            </div>
          </div>
        </div>
      ` : ''}
    `
  }

  renderSuccessView() {
    return html`
      <div class="success-banner">
        <div class="icon-circle">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        </div>
        <div>
          <h2>Upload Successful</h2>
          <p>The documents have been securely stored in the clinical repository.</p>
        </div>
      </div>

      <div class="batch-list">
        <div class="batch-header">
          Recently Processed Batch <span style="font-weight:400; color:#7a8a9a; margin-left:8px;">${this.lastUploadedFiles.length} files</span>
        </div>
        ${this.lastUploadedFiles.map(file => html`
          <div class="batch-item">
            <div class="file-name">📄 ${file.name}</div>
            <div class="status">Success</div>
          </div>
        `)}
      </div>

      <div class="batch-list">
        <div class="batch-header">Recent History</div>
        ${this.recentUploads.length === 0
          ? html`<div style="padding:20px; text-align:center; color:#7a8a9a;">No recent uploads</div>`
          : this.recentUploads.map(doc => html`
            <div class="batch-item">
              <div class="file-name">📄 ${doc.documentName}</div>
              <div class="status">${doc.statusName || 'Stored'}</div>
            </div>
          `)
        }
      </div>

      <div class="actions-row">
        <button class="btn btn-primary" @click=${() => { window.location.href = '/allDocument'; }}>
          <span class="material-symbols-outlined">visibility</span>
          View All Documents
        </button>
        <button class="btn btn-outline" @click=${this.resetUpload}>
          <span class="material-symbols-outlined">add_circle</span>
          Upload Another Batch
        </button>
      </div>
    `;
  }

  formatDate(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

customElements.define('staff-upload-page', StaffUpload);
