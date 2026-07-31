import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import '../../component/dashboard-page/staff-side-bar.js';
import '../../component/dashboard-page/staff-top-bar.js';
import '../../component/dashboard-page/staff-document.js'

export class AllDocument extends LitElement {
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
      padding: 0 0 0 32px;
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
                <staff-top-bar username=${this.username} pageTitle="All Documents"></staff-top-bar>
                <div class="scroll-area">
                    <staff-document-page></staff-document-page>
                </div>   
            </div>
        </div>
        `;
    }

}

customElements.define('document-page', AllDocument);

