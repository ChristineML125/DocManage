import { LitElement, html, css } from 'lit';
import { getCategories,createCategory,deleteCategory } from '../../api/categoryAPI.js';
import { getDepartmentLoad, createDepartment, deleteDepartment } from '../../api/departmentAPI.js';
import { getDocumentsList } from '../../api/documentAPI.js'

export class StaffCategories extends LitElement {
    static properties = {
        categories: {type: Array},
        loading: {type: Boolean},
        showModal: {type: Boolean},
        newCategoryName: {type: String},
        newCategoryDecription: {type: String},
        departments: {type: Array},
        selectedCategoryID: {type: Number},
        filteredDocs: {type: Array},
        docLoading: {type: Boolean},
        docPage: {type: Number},
        docPageSize: {type: Number},
        keyword: {type: String}
    }

    constructor() {
        super();
        this.categories = [];
        this.loading = true;
        this.showModal = false;
        this.newCategoryName = '';
        this.newCategoryDescription = '';
        this.departments = [];
        this.selectedCategoryID = null;
        this.filteredDocs = [];
        this.docLoading = false;
        this.docPage = 1;
        this.docPageSize = 8;
        this.keyword = '';
    }

    connectedCallback() {
        super.connectedCallback();
        this.fetchData();
    }

    async fetchData() {
        try{
            const [catRes, deptRes] = await Promise.all([
              getCategories(),
              getDepartmentLoad()
            ]);

            if(catRes.success){
              this.categories = catRes.categories;
            };

            if(deptRes.success){
              this.departments = deptRes.departments;
            };
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            this.loading = false;
        }
    }

    selectCategory(catId) {
        if (this.selectedCategoryID === catId) return;
        this.selectedCategoryID = catId;
        this.docPage = 1;
        this.keyword = '';
        this.fetchDocsByCategory();
    }

    async fetchDocsByCategory() {
        this.docLoading = true;
        try {
            const params = {};
            if (this.selectedCategoryID) params.categoryId = this.selectedCategoryID;
            if (this.keyword.trim()) params.keyword = this.keyword.trim();
            const res = await getDocumentsList(params);
            if (res.success) {
                this.filteredDocs = res.documents || [];
            } else {
                this.filteredDocs = [];
            }
        } catch (err) {
            console.error('Failed to load documents', err);
            this.filteredDocs = [];
        } finally {
            this.docLoading = false;
        }
    }

    get docTotalPages() {
        return Math.max(1, Math.ceil(this.filteredDocs.length / this.docPageSize));
    }

    get paginatedDocs() {
        const start = (this.docPage - 1) * this.docPageSize;
        return this.filteredDocs.slice(start, start + this.docPageSize);
    }

    onDocKeywordInput(e) {
        this.keyword = e.target.value;
    }

    onDocKeywordKeydown(e) {
        if (e.key === 'Enter') {
            this.docPage = 1;
            this.fetchDocsByCategory();
        }
    }

    getSelectedCategoryName() {
        if (!this.selectedCategoryID) return 'All Documents';
        const cat = this.categories.find(c => c.id === this.selectedCategoryID);
        return cat ? cat.name : 'All Documents';
    }

    getStatusClass(statusName) {
        if (!statusName) return '';
        const s = statusName.toLowerCase();
        if (s === 'active' || s === 'approved') return 'status-active';
        if (s === 'draft') return 'status-draft';
        if (s === 'archived') return 'status-archived';
        if (s === 'pending') return 'status-pending';
        if (s === 'review') return 'status-review';
        return '';
    }

    async handleCreateCategory() {
      if(!this.newCategoryName.trim()) return;
        const data = await createCategory(this.newCategoryName, this.newCategoryDescription);
        if (data.success) {
            await this.fetchData();
            this.closeModal();
        } else {
            alert(data.message);
        }
    }

    openModal() {this.showModal = true; }
    closeModal() {
        this.showModal = false;
        this.newCategoryName ='';
        this.newCategoryDescription ='';
    }

