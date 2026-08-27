import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { getCategories } from '../../api/categoryAPI.js';
import { getDocumentsList, getDocument } from '../../api/documentAPI.js';
import { renderAsync } from 'docx-preview';
import { fetchFile, getFileUrl } from '../../api/http.js';
import * as XLSX from 'xlsx';

export class AdminCategoryDetail extends LitElement {
    static properties = {
        categoryId: { type: Number },
        category: { type: Object },
        documents: { type: Array },
        loading: { type: Boolean },
        keyword: { type: String },
        currentPage: { type: Number },
        pageSize: { type: Number },
        selectedDoc: { type: Object },
        showPreviewModal: { type: Boolean },
        pdfBlobUrl: { type: String }
    }

    constructor() {
        super();
        this.categoryId = null;
        this.category = null;
        this.documents = [];
        this.loading = true;
        this.keyword = '';
        this.currentPage = 1;
        this.pageSize = 8;
        this.selectedDoc = null;
        this.showPreviewModal = false;
        this.pdfBlobUrl = null;
    }

    connectedCallback() {
        super.connectedCallback();
        const match = window.location.pathname.match(/\/admin-category\/(\d+)/);
        if (match) {
            this.categoryId = parseInt(match[1], 10);
            this.fetchData();
        }
    }

    async fetchData() {
        this.loading = true;
        try {
            const [catRes, docRes] = await Promise.all([
                getCategories(),
                getDocumentsList({ categoryId: this.categoryId })
            ]);
            if (catRes.success) {
                this.category = (catRes.categories || []).find(c => c.id === this.categoryId) || null;
            }
            if (docRes.success) {
                this.documents = docRes.documents || [];
            }
        } catch (err) {
            console.error('Failed to load category data', err);
        } finally {
            this.loading = false;
        }
    }

    get filteredDocs() {
        if (!this.keyword.trim()) return this.documents;
        const kw = this.keyword.toLowerCase();
        return this.documents.filter(d =>
            d.documentName?.toLowerCase().includes(kw) ||
            d.categoriesName?.toLowerCase().includes(kw)
        );
    }

    get totalPages() {
        return Math.max(1, Math.ceil(this.filteredDocs.length / this.pageSize));
    }

    get paginatedDocs() {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredDocs.slice(start, start + this.pageSize);
    }

    onSearchInput(e) { this.keyword = e.target.value; }
    onSearchKeydown(e) { if (e.key === 'Enter') { this.currentPage = 1; this.requestUpdate(); } }

    goBack() { Router.go('/admin-category'); }

    async openPreview(doc) {
        try {
            const res = await getDocument(doc.documentID);
            if (res.success) {
                const filePath = res.document.filePath;
                const fileUrl = filePath ? getFileUrl(filePath) : null;
                const fileType = filePath ? filePath.split('.').pop().toLowerCase() : '';
                this.selectedDoc = { ...doc, ...res.document, fileUrl, fileType };

                if (fileType === 'pdf' && fileUrl) {
                    try {
                        const fileRes = await fetchFile(fileUrl);
                        const blob = await fileRes.blob();
                        if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
                        this.pdfBlobUrl = URL.createObjectURL(blob);
                    } catch(err) {
                        console.error('PDF load error:', err);
                    }
                }

                this.showPreviewModal = true;
                await this.updateComplete;
                await new Promise(resolve => requestAnimationFrame(resolve));

                if (fileType === 'docx' && fileUrl) {
                    const el = this.renderRoot.querySelector('#docx-modal-container');
                    if (el) {
                        const res2 = await fetchFile(fileUrl);
                        const buffer = await res2.arrayBuffer();
                        el.innerHTML = '';
                        await renderAsync(buffer, el, null, { ignoreWidth: true, ignoreHeight: true, breakPages: false });
                    }
                }
                if ((fileType === 'xlsx' || fileType === 'xls') && fileUrl) {
                    const el = this.renderRoot.querySelector('#excel-modal-container');
                    if (el) {
                        const res2 = await fetchFile(fileUrl);
                        const buffer = await res2.arrayBuffer();
                        const workbook = XLSX.read(buffer, { type: 'array' });
                        el.innerHTML = '';
                        workbook.SheetNames.forEach(sheetName => {
                            const sheet = workbook.Sheets[sheetName];
                            const title = document.createElement('h3');
                            title.textContent = sheetName;
                            el.appendChild(title);
                            const div = document.createElement('div');
                            div.innerHTML = XLSX.utils.sheet_to_html(sheet);
                            el.appendChild(div);
                        });
                    }
                }
            }
        } catch (err) { console.error('Preview error:', err); }
    }

    closePreview() {
        this.showPreviewModal = false;
        this.selectedDoc = null;
        if (this.pdfBlobUrl) { URL.revokeObjectURL(this.pdfBlobUrl); this.pdfBlobUrl = null; }
    }

    downloadFile(doc) {
        if (doc.filePath) window.open(getFileUrl(doc.filePath), '_blank');
    }

