import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import '../../component/personal/personal-sidebar.js';
import '../../component/personal/personal-top-bar.js';
import '../../component/personal/personal-main-content.js';

export class PersonalDashboardPage extends LitElement {

  static styles = css`
    :host {
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
    }
    .scroll-area {
      flex: 1;
      overflow-y: auto;
      padding: 0 32px 32px 32px;
      margin-top: 20px;
    }

    @media (max-width: 767px) {
      .scroll-area { padding-bottom: 84px; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    const user = sessionStorage.getItem('personalUser');
    if (!user) Router.go('/login');
  }

  render() {
    return html`
      <div class="layout">
        <personal-sidebar></personal-sidebar>
        <div class="top">
          <personal-top-bar pageTitle="Dashboard"></personal-top-bar>
          <div class="scroll-area">
            <personal-main-content></personal-main-content>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('personal-dashboard-page', PersonalDashboardPage);
