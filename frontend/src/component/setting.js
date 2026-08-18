import { LitElement, html, css } from 'lit';
import { changePassword, getUser, uploadAvatar, updateProfile } from '../api/userAPI.js';
import { getFileUrl } from '../api/http.js';

export class AllSetting extends LitElement {
    static properties = {
        user: { type: Object },
        showChangePassword: { type: Boolean },
        currentPassword: { type: String },
        newPassword: { type: String },
        confirmPassword: { type: String },
        message: { type: String },
        isError: { type: Boolean },
        isSaving: { type: Boolean },
        editingProfile: { type: Boolean },
        editUserName: { type: String },
        editEmail: { type: String }
    };

    static styles = css`
        :host {
            display: block;
            color: #191c1e;
            font-family: Inter, sans-serif;
        }

        .container {
            max-width: 850px;
            padding: 28px 30px 48px;
            margin: 0 auto;
        }

        .content {
            display: grid;
            gap: 16px;
        }

        .card {
            background: #fff;
            border: 1px solid #d7dbe2;
            border-radius: 12px;
            padding: 28px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, .05);
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 22px;
        }

        .icon-box {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            color: #fff;
            background: #0058be;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 25px;
        }

        .avatar-row {
            display: flex;
            align-items: center;
            gap: 18px;
            margin: 10px 0 25px;
        }

        .avatar,
        .avatar-placeholder {
            width: 82px;
            height: 82px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #d7dbe2;
        }

        .avatar-placeholder {
            display: grid;
            place-items: center;
            background: #e7eef9;
            color: #0058be;
            font-size: 30px;
            font-weight: 700;
        }

        .outline-btn,
        .save-btn {
            border-radius: 8px;
            padding: 10px 17px;
            cursor: pointer;
            font: inherit;
        }

        .outline-btn {
            background: #fff;
            border: 1px solid #aab1bb;
        }

        .save-btn {
            background: #091426;
            color: #fff;
            border: 0;
        }

        button:disabled {
            opacity: .6;
            cursor: not-allowed;
        }

        .details {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 7px;
        }

        label {
            color: #5f6773;
            font-size: 13px;
            font-weight: 600;
        }

        input,
        .value {
            min-height: 42px;
            box-sizing: border-box;
            border: 1px solid #cfd4dc;
            border-radius: 8px;
            padding: 10px 13px;
            font-size: 15px;
        }

        .value {
            display: flex;
            align-items: center;
            background: #f8fafc;
        }

        .security-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }

        .password-form {
            margin-top: 22px;
            padding-top: 22px;
            border-top: 1px solid #e3e6eb;
            display: grid;
            gap: 14px;
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 5px;
        }

        .message {
            margin: 16px 0 0;
            padding: 11px 13px;
            border-radius: 8px;
            background: #e8f7ed;
            color: #12632d;
        }

        .message.error {
            background: #fff0f0;
            color: #a51f1f;
        }

        .loading {
            color: #5f6773;
        }

        @media (max-width: 620px) {
            .container {
                padding: 22px 16px;
            }
            .details {
                grid-template-columns: 1fr;
            }
            .security-row {
                align-items: flex-start;
                flex-direction: column;
            }
        }
    `;

    constructor() {
        super();
        this.user = null;
        this.showChangePassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.message = '';
        this.isError = false;
        this.isSaving = false;
        this.editingProfile = false;
        this.editUserName = '';
        this.editEmail = '';
        this.openPhotoPicker = this.openPhotoPicker.bind(this);
        this.handleAvatarChange = this.handleAvatarChange.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadProfile();
    }

    getStoredUser() {

        const adminUser = sessionStorage.getItem('adminUser');
        const staffUser = sessionStorage.getItem('staffUser');
        const personalUser = sessionStorage.getItem('personalUser');

        if(adminUser){
            return JSON.parse(adminUser);
        }

        if(staffUser){
            return JSON.parse(staffUser);
        }

        if(personalUser){
            return JSON.parse(personalUser);
        }

        return null;
    }

