import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import '../component/login-page/login-form.js';

export class LoginPage extends LitElement {
  currentPath = window.location.pathname;

  static styles = css`
  .page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0 auto;
    background: var(--color-surface);
  }

  .container {
    background: #adc6ff;
    border-radius: var(--radius-sm);
    display: flex;
    width: min(1000px, 90%);
    max-width:700px;
    min-height: 550px;
    border: 2px solid var(--color-outline);
    box-shadow: 0 10px 20px rgba(27, 59, 111, 0.25);
  }

  .left {
    color: black;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--space-xl);
    padding-top: 40px;
    justify-content: center;
    gap: 12px;
  }

  .left h1{
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: 700;
    line-height: 40px;
    letter-spacing: -0.02em;
    margin-top: -10px;
    justify-content: center;
    margin-bottom: var(--space-xs);
  }

  .left p{
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 400;
    line-height: 24px;
    margin-top: 0;
    justify-content: center;
    align-items: center;
  }

  .right {
    background: white;
    flex: 1;
    justify-content: right;
    align-items: center;
    padding: var(--space-xl);
  }

  h2{
    color: var(--color-primary);
    margin-bottom: var(--space-xs);
    font-family: var(--font-head);
  }

  .right p{
    font-size: 12px;
  }

  img {
    width: 100%;
    max-width: 1000px;

    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.12);
  }
`;

  render() {
    return html`
      <main class="page">
        <div class="container">

          <section class="left">
            <h1>Document Management</h1>
            <p>Secure, efficient, and professional document management for the modern workplace.</p>
            <img src="/img/staffDashboard.png" alt="staffDashboard">
          </section>

          <section class="right">
            <h2>Login</h2>
            <p>Access your Document Management dashboard</p>
            <login-form></login-form>
          </section>
        </div>
    </main>
    `;
  }
}
customElements.define("login-page", LoginPage);