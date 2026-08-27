import { LitElement, html, css } from 'lit';
import { getCategories,createCategory,deleteCategory} from '../../api/categoryAPI';
import { getDepartmentLoad, createDepartment, deleteDepartment } from '../../api/departmentAPI.js';
import { Router } from '@vaadin/router';

export class AdminCategories extends LitElement {
    static properties = {
        categories: {type: Array},
        loading: {type: Boolean},
        showModal: {type: Boolean},
        newCategoryName: {type: String},
        newCategoryDescription: {type: String},
        departments: {type: Array},
        newDepartmentName: {type: String},
        newDepartmentDescription: {type: String},
        modalType: {type: String},
        catSearch: {type: String}
    }

    constructor() {
        super();
        this.categories = [];
        this.loading = true;
        this.showModal = false;
        this.newCategoryName = '';
        this.newCategoryDescription = '';
        this.departments = [];
        this.newDepartmentName = '';
        this.newDepartmentDescription = '';
        this.modalType = 'category';
        this.catSearch = '';
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

    openCategory(catId) {
        Router.go(`/admin-allDocument?categoryId=${catId}`);
    }

    get filteredCategories() {
        if (!this.catSearch.trim()) return this.categories;
        const kw = this.catSearch.toLowerCase();
        return this.categories.filter(c => c.name?.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw));
    }

    async handleCategoryCreate() {
      if(!this.newCategoryName.trim()) {
          alert('Category name cannot be empty');
           return; 
      }
      try{
        const data = await createCategory(this.newCategoryName);

        if(data.success){
          await this.fetchData();
          this.closeModal();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error('Failed to create category', err);
      }

    }

    async handleDepartmentCreate() {
      if(!this.newDepartmentName.trim()) {
          alert('Department name cannot be empty');
           return; 
      }
      try{
        const data = await createDepartment(this.newDepartmentName);

        if(data.success){
          await this.fetchData();
          this.closeModal();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error('Failed to create department', err);
      }

    }

    openModal(type = 'category') {
        this.modalType = type;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.newCategoryName ='';
        this.newCategoryDescription ='';
        this.newDepartmentName = '';
        this.newDepartmentDescription = '';
    }

    async handleCategoryDelete(id){
        if(!confirm('Are you sure?')) return;
        try{
          const data = await deleteCategory(id);
          if (data.success){
            await this.fetchData();
          } else {
            alert(data.message);
          }
        } catch (err) {
          console.error('Failed to delete category', err);
        }
    }

    async handleDepartmentDelete(id){
        if(!confirm('Are you sure?')) return;
        try{
          const data = await deleteDepartment(id);
          if (data.success){
            await this.fetchData();
          } else {
            alert(data.message);
          }
        } catch (err) {
          console.error('Failed to delete department', err);
        }
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

    .cat-search {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border: 1px solid #d3e4fe;
        border-radius: 10px;
        background: white;
        transition: border-color 0.15s;
    }
    .cat-search:focus-within { border-color: #00685f; box-shadow: 0 0 0 2px rgba(0,104,95,0.12); }
    .cat-search input {
        border: none; outline: none; font-size: 14px; font-family: inherit;
        width: 200px; background: transparent; color: #0b1c30;
    }
    .cat-search-clear {
        background: none; border: none; cursor: pointer; padding: 2px;
        display: flex; color: #7a8a9a; border-radius: 50%;
    }
    .cat-search-clear:hover { background: #f2f4f6; color: #0b1c30; }

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
        cursor: pointer;
    }

    .category-card:hover {
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
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="cat-search">
            <span class="material-symbols-outlined" style="font-size:20px;color:#7a8a9a;">search</span>
            <input type="text" placeholder="Search categories..."
              .value=${this.catSearch}
              @input=${(e) => this.catSearch = e.target.value}
            />
            ${this.catSearch ? html`
              <button class="cat-search-clear" @click=${() => this.catSearch = ''}>
                <span class="material-symbols-outlined" style="font-size:18px;">close</span>
              </button>
            ` : ''}
          </div>
          <button class="btn-primary" @click=${()=>this.openModal('category')}>
            <span class="material-symbols-outlined">add_circle</span>
            Create New Category
          </button>
        </div>
      </div>
      
      <!-- Bento Grid -->
      <div class="bento-grid">
        ${this.filteredCategories.length === 0
          ? html`
            <div class="empty-placeholder" style="grid-column:1/-1;">
              <div class="material-symbols-outlined icon">search_off</div>
              <p>${this.catSearch ? 'No categories match your search.' : 'No Category available'}</p>
            </div>
          `
        : this.filteredCategories.map(cat => html`
          <div class="category-card" @click=${() => this.openCategory(cat.id)}>
            <div class="card-header">
              <div class="icon-circle">
                <span class="material-symbols-outlined">folder</span>
              </div>
              <button class="icon-btn" @click=${(e) => { e.stopPropagation(); this.handleCategoryDelete(cat.id); }}>
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
            <h3 class="category-name">${cat.name}</h3>
            <p class="category-desc">${cat.description || 'No description'}</p>
            <div class="card-footer">
              <span class="doc-count">
                <span class="material-symbols-outlined" style="font-size:16px;">description</span>
                ${cat.docCount || 0} Docs
              </span>
              <span class="updated-time">Updated ${cat.updatedAt || 'just now'}</span>
            </div>
          </div>
        `)}
        <!-- Add New Card -->
        <div class="empty-card" @click=${()=>this.openModal('category')}>
          <span class="material-symbols-outlined icon">add_box</span>
          <h3>New Category</h3>
          <p>Click to add a specialty</p>
        </div>
      </div>

      <div>
          <h2>Departments</h2>
      </div>
        <div class="bento-grid">
        ${this.departments.length === 0
          ? html`
            <div class="empty-placeholder">
              <div class="material-symbols-outlined icon">inbox</div>
              <p>No Department available</p>
            </div>
          `
        : this.departments.map(dept => html`
          <buttom>
          <div class="department-card">
            <div class="card-header">
              <div class="icon-circle">
                <span class="material-symbols-outlined">folder</span>
              </div>
                <buttom class="icon-btn" @click=${() => this.handleDepartmentDelete(dept.id)}>
                  <span class="material-symbols-outlined">delete</span>
                </buttom>
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

        <div class="empty-card" @click=${()=>this.openModal('department')}>
          <span class="material-symbols-outlined icon">add_box</span>
          <h3>New Department</h3>
          <p>Click to add a specialty</p>
        </div>
        
      <!-- Modal -->
      ${this.showModal ? html`
        <div class="modal-backdrop" @click=${this.closeModal}>
          <div class="modal" @click=${(e) => e.stopPropagation()}>
          ${this.modalType === 'category' ? html`
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
              <button class="btn-save" @click=${this.handleCategoryCreate}>Save Category</button>
            </div>
          ` : this.modalType === 'department' ? html`
            <h3>Create Department</h3>
            <div class="form-group">
              <label>Department Name</label>
              <input 
                type="text" 
                placeholder="e.g., Account, Administrator"
                .value=${this.newDepartmentName}
                @input=${(e) => this.newDepartmentName = e.target.value}
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea 
                rows="3" 
                placeholder="Define what documents belong here..."
                .value=${this.newDepartmentDescription}
                @input=${(e) => this.newDepartmentDescription = e.target.value}
              ></textarea>
            </div>
            <div class="modal-actions">
              <buttom class="btn-cancel" @click=${this.closeModal}>Cancel</buttom>
              <buttom class="btn-save" @click=${this.handleDepartmentCreate}>Save Department</buttom>
            </div>
          ` : ''}
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('admin-categories-page', AdminCategories);
