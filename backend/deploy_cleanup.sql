/*
 * MedicalDocManage - Deployment Cleanup Script
 * ============================================
 * Run this BEFORE deploying to production.
 *
 * HOW TO USE:
 *   1. Edit SECTION 2 to match your real departments, categories, etc.
 *   2. Run:
 *      sqlcmd -S "localhost\SQLEXPRESS" -U sa -P "YourStrongPassword123!" -C -d MedicalDB -i deploy_cleanup.sql
 *
 * IMPORTANT: Back up your database first!
 */

USE MedicalDB;
GO
SET NOCOUNT ON;
GO

-- ============================================================
-- SECTION 1: Clear ALL test data (order matters for foreign keys)
-- ============================================================
PRINT '--- SECTION 1: Clearing test data ---';

DELETE FROM OneTimePassword;
PRINT '  Cleared OneTimePassword';

DELETE FROM PasswordResetToken;
PRINT '  Cleared PasswordResetToken';

DELETE FROM AISummary;
PRINT '  Cleared AISummary';

DELETE FROM DocumentVersion;
PRINT '  Cleared DocumentVersion';

DELETE FROM UsersDocument;
PRINT '  Cleared UsersDocument';

DELETE FROM Document;
PRINT '  Cleared Document';

DELETE FROM AuditLog;
PRINT '  Cleared AuditLog';

DELETE FROM Users;
PRINT '  Cleared all Users';

-- ============================================================
-- SECTION 2: Reference/lookup tables
-- ============================================================
PRINT '';
PRINT '--- SECTION 2: Updating reference tables ---';

-- Departments (edit to match your real departments)
DELETE FROM Department;
SET IDENTITY_INSERT Department ON;
INSERT INTO Department (departmentID, departmentName) VALUES
  (1, 'Administration'),
  (2, 'Finance'),
  (3, 'Human Resources'),
  (4, 'Operations'),
  (5, 'IT');
SET IDENTITY_INSERT Department OFF;
PRINT '  Updated Department';

-- Categories (edit to match your real document categories)
DELETE FROM Category;
SET IDENTITY_INSERT Category ON;
INSERT INTO Category (categoriesID, categoriesName, description) VALUES
  (1, 'Policy', 'Company policies and guidelines'),
  (2, 'Report', 'Reports and analysis documents'),
  (3, 'Memo', 'Internal memorandums'),
  (4, 'Contract', 'Legal agreements and contracts'),
  (5, 'Certificate', 'Certificates and credentials');
SET IDENTITY_INSERT Category OFF;
PRINT '  Updated Category';

-- Branches (edit to match your real office branches)
DELETE FROM Branch;
SET IDENTITY_INSERT Branch ON;
INSERT INTO Branch (branchID, branchName) VALUES
  (1, 'Head Office'),
  (2, 'Branch 1'),
  (3, 'Branch 2');
SET IDENTITY_INSERT Branch OFF;
PRINT '  Updated Branch';

-- Status (no identity column, do NOT use IDENTITY_INSERT)
DELETE FROM Status;
INSERT INTO Status (statusID, statusName) VALUES
  (1, 'Active'),
  (2, 'Archived');
PRINT '  Updated Status';

-- UserStatus
DELETE FROM UserStatus;
SET IDENTITY_INSERT UserStatus ON;
INSERT INTO UserStatus (UserStatusID, StatusName) VALUES
  (1, 'Active'),
  (2, 'Inactive');
SET IDENTITY_INSERT UserStatus OFF;
PRINT '  Updated UserStatus';

-- ============================================================
-- SECTION 3: Create production admin account
-- ============================================================
PRINT '';
PRINT '--- SECTION 3: Creating admin account ---';

/*
 * Default password: Admin123!
 * To change: run in Node.js:
 *   require('crypto').createHash('sha256').update('YourNewPassword').digest('hex')
 */

INSERT INTO Users (UserName, Password, Email, DepartmentID, role, UserStatusID, MustChangePassword, CreatedAt)
VALUES (
  'Admin',
  '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121',
  'admin@company.com',
  1,
  'admin',
  1,
  0,
  GETDATE()
);
PRINT '  Created admin (UserName: Admin, Password: Admin123!)';

-- ============================================================
-- SECTION 4: Reset identity seeds
-- ============================================================
PRINT '';
PRINT '--- SECTION 4: Resetting identity seeds ---';

DECLARE @maxId INT;

SELECT @maxId = ISNULL(MAX(UserID), 0) FROM Users;
DBCC CHECKIDENT ('Users', RESEED, @maxId);

SELECT @maxId = ISNULL(MAX(documentID), 0) FROM Document;
DBCC CHECKIDENT ('Document', RESEED, @maxId);

SELECT @maxId = ISNULL(MAX(versionID), 0) FROM DocumentVersion;
DBCC CHECKIDENT ('DocumentVersion', RESEED, @maxId);

SELECT @maxId = ISNULL(MAX(AuditLogID), 0) FROM AuditLog;
DBCC CHECKIDENT ('AuditLog', RESEED, @maxId);

PRINT '  Identity seeds reset';

-- ============================================================
-- SECTION 5: Verify
-- ============================================================
PRINT '';
PRINT '--- SECTION 5: Verification ---';

SELECT 'Users' AS [Table], COUNT(*) AS [Rows] FROM Users
UNION ALL SELECT 'Department', COUNT(*) FROM Department
UNION ALL SELECT 'Category', COUNT(*) FROM Category
UNION ALL SELECT 'Branch', COUNT(*) FROM Branch
UNION ALL SELECT 'Status', COUNT(*) FROM Status
UNION ALL SELECT 'UserStatus', COUNT(*) FROM UserStatus
UNION ALL SELECT 'Document', COUNT(*) FROM Document
UNION ALL SELECT 'DocumentVersion', COUNT(*) FROM DocumentVersion
UNION ALL SELECT 'AISummary', COUNT(*) FROM AISummary
UNION ALL SELECT 'AuditLog', COUNT(*) FROM AuditLog;

PRINT '';
PRINT '=== Deployment cleanup complete! ===';
GO
