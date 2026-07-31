import { LitElement, html, css } from 'lit';
import { getUserList, 
        editUser, 
        deleteUser, 
        createUser, 
        getUsers,
        updateUserStatus,
        resetPassword,
        getPasswordResetRequests
      } from '../../api/userAPI.js';
import { getDocumentsList } from '../../api/documentAPI.js';
import { getAllLookUp } from '../../api/lookupAPI.js';

//export pdf
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class userManagement extends LitElement{
  static styles = css`
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #afc4d43d;
        font-family: 'Inter', sans-serif;
        color: #191c1e;
        overflow-y: auto;
        padding: 24px;
        box-sizing: border-box;
    }

    /* ========== Page Header ========== */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .page-header h2 {
        font-size: 24px;
        font-weight: 700;
        color: #0b1c30;
        margin: 0 0 4px 0;
    }

    .page-header p {
        font-size: 14px;
        color: #7a8a9a;
        margin: 0;
    }

    .title-section h2 {
        font-size: 24px;
        font-weight: 700;
        color: #0b1c30;
        margin: 0 0 4px 0;
    }

    .title-section p {
        font-size: 14px;
        color: #7a8a9a;
        margin: 0;
    }

    /* ========== Primary Button ========== */
    .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #00ad57;
        color: #ffffff;
        padding: 10px 24px;
        border-radius: 10px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        font-size: 14px;
    }

    .btn-primary:hover {
        background: #278d5c;
    }

    .btn-primary:active {
        transform: scale(0.97);
    }

    /* ========== Stats Cards Grid ========== */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
        margin-bottom: 28px;
        padding-left: 10px;
        padding-right: 10px;
    }

    .stats-card {
        display: flex;
        justify-content: space-between;
        background: white;
        border: 1px solid #eef2f6;
        padding: 18px 20px;
        border-radius: 12px;
        transition: all 0.2s ease;
    }

    .stats-card:hover {
        border-color: #dce4ed;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }

    .label {
        font-size: 13px;
        font-weight: 500;
        color: #7a8a9a;
        margin: 0;
        letter-spacing: 0.2px;
    }

    .value {
        font-size: 28px;
        font-weight: 700;
        color: #0b1c30;
        margin: 0 0 2px 0;
        letter-spacing: -0.5px;
        padding-top: 15px;
        padding-left: 10px;
    }

    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 20%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e0e7ff;
        color: #1e40af;
        font-size: 30px;
    }

    .stat-meta {
        font-size: 12px;
        font-weight: 600;
        margin-top: 6px;
        display: inline-block;
    }

    .stat-meta.green {
        color: #00685f;
    }

    .stat-meta.blue {
        color: #006591;
    }

    .stat-meta.red {
        color: #ba1a1a;
    }

    .stat-meta.gray {
        color: #7a8a9a;
    }

    /* ========== Table Container ========== */
    .container {
        display: flex;
        flex: 1;
        overflow: hidden;
        flex-direction: column;
        background: #ffffff;
        border: 1px solid #eef2f6;
        border-radius: 12px;
        min-width: 0;
    }

    /* ========== Table Top Bar ========== */
    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #ffffff;
        border-bottom: 1px solid #eef2f6;
    }

    .top-actions {
        display: flex;
        gap: 8px;
    }

    /* Filter Button */
    .filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ffffff;
        border: 1px solid #dbdbdb;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        color: #7a8a9a;
        cursor: pointer;
        transition: all 0.2s;
    }

    .filter-btn:hover {
        background: #f0f3f7;
        border-color: #dce4ed;
    }

    .filter-btn .material-symbols-outlined {
        font-size: 16px;
    }

    /* Export Button */
    .export-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ffffff;
        border: 1px solid #dbdbdb;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        color: #7a8a9a;
        cursor: pointer;
        transition: all 0.2s;
    }

    .export-btn:hover {
        background: #f0f3f7;
        border-color: #dce4ed;
    }

    .export-btn .material-symbols-outlined {
        font-size: 16px;
    }

    /* Showing Text */
    .showing-text {
        font-size: 12px;
        font-weight: 600;
        color: #7a8a9a;
    }

    /* ========== Table ========== */
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
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #7a8a9a;
        border-bottom: 1px solid #eef2f6;
        z-index: 1;
    }

    tbody td {
        padding: 12px 16px;
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
        background: #eef2f6;
        border-left: 4px solid #00685f;
    }

    /* ========== User ID ========== */
    .userID {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .userID span {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
        background: #ffffff;
        color: #1e40af;
    }

    /* ========== Username ========== */
    .username {
        font-weight: 600;
        color: #0b1c30;
    }

    /* ========== Badge ========== */
    .badge {
        display: inline-block;
        padding: 2px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        background: #e0e7ff;
        color: #1e40af;
    }

    /* ========== Status Badges ========== */
    .status-active {
        background: #d1fae5;
        color: #047857;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }

    .status-inactive {
        background: #fee2e2;
        color: #686868;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }

    /* ========== Action Button ========== */
    .action-btn {
        border: none;
        background: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
    }

    .action-btn:hover {
        background: #eef2f6;
    }

    /* ========== Pagination ========== */
    .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 14px 16px;
        background: #fafbfc;
        border-top: 1px solid #eef2f6;
    }

    .pagination button {
        padding: 6px 14px;
        background: #ffffff;
        border: 1px solid #eef2f6;
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

    /* ========== Empty State ========== */
    .empty-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #bcc9c6;
    }

    .empty-placeholder .icon {
        font-size: 48px;
        margin-bottom: 12px;
    }

    .empty-placeholder p {
        font-size: 14px;
        font-weight: 500;
        margin: 0;
    }

    /* ========== Modal Overlay ========== */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(11, 28, 48, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        width: 90%;
        max-width: 440px;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .modal h3 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 20px;
    }

    /* ========== Form Group ========== */
    .form-group {
        margin-bottom: 16px;
    }

    .form-group label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #0b1c30;
        margin-bottom: 6px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #bcc9c6;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
        font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        border-color: #00685f;
        box-shadow: 0 0 0 2px rgba(0, 104, 95, 0.2);
    }

    /* ========== Modal Action Buttons ========== */
    .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
    }

    .btn-cancel {
        flex: 1;
        padding: 10px;
        background: #f2f4f6;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-cancel:hover {
        background: #e0e3e5;
    }

    .btn-create {
        flex: 1;
        padding: 10px;
        background: #00ad57;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        color: #ffffff;
    }

    .btn-create:hover {
        background: #278d5c;
    }

    /* ========== Column Resizer ========== */
    .resizer {
        width: 4px;
        background: #eef2f6;
        cursor: col-resize;
        transition: background 0.2s;
        flex-shrink: 0;
    }

    .resizer:hover,
    .resizer.active {
        background: #00685f;
    }

    /* ========== Material Icons ========== */
    .material-symbols-outlined {
        font-family: 'Material Symbols Outlined';
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        vertical-align: middle;
    }

    /* ========== Reset Password Modal ========== */
    .reset-password-modal {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(9, 20, 38, 0.4);
        backdrop-filter: blur(4px);
        padding: 24px;
    }

    .reset-password-modal.hidden {
        display: none;
    }

    /* Modal Dialog */
    .reset-password-dialog {
        width: 100%;
        max-width: 448px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        border: 1px solid #c5c6cd;
        overflow: hidden;
    }

    /* Modal Header */
    .reset-password-header {
        padding: 24px;
        border-bottom: 1px solid #c5c6cd;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .reset-password-header h3 {
        font-size: 20px;
        font-weight: 600;
        line-height: 28px;
        color: #091426;
        margin: 0;
    }

    .modal-close-btn {
        padding: 8px;
        background: transparent;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        color: #45474c;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-close-btn:hover {
        background: #e6e8ea;
    }

    /* Modal Body */
    .reset-password-body {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .reset-password-description {
        font-size: 14px;
        line-height: 20px;
        color: #45474c;
        margin: 0;
    }

    /* Reset Options */
    .reset-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .reset-option-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border: 1px solid #c5c6cd;
        border-radius: 8px;
        background: #ffffff;
        cursor: pointer;
        transition: background 0.2s;
    }

    .reset-option-btn:hover {
        background: #f2f4f6;
    }

    .reset-option-content {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .reset-option-icon {
        color: #0058be;
        font-size: 24px;
    }

    .reset-option-text {
        text-align: left;
    }

    .reset-option-title {
        font-size: 14px;
        font-weight: 700;
        color: #091426;
        margin: 0 0 2px 0;
    }

    .reset-option-desc {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.05em;
        color: #45474c;
        margin: 0;
    }

    .reset-option-arrow {
        color: #75777d;
        font-size: 20px;
        transition: color 0.2s;
    }

    .reset-option-btn:hover .reset-option-arrow {
        color: #091426;
    }

    /* Modal Footer */
    .reset-password-footer {
        padding: 24px;
        background: #f2f4f6;
        display: flex;
        justify-content: flex-end;
        gap: 16px;
    }

    .reset-password-cancel {
        padding: 8px 32px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: #45474c;
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .reset-password-cancel:hover {
        background: #e0e3e5;
    }
  `
    
    static properties ={
        users: { type: Array },
        loading: { type: Boolean },
        deactivateUser : {type: Number},

        selectedUser: { type: Object },
        searchQuery: { type: String },
        filterStatus: { type: String },
        filterRole: { type: String },
        currentPage: { type: Number },
        pageSize: { type: Number },
        showCreateModal: {type: Boolean},

        newUser: {type: Object},
        departments: { type: Array },

        totalUsers: {type: Number},
        admin: {type: Number},
        staff: {type: Number},

        showResetModal: { type: Boolean},
        selectedResetUserID: { type: Number },
        tempPassword: { type: String },
        resetRequests: { type: Array },
        selectedResetUser: { type: Object },
    };

    constructor (){
      super();
      this.users = [];
      this.newUser = {
          UserName: '',
          Password: '',
          Email: '',
          DepartmentID: '',
          role: 'Staff'
      };

      this.departments = [];

      this.totalUsers = 0;
      this.admin = 0;
      this.staff = 0;

      this.deactivateUser = 0;

      this.selectedUser= null;
      this.loading = true;
      this.searchQuery = '';
      this.filterStatus = 'all';
      this.filterRole = 'all';
      this.currentPage = 1;
      this.pageSize = 10;
      this.showCreateModal = false;

      this.showResetModal = false;
      this.selectedResetUserID = null;
      this.resetRequests = [];
      this.selectedResetUser = null;
      this.tempPassword = '';

    }

    async connectedCallback() {
        super.connectedCallback();
        try {
            const data = await getUsers();

            if(data && data.success){
                this.totalUsers = data.totalUsers;
                this.admin = data.adminCount;
                this.staff = data.staffCount;
            }
        }catch(err){
            console.error(err);
        }

        try {
            const lookupData = await getAllLookUp();

            console.log("Lookup:", lookupData);

            if(lookupData.success){
                this.departments = lookupData.departments;
            }

        }catch(err){
            console.error("Failed load departments:",err);
        }

        try {
            const listData = await getUserList();

            if(listData.success){
                this.users = listData.users.slice(0,10);
                console.log("Users:", this.users);
            }

        }catch(err){
            console.error(err);
        }

        await this.loadResetRequests();
    }

      async loadResetRequests() {
        try {
          const result = await getPasswordResetRequests();
          this.resetRequests = result.requests || [];
        } catch (err) {
          console.error('Failed to load password reset requests:', err);
        }
      }

    async selectUser(user) {
        this.selectedUser = user;
    }

    async fetchUser() {
        try {
            const listData = await getUserList();

            if(listData && listData.success){
                this.users = listData.users;
            }

            const countData = await getUsers();

            if(countData && countData.success){
                this.totalUsers = countData.totalUsers;
                this.admin = countData.adminCount;
                this.staff = countData.staffCount;
            }

            this.requestUpdate();

        } catch(err){
            console.error("Failed to load Users", err);
        } finally {
            this.loading = false;
        }
    }

    formatDate(dateStr) {
    if (!dateStr) return 'Never Login';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
    async handleChangeStatus(user) {

        const newStatus = user.StatusName === "Active"
            ? "Inactive"
            : "Active";

        const action = newStatus === "Inactive"
            ? "Deactivate"
            : "Activate";


        if(!confirm(`${action} this user?`)) return;


        try {

            const data = await updateUserStatus(
                user.UserID,
                newStatus
            );


            if(data.success){
                await this.fetchUser();
            }

        }catch(err){
            alert(err.message);
        }
    }

    
    getStatusClass(statusName) {
      if (!statusName) return '';
        switch(statusName) {
            case "Active":
                return "status-active";
            case "Inactive":
                return "status-inactive";
            default:
                return "";
      }
    }

    async handleRegister(){
      try{
        const data = await createUser(this.newUser);

        console.log("CREATE RESPONSE:", data);

        if(data.success){

          alert("User created successfully");
            await this.fetchUser();
            this.closeCreateModal();
        }else{
          alert(data.message);
        }
        console.log("Create data:", this.newUser);
      }catch(err){
        alert(err.message);
      }
    }

    handleInput(e){
      const {name, value} = e.target;

      this.newUser = {
          ...this.newUser,
          [name]: value
      };
    }

    openCreateModal(){
      this.showCreateModal=true;
      
    }

    closeCreateModal(){
      this.showCreateModal=false;

      this.newUser={
            UserName:'',
            Password:'',
            DepartmentID:'',
            role:'staff'
      };
    }

    exportPDF() {
      const headers = [
        [
          'User ID',
          'User Name',
          'Role',
          'Department',
          'Status',
          'Created At',
          'Last Login'
        ]
      ];

        const rows = this.users.map(u => [
            u.UserID,
            u.UserName,
            u.role,
            u.departmentName || 'N/A',
            u.StatusName,
            this.formatDate(u.CreatedAt),
            this.formatDate(u.LastLogin)
        ]);

        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text(
            "User Report",
            14,
            15
          );

          autoTable(pdf, {
            head: headers,
            body: rows,
            startY: 25,

            styles: {
              fontSize: 10
            },

            headStyles: {
              fillColor: [52, 73, 94]
            }
          });

          pdf.save(`users_${new Date().toISOString().slice(0,20)}.pdf`);
      }

      get filteredUsers() {
          let result = [...this.users];

          // Filter Role
          if(this.filterRole !== 'all'){
              result = result.filter(
                  u => u.role?.toLowerCase() === this.filterRole
              );
          }

          // Filter Status
          if(this.filterStatus !== 'all'){
              result = result.filter(
                  u => u.StatusName === this.filterStatus
              );
          }

          return result;
      }

      get paginatedUser() {
          const start = (this.currentPage - 1) * this.pageSize;
          const end = start + this.pageSize;

          return this.filteredUsers.slice(start, end);
      }

      get totalPages() {
          return Math.ceil(
              this.filteredUsers.length / this.pageSize
          );
      }

      handleRoleFilter(e){
          this.filterRole = e.target.value;
          this.currentPage = 1;
      }


      handleStatusFilter(e){
          this.filterStatus = e.target.value;
          this.currentPage = 1;
      }

      previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
      }

      nextPage() {
          if (this.currentPage < this.totalPages) {
              this.currentPage++;
          }
      }

      async handleResetPassword(userID){
            try{
                const result = await resetPassword(userID);

                console.log("RESET RESULT:", result);

                if(result.success){
                    this.tempPassword = result.tempPassword;
                    await this.loadResetRequests();

                }else{
                    alert(result.message);

                }
            }catch(err){
                console.error(err);
                alert("Reset password failed");

            }
      }

      openResetModal(userOrID){
        const userID = typeof userOrID === 'object' ? userOrID.UserID : userOrID;
        this.selectedResetUserID = userID;
        this.selectedResetUser = typeof userOrID === 'object'
          ? userOrID
          : this.users.find(user => user.UserID === userID) || null;
        this.tempPassword = '';
        this.showResetModal = true;
      }
      
      async closeResetModal (){
        this.showResetModal = false;
        this.tempPassword = '';
        this.selectedResetUser = null;
      }

      createTemporaryPasswordEmail() {
        const user = this.selectedResetUser;
        if (!user?.Email || !this.tempPassword) return '#';
        const subject = 'Your temporary password';
        const body = `Hello ${user.UserName},\n\nYour temporary password is: ${this.tempPassword}\n\nPlease sign in with this temporary password and set a new password immediately.\n\nRegards,\nDocument Management Administrator`;
        return `mailto:${encodeURIComponent(user.Email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }

  render() {
    return html`
        <div class="page-header">
          <div class="title-section">
            <h2>System Users</h2>
            <p>Manage organization access and permissions.</p>
          </div>
          <button class="btn-primary" @click=${this.openCreateModal}>
            <span class="material-symbols-outlined">person_add</span>
            Register New User
          </button>
        </div>

        <div class="stats-grid">
          <div class="stats-card">
            <div>
              <div class="label">Total Users</div>
              <div class="value">${this.totalUsers}</div>
            </div>
            <div class="stat-icon"><span class="material-symbols-outlined">group</span></div>
          </div>
          <div class="stats-card">
            <div>
              <div class="label">Admin</div>
              <div class="value">${this.admin}</div>
            </div>
            <div class="stat-icon"><span class="material-symbols-outlined">admin_panel_settings</span></div>
          </div>
          <div class="stats-card">
            <div>
              <div class="label">Staff</div>
              <div class="value">${this.staff}</div>
            </div>
            <div class="stat-icon"><span class="material-symbols-outlined">badge</span></div>
          </div>
        </div>

        ${this.resetRequests.length ? html`
          <div style="margin:0 10px 20px;padding:16px 20px;border:1px solid #b9d2ff;border-radius:12px;background:#f3f7ff;">
            <strong>Password reset requests (${this.resetRequests.length})</strong>
            ${this.resetRequests.map(request => html`
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:12px;">
                <span>${request.UserName} (${request.Email || 'no email'}) requested a temporary password.</span>
                <button class="btn-primary" @click=${() => this.openResetModal(request)}>Send temporary password</button>
              </div>`)}
          </div>` : ''}

        <div class="container">
            <div class="top">
              <div class="flex gap-xs">
                <select 
                    class="filter-btn"
                    @change=${this.handleRoleFilter}
                >
                    <option value="all">All Role</option>

                    <option value="admin">Admin</option>

                    <option value="staff">Staff</option>
                </select>

                <select 
                    class="filter-btn"
                    @change=${this.handleStatusFilter}
                >
                    <option value="all">All Status</option>

                    <option value="Active">Active</option>

                    <option value="Inactive">Inactive</option>

                </select>
                <button class="export-btn" @click=${this.exportPDF}>
                    <span class="material-symbols-outlined">download</span>
                    Export CSV
                </button>
              </div>
              <div class="showing-text">
                  Showing 1-${this.paginatedUser.length} of ${this.users.length} users
              </div>
            </div>
            <div class="table-wrap">
                <table>
                <thead>
                    <tr>
                      <th>User ID</th>
                      <th>User Name</th>
                      <th>Department</th>
                      <th>Role (admin/staff)</th>
                      <th>Created At</th>
                      <th>Last Login</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.users.length === 0
                        ? html`
                            <tr>
                            <td colspan="8">
                            <div class="empty-placeholder">
                                <div class="material-symbols-outlined icon">inbox</div>
                                <p>No User</p>
                            </div>
                            </td>
                            </tr>
                        ` 
                    : this.paginatedUser.map(u => html`
                      <tr
                        class="${this.selectedUser && this.selectedUser.UserID === u.UserId ? 'active' : ''}"
                        @click=${() => this.selectUser(u)}
                      >
                        <td><span class="userID">${u.UserID}</span></td>
                        <td><span class="username">${u.UserName}</span></td>
                        <td><span class="badge">${u.departmentName || 'N/A'}</span></td>
                        <td><span class="">${u.role}</span></td>
                        <td><span class="">${this.formatDate(u.CreatedAt)}</span></td>
                        <td>${this.formatDate(u.LastLogin)}</td>
                        <td>
                            <span class="${this.getStatusClass(u.StatusName)}">
                                ${u.StatusName}
                            </span>
                        </td>
                        <td>
                            <button 
                              class="action-btn"
                              @click=${() => this.handleChangeStatus(u)}
                              >

                              <span class="material-symbols-outlined">
                              ${u.StatusName === "Active"
                                  ? "block"
                                  : "check_circle"
                              }
                              </span>

                            </button>

                            <button class="action-btn" @click=${() => this.openResetModal(u)}>

                              <span class="material-symbols-outlined">
                                lock_reset
                              </span>

                            </button>
                        </td>
                      </tr>
                    `)}
                </tbody>
                </table>
                <div class="pagination">
                  <button
                      ?disabled=${this.currentPage === 1}
                      @click=${this.previousPage}>
                      <
                  </button>
                  <span>
                      Page ${this.currentPage} of ${this.totalPages}
                  </span>

                  <button
                      ?disabled=${this.currentPage === this.totalPages}
                      @click=${this.nextPage}>
                      >
                  </button>
                </div>
            </div>

    ${this.showCreateModal ? html`
      <div class="modal-overlay" @click=${this.closeCreateModal}>
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <h3>Create New User</h3>
          <div class="form-group">
            <label>User Name</label>
            <input 
                placeholder="Staff Name" 
                .value=${this.newUser.UserName}
                @input=${(e) => {this.newUser = { 
                          ...this.newUser, 
                          UserName : e.target.value
                        };
                      }}
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input
                type="password"
                placeholder="Password"
                @input=${(e) => {this.newUser = { 
                          ...this.newUser, 
                          Password : e.target.value
                        };
                      }}
            />
          </div>
           <div class="form-group">
            <label>Email</label>
            <input
                placeholder="email"
                @input=${(e) => {this.newUser = { 
                          ...this.newUser, 
                          Email : e.target.value
                        };
                      }}
            />
          </div>
          <div class="form-group">
            <label>Department ID</label>
            <select
              .value=${this.newUser.DepartmentId}
              @change=${(e)=>{
                        this.newUser={
                            ...this.newUser,
                            DepartmentID:e.target.value
                        }
                      }}
            >
              <option value="">Select Department</option>
              ${this.departments.map(
                (dept) => html`<option value="${dept.id}">${dept.name}</option>`
              )}
            </select>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select
                name="role"
                @change=${this.handleInput}
            >
              <option>Select Roles</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

            <div class="modal-actions">
              <button class="btn-cancel"
                @click=${this.closeCreateModal}>
                Cancel
              </button>

              <button class="btn-create"
                @click=${this.handleRegister}>
                Create
              </button>
            </div>
          </div>
        </div>

      </div>

  `:''}
  ${this.showResetModal ?html`
    <!-- Reset Password Modal -->
    <div class="reset-password-modal" id="reset-password-modal">
        <div class="reset-password-dialog">
            <!-- Modal Header -->
            <div class="reset-password-header">
                <h3>Reset User Password</h3>
                <button class="modal-close-btn" onclick="closeResetPasswordModal()">
                    <span class="material-symbols-outlined" @click=${this.closeResetModal}>close</span>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="reset-password-body">
                <p class="reset-password-description">
                    Choose how you would like to reset the password for this user. This action will invalidate their current password.
                </p>
                <div class="reset-options">
                    ${this.tempPassword ? html`
                      <div style="padding:14px;border-radius:8px;background:#edf7ef;color:#12632d;">
                        <strong>Temporary password: ${this.tempPassword}</strong>
                        <p style="margin:8px 0;">Send it to ${this.selectedResetUser?.Email || 'this user'} and ask them to change it immediately after login.</p>
                        ${this.selectedResetUser?.Email
                          ? html`<a class="reset-option-btn" style="box-sizing:border-box;text-decoration:none;justify-content:center;" href=${this.createTemporaryPasswordEmail()}>Open email draft</a>`
                          : html`<p style="margin:0;color:#a51f1f;">This user does not have an email address.</p>`}
                      </div>` : ''}

                    <!-- Option 2: Generate Temp Password -->
                    <button 
                      class="reset-option-btn"
                      @click=${() => this.handleResetPassword(this.selectedResetUserID)}
                      >
                          <div class="reset-option-content">
                              <span class="material-symbols-outlined reset-option-icon">
                                  key
                              </span>

                              <div class="reset-option-text">
                                  <p class="reset-option-title">
                                      Generate Temp Password
                                  </p>

                                  <p class="reset-option-desc">
                                      Generate a temporary password for first login
                                  </p>
                              </div>
                          </div>

                          <span class="material-symbols-outlined reset-option-arrow">
                              chevron_right
                          </span>
                    </button>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="reset-password-footer">
                <button class="reset-password-cancel" @click=${this.closeResetModal}>Cancel</button>
            </div>
        </div>
    </div>
  `: ''}
  `}

}

customElements.define('usermanagement-page', userManagement);