  static styles = css`
    :host {
        display: block;
        padding: 24px;
        background: #f8f9ff;
        font-family: 'Hanken Grotesk', sans-serif;
        color: #0b1c30;
        min-height: 100vh;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 32px;
    }

    .header h2 {
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        color: #0b1c30;
    }

    .header p {
        font-size: 16px;
        color: #3d4947;
        margin: 4px 0 0;
    }

    .btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #00685f;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
        box-shadow: 0 4px 12px rgba(0,104,95,0.3);
    }

    .btn-primary:hover {
        background: #008378;
    }

    .bento-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
    }

    .category-card {
        background: white;
        border: 1px solid #d3e4fe;
        border-radius: 16px;
        padding: 24px;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
    }

    .category-card:hover {
        border-color: #00685f;
        box-shadow: 0 6px 20px rgba(0,0,0,0.05);
    }

    .category-card.selectable {
        cursor: pointer;
    }

    .category-card.selected {
        border-color: #00685f;
        background: #f0fbf9;
        box-shadow: 0 0 0 2px rgba(0,104,95,0.15);
    }

    .all-docs-card {
        background: #f0fbf9;
        border: 2px dashed #00685f;
        border-radius: 16px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
    }

    .all-docs-card:hover {
        background: #e0f5f0;
        box-shadow: 0 6px 20px rgba(0,104,95,0.1);
    }

    .all-docs-card.selected {
        border-style: solid;
        background: #00685f;
        color: white;
        box-shadow: 0 6px 20px rgba(0,104,95,0.25);
    }

    .all-docs-card .icon-circle {
        width: 56px; height: 56px;
        background: rgba(0,104,95,0.1);
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        color: #00685f; font-size: 32px;
        margin-bottom: 12px;
    }

    .all-docs-card.selected .icon-circle {
        background: rgba(255,255,255,0.2);
        color: white;
    }

    .all-docs-card h3 {
        margin: 0 0 4px; font-size: 18px; font-weight: 700;
    }

    .all-docs-card p {
        margin: 0; font-size: 13px; opacity: 0.8;
    }

    .department-card:hover {
        border-color: #00685f;
        box-shadow: 0 6px 20px rgba(0,0,0,0.05);
    }

    .department-card {
        background: white;
        border: 1px solid #d3e4fe;
        border-radius: 16px;
        padding: 24px;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
    }

    .department-card:hover {
        border-color: #00685f;
        box-shadow: 0 6px 20px rgba(0,0,0,0.05);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }

      .icon-circle {
        width: 56px;
        height: 56px;
        background: #e5eeff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00685f;
        font-size: 32px;
        }

      .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #7a8a9a;
        padding: 4px;
        border-radius: 50%;
        transition: background 0.2s;
        }

      .icon-btn:hover {
        background: #f2f4f6;
      }

      .category-name {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 8px;
      }

      .category-desc {
        font-size: 14px;
        color: #3d4947;
        margin: 0 0 24px;
        flex: 1;
      }

      .card-footer {
        border-top: 1px solid #eef2f6;
        padding-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
      }

        .doc-count {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #00685f;
        }

        .updated-time {
        color: #7a8a9a;
        }

        .empty-card {
        border: 2px dashed #bcc9c6;
        border-radius: 16px;
        padding: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: #3d4947;
        }

        .empty-card:hover {
        border-color: #00685f;
        background: #f4fffc;
        color: #00685f;
        }

        .empty-card .icon {
        font-size: 48px;
        margin-bottom: 12px;
        }

        .empty-card h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        }

        .empty-card p {
        font-size: 12px;
        margin-top: 8px;
        }

        .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(11, 28, 48, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        }

        .modal {
        background: white;
        width: 90%;
        max-width: 440px;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal h3 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 20px;
        }

        .form-group {
        margin-bottom: 16px;
        }

        .form-group label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #0b1c30;
        margin-bottom: 6px;
        }

        .form-group input,
        .form-group textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #bcc9c6;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
        font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
        border-color: #00685f;
        box-shadow: 0 0 0 2px rgba(0,104,95,0.2);
        }

        .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        }

        .btn-cancel {
        flex: 1;
        padding: 10px;
        background: #f2f4f6;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        }

        .btn-cancel:hover {
        background: #e0e3e5;
        }

    .btn-save {
        flex: 1;
        padding: 10px;
        background: #00685f;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
    }

    .btn-save:hover {
        background: #008378;
    }

    .material-symbols-outlined {
        font-family: 'Material Symbols Outlined';
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        line-height: 1;
    }

    /* ---- Category Filter Document List ---- */
    .doc-section {
        margin-top: 40px;
        background: white;
        border: 1px solid #d3e4fe;
        border-radius: 16px;
        overflow: hidden;
    }

    .doc-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #eef2f6;
        flex-wrap: wrap;
        gap: 12px;
    }

    .doc-section-header h3 {
        margin: 0; font-size: 18px; font-weight: 700;
    }

    .doc-search {
        display: flex; align-items: center; gap: 8px;
    }

    .doc-search input {
        padding: 8px 14px;
        border: 1px solid #bcc9c6;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        width: 220px;
        font-family: inherit;
    }

    .doc-search input:focus {
        border-color: #00685f;
        box-shadow: 0 0 0 2px rgba(0,104,95,0.15);
    }

    .doc-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    .doc-table thead th {
        text-align: left;
        padding: 12px 24px;
        background: #f8fcfb;
        font-weight: 700;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #3d4947;
        border-bottom: 1px solid #eef2f6;
    }

    .doc-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
    }

    .doc-table tbody tr:hover {
        background: #f8fcfb;
    }

    .doc-table tbody td {
        padding: 14px 24px;
        border-bottom: 1px solid #f2f4f6;
        color: #0b1c30;
        vertical-align: middle;
    }

    .doc-table .doc-name {
        display: flex; align-items: center; gap: 10px;
    }

    .doc-table .doc-avatar {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: #e5eeff;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 14px; color: #00685f;
        flex-shrink: 0;
    }

    .doc-table .doc-title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 280px;
    }

    .badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        background: #e5eeff;
        color: #00685f;
    }

    .badge-version {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        background: #f2f4f6;
        color: #3d4947;
    }

    .status-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
    }

    .status-active { background: #e6f9ee; color: #0a7c42; }
    .status-draft { background: #fff7e0; color: #a16207; }
    .status-archived { background: #f2f4f6; color: #6b7280; }
    .status-pending { background: #fef3cd; color: #856404; }
    .status-review { background: #e0ecff; color: #1a56db; }

    .doc-empty {
        text-align: center;
        padding: 48px 24px;
        color: #7a8a9a;
    }

    .doc-empty .material-symbols-outlined {
        font-size: 48px;
        margin-bottom: 12px;
        color: #bcc9c6;
    }

    .doc-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid #eef2f6;
    }

    .doc-pagination button {
        padding: 6px 12px;
        border: 1px solid #d3e4fe;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        color: #0b1c30;
        transition: all 0.15s;
    }

    .doc-pagination button:hover:not(:disabled) {
        background: #f0fbf9;
        border-color: #00685f;
    }

    .doc-pagination button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .doc-pagination span {
        font-size: 13px;
        color: #3d4947;
    }

    /* ========== Responsive ========== */
    @media (max-width: 480px) {
        .bento-grid { grid-template-columns: 1fr; }
    }
  `;

