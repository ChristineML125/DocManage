import { LitElement, html, css } from 'lit';
import { getFavorites, toggleFavorite, getDocument, getVersionList, generateAISummary, exportPDF, exportDocx, exportXlsx } from '../../api/documentAPI.js';
import { getFileUrl, fetchFile } from '../../api/http.js';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';

export class PersonalFavoritesPage extends LitElement {

  static styles = css`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      background: #f3faff;
      font-family: 'Manrope', sans-serif;
      color: #071e27;
      --accent: #00685f;
      --accent-light: rgba(0, 94, 83, 0.08);
      --accent-lighter: rgba(0, 94, 83, 0.12);
      --border: #eef2f6;
    }

    .container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .left-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-right: 1px solid var(--border);
      min-width: 0;
    }

    .filter-bar {
      padding: 12px 16px;
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #45474c;
    }

    .table-wrap {
      flex: 1;
      overflow-y: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead th {
      position: sticky;
      top: 0;
      background: #fafbfc;
      padding: 12px 16px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #7a8a9a;
      border-bottom: 1px solid var(--border);
      z-index: 1;
    }

    tbody td {
      padding: 12px 16px;
      text-align: center;
      border-bottom: 1px solid #f0f3f7;
      color: #2a3a4a;
      vertical-align: middle;
    }

    tbody tr {
      cursor: pointer;
      transition: background 0.15s;
    }

    tbody tr:hover {
      background: #f8fafc;
    }

    tbody tr.active {
      background: var(--accent-lighter);
      border-left: 4px solid var(--accent);
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
      background: #ede9fe;
      color: var(--accent);
    }

    .doc-title {
      font-weight: 600;
      color: #0b1c30;
    }

    .doc-name {
      max-width: 200px;
      width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge {
      display: inline-block;
      padding: 2px 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .badge-version {
      display: inline-block;
      padding: 2px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: #4338ca;
      background: #ede9fe;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #7a8a9a;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: var(--accent-light);
      color: var(--accent);
    }

    .icon-btn .material-symbols-outlined {
      font-size: 18px;
    }

    .star-btn {
      color: #f59e0b;
    }

    .star-btn:hover {
      color: #d97706;
      background: rgba(245, 158, 11, 0.12);
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .edit-btn:hover {
      background: rgba(0, 94, 83, 0.08);
      color: #00685f;
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

    .resizer {
      width: 3px;
      background: var(--border);
      cursor: col-resize;
      transition: background 0.2s;
      flex-shrink: 0;
    }

    .resizer:hover,
    .resizer.active {
      background: #707070;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 14px 16px;
      background: #fafbfc;
      border-top: 1px solid var(--border);
    }

    .pagination button {
      padding: 6px 14px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #7a8a9a;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination button:hover:not(:disabled) {
      background: #f0f3f7;
      border-color: #dce4ed;
    }

    .pagination button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pagination span {
      font-size: 12px;
      font-weight: 600;
      color: #7a8a9a;
    }

    .right-pane {
      background: #ffffff;
      border-left: 1px solid #eef2f6;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      min-width: 350px;
    }

    .preview-header {
      padding: 15px;
      border-bottom: 1px solid #eef2f6;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .preview-title {
      font-size: 17px;
      font-weight: 600;
      color: #0b1c30;
      margin: 0 0 5px;
      word-wrap: break-word;
    }

    .preview-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 16px 20px 16px 16px;
      border-bottom: 1px solid #eef2f6;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #7a8a9a;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 14px;
      font-weight: 600;
      color: #0b1c30;
    }

    .preview-content {
      flex: 1;
      min-height: 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: auto;
      position: relative;
      border-radius: 6px;
    }

    .preview-content iframe {
      width: 100%;
      height: 100%;
      border: none;
      min-height: 0;
      padding: 10px 15px;
    }

    .empty-placeholder,
    .empty-center {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #7a8a9a;
    }

    .empty-placeholder .icon {
      font-size: 20px;
    }

    .empty-center .icon {
      font-size: 48px;
      color: #dce4ed;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      vertical-align: middle;
    }

    .docx-wrapper {
      width: 100%;
      overflow: auto;
      box-sizing: border-box;
      min-height: 0;
      padding: 0;
    }

    #docx-container *,
    #docx-modal-container * {
      max-width: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
      box-sizing: border-box;
      font-size: 14px;
    }

    #docx-container,
    #docx-modal-container {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .exl-wrapper {
      width: 100%;
      overflow: auto;
      box-sizing: border-box;
      min-height: 0;
      padding: 15px;
    }

    #excel-container *,
    #excel-modal-container * {
      max-width: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
      box-sizing: border-box;
      font-size: 14px;
      padding: 15px;
    }

    #excel-container,
    #excel-modal-container {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .preview-modal {
      position: fixed;
      inset: 0;
      background: rgba(4, 0, 43, 0.53);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .preview-window {
      width: 70%;
      height: 90%;
      background: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
      position: relative;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-box {
      background: #fff;
      border-radius: 14px;
      padding: 28px 32px;
      width: 420px;
      max-width: 92vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }

    .modal-box h3 {
      margin: 0 0 16px;
      font-size: 18px;
      font-weight: 700;
      color: #1a1d21;
    }

    .modal-box p {
      margin: 0 0 10px;
      font-size: 14px;
      color: #4a5568;
    }

    .modal-box input[type="text"] {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
      outline: none;
    }

    .modal-box input[type="text"]:focus {
      border-color: var(--accent);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .modal-actions button {
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-confirm {
      background: var(--accent);
      color: #fff;
    }

    .btn-danger {
      background: #dc2626;
      color: #fff;
    }

    .toolbar {
      height: 50px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      border-bottom: 1px solid #eef2f6;
    }

    .toolbar button {
      border: none;
      background: var(--accent);
      color: white;
      padding: 8px 14px;
      border-radius: 6px;
      cursor: pointer;
    }

    .toolbar button:hover {
      opacity: 0.85;
    }

    .modal-body {
      flex: 1;
      display: flex;
      overflow: hidden;
      border-radius: 6pt;
    }

    .modal-body .document-side {
      flex: 1;
      overflow: auto;
      padding: 20px;
      border: 2px solid #c6c6c791;
      margin: 20px;
      background: #d7d8d82f;
      border-radius: 6pt;
    }

    .ai-summary-panel {
      width: 320px;
      height: 100%;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
    }

    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .ai-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-title h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #0b1c30;
    }

    .ai-content {
      flex: 1;
      overflow: auto;
      padding: 20px;
    }

    .summary-section h4 {
      font-size: 11px;
      color: #64748b;
      letter-spacing: 1px;
    }

    #summary-content {
      padding-left: 18px;
      font-size: 14px;
      color: #334155;
      margin-bottom: 10px;
    }

    #summary-content li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .progress-modal {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(6px);
      background: rgba(9, 20, 38, 0.25);
      z-index: 2000;
      padding: 24px;
    }

    .progress-box {
      width: 100%;
      max-width: 448px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #c5c6cd;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .progress-header {
      padding: 16px 32px;
      border-bottom: 1px solid #c5c6cd;
      background: #f7f9fb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #091426;
    }

    .progress-close {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #45474c;
      padding: 4px;
      display: flex;
      align-items: center;
    }

    .progress-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .progress-label-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .progress-label {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #45474c;
    }

    .progress-percent {
      font-size: 20px;
      font-weight: 600;
      color: var(--accent);
    }

    .progress-track {
      height: 12px;
      width: 100%;
      background: #e6e8ea;
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid rgba(197, 198, 205, 0.1);
    }

    .progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 9999px;
      transition: width 0.5s ease-out;
      position: relative;
      overflow: hidden;
    }

    .progress-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
      animation: exportShimmer 1.5s infinite;
    }

    @keyframes exportShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .progress-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #45474c;
      margin-top: 8px;
    }

    .progress-status .spin-icon {
      font-size: 18px;
      color: var(--accent);
      animation: exportSpin 1s linear infinite;
    }

    @keyframes exportSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .progress-steps {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-step {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #45474c;
    }

    .progress-step.active {
      color: #091426;
      font-weight: 600;
    }

    .progress-step .step-icon { font-size: 16px; flex-shrink: 0; }
    .progress-step .step-icon.done { color: #16a34a; }

    .progress-step .step-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--accent);
      border-top-color: transparent;
      border-radius: 50%;
      animation: exportSpin 0.8s linear infinite;
      flex-shrink: 0;
    }

    .progress-footer {
      padding: 16px 32px;
      background: #f2f4f6;
      border-top: 1px solid #c5c6cd;
      display: flex;
      justify-content: flex-end;
    }

    .progress-cancel {
      padding: 8px 32px;
      border: 1px solid #091426;
      background: transparent;
      color: #091426;
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
    }

    .progress-cancel:hover {
      background: rgba(9, 20, 38, 0.05);
    }
  `;