    async loadProfile() {
        const storedUser = this.getStoredUser();
        if (!storedUser?.UserID) return;
        try {
            const result = await getUser(storedUser.UserID);
            this.user = result.user || storedUser;
            this.saveCurrentUser(this.user);
        } catch (error) {
            this.user = storedUser;
            this.setMessage('Unable to refresh profile details. Showing saved information.', true);
        }
    }

    saveCurrentUser(user) {
        const key = user.userType === 'personal' ? 'personalUser' : user.role === 'admin' ? 'adminUser' : 'staffUser';
        const existing = this.getStoredUser() || {};
        sessionStorage.setItem(key, JSON.stringify({ ...existing, ...user }));
    }

    avatarUrl() {
        return this.user?.AvatarPath ? getFileUrl(this.user.AvatarPath) : '';
    }

    setMessage(message, isError = false) {
        this.message = message;
        this.isError = isError;
    }

    openPhotoPicker() {
        this.renderRoot.querySelector('#avatar-input')?.click();
    }

    async handleAvatarChange(event) {
        const file = event.target.files?.[0];
        if (!file || !this.user?.UserID) return;
        this.isSaving = true;
        this.setMessage('');
        try {
            const result = await uploadAvatar(this.user.UserID, file);
            this.user = { ...this.user, AvatarPath: result.avatarPath };
            this.saveCurrentUser(this.user);
            this.setMessage('Profile photo updated.');
        } catch (error) {
            this.setMessage(error.message || 'Unable to update profile photo.', true);
        } finally {
            this.isSaving = false;
            event.target.value = '';
        }
    }

    async handleChangePassword() {
        if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
            this.setMessage('Please complete all password fields.', true);
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.setMessage('New password and confirmation do not match.', true);
            return;
        }

