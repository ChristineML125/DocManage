import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import '../../component/dashboard-page/staff-side-bar.js';
import '../../component/dashboard-page/staff-top-bar.js';
import '../../component/dashboard-page/staff-categories.js'

export class Categories extends LitElement {

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

    .content-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 20px;
      margin-top: 28px;
    }

    .content-grid .main-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
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

    static properties ={
        username: {type: String}
    }

    constructor (){
        super();
        this.username = '';
    }

    connectedCallback(){
        super.connectedCallback();
        this.getUserInfo();
    }

    getUserInfo(){
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
                    <staff-categories-page></staff-categories-page>
                </div>   
            </div>
        </div>
        `;
    }
}

customElements.define('categories-page', Categories);