  static properties = {
    favorites: { type: Array },
    filteredDocs: { type: Array },
    paginatedDocs: { type: Array },
    selectedDoc: { type: Object },
    keyword: { type: String },
    currentPage: { type: Number },
    totalPages: { type: Number },
    pdfBlobUrl: { type: String },
    showPreviewModal: { type: Boolean },
    showAISummary: { type: Boolean },
    aiSummary: { type: String },
    loadingSummary: { type: Boolean },
    converting: { type: Boolean },
    progress: { type: Number },
    message: { type: String },
    rightPanelWidth: { type: Number },
    isDragging: { type: Boolean },
    editingDoc: { type: Object },
    editName: { type: String },
    deletingDoc: { type: Object },
    favoriteIds: { type: Set }
  };

  constructor() {
    super();
    this.favorites = [];
    this.filteredDocs = [];
    this.paginatedDocs = [];
    this.selectedDoc = null;
    this.keyword = '';
    this.currentPage = 1;
    this.pageSize = 8;
    this.totalPages = 1;
    this.pdfBlobUrl = null;
    this.showPreviewModal = false;
    this.showAISummary = false;
    this.aiSummary = '';
    this.loadingSummary = false;
    this.converting = false;
    this.progress = 0;
    this.message = '';
    this.rightPanelWidth = 350;
    this.isDragging = false;
    this.editingDoc = null;
    this.editName = '';
    this.deletingDoc = null;
    this.favoriteIds = new Set();

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._exportCancelled = false;
    this._exportProgressTimer = null;
    this._exportCompletionTimer = null;
    this._exportAbortController = null;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    this.fetchFavorites();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
  }

