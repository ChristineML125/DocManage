import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import './pages/login.js'
import './pages/register-page.js'
import './pages/staff-page/setting.js'
import './pages/staff-page/dashboard.js'
import './pages/staff-page/allDocument.js'
import './pages/staff-page/upload.js'
import './pages/staff-page/categories.js'
import './pages/staff-page/category-detail.js'

import './pages/admin-page/admin-dashboard.js'
import './pages/admin-page/admin-allDocument.js'
import './pages/admin-page/admin-upload.js'
import './pages/admin-page/admin-category.js'
import './pages/admin-page/admin-category-detail.js'
import './pages/admin-page/UserManagement.js'
import './pages/admin-page/AuditLogs.js'
import './pages/admin-page/admin-setting.js'

import './pages/personal-page/personal-dashboard.js'
import './pages/personal-page/personal-documents.js'
import './pages/personal-page/personal-upload.js'
import './pages/personal-page/personal-setting.js'
import './pages/personal-page/personal-favorites.js'


class AppRoot extends LitElement {
    render() {
        return html`<div id="outlet"></div>`;
    }

    firstUpdated() {
        const outlet = this.renderRoot.querySelector('#outlet')
        const router = new Router(outlet);

        router.setRoutes([
            { path: '/', redirect: '/login' },
            { path: '/login', component: 'login-page' },
            { path: '/register', component: 'register-page' },

            { path: '/setting', component: 'setting-page'},
            { path: '/dashboard', component: 'dashboard-page' },
            { path: '/allDocument', component: 'document-page' },
            { path: '/upload', component: 'upload-page' },
            { path: '/category/:id', component: 'staff-category-detail-wrapper'},
            { path: '/categories', component: 'categories-page' },

            { path: '/admin-dashboard', component: 'admin-dashboard-page'},
            { path: '/admin-allDocument', component: 'admin-alldocument-page'},
            { path: '/admin-upload', component: 'admin-upload-page'},
            { path: '/admin-category/:id', component: 'admin-category-detail-wrapper'},
            { path: '/admin-category', component: 'admin-category-page'},
            { path: '/UserManagement', component: 'user-management-page'},
            { path: '/AuditLogs', component: 'audit-logs-page'},
            { path: '/admin-setting', component: 'admin-setting-page'},

            { path: '/personal-dashboard', component: 'personal-dashboard-page'},
            { path: '/personal-documents', component: 'personal-documents-page'},
            { path: '/personal-favorites', component: 'personal-favorites-page-wrapper'},
            { path: '/personal-upload', component: 'personal-upload-page'},
            { path: '/personal-setting', component: 'personal-setting-page'},

        ])
    }
}

customElements.define('app-root', AppRoot);