  render() {
    if (this.loading) {
      return html`<div style="text-align:center;padding:48px;">Loading...</div>`;
    }

    return html`
      <!-- Header -->
      <div class="header">
        <div>
          <h2>Document Categories</h2>
          <p>Organize and manage document classifications for your health records.</p>
        </div>
        <button class="btn-primary" @click=${this.openModal}>
          <span class="material-symbols-outlined">add_circle</span>
          Create New Category
        </button>
      </div>

      <!-- Bento Grid -->
      <div class="bento-grid">
        <!-- All Documents Card -->
        <div class="all-docs-card ${this.selectedCategoryID === null ? 'selected' : ''}"
             @click=${() => this.selectCategory(null)}>
          <div class="icon-circle">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <h3>All Documents</h3>
          <p>Show all documents across categories</p>
        </div>

        ${this.categories.length === 0
          ? html`
            <div class="empty-placeholder">
              <div class="material-symbols-outlined icon">inbox</div>
              <p>No Category available</p>
            </div>
          `
        : this.categories.map(cat => html`
          <div class="category-card selectable ${this.selectedCategoryID === cat.id ? 'selected' : ''}"
               @click=${() => this.selectCategory(cat.id)}>
            <div class="card-header">
              <div class="icon-circle">
                <span class="material-symbols-outlined">folder</span>
              </div>
            </div>
            <h3 class="category-name">${cat.name}</h3>
            <p class="category-desc">${cat.description || 'No description'}</p>
            <div class="card-footer">
              <span class="doc-count">
                <span class="material-symbols-outlined" style="font-size:16px;">description</span>
                ${cat.docCount || 0} Docs
              </span>
            </div>
          </div>
        `)}

        <!-- Add New Card -->
        <div class="empty-card" @click=${this.openModal}>
          <span class="material-symbols-outlined icon">add_box</span>
          <h3>New Category</h3>
          <p>Click to add a specialty</p>
        </div>
      </div>

      <!-- Document List Section -->
      <div class="doc-section">
        <div class="doc-section-header">
          <h3>${this.getSelectedCategoryName()} <span style="font-weight:400;font-size:14px;color:#7a8a9a;">(${this.filteredDocs.length} documents)</span></h3>
          <div class="doc-search">
            <input type="text"
              placeholder="Search in this category..."
              .value=${this.keyword}
              @input=${this.onDocKeywordInput}
              @keydown=${this.onDocKeywordKeydown}
            />
            <button class="btn-primary" style="padding:8px 16px;font-size:13px;" @click=${() => { this.docPage = 1; this.fetchDocsByCategory(); }}>
              <span class="material-symbols-outlined" style="font-size:18px;">search</span>
            </button>
          </div>
        </div>

        ${this.docLoading
          ? html`<div style="text-align:center;padding:32px;color:#7a8a9a;">Loading documents...</div>`
          : this.filteredDocs.length === 0
            ? html`
              <div class="doc-empty">
                <span class="material-symbols-outlined">folder_open</span>
                <p>No documents found in this category.</p>
              </div>
            `
            : html`
              <table class="doc-table">
                <thead>
                  <tr>
                    <th>Document Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Version</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.paginatedDocs.map(doc => html`
                    <tr>
                      <td>
                        <div class="doc-name">
                          <div class="doc-avatar">${doc.documentName?.charAt(0) || 'D'}</div>
                          <span class="doc-title" title="${doc.documentName}">${doc.documentName}</span>
                        </div>
                      </td>
                      <td><span class="badge">${doc.categoriesName || 'N/A'}</span></td>
                      <td><span class="status-badge ${this.getStatusClass(doc.statusName)}">${doc.statusName || 'N/A'}</span></td>
                      <td><span class="badge-version">V ${doc.versionNum || 1}.0</span></td>
                    </tr>
                  `)}
                </tbody>
              </table>
              ${this.docTotalPages > 1 ? html`
                <div class="doc-pagination">
                  <button ?disabled=${this.docPage <= 1} @click=${() => { this.docPage--; this.requestUpdate(); }}>
                    <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">chevron_left</span> Prev
                  </button>
                  <span>Page ${this.docPage} of ${this.docTotalPages}</span>
                  <button ?disabled=${this.docPage >= this.docTotalPages} @click=${() => { this.docPage++; this.requestUpdate(); }}>
                    Next <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">chevron_right</span>
                  </button>
                </div>
              ` : ''}
            `
        }
      </div>

      <!-- Modal -->
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
              <button class="btn-cancel" @click=${this.closeModal}>Cancel</button>
              <button class="btn-save" @click=${this.handleCreateCategory}>Save Category</button>
            </div>
          </div>
        </div>
      ` : ''}

        <div>
          <h2>Department Categories</h2>
        </div>
        <div class="bento-grid">
        ${this.departments.length === 0
          ? html`
            <div class="empty-placeholder">
              <div class="material-symbols-outlined icon">inbox</div>
              <p>No Category available</p>
            </div>
          `
        : this.departments.map(dept => html`
          <buttom>
          <div class="department-card">
            <div class="card-header">
              <div class="icon-circle">
                <span class="material-symbols-outlined">folder</span>
              </div>
            </div>
            <h3 class="department-name">${dept.departmentName}</h3>
            <p class="department-desc">${dept.description || 'No description'}</p>
            <div class="card-footer">
              <span class="doc-count">
                <span class="material-symbols-outlined" style="font-size:16px;">description</span>
                ${dept.documentCount || 0} Docs
              </span>
            </div>
          </div>
          </buttom>
        `)}
        </div>
    `;
  }
}

customElements.define('staff-categories-page', StaffCategories);