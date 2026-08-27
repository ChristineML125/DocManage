import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import '../../component/admin/admin-top-bar.js';
import '../../component/admin/admin-side-bar.js';
import '../../component/admin/admin-categories.js'

export class adminCategory extends LitElement {
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
    const userStr = localStorage.getItem("adminUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      this.username = user.UserName || 'Admin';
    }
  }

    render() {
        return html`
        <div class="layout">
            <admin-side-bar></admin-side-bar>

            <div class="top">
                <admin-top-bar username=${this.username}></admin-top-bar>
                <div class="scroll-area">
                    <admin-categories-page></admin-categories-page>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define('admin-category-page', adminCategory);
