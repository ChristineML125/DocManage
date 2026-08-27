import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import '../../component/dashboard-page/staff-side-bar.js';
import '../../component/dashboard-page/staff-top-bar.js';
import '../../component/dashboard-page/staff-main-content.js'
import '../../component/dashboard-page/staff-right-bar.js'

export class DashboardPage extends LitElement {

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
      grid-template-columns: 1fr 250px;
      gap: 20px;
      align-items: flex-start;
      margin-top: 28px;
    }

    .content-grid .staff-main-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
    }

    .content-grid > staff-main-content {
      flex: 1;               
      min-width: 0;
    }

    .scroll-area {
      flex: 1;
      overflow-y: auto;
      padding: 0 32px 32px 32px;
    }

    @media (max-width: 767px) {
      .scroll-area { padding: 0 0 84px 0; }
    }
    
    @media (max-width: 1068px) {
      .content-grid {
        display: grid;
        grid-template-columns: 1fr 240px;
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .content-grid {
        display: grid;
        grid-template-columns: 1fr;
        flex-direction: column;
      }

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
                <staff-top-bar username=${this.username} pageTitle="Dashboard"></staff-top-bar>
                <div class="scroll-area">
                    <div class="content-grid">
                        <staff-main-content></staff-main-content>
                        <staff-right-bar></staff-right-bar>
                    </div>
                <div>
            </div>
        </div>
    `;
  }
}
customElements.define('dashboard-page', DashboardPage);