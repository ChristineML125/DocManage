import { LitElement, html, css } from 'lit';
import { getDocumentsList, getDocument, getVersionList, generateAISummary, exportPDF, exportDocx, exportXlsx, uploadNewVersion } from '../../api/documentAPI.js';
import { getFileUrl, fetchFile, http } from '../../api/http.js';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';

export class PersonalDocumentPage extends LitElement {

  static styles = css`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      background: #f3faff;
      font-family: 'Manrope', sans-serif;
      color: #071e27;
      --accent: #005e53;
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
      background: transparent;
      border: none;
      cursor: pointer;
      color: #8a9aa8;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .actions-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .icon-btn .material-symbols-outlined {
      font-size: 18px;
    }
    .edit-btn:hover {
      background: rgba(0, 94, 83, 0.08);
      color: #005e53;
    }
    .delete-btn:hover {
      background: rgba(220, 38, 38, 0.08);
      color: #dc2626;
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
      box-shadow: 0 0 0 3px rgba(108,99,255,0.12);
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

    .action-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #8a9aa8;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: var(--accent-light);
      color: var(--accent);
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

    .preview-content iframe,
    .document-side iframe {
      width: 100%;
      height: 100%;
      border: none;
      min-height: 0;
    }

    .preview-content iframe {
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

    .docx {
      width: 100% !important;
      max-width: 100% !important;
    }

    #docx-container .docx-wrapper {
      padding: 5pt !important;
    }

    #docx-modal-container .docx-wrapper {
      padding: 20pt !important;
    }

    #docx-container > div > section {
      padding: 10pt !important;
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

    .xlsx {
      width: 100% !important;
      max-width: 100% !important;
    }

    #excel-container .exl-wrapper {
      padding: 5pt !important;
    }

    #excel-modal-container .exl-wrapper {
      padding: 20pt !important;
    }

    #excel-container table,
    #excel-modal-container table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    #excel-container th,
    #excel-modal-container th {
      background: #f1f4f8;
      color: #1e293b;
      font-weight: 600;
      padding: 10px 12px;
      border: 1px solid #dce2ec;
      text-align: left;
      white-space: nowrap;
    }

    #excel-container td,
    #excel-modal-container td {
      padding: 8px 12px;
      border: 1px solid #e6edf5;
      vertical-align: middle;
      color: #1e293b;
      word-break: break-word;
    }

    .preview-modal,
    .version-modal {
      position: fixed;
      inset: 0;
      background: rgba(4, 0, 43, 0.53);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .preview-window,
    .version-window {
      width: 70%;
      height: 90%;
      background: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
    }

    .preview-window {
      position: relative;
    }

    .upload-version-modal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background-color: rgba(9, 20, 38, 0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      animation: overlayFadeIn 300ms ease both;
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .upload-window {
      width: 30%;
      height: 80%;
      min-width: 420px;
      max-width: 520px;
      max-height: 90vh;
      background: white;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
      animation: modalZoomIn 300ms ease both;
    }

    @keyframes modalZoomIn {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(12px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .progress-modal {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
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
      animation: exportFadeIn 0.3s ease-out;
    }

    @keyframes exportFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
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
      font-family: 'Hanken Grotesk', 'Inter', sans-serif;
      font-size: 24px;
      font-weight: 600;
      line-height: 32px;
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
      transition: color 0.2s;
    }

    .progress-close:hover {
      color: #091426;
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
      font-family: 'Hanken Grotesk', 'Inter', sans-serif;
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
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.35) 50%,
        transparent 100%
      );
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

    .progress-step .step-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .progress-step .step-icon.done {
      color: #16a34a;
    }

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
      transition: background 0.15s, transform 0.15s;
    }

    .progress-cancel:hover {
      background: rgba(9, 20, 38, 0.05);
    }

    .progress-cancel:active {
      transform: scale(0.95);
    }

    .toolbar,
    .version-toolbar,
    .upload-top,
    .bottom {
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
    }

    .toolbar {
      height: 50px;
      border-bottom: 1px solid #eef2f6;
    }

    .toolbar button,
    .version-toolbar button,
    .bottom button {
      border: none;
      background: var(--accent);
      color: white;
      padding: 8px 14px;
      border-radius: 6px;
      cursor: pointer;
    }

    .toolbar button:hover,
    .version-toolbar button:hover {
      opacity: 0.85;
    }

    .bottom {
      padding-top: 0;
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

    .ai-side {
      width: 300px;
      border-left: 1px solid #eef2f6;
      padding: 20px;
      overflow-y: auto;
      background: #fafafa;
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

    .summary-section {
      margin-bottom: 24px;
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

    .ai-footer {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .ai-footer button {
      width: 100%;
      padding: 10px;
      background: #101828;
      color: white;
      border: none;
      border-radius: 5px;
    }

    .top,
    .upload-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #5480ad33;
      padding: 0 16px;
    }

    .top h2 {
      padding-left: 20px;
    }

    .upload-top h2 {
      font-size: 20px;
      font-weight: 600;
      color: #0b1c30;
      padding-left: 13px;
      margin: 12px 0;
    }

    .upload-top {
      background: #ffffff;
      border-bottom: 2px solid #5480ad33;
    }

    .upload-top button {
      background: none;
      border: none;
      cursor: pointer;
      color: #7a8a9a;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      transition: background 0.2s, color 0.2s;
    }

    .upload-top button:hover {
      background: var(--accent-light);
      color: var(--accent);
    }

    .upload-top .material-symbols-outlined {
      font-size: 20px;
    }

    .display {
      display: flex;
      flex-direction: column;
      margin: 15px;
      padding: 12px 15px;
      border: 1px solid #cfcfcf;
      background: #f4ffffab;
      border-radius: 6px;
      gap: 6px;
      flex-shrink: 0;
    }

    .upload-form {
      flex-shrink: 0;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }

    .upload-item1 {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-left: 20px;
      padding-bottom: 0;
      gap: 8px;
    }

    .upload-item1 .material-symbols-outlined {
      font-size: 30px;
      color: var(--accent);
    }

    .upload-item1 .item-title {
      color: #1d1d1d;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-bottom: 0;
    }

    .upload-item2 {
      display: flex;
      align-items: flex-start;
      padding-left: 58px;
      gap: 40px;
      margin-top: 4px;
    }

    .item-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .upload-item1 p,
    .upload-item2 p {
      margin: 0;
    }

    .item-content {
      font-size: 10px;
      color: #45474c;
    }

    .item-content:first-child {
      font-weight: 500;
      color: #7a8a9a;
      font-size: 13px;
    }

    .item-group p:last-child {
      font-size: 10px;
      font-weight: 600;
      color: #1d1d1d;
    }

    .version-content {
      display: flex;
      height: 100%;
      flex: 1;
      overflow: hidden;
      background: #96b2c94d;
    }

    .version-list {
      flex: 1;
      padding: 20px;
      overflow: auto;
      background: #fafbfc;
      border: 3px solid #b0c4d88f;
      margin: 15px;
      border-radius: 6px;
    }

    .version-item {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #a8bae0;
      cursor: pointer;
      transition: background 0.15s;
      justify-content: space-between;
    }

    .version-item:hover {
      background: #eef2f6;
    }

    .version-item .version-num {
      font-weight: 600;
      color: #0b1c30;
      flex-shrink: 0;
    }

    .version-item .upload-date,
    .version-item .upload-by {
      font-size: 12px;
      color: #7a8a9a;
      flex-shrink: 0;
    }

    .version-item .current {
      display: inline-block;
      padding: 0 12px;
      height: 22px;
      line-height: 22px;
      background: #091426;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 12px;
      flex-shrink: 0;
      margin-left: auto;
      vertical-align: middle;
    }

    .right-version-preview {
      flex: 1;
      min-width: 750px;
      display: flex;
      flex-direction: column;
      border: 3px solid #b0c4d88f;
      margin: 15px;
      border-radius: 6px;
      background: #ffffff;
    }

    .right-version-preview .preview-content {
      flex: 1;
      min-height: 0;
      display: flex;
      justify-content: center;
      position: relative;
    }

    .bento-card {
      border-radius: 12px;
      padding: 15px;
      transition: all 0.2s ease;
    }

    .upload-zone {
      height: 100%;
      min-height: 150px;
      max-height: 300px;
      height: clamp(180px, 25vh, 320px);
      border: 2px dashed var(--accent);
      background: #ffffff;
      box-shadow: 0 0 5px 3px rgba(108, 99, 255, 0.1);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      padding: 30px 20px;
    }

    .upload-zone.drag-over {
      border-color: var(--accent);
      background: #f5f3ff;
    }

    .upload-zone .icon {
      font-size: 48px;
      color: var(--accent);
      margin-bottom: 16px;
    }

    .upload-zone h3 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 8px;
    }

    .upload-zone p {
      font-size: 14px;
      color: #3d4947;
      margin: 0;
    }

    .upload-zone .file-name {
      margin-top: 12px;
      color: var(--accent);
      font-weight: 600;
      font-size: 14px;
      word-break: break-all;
      text-align: center;
    }

    #fileInput {
      display: none;
    }

    .bottom {
      background: #d8d8d856;
      border-top: 1px solid #8181817c;
      margin-top: auto;
      padding: 15px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      flex-shrink: 0;
    }

    .bottom button {
      border: none;
      background: var(--accent);
      color: white;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
    }

    .bottom button:hover {
      opacity: 0.9;
    }

    .bottom button:active {
      transform: scale(0.97);
    }

    .bottom button:first-child {
      background: #ffffff;
      color: var(--accent);
      border: 1px solid var(--accent);
    }

    .bottom button:first-child:hover {
      background: var(--accent-light);
    }

    @media (max-width: 1024px) {
      .upload-window {
        width: 80%;
        min-width: unset;
      }

      .display {
        margin: 12px;
        padding: 10px 12px;
      }

      .upload-item1 .item-title {
        font-size: 18px;
      }

      .upload-item2 {
        padding-left: 45px;
        gap: 30px;
      }
    }

    @media (max-width: 640px) {
      .upload-window {
        width: 90% !important;
        min-width: unset;
        margin: 0 10px;
        max-height: 95vh;
      }

      .upload-top h2 {
        font-size: 18px;
      }

      .display {
        margin: 10px;
        padding: 10px;
      }

      .upload-item1 {
        padding-left: 10px;
      }

      .upload-item1 .material-symbols-outlined {
        font-size: 26px;
      }

      .upload-item1 .item-title {
        font-size: 16px;
        max-width: 220px;
      }

      .upload-item2 {
        padding-left: 10px;
        gap: 20px;
      }

      .item-content {
        font-size: 14px;
      }

      .bottom {
        padding: 10px;
      }
    }

    @media (max-width: 400px) {
      .upload-window {
        width: 95% !important;
        margin: 0 5px;
      }

      .upload-top {
        padding: 0 10px;
      }

      .upload-top h2 {
        font-size: 16px;
      }

      .display {
        margin: 8px;
        padding: 8px;
      }

      .upload-item1 {
        padding-left: 5px;
        gap: 5px;
      }

      .upload-item1 .material-symbols-outlined {
        font-size: 24px;
      }

      .upload-item1 .item-title {
        font-size: 14px;
        max-width: 160px;
      }

      .upload-item2 {
        padding-left: 5px;
        gap: 15px;
        flex-wrap: wrap;
      }

      .item-group p:first-child {
        font-size: 12px;
      }

      .item-group p:last-child {
        font-size: 14px;
      }
    }
  `;

