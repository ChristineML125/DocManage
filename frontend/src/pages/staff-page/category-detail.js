import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../../component/dashboard-page/staff-side-bar.js';
import '../../component/dashboard-page/staff-top-bar.js';
import '../../component/dashboard-page/staff-category-detail.js';

export class StaffCategoryDetailPage extends LitElement {
    static styles = css`
    :host{
        display: block;
        height: 100vh;
        width: 100%;
        overflow: hidden;
    }
    .layout {
      display: flex;
      height: 100%;
    }

    .top {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
    }

    .scroll-area {
      flex: 1;
      overflow-y: auto;
      padding: 0 32px 32px 32px;
    }

    @media (max-width: 767px) {
      .scroll-area { padding: 0 0 84px 0; }
    }
  `;

    static properties = {
        username: { type: String }
    }

    constructor() {
        super();
        this.username = '';
    }

    connectedCallback() {
        super.connectedCallback();
        this.getUserInfo();
    }

    getUserInfo() {
        const userStr = localStorage.getItem("staffUser");
        if (userStr) {
            const user = JSON.parse(userStr);
            this.username = user.UserName || 'staffUser';
        }
    }

    render() {
        return html`
        <div class="layout">
            <staff-side-bar></staff-side-bar>

            <div class="top">
                <staff-top-bar username=${this.username}></staff-top-bar>
                <div class="scroll-area">
                    <staff-category-detail-page></staff-category-detail-page>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define('staff-category-detail-wrapper', StaffCategoryDetailPage);