    getStatusClass(s) {
        if (!s) return '';
        const v = s.toLowerCase();
        if (v === 'active' || v === 'approved') return 'status-active';
        if (v === 'draft') return 'status-draft';
        if (v === 'archived') return 'status-archived';
        if (v === 'pending') return 'status-pending';
        if (v === 'review') return 'status-review';
        return '';
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

        .back-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px; background: white; border: 1px solid #d3e4fe;
            border-radius: 10px; font-size: 14px; font-weight: 600;
            color: #00685f; cursor: pointer; transition: all 0.15s;
            margin-bottom: 20px; font-family: inherit;
        }
        .back-btn:hover { background: #f0fbf9; border-color: #00685f; }
        .back-btn .material-symbols-outlined { font-size: 18px; }

        .page-header { margin-bottom: 28px; }
        .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .page-header p { margin: 6px 0 0; font-size: 15px; color: #3d4947; }

        .toolbar {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .search-box {
            display: flex; align-items: center; gap: 8px;
        }
        .search-box input {
            padding: 9px 14px; border: 1px solid #d3e4fe; border-radius: 8px;
            font-size: 14px; outline: none; width: 240px; font-family: inherit;
        }
        .search-box input:focus { border-color: #00685f; box-shadow: 0 0 0 2px rgba(0,104,95,0.15); }
        .doc-count-label { font-size: 14px; color: #7a8a9a; font-weight: 600; }

        .doc-card {
            background: white; border: 1px solid #d3e4fe; border-radius: 14px;
            padding: 18px 22px; margin-bottom: 12px;
            display: flex; align-items: center; gap: 16px;
            transition: all 0.15s; cursor: pointer;
        }
        .doc-card:hover { border-color: #00685f; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .doc-avatar {
            width: 44px; height: 44px; border-radius: 12px; background: #e5eeff;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 16px; color: #00685f; flex-shrink: 0;
        }
        .doc-info { flex: 1; min-width: 0; }
        .doc-info h4 { margin: 0; font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .doc-meta { display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap; }
        .doc-meta span { font-size: 12px; color: #7a8a9a; }
        .doc-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .act-btn {
            width: 36px; height: 36px; border-radius: 10px; border: 1px solid #eef2f6;
            background: white; cursor: pointer; display: flex; align-items: center;
            justify-content: center; color: #3d4947; transition: all 0.15s;
        }
        .act-btn:hover { background: #f0fbf9; border-color: #00685f; color: #00685f; }
        .act-btn .material-symbols-outlined { font-size: 18px; }

        .badge {
            display: inline-block; padding: 2px 8px; border-radius: 5px;
            font-size: 11px; font-weight: 600; background: #e5eeff; color: #00685f;
        }
        .badge-version {
            display: inline-block; padding: 2px 8px; border-radius: 5px;
            font-size: 11px; font-weight: 600; background: #f2f4f6; color: #3d4947;
        }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: 600; }
        .status-active { background: #e6f9ee; color: #0a7c42; }
        .status-draft { background: #fff7e0; color: #a16207; }
        .status-archived { background: #f2f4f6; color: #6b7280; }
        .status-pending { background: #fef3cd; color: #856404; }
        .status-review { background: #e0ecff; color: #1a56db; }

        .empty-state {
            text-align: center; padding: 64px 24px; color: #7a8a9a;
        }
        .empty-state .material-symbols-outlined { font-size: 56px; margin-bottom: 16px; color: #bcc9c6; }
        .empty-state p { font-size: 16px; }

        .pagination {
            display: flex; align-items: center; justify-content: center;
            gap: 12px; padding: 20px 0;
        }
        .pagination button {
            padding: 7px 14px; border: 1px solid #d3e4fe; border-radius: 8px;
            background: white; cursor: pointer; font-size: 13px; font-weight: 600;
            color: #0b1c30; font-family: inherit; transition: all 0.15s;
        }
        .pagination button:hover:not(:disabled) { background: #f0fbf9; border-color: #00685f; }
        .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
        .pagination span { font-size: 13px; color: #3d4947; }

        /* Modal */
        .modal-backdrop {
            position: fixed; inset: 0; background: rgba(11,28,48,0.5);
            backdrop-filter: blur(4px); display: flex; align-items: center;
            justify-content: center; z-index: 1000;
        }
        .modal-box {
            background: white; width: 90vw; max-width: 900px; max-height: 88vh;
            border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 24px; border-bottom: 1px solid #eef2f6;
        }
        .modal-header h3 { margin: 0; font-size: 18px; }
        .modal-close {
            background: none; border: none; cursor: pointer; color: #7a8a9a;
            padding: 4px; display: flex; border-radius: 8px;
        }
        .modal-close:hover { background: #f2f4f6; color: #0b1c30; }
        .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
        .preview-content { min-height: 200px; }
        .preview-content .docx-wrapper,
        .preview-content .docx-container { overflow: auto; }
        .preview-content .exl-wrapper { overflow: auto; }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            line-height: 1;
        }

        @media (max-width: 640px) {
            .toolbar { flex-direction: column; align-items: stretch; }
            .search-box input { width: 100%; }
            .doc-card { flex-wrap: wrap; }
            .doc-actions { width: 100%; justify-content: flex-end; }
        }
    `;

    render() {
        if (this.loading) {
            return html`<div style="text-align:center;padding:48px;">Loading...</div>`;
        }

        return html`
            <button class="back-btn" @click=${this.goBack}>
                <span class="material-symbols-outlined">arrow_back</span>
                Back to Categories
            </button>

            <div class="page-header">
                <h1>${this.category?.name || 'Category'}</h1>
                <p>Documents in this category</p>
            </div>

            <div class="toolbar">
                <span class="doc-count-label">${this.filteredDocs.length} document${this.filteredDocs.length !== 1 ? 's' : ''}</span>
                <div class="search-box">
                    <input type="text" placeholder="Search documents..."
                        .value=${this.keyword}
                        @input=${this.onSearchInput}
                        @keydown=${this.onSearchKeydown}
                    />
                </div>
            </div>

            ${this.filteredDocs.length === 0
                ? html`
                    <div class="empty-state">
                        <span class="material-symbols-outlined">folder_open</span>
                        <p>No documents in this category yet.</p>
                    </div>
                `
                : html`
                    ${this.paginatedDocs.map(doc => html`
                        <div class="doc-card" @click=${() => this.openPreview(doc)}>
                            <div class="doc-avatar">${doc.documentName?.charAt(0) || 'D'}</div>
                            <div class="doc-info">
                                <h4 title="${doc.documentName}">${doc.documentName}</h4>
                                <div class="doc-meta">
                                    <span class="status-badge ${this.getStatusClass(doc.statusName)}">${doc.statusName || 'N/A'}</span>
                                    <span class="badge-version">V ${doc.versionNum || 1}.0</span>
                                    <span>${doc.categoriesName || ''}</span>
                                </div>
                            </div>
                            <div class="doc-actions" @click=${(e) => e.stopPropagation()}>
                                <button class="act-btn" title="Preview" @click=${() => this.openPreview(doc)}>
                                    <span class="material-symbols-outlined">visibility</span>
                                </button>
                                <button class="act-btn" title="Download" @click=${() => this.downloadFile(doc)}>
                                    <span class="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        </div>
                    `)}

                    ${this.totalPages > 1 ? html`
                        <div class="pagination">
                            <button ?disabled=${this.currentPage <= 1} @click=${() => { this.currentPage--; this.requestUpdate(); }}>
                                Prev
                            </button>
                            <span>Page ${this.currentPage} of ${this.totalPages}</span>
                            <button ?disabled=${this.currentPage >= this.totalPages} @click=${() => { this.currentPage++; this.requestUpdate(); }}>
                                Next
                            </button>
                        </div>
                    ` : ''}
                `
            }

            ${this.showPreviewModal && this.selectedDoc ? html`
                <div class="modal-backdrop" @click=${this.closePreview}>
                    <div class="modal-box" @click=${(e) => e.stopPropagation()}>
                        <div class="modal-header">
                            <h3>${this.selectedDoc.documentName}</h3>
                            <button class="modal-close" @click=${this.closePreview}>
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="preview-content">
                                ${this.selectedDoc.fileType === 'docx' ? html`
                                    <div class="docx-wrapper">
                                        <div id="docx-modal-container"></div>
                                    </div>
                                ` : ''}
                                ${(this.selectedDoc.fileType === 'xlsx' || this.selectedDoc.fileType === 'xls') ? html`
                                    <div class="exl-wrapper">
                                        <div id="excel-modal-container"></div>
                                    </div>
                                ` : ''}
                                ${this.selectedDoc.fileType === 'pdf' ? html`
                                    ${this.pdfBlobUrl ? html`<iframe src="${this.pdfBlobUrl}" style="width:100%;height:500px;border:none;"></iframe>` : html`<p style="text-align:center;padding:32px;color:#7a8a9a;">Loading PDF...</p>`}
                                ` : ''}
                                ${['png','jpg','jpeg','webp'].includes(this.selectedDoc.fileType) ? html`
                                    <img src="${this.selectedDoc.fileUrl}" style="max-width:100%;height:auto;">
                                ` : ''}
                                ${this.selectedDoc.fileType === 'txt' ? html`
                                    <iframe src="${this.selectedDoc.fileUrl}" style="width:100%;height:500px;border:none;"></iframe>
                                ` : ''}
                                ${!['docx', 'xlsx', 'xls', 'pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'].includes(this.selectedDoc.fileType) ? html`
                                    <p style="text-align:center;padding:32px;color:#7a8a9a;">Preview not available for this file type.</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define('admin-category-detail-page', AdminCategoryDetail);