  static properties = {
    documents: { type: Array },
    filteredDocs: { type: Array },
    paginatedDocs: { type: Array },
    selectedDoc: { type: Object },
    keyword: { type: String },
    currentPage: { type: Number },
    totalPages: { type: Number },
    pdfBlobUrl: { type: String },
    showHistoryVersion: { type: Boolean },
    showUploadVersion: { type: Boolean },
    showPreviewModal: { type: Boolean },
    showAISummary: { type: Boolean },
    versions: { type: Array },
    selectedVer: { type: Object },
    aiSummary: { type: String },
    loadingSummary: { type: Boolean },
    converting: { type: Boolean },
    progress: { type: Number },
    message: { type: String },
    selectedFile: { type: Object },
    dragOver: { type: Boolean },
    rightPanelWidth: { type: Number },
    isDragging: { type: Boolean },
    editingDoc: { type: Object },
    editName: { type: String },
    deletingDoc: { type: Object }
  };

  constructor() {
    super();
    this.documents = [];
    this.filteredDocs = [];
    this.paginatedDocs = [];
    this.selectedDoc = null;
    this.keyword = '';
    this.currentPage = 1;
    this.pageSize = 8;
    this.totalPages = 1;
    this.pdfBlobUrl = null;
    this.showHistoryVersion = false;
    this.showUploadVersion = false;
    this.showPreviewModal = false;
    this.showAISummary = false;
    this.versions = [];
    this.selectedVer = null;
    this.aiSummary = '';
    this.loadingSummary = false;
    this.converting = false;
    this.progress = 0;
    this.message = '';
    this.selectedFile = null;
    this.dragOver = false;
    this.rightPanelWidth = 350;
    this.isDragging = false;
    this.editingDoc = null;
    this.editName = '';
    this.deletingDoc = null;

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
    this.fetchDocuments();

    const params = new URLSearchParams(window.location.search);
    const urlKeyword = params.get('keyword') || '';
    if (urlKeyword) {
      this.keyword = urlKeyword;
      setTimeout(() => this.filterDocuments(), 300);
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.recalculateScale();
    });
    setTimeout(() => {
      const previewContent = this.renderRoot.querySelector('.preview-content');
      if (previewContent) {
        this.resizeObserver.observe(previewContent);
      }
    }, 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
    }
  }

  recalculateScale() {
    const container = this.renderRoot.querySelector('.preview-content');
    const docx = this.renderRoot.querySelector('#docx-container, #docx-modal-container');
    if (!container || !docx) return;
    const containerWidth = container.clientWidth;
    const baseWidth = 800;
    const scale = containerWidth / baseWidth;
    docx.style.transform = '';
  }

  async fetchDocuments() {
    try {
      const res = await http('/documents/my');
      if (res.success) {
        this.documents = res.documents || [];
        this.filteredDocs = [...this.documents];
        this.selectedDoc = null;
        this.updatePagination();
      }
    } catch (err) {
      console.error('Failed to load personal documents', err);
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDocs.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDocs = this.filteredDocs.slice(start, end);
  }

  get paginatedDocsComputed() {
    return this.paginatedDocs;
  }

  get totalPagesComputed() {
    return this.totalPages;
  }

  filterDocuments() {
    const kw = this.keyword.toLowerCase();
    if (!kw) {
      this.filteredDocs = [...this.documents];
    } else {
      this.filteredDocs = this.documents.filter(d =>
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
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
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
        await this.loadDocs();
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
        await this.loadDocs();
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

        this.selectedDoc = {
          ...doc,
          ...res.document,
          fileUrl,
          fileType
        };

        if (fileType === 'docx') {
          await this.updateComplete;
          await this.renderDoc(fileUrl);
        }

        if (fileType === 'xlsx' || fileType === 'xls') {
          await this.updateComplete;
          await this.renderExcel(fileUrl);
        }

        if (fileType === 'pdf' && fileUrl) {
          try {
            const fileRes = await fetchFile(fileUrl);
            const blob = await fileRes.blob();
            if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
            this.pdfBlobUrl = URL.createObjectURL(blob);
          } catch (err) {
            console.error('Failed to load PDF as blob:', err);
          }
        }
      } else {
        console.error('Failed to fetch document:', res.message);
      }
    } catch (err) {
      console.error('Failed to load document details', err);
    }

    this.requestUpdate();
  }

  formatDate(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getFileType(filePath) {
    if (!filePath) return '--';
    const ext = filePath.split('.').pop().toLowerCase();
    return ext.toUpperCase();
  }

  getStatusClass(statusName) {
    if (!statusName) return '';
    switch (statusName) {
      case 'Active':
        return 'status-active';
      case 'Archived':
        return 'status-archived';
      default:
        return '';
    }
  }

  _startDrag() {
    this.isDragging = true;
  }

  _onMouseMove(e) {
    if (!this.isDragging) return;
    const container = this.renderRoot.querySelector('.container');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    if (newWidth >= 200 && newWidth <= 600) {
      this.rightPanelWidth = newWidth;
    }
  }

  _onMouseUp() {
    this.isDragging = false;
  }

  async renderDoc(url) {
    const res = await fetchFile(url);
    const buffer = await res.arrayBuffer();
    await this.updateComplete;
    const container = this.renderRoot.querySelector('#docx-container');
    if (!container) return;
    container.innerHTML = '';
    await renderAsync(buffer, container, null, {
      ignoreWidth: true,
      ignoreHeight: true,
      breakPages: false
    });
    this.recalculateScale();
  }

  async renderModalDoc(url) {
    const res = await fetchFile(url);
    const buffer = await res.arrayBuffer();
    await this.updateComplete;
    const container = this.renderRoot.querySelector('#docx-modal-container');
    if (!container) {
      console.log('modal docx container not found');
      return;
    }
    container.innerHTML = '';
    await renderAsync(buffer, container, null, {
      ignoreWidth: true,
      ignoreHeight: true,
      breakPages: false
    });
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
    const excelcontainer = this.renderRoot.querySelector('#excel-modal-container');
    if (!excelcontainer) {
      console.log('modal excel container not found');
      return;
    }
    excelcontainer.innerHTML = '';
    const workbook = XLSX.read(buffer, { type: 'array' });
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const htmlStr = XLSX.utils.sheet_to_html(sheet);
      const title = document.createElement('h3');
      title.textContent = sheetName;
      excelcontainer.appendChild(title);
      const div = document.createElement('div');
      div.innerHTML = htmlStr;
      excelcontainer.appendChild(div);
    });
  }

  renderPreview(type, url, containerId = 'docx-container', excelContainer = 'excel-container') {
    if (type === 'pdf') {
      if (this.pdfBlobUrl) {
        return html`<iframe src="${this.pdfBlobUrl}"></iframe>`;
      }
      return html`<iframe></iframe>`;
    }

    if (['png', 'jpg', 'jpeg', 'webp'].includes(type)) {
      return html`<img src="${url}" style="max-width:100%;height:auto;">`;
    }

    if (type === 'docx') {
      return html`
        <div class="docx-wrapper">
          <div id="${containerId}"></div>
        </div>
      `;
    }

    if (type === 'txt') {
      return html`
        <iframe
          src="${url}"
          style="width:100%;height:500px;border:none;">
        </iframe>
      `;
    }

    if (type === 'xlsx' || type === 'xls') {
      return html`
        <div class="exl-wrapper">
          <div id="${excelContainer}"></div>
        </div>
      `;
    }

    return '';
  }

  async openPreviewModal() {
    this.showPreviewModal = true;
    this.showAISummary = false;

    await this.updateComplete;
    await new Promise(resolve => requestAnimationFrame(resolve));

    if (this.selectedDoc?.fileType === 'docx') {
      await this.renderModalDoc(this.selectedDoc.fileUrl);
    }

    if (this.selectedDoc?.fileType === 'xlsx' || this.selectedDoc?.fileType === 'xls') {
      await this.renderModalExcel(this.selectedDoc.fileUrl);
    }

    if (this.selectedDoc?.fileType === 'pdf' && this.selectedDoc?.fileUrl) {
      try {
        const res = await fetchFile(this.selectedDoc.fileUrl);
        const blob = await res.blob();
        if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = URL.createObjectURL(blob);
        await this.updateComplete;
      } catch (err) {
        console.error('Failed to load PDF as blob:', err);
      }
    }
  }

  async openHistoryVersion() {
    if (!this.selectedDoc) {
      console.log('No document selected');
      return;
    }

    const res = await getVersionList(this.selectedDoc.documentID);
    if (res.success) {
      this.versions = res.versions || [];
      this.showHistoryVersion = true;
    }
  }

  async selectVersion(version) {
    this.selectedVer = {
      ...version,
      fileUrl: getFileUrl(version.filePath),
      fileType: version.filePath.split('.').pop().toLowerCase()
    };

    if (this.selectedVer.fileType === 'docx') {
      await this.updateComplete;
      await this.renderModalDoc(this.selectedVer.fileUrl);
    }

    if (this.selectedVer.fileType === 'pdf' && this.selectedVer.fileUrl) {
      try {
        const res = await fetchFile(this.selectedVer.fileUrl);
        const blob = await res.blob();
        if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = URL.createObjectURL(blob);
        await this.updateComplete;
      } catch (err) {
        console.error('Failed to load version PDF as blob:', err);
      }
    }

    if (this.selectedVer.fileType === 'xlsx' || this.selectedVer.fileType === 'xls') {
      await this.updateComplete;
      await this.renderModalExcel(this.selectedVer.fileUrl);
    }
  }

  async openUploadModal() {
    this.showUploadVersion = true;
  }

  closeModal() {
    if (this.converting) {
      this.cancelConversion();
    }
    this.showPreviewModal = false;
    this.showHistoryVersion = false;
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }

  closeUploadModal() {
    this.showUploadVersion = false;
    this.selectedFile = null;
    this.dragOver = false;
  }

  closeSummaryModal() {
    this.showAISummary = false;
  }

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

    if (this._exportProgressTimer) {
      clearInterval(this._exportProgressTimer);
      this._exportProgressTimer = null;
    }

    if (this._exportCompletionTimer) {
      clearTimeout(this._exportCompletionTimer);
      this._exportCompletionTimer = null;
    }

    if (this._exportAbortController) {
      this._exportAbortController.abort();
      this._exportAbortController = null;
    }

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

    if (this._exportProgressTimer) {
      clearInterval(this._exportProgressTimer);
      this._exportProgressTimer = null;
    }

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
        .catch(err => {
          console.error('Export download failed:', err);
          alert('Download failed: ' + err.message);
        });
    }
  }

  _finishExportFailure() {
    if (this._exportCancelled) return;

    if (this._exportProgressTimer) {
      clearInterval(this._exportProgressTimer);
      this._exportProgressTimer = null;
    }

    this.message = 'Conversion failed';
    this.converting = false;
    this._exportAbortController = null;
    this.requestUpdate();
  }

  _finishExportError(err) {
    if (this._exportProgressTimer) {
      clearInterval(this._exportProgressTimer);
      this._exportProgressTimer = null;
    }

    if (this._exportCancelled || err?.name === 'AbortError') {
      return;
    }

    this._finishExportFailure();
  }

  async exportPDF() {
    this._beginExport('Converting to PDF....');

    try {
      const res = await exportPDF(
        this.selectedDoc.documentID,
        { signal: this._exportAbortController.signal }
      );

      if (this._exportCancelled) return;

      if (res.success) {
        this._finishExportSuccess(res);
      } else {
        this._finishExportFailure();
      }
    } catch (err) {
      this._finishExportError(err);
    }
  }

  async exportDOCX() {
    this._beginExport('Converting to Word....');

    try {
      const res = await exportDocx(
        this.selectedDoc.documentID,
        { signal: this._exportAbortController.signal }
      );

      if (this._exportCancelled) return;

      if (res.success) {
        this._finishExportSuccess(res);
      } else {
        this._finishExportFailure();
      }
    } catch (err) {
      this._finishExportError(err);
    }
  }

  async exportXLSX() {
    this._beginExport('Converting to Excel....');

    try {
      const res = await exportXlsx(
        this.selectedDoc.documentID,
        { signal: this._exportAbortController.signal }
      );

      if (this._exportCancelled) return;

      if (res.success) {
        this._finishExportSuccess(res);
      } else {
        this._finishExportFailure();
      }
    } catch (err) {
      this._finishExportError(err);
    }
  }

  async generateSummary() {
    if (!this.selectedDoc) {
      console.log('No document selected');
      return;
    }
    try {
      this.showAISummary = true;
      this.loadingSummary = true;
      this.aiSummary = '';

      const res = await generateAISummary(this.selectedDoc.documentID);

      if (res.success) {
        this.aiSummary = res.summary;
      } else {
        this.aiSummary = 'No summary available';
      }
    } catch (err) {
      console.error('Generate Summary Error:', err);
      this.aiSummary = 'Failed to generate summary';
    } finally {
      this.loadingSummary = false;
    }
  }

  async uploadVersion() {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }
    this.uploading = true;
    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const data = await uploadNewVersion(this.selectedDoc.documentID, formData);
      if (data.success) {
        alert('Document uploaded successfully!');

        const docId = this.selectedDoc.documentID;
        await this.fetchDocuments();

        const updatedDoc = this.documents.find(d => d.documentID === docId);
        if (updatedDoc) {
          await this.selectDoc(updatedDoc);
        }

        this.closeUploadModal();
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

  render() {
    const type = this.selectedDoc?.fileType;
    const url = this.selectedDoc?.fileUrl;

    return html`
      <div class="container">
        <div class="left-pane">
          <div class="filter-bar">
            <span>${this.filteredDocs.length || 0} documents</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
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
                        <td colspan="5">
                          <div class="empty-placeholder">
                            <div class="material-symbols-outlined icon">inbox</div>
                            <p>No documents available</p>
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
                        @dblclick=${async () => {
                          await this.selectDoc(doc);
                          await this.openPreviewModal();
                        }}
                        title="Double-click to view the full content"
                      >
                        <td class="doc-name">
                          <div class="doc-info">
                            <div class="doc-avatar">
                              ${doc.documentName?.charAt(0) || 'D'}
                            </div>
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
              <button
                ?disabled=${this.currentPage === 1}
                @click=${this.previousPage}>
                <span class="material-symbols-outlined icon"><</span>
              </button>
              <span>Page ${this.currentPage} of ${this.totalPages}</span>
              <button
                ?disabled=${this.currentPage === this.totalPages}
                @click=${this.nextPage}>
                <span class="material-symbols-outlined icon">></span>
              </button>
            </div>
          </div>
        </div>

        <div
          class="resizer ${this.isDragging ? 'active' : ''}"
          @mousedown=${this._startDrag}
        ></div>

        <div class="right-pane" style="width: ${this.rightPanelWidth}px;">
          ${this.selectedDoc
            ? html`
              <div class="preview-header">
                <h3 class="preview-title" title="${this.selectedDoc.documentName}">${this.selectedDoc.documentName}</h3>
                <div style="display:flex;gap:10px">
                  <button class="icon-btn" @click=${this.openHistoryVersion} title="View History Version">
                    <span class="material-symbols-outlined">history</span>
                  </button>
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

              <div style="padding: 10px;">
                <p style="font-size:13px; color:#7a8a9a; line-height:1.0;">
                  This document was uploaded on ${this.formatDate(this.selectedDoc.uploadDate)}.
                </p>
              </div>
            `
            : html`
              <div class="empty-center">
                <span class="material-symbols-outlined icon">description</span>
                <p>Select a document to view details</p>
              </div>
            `}
        </div>
      </div>

      ${this.showHistoryVersion
        ? html`
          <div class="version-modal">
            <div class="version-window">
              <div class="top">
                <h2>History Version</h2>
                <div class="version-toolbar">
                  <button @click=${this.openUploadModal} title="Upload New Version">
                    Add New Version
                  </button>
                  <button @click=${this.closeModal} title="Close">
                    Close
                  </button>
                </div>
              </div>

              <div class="version-content">
                <div class="version-list">
                  ${this.versions.length === 0
                    ? html`
                      <div class="empty-placeholder">
                        <div class="material-symbols-outlined icon">inbox</div>
                        <p>No History Version available</p>
                      </div>
                    `
                    : this.versions.map(v => html`
                        <div class="version-item" @click=${() => this.selectVersion(v)}>
                          <div class="version-num">V ${v.versionNum}.0</div>
                          ${Number(v.isLatest) === 1
                            ? html`<div class="current">Current</div>`
                            : ''}
                          <div class="upload-date">${this.formatDate(v.uploadDate)}</div>
                          <div class="upload-by">${v.UserName}</div>
                        </div>
                      `)}
                </div>
                <div class="right-version-preview">
                  ${this.selectedVer
                    ? html`
                      <div class="preview-content">
                        ${this.renderPreview(
                          this.selectedVer.fileType,
                          this.selectedVer.fileUrl,
                          'docx-modal-container',
                          'excel-modal-container'
                        )}
                      </div>
                    `
                    : html`
                      <div class="empty-center">
                        <span class="material-symbols-outlined icon">description</span>
                        <p>Select a version to preview</p>
                      </div>
                    `}
                </div>
              </div>
            </div>
          </div>
        `
        : ''}

      ${this.showUploadVersion
        ? html`
          <div class="upload-version-modal">
            <div class="upload-window">
              <div class="upload-top">
                <h2>Upload New Version</h2>
                <button @click=${this.closeUploadModal}>
                  <span class="material-symbols-outlined icon" id="upload-close">close</span>
                </button>
              </div>

              <div class="display">
                <div class="upload-item1">
                  <span class="material-symbols-outlined icon">files</span>
                  <p class="item-title">${this.selectedDoc.documentName}.${this.selectedDoc.fileType}</p>
                </div>

                <div class="upload-item2">
                  <div class="item-group">
                    <p class="item-content">Current Version</p>
                    <p class="item-content">V${this.selectedDoc.versionNum}.0</p>
                  </div>

                  <div class="item-group">
                    <p class="item-content">Next Version</p>
                    <p>V${this.selectedDoc.versionNum + 1}.0</p>
                  </div>
                </div>
              </div>

              <div class="upload-form">
                <div class="bento-card">
                  <div
                    class="upload-zone ${this.dragOver ? 'drag-over' : ''}"
                    @dragover=${this._onDragOver}
                    @dragleave=${this._onDragLeave}
                    @drop=${this._onDrop}
                    @click=${() => this.shadowRoot.querySelector('#fileInput').click()}
                  >
                    <span class="material-symbols-outlined icon">cloud_upload</span>
                    <h3>Drag and drop file here</h3>
                    <p style="font-size:14px; color:#3d4947;">Support for PDF, DICOM, JPG (Max 50MB)</p>
                    <input
                      type="file"
                      id="fileInput"
                      style="display: none"
                      @change=${this._onFileChange}
                    />
                    ${this.selectedFile
                      ? html`<p style="margin-top:8px; color:var(--accent); font-weight:600;">${this.selectedFile.name}</p>`
                      : ''}
                  </div>
                </div>
              </div>

              <div class="bottom">
                <button @click=${this.closeUploadModal}>Cancel</button>
                <button @click=${this.uploadVersion}>Upload</button>
              </div>
            </div>
          </div>
        `
        : ''}

      ${this.showPreviewModal
        ? html`
          <div class="preview-modal">
            <div class="preview-window">
              <div class="toolbar">
                <button @click=${this.downloadDocument}>
                  Download
                </button>

                <button @click=${this.exportPDF} ?disabled=${this.converting}>
                  PDF
                </button>

                <button @click=${this.exportDOCX} ?disabled=${this.converting}>
                  DOCX
                </button>

                <button @click=${this.exportXLSX} ?disabled=${this.converting}>
                  XLSX
                </button>

                <button @click=${async () => {
                  this.showAISummary = true;
                  await this.generateSummary();
                }}>
                  AI Summary
                </button>

                <button @click=${this.closeModal}>
                  Close
                </button>
              </div>

              ${this.converting
                ? html`
                  <div class="progress-modal">
                    <div class="progress-box">
                      <div class="progress-header">
                        <h2>Converting Document</h2>
                        <button class="progress-close" type="button" aria-label="Close" @click=${this.cancelConversion}>
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

                        <div class="progress-steps">
                          <div class="progress-step ${this.progress >= 10 ? '' : 'active'}">
                            ${this.progress >= 10
                              ? html`<span class="material-symbols-outlined step-icon done">check_circle</span>`
                              : html`<div class="step-spinner"></div>`}
                            <span>Uploading secure buffer...</span>
                          </div>

                          <div class="progress-step ${this.progress >= 10 && this.progress < 40 ? 'active' : ''}">
                            ${this.progress >= 40
                              ? html`<span class="material-symbols-outlined step-icon done">check_circle</span>`
                              : this.progress >= 10
                                ? html`<div class="step-spinner"></div>`
                                : html`<span class="material-symbols-outlined step-icon" style="opacity:0.3">radio_button_unchecked</span>`}
                            <span>Parsing metadata structure...</span>
                          </div>

                          <div class="progress-step ${this.progress >= 40 && this.progress < 100 ? 'active' : ''}">
                            ${this.progress >= 100
                              ? html`<span class="material-symbols-outlined step-icon done">check_circle</span>`
                              : this.progress >= 40
                                ? html`<div class="step-spinner"></div>`
                                : html`<span class="material-symbols-outlined step-icon" style="opacity:0.3">radio_button_unchecked</span>`}
                            <span>Applying conversion protocols...</span>
                          </div>
                        </div>
                      </div>

                      <div class="progress-footer">
                        <button class="progress-cancel" type="button" @click=${this.cancelConversion}>Cancel</button>
                      </div>
                    </div>
                  </div>
                `
                : ''}

              <div class="modal-body">
                <div class="document-side">
                  ${this.renderPreview(type, url, 'docx-modal-container', 'excel-modal-container')}
                </div>

                ${this.showAISummary
                  ? html`
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
                              ? html`
                                <ul id="summary-content">
                                  ${this.aiSummary
                                    .split('\n')
                                    .filter(item => item.trim() !== '')
                                    .map(item => html`
                                      <li>${item.replace(/\u2022/g, '').trim()}</li>
                                    `)}
                                </ul>
                              `
                              : html`<p>No summary available</p>`
                          }
                        </section>
                      </div>
                    </div>
                  `
                  : ''}
              </div>
            </div>
          </div>
        `
        : ''}

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

customElements.define('personal-document-page', PersonalDocumentPage);