        this.isSaving = true;
        this.setMessage('');
        try {
            const result = await changePassword({ userID: this.user.UserID, currentPassword: this.currentPassword, newPassword: this.newPassword });
            this.showChangePassword = false;
            this.currentPassword = this.newPassword = this.confirmPassword = '';
            this.setMessage(result.message || 'Password changed successfully.');
        } catch (error) {
            this.setMessage(error.message || 'Unable to change password.', true);
        } finally {
            this.isSaving = false;
        }
    }

    renderAvatar() {
        const avatarUrl = this.avatarUrl();
        return avatarUrl
            ? html`<img class="avatar" src=${avatarUrl} alt="Current profile photo">`
            : html`<div class="avatar-placeholder" aria-label="Profile photo">${this.user?.UserName?.charAt(0)?.toUpperCase() || 'U'}</div>`;
    }

    async saveProfile() {
        if (!this.editUserName.trim()) {
            this.setMessage('Username is required.', true);
            return;
        }
        this.isSaving = true;
        this.setMessage('');
        try {
            const result = await updateProfile(this.editUserName.trim(), this.editEmail.trim());
            if (result.success) {
                this.user = { ...this.user, UserName: this.editUserName.trim(), Email: this.editEmail.trim() };
                this.saveCurrentUser(this.user);
                this.editingProfile = false;
                this.setMessage('Profile updated successfully.');
            } else {
                this.setMessage(result.message || 'Update failed.', true);
            }
        } catch (error) {
            this.setMessage(error.message || 'Unable to update profile.', true);
        } finally {
            this.isSaving = false;
        }
    }

    renderProfile() {
        if (this.editingProfile) {
            return html`
                <div class="details">
                    <div class="field">
                        <label>Username</label>
                        <input type="text" .value=${this.editUserName} @input=${e => this.editUserName = e.target.value}>
                    </div>
                    <div class="field">
                        <label>Email</label>
                        <input type="email" .value=${this.editEmail} @input=${e => this.editEmail = e.target.value}>
                    </div>
                </div>
                <div class="actions" style="margin-top:16px;">
                    <button class="outline-btn" @click=${() => { this.editingProfile = false; this.setMessage(''); }}>Cancel</button>
                    <button class="save-btn" @click=${this.saveProfile} ?disabled=${this.isSaving}>${this.isSaving ? 'Saving…' : 'Save profile'}</button>
                </div>
            `;
        }
        const isPersonal = this.user?.userType === 'personal';
        return html`
            <div class="details">
                <div class="field">
                    <label>Username</label>
                    <div class="value">${this.user.UserName || '—'}</div>
                </div>
                <div class="field">
                    <label>Email</label>
                    <div class="value">${this.user.Email || 'Not available'}</div>
                </div>
                ${!isPersonal ? html`
                    <div class="field">
                        <label>Role</label>
                        <div class="value">${this.user.role || '—'}</div>
                    </div>
                    <div class="field">
                        <label>Department</label>
                        <div class="value">${this.user.departmentName || 'Not assigned'}</div>
                    </div>
                    <div class="field">
                        <label>Account status</label>
                        <div class="value">${this.user.StatusName || 'Active'}</div>
                    </div>
                ` : ''}
            </div>
            <div class="actions" style="margin-top:16px;">
                <button class="outline-btn" @click=${() => {
                    this.editingProfile = true;
                    this.editUserName = this.user.UserName || '';
                    this.editEmail = this.user.Email || '';
                    this.setMessage('');
                }}>Edit profile</button>
            </div>
        `;
    }

    render() {
        if (!this.user) return html`<div class="container"><p class="loading">Loading profile…</p></div>`;
        return html`
            <div class="container">
                <h1>Account Settings</h1>
                <p>View your account details, update your photo, and manage your password.</p>
                <div class="content">
                    <section class="card">
                        <div class="section-title">
                            <div class="icon-box">
                                <span class="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <h2>Profile</h2>
                                <p>Your current account information.</p>
                            </div>
                        </div>
                        <div class="avatar-row">
                            ${this.renderAvatar()}
                            <div>
                                <button class="outline-btn" 
                                    @click=${this.openPhotoPicker} 
                                    ?disabled=${this.isSaving}
                                >
                                    Change photo
                                </button>
                                <input id="avatar-input" 
                                    type="file" 
                                    accept="image/png,image/jpeg,image/webp" hidden 
                                    @change=${this.handleAvatarChange}
                                >
                            </div>
                        </div>
                        ${this.renderProfile()}
                    </section>
                    <section class="card">
                        <div class="section-title">
                            <div class="icon-box">
                                <span class="material-symbols-outlined">security</span>
                            </div>
                            <div>
                                <h2>Security</h2>
                                <p>Use your current password to set a new one.</p>
                            </div>
                        </div>
                        <div class="security-row">
                            <div>
                                <h3>Password</h3>
                                <p>Choose a password with at least 8 characters.</p>
                            </div>

                                <button class="outline-btn" 
                                        @click=${() => { this.showChangePassword = !this.showChangePassword; 
                                            this.setMessage(''); 
                                        }}
                                >
                                    ${this.showChangePassword ? 'Cancel' : 'Change password'} 
                                </button>
                                
                        </div>

                        ${this.showChangePassword ? html`<div class="password-form">
                            <div class="field">
                                <label>Current password</label>
                                <input type="password" autocomplete="current-password" .value=${this.currentPassword} @input=${e => this.currentPassword = e.target.value}>
                            </div>
                            <div class="field">
                                <label>New password</label>
                                <input type="password" autocomplete="new-password" .value=${this.newPassword} @input=${e => this.newPassword = e.target.value}>
                            </div>
                            <div class="field">
                                <label>Confirm new password</label>
                                <input type="password" autocomplete="new-password" .value=${this.confirmPassword} @input=${e => this.confirmPassword = e.target.value}>
                            </div>
                            <div class="actions">
                                <button class="save-btn" @click=${this.handleChangePassword} ?disabled=${this.isSaving}>
                                    ${this.isSaving ? 'Saving…' : 'Save password'}
                                </button>
                            </div>
                        </div>` : ''}
                    </section>
                </div>
                ${this.message ? html`<p class="message ${this.isError ? 'error' : ''}" role="status">${this.message}</p>` : ''}
            </div>`;
    }
}

customElements.define('all-setting-page', AllSetting);