  async fetchFavorites() {
    try {
      const res = await getFavorites();
      if (res.success) {
        this.favorites = res.favorites || [];
        this.favoriteIds = new Set(this.favorites.map(f => f.documentID));
        this.filteredDocs = [...this.favorites];
        this.selectedDoc = null;
        this.updatePagination();
      }
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDocs.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedDocs = this.filteredDocs.slice(start, start + this.pageSize);
  }

  filterDocuments() {
    const kw = this.keyword.toLowerCase();
    if (!kw) {
      this.filteredDocs = [...this.favorites];
    } else {
      this.filteredDocs = this.favorites.filter(d =>
        (d.documentName || '').toLowerCase().includes(kw)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  onKeywordInput(e) {
    this.keyword = e.target.value;
    this.filterDocuments();
  }

  previousPage() {
    if (this.currentPage > 1) { this.currentPage--; this.updatePagination(); }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) { this.currentPage++; this.updatePagination(); }
  }

  async handleToggleFavorite(doc, e) {
    e.stopPropagation();
    try {
      const { toggleFavorite } = await import('../../api/documentAPI.js');
      const res = await toggleFavorite(doc.documentID);
      if (res.success && !res.favorited) {
        this.favorites = this.favorites.filter(f => f.documentID !== doc.documentID);
        this.favoriteIds = new Set(this.favorites.map(f => f.documentID));
        if (this.selectedDoc?.documentID === doc.documentID) {
          this.selectedDoc = null;
          this.pdfBlobUrl = null;
        }
        this.filterDocuments();
      }
    } catch (err) {
      console.error('Remove favorite failed', err);
    }
  }

  async startEdit(doc) {
    this.editingDoc = doc;
    this.editName = doc.documentName;
  }

  async saveEdit() {
    if (!this.editName.trim() || !this.editingDoc) return;
    try {
      const { renameDocument } = await import('../../api/documentAPI.js');
      const res = await renameDocument(this.editingDoc.documentID, this.editName.trim());
      if (res.success) {
        this.editingDoc.documentName = this.editName.trim();
        if (this.selectedDoc?.documentID === this.editingDoc.documentID) {
          this.selectedDoc = { ...this.selectedDoc, documentName: this.editName.trim() };
        }
        this.editingDoc = null;
        this.editName = '';
        await this.fetchFavorites();
      } else {
        alert(res.message || 'Rename failed');
      }
    } catch (err) {
      alert('Rename failed: ' + err.message);
    }
  }

  confirmDelete(doc) {
    this.deletingDoc = doc;
  }

  async doDelete() {
    if (!this.deletingDoc) return;
    try {
      const { deleteDocuments } = await import('../../api/documentAPI.js');
      const res = await deleteDocuments(this.deletingDoc.documentID);
      if (res.success) {
        if (this.selectedDoc?.documentID === this.deletingDoc.documentID) {
          this.selectedDoc = null;
          this.pdfBlobUrl = null;
        }
        this.deletingDoc = null;
        await this.fetchFavorites();
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }

  async selectDoc(doc) {
    this.selectedDoc = { ...doc };
    try {
      const res = await getDocument(doc.documentID);
      if (res.success) {
        const filePath = res.document.filePath;
        const fileUrl = filePath ? getFileUrl(filePath) : null;
        const fileType = filePath ? filePath.split('.').pop().toLowerCase() : '';
        this.selectedDoc = { ...doc, ...res.document, fileUrl, fileType };

        if (fileType === 'docx') { await this.updateComplete; await this.renderDoc(fileUrl); }
        if (fileType === 'xlsx' || fileType === 'xls') { await this.updateComplete; await this.renderExcel(fileUrl); }
        if (fileType === 'pdf' && fileUrl) {
          try {
            const fileRes = await fetchFile(fileUrl);
            const blob = await fileRes.blob();
            if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
            this.pdfBlobUrl = URL.createObjectURL(blob);
          } catch (err) { console.error('Failed to load PDF as blob:', err); }
        }
      }
    } catch (err) { console.error('Failed to load document details', err); }
    this.requestUpdate();
  }

  formatDate(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getStatusClass(statusName) {
    if (!statusName) return '';
    if (statusName === 'Active') return 'status-active';
    if (statusName === 'Archived') return 'status-archived';
    return '';
  }

  _startDrag() { this.isDragging = true; }

  _onMouseMove(e) {
    if (!this.isDragging) return;
    const container = this.renderRoot.querySelector('.container');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    if (newWidth >= 200 && newWidth <= 600) this.rightPanelWidth = newWidth;
  }

  _onMouseUp() { this.isDragging = false; }

  async renderDoc(url) {
    const res = await fetchFile(url);
    const buffer = await res.arrayBuffer();
    await this.updateComplete;
    const container = this.renderRoot.querySelector('#docx-container');
    if (!container) return;
    container.innerHTML = '';
    await renderAsync(buffer, container, null, { ignoreWidth: true, ignoreHeight: true, breakPages: false });
  }

  async renderModalDoc(url) {
    const res = await fetchFile(url);
    const buffer = await res.arrayBuffer();
    await this.updateComplete;
    const container = this.renderRoot.querySelector('#docx-modal-container');
    if (!container) return;
    container.innerHTML = '';
    await renderAsync(buffer, container, null, { ignoreWidth: true, ignoreHeight: true, breakPages: false });
  }

  async renderExcel(url) {
    const res = await fetchFile(url);
    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const container = this.renderRoot.querySelector('#excel-container');
    if (!container) return;
    container.innerHTML = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const title = document.createElement('h3');
      title.textContent = sheetName;
      container.appendChild(title);
      const htmlStr = XLSX.utils.sheet_to_html(sheet);
      const div = document.createElement('div');
      div.innerHTML = htmlStr;
      container.appendChild(div);
    });
  }

  async renderModalExcel(url) {
    const res = await fetchFile(url);
    const buffer = await res.arrayBuffer();
    await this.updateComplete;
    const container = this.renderRoot.querySelector('#excel-modal-container');
    if (!container) return;
    container.innerHTML = '';
    const workbook = XLSX.read(buffer, { type: 'array' });
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const htmlStr = XLSX.utils.sheet_to_html(sheet);
      const title = document.createElement('h3');
      title.textContent = sheetName;
      container.appendChild(title);
      const div = document.createElement('div');
      div.innerHTML = htmlStr;
      container.appendChild(div);
    });
  }

  renderPreview(type, url, containerId = 'docx-container', excelContainer = 'excel-container') {
    if (type === 'pdf') {
      return this.pdfBlobUrl ? html`<iframe src="${this.pdfBlobUrl}"></iframe>` : html`<iframe></iframe>`;
    }
    if (['png', 'jpg', 'jpeg', 'webp'].includes(type)) return html`<img src="${url}" style="max-width:100%;height:auto;">`;
    if (type === 'docx') return html`<div class="docx-wrapper"><div id="${containerId}"></div></div>`;
    if (type === 'xlsx' || type === 'xls') return html`<div class="exl-wrapper"><div id="${excelContainer}"></div></div>`;
    return '';
  }

  async openPreviewModal() {
    this.showPreviewModal = true;
    this.showAISummary = false;
    await this.updateComplete;
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (this.selectedDoc?.fileType === 'docx') await this.renderModalDoc(this.selectedDoc.fileUrl);
    if (this.selectedDoc?.fileType === 'xlsx' || this.selectedDoc?.fileType === 'xls') await this.renderModalExcel(this.selectedDoc.fileUrl);
    if (this.selectedDoc?.fileType === 'pdf' && this.selectedDoc?.fileUrl) {
      try {
        const res = await fetchFile(this.selectedDoc.fileUrl);
        const blob = await res.blob();
        if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = URL.createObjectURL(blob);
        await this.updateComplete;
      } catch (err) { console.error('Failed to load PDF as blob:', err); }
    }
  }

  closeModal() {
    if (this.converting) this.cancelConversion();
    this.showPreviewModal = false;
    if (this.pdfBlobUrl) { URL.revokeObjectURL(this.pdfBlobUrl); this.pdfBlobUrl = null; }
  }

  closeSummaryModal() { this.showAISummary = false; }

  downloadDocument() {
    if (!this.selectedDoc?.fileUrl) return;
    const a = document.createElement('a');
    a.href = this.selectedDoc.fileUrl;
    a.download = this.selectedDoc.documentName;
    a.click();
  }

  cancelConversion() {
    if (!this.converting) return;
    this._exportCancelled = true;
    if (this._exportProgressTimer) { clearInterval(this._exportProgressTimer); this._exportProgressTimer = null; }
    if (this._exportCompletionTimer) { clearTimeout(this._exportCompletionTimer); this._exportCompletionTimer = null; }
    if (this._exportAbortController) { this._exportAbortController.abort(); this._exportAbortController = null; }
    this.converting = false;
    this.progress = 0;
    this.message = '';
    this.requestUpdate();
  }

  _beginExport(message) {
    this._exportCancelled = false;
    this._exportAbortController = new AbortController();
    this.converting = true;
    this.progress = 0;
    this.message = message;
    this._exportProgressTimer = setInterval(() => {
      if (this._exportCancelled || this.progress >= 90) return;
      this.progress += 10;
      this.requestUpdate();
    }, 500);
  }

  _finishExportSuccess(res) {
    if (this._exportCancelled) return;
    if (this._exportProgressTimer) { clearInterval(this._exportProgressTimer); this._exportProgressTimer = null; }
    this.progress = 100;
    this.message = 'Conversion completed';
    this.requestUpdate();
    this._exportCompletionTimer = setTimeout(() => {
      if (this._exportCancelled) return;
      this.converting = false;
      this.progress = 0;
      this.message = '';
      this._exportAbortController = null;
      this.requestUpdate();
    }, 1500);
    if (res?.success && res.downloadUrl) {
      fetchFile(res.downloadUrl)
        .then(fileRes => fileRes.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = res.documentName || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        })
        .catch(err => { console.error('Export download failed:', err); alert('Download failed: ' + err.message); });
    }
  }

  _finishExportFailure() {
    if (this._exportCancelled) return;
    if (this._exportProgressTimer) { clearInterval(this._exportProgressTimer); this._exportProgressTimer = null; }
    this.message = 'Conversion failed';
    this.converting = false;
    this._exportAbortController = null;
    this.requestUpdate();
  }

  _finishExportError(err) {
    if (this._exportProgressTimer) { clearInterval(this._exportProgressTimer); this._exportProgressTimer = null; }
    if (this._exportCancelled || err?.name === 'AbortError') return;
    this._finishExportFailure();
  }

  async exportPDF() {
    this._beginExport('Converting to PDF....');
    try {
      const res = await exportPDF(this.selectedDoc.documentID, { signal: this._exportAbortController.signal });
      if (this._exportCancelled) return;
      res.success ? this._finishExportSuccess(res) : this._finishExportFailure();
    } catch (err) { this._finishExportError(err); }
  }

  async exportDOCX() {
    this._beginExport('Converting to Word....');
    try {
      const res = await exportDocx(this.selectedDoc.documentID, { signal: this._exportAbortController.signal });
      if (this._exportCancelled) return;
      res.success ? this._finishExportSuccess(res) : this._finishExportFailure();
    } catch (err) { this._finishExportError(err); }
  }

  async exportXLSX() {
    this._beginExport('Converting to Excel....');
    try {
      const res = await exportXlsx(this.selectedDoc.documentID, { signal: this._exportAbortController.signal });
      if (this._exportCancelled) return;
      res.success ? this._finishExportSuccess(res) : this._finishExportFailure();
    } catch (err) { this._finishExportError(err); }
  }

  async generateSummary() {
    if (!this.selectedDoc) return;
    try {
      this.showAISummary = true;
      this.loadingSummary = true;
      this.aiSummary = '';
      const res = await generateAISummary(this.selectedDoc.documentID);
      this.aiSummary = res.success ? res.summary : 'No summary available';
    } catch (err) {
      this.aiSummary = 'Failed to generate summary';
    } finally {
      this.loadingSummary = false;
    }
  }

  render() {
    const type = this.selectedDoc?.fileType;
    const url = this.selectedDoc?.fileUrl;

    return html`
      <div class="container">
        <div class="left-pane">
          <div class="filter-bar">
            <span>${this.filteredDocs.length || 0} favorite documents</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style="width:40px"></th>
                  <th>Document Title</th>
                  <th>File Type</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${this.filteredDocs.length === 0
                  ? html`
                      <tr>
                        <td colspan="6">
                          <div class="empty-placeholder">
                            <div class="material-symbols-outlined icon">star_border</div>
                            <p>No favorite documents yet</p>
                          </div>
                        </td>
                      </tr>
                    `
                  : this.paginatedDocs.map(doc => {
                    const ext = doc.filePath?.split('.').pop()?.toUpperCase() || 'N/A';
                    return html`
                      <tr
                        class="${this.selectedDoc && this.selectedDoc.documentID === doc.documentID ? 'active' : ''}"
                        @click=${() => this.selectDoc(doc)}
                        @dblclick=${async () => { await this.selectDoc(doc); await this.openPreviewModal(); }}
                        title="Double-click to view the full content"
                      >
                        <td style="text-align:center">
                          <button class="icon-btn star-btn"
                            @click=${(e) => this.handleToggleFavorite(doc, e)}
                            title="Remove from favorites">
                            <span class="material-symbols-outlined">star</span>
                          </button>
                        </td>
                        <td class="doc-name">
                          <div class="doc-info">
                            <div class="doc-avatar">${doc.documentName?.charAt(0) || 'D'}</div>
                            <span class="doc-title" title="${doc.documentName}">${doc.documentName}</span>
                          </div>
                        </td>
                        <td><span class="badge">${ext}</span></td>
                        <td><span class="status-badge ${this.getStatusClass(doc.statusName)}">${doc.statusName}</span></td>
                        <td><span class="badge-version">V ${doc.versionNum}.0</span></td>
                        <td class="actions-cell">
                          <button class="icon-btn edit-btn" title="Edit name" @click=${(e) => { e.stopPropagation(); this.startEdit(doc); }}>
                            <span class="material-symbols-outlined">edit</span>
                          </button>
                          <button class="icon-btn delete-btn" title="Delete document" @click=${(e) => { e.stopPropagation(); this.confirmDelete(doc); }}>
                            <span class="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    `;
                  })}
              </tbody>
            </table>
            <div class="pagination">
              <button ?disabled=${this.currentPage === 1} @click=${this.previousPage}>
                <span class="material-symbols-outlined icon"><</span>
              </button>
              <span>Page ${this.currentPage} of ${this.totalPages}</span>
              <button ?disabled=${this.currentPage === this.totalPages} @click=${this.nextPage}>
                <span class="material-symbols-outlined icon">></span>
              </button>
            </div>
          </div>
        </div>

        <div class="resizer ${this.isDragging ? 'active' : ''}" @mousedown=${this._startDrag}></div>

        <div class="right-pane" style="width: ${this.rightPanelWidth}px;">
          ${this.selectedDoc
            ? html`
              <div class="preview-header">
                <h3 class="preview-title" title="${this.selectedDoc.documentName}">${this.selectedDoc.documentName}</h3>
                <div style="display:flex;gap:10px">
                  <button class="icon-btn" @click=${this.openPreviewModal} title="Open Full Preview">
                    <span class="material-symbols-outlined">open_in_full</span>
                  </button>
                </div>
              </div>
              <div class="preview-content">
                ${this.renderPreview(type, url)}
              </div>
              <div class="preview-meta">
                <div class="meta-item">
                  <span class="meta-label">Category</span>
                  <span class="meta-value">${this.selectedDoc.categoriesName || '--'}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Status</span>
                  <span class="meta-value">${this.selectedDoc.statusName || '--'}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Upload Date</span>
                  <span class="meta-value">${this.formatDate(this.selectedDoc.uploadDate)}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">ID</span>
                  <span class="meta-value">${this.selectedDoc.documentID}</span>
                </div>
              </div>
            `
            : html`
              <div class="empty-center">
                <span class="material-symbols-outlined icon">star</span>
                <p>Select a favorite document to view details</p>
              </div>
            `}
        </div>
      </div>

      ${this.showPreviewModal ? html`
        <div class="preview-modal">
          <div class="preview-window">
            <div class="toolbar">
              <button @click=${this.downloadDocument}>Download</button>
              <button @click=${this.exportPDF} ?disabled=${this.converting}>PDF</button>
              <button @click=${this.exportDOCX} ?disabled=${this.converting}>DOCX</button>
              <button @click=${this.exportXLSX} ?disabled=${this.converting}>XLSX</button>
              <button @click=${async () => { this.showAISummary = true; await this.generateSummary(); }}>AI Summary</button>
              <button @click=${this.closeModal}>Close</button>
            </div>
            ${this.converting ? html`
              <div class="progress-modal">
                <div class="progress-box">
                  <div class="progress-header">
                    <h2>Converting Document</h2>
                    <button class="progress-close" @click=${this.cancelConversion}>
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div class="progress-content">
                    <div class="progress-section">
                      <div class="progress-label-row">
                        <span class="progress-label">Overall Progress</span>
                        <span class="progress-percent">${this.progress}%</span>
                      </div>
                      <div class="progress-track">
                        <div class="progress-fill" style="width: ${this.progress}%">
                          ${this.progress < 100 ? html`<div class="progress-shimmer"></div>` : ''}
                        </div>
                      </div>
                      <div class="progress-status">
                        ${this.progress < 100
                          ? html`<span class="material-symbols-outlined spin-icon">sync</span>`
                          : html`<span class="material-symbols-outlined step-icon done">check_circle</span>`}
                        <p>${this.message || 'Converting... Please wait.'}</p>
                      </div>
                    </div>
                  </div>
                  <div class="progress-footer">
                    <button class="progress-cancel" @click=${this.cancelConversion}>Cancel</button>
                  </div>
                </div>
              </div>
            ` : ''}
            <div class="modal-body">
              <div class="document-side">
                ${this.renderPreview(type, url, 'docx-modal-container', 'excel-modal-container')}
              </div>
              ${this.showAISummary ? html`
                <div class="ai-summary-panel">
                  <div class="ai-header">
                    <div class="ai-title">
                      <span class="material-symbols-outlined icon">bolt</span>
                      <h3>AI Summary</h3>
                    </div>
                    <button class="icon-btn" @click=${this.closeSummaryModal}>
                      <span class="material-symbols-outlined icon">close</span>
                    </button>
                  </div>
                  <div class="ai-content">
                    <section class="summary-section">
                      <h4>AI SUMMARY</h4>
                      ${this.loadingSummary
                        ? html`<p>Generating summary...</p>`
                        : this.aiSummary
                          ? html`<ul id="summary-content">${this.aiSummary.split('\n').filter(i => i.trim()).map(item => html`<li>${item.replace(/\u2022/g, '').trim()}</li>`)}</ul>`
                          : html`<p>No summary available</p>`
                      }
                    </section>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      ` : ''}

      ${this.editingDoc ? html`
        <div class="modal-overlay" @click=${() => { this.editingDoc = null; this.editName = ''; }}>
          <div class="modal-box" @click=${e => e.stopPropagation()}>
            <h3>Rename Document</h3>
            <input type="text" .value=${this.editName} @input=${e => this.editName = e.target.value}
              @keydown=${e => { if (e.key === 'Enter') this.saveEdit(); }} autofocus>
            <div class="modal-actions">
              <button class="btn-cancel" @click=${() => { this.editingDoc = null; this.editName = ''; }}>Cancel</button>
              <button class="btn-confirm" @click=${() => this.saveEdit()}>Save</button>
            </div>
          </div>
        </div>
      ` : ''}

      ${this.deletingDoc ? html`
        <div class="modal-overlay" @click=${() => { this.deletingDoc = null; }}>
          <div class="modal-box" @click=${e => e.stopPropagation()}>
            <h3>Delete Document</h3>
            <p>Are you sure you want to delete "<strong>${this.deletingDoc.documentName}</strong>"? This action cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn-cancel" @click=${() => { this.deletingDoc = null; }}>Cancel</button>
              <button class="btn-danger" @click=${() => this.doDelete()}>Delete</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('personal-favorites-page', PersonalFavoritesPage);
