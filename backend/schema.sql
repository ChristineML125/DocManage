-- MedicalDB PostgreSQL Schema
-- Run this once to create all tables

-- Lookup / reference tables
CREATE TABLE IF NOT EXISTS "Department" (
    "departmentID" SERIAL PRIMARY KEY,
    "departmentName" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Category" (
    "categoriesID" SERIAL PRIMARY KEY,
    "categoriesName" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "Branch" (
    "branchID" SERIAL PRIMARY KEY,
    "branchName" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Status" (
    "statusID" INT PRIMARY KEY,
    "statusName" VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "UserStatus" (
    "UserStatusID" SERIAL PRIMARY KEY,
    "StatusName" VARCHAR(50) NOT NULL
);

-- Core tables
CREATE TABLE IF NOT EXISTS "Users" (
    "UserID" SERIAL PRIMARY KEY,
    "UserName" VARCHAR(255) NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "Email" VARCHAR(255),
    "DepartmentID" INT REFERENCES "Department"("departmentID"),
    "role" VARCHAR(50) NOT NULL DEFAULT 'staff',
    "UserStatusID" INT REFERENCES "UserStatus"("UserStatusID"),
    "MustChangePassword" BOOLEAN DEFAULT false,
    "userType" VARCHAR(20) DEFAULT 'company',
    "CreatedAt" TIMESTAMP DEFAULT NOW(),
    "LastLogin" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Document" (
    "documentID" SERIAL PRIMARY KEY,
    "documentName" VARCHAR(255) NOT NULL,
    "categoriesID" INT REFERENCES "Category"("categoriesID"),
    "departmentID" INT REFERENCES "Department"("departmentID"),
    "branchID" INT REFERENCES "Branch"("branchID"),
    "uploadedBy" INT REFERENCES "Users"("UserID"),
    "statusID" INT REFERENCES "Status"("statusID"),
    "filePath" VARCHAR(500),
    "pdfPath" VARCHAR(500),
    "previewPath" VARCHAR(500),
    "uploadDate" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DocumentVersion" (
    "VersionID" SERIAL PRIMARY KEY,
    "DocumentID" INT REFERENCES "Document"("documentID") ON DELETE CASCADE,
    "VersionNum" INT NOT NULL,
    "filePath" VARCHAR(500),
    "uploadDate" TIMESTAMP DEFAULT NOW(),
    "isLatest" BOOLEAN DEFAULT false,
    "uploadedBy" INT REFERENCES "Users"("UserID"),
    "VersionNumber" INT
);

CREATE TABLE IF NOT EXISTS "AISummary" (
    "documentID" INT PRIMARY KEY REFERENCES "Document"("documentID") ON DELETE CASCADE,
    "SummaryText" TEXT,
    "GenerateAT" TIMESTAMP,
    "summaryText" TEXT
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "AuditLogID" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "Users"("UserID"),
    "Action" VARCHAR(50),
    "documentID" INT,
    "description" VARCHAR(255),
    "targetEntity" VARCHAR(255),
    "targetID" INT,
    "timestamp" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "UsersDocument" (
    "UserID" INT REFERENCES "Users"("UserID"),
    "documentID" INT REFERENCES "Document"("documentID"),
    PRIMARY KEY ("UserID", "documentID")
);

CREATE TABLE IF NOT EXISTS "OneTimePassword" (
    "id" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "Users"("UserID"),
    "otp" VARCHAR(10),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "Users"("UserID"),
    "token" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO "Department" ("departmentName") VALUES
    ('Administration'),
    ('Finance'),
    ('Human Resources'),
    ('Operations'),
    ('IT')
ON CONFLICT DO NOTHING;

INSERT INTO "Category" ("categoriesName", "description") VALUES
    ('Policy', 'Company policies and guidelines'),
    ('Report', 'Reports and analysis documents'),
    ('Memo', 'Internal memorandums'),
    ('Contract', 'Legal agreements and contracts'),
    ('Certificate', 'Certificates and credentials')
ON CONFLICT DO NOTHING;

INSERT INTO "Branch" ("branchName") VALUES
    ('Head Office'),
    ('Branch 1'),
    ('Branch 2')
ON CONFLICT DO NOTHING;

INSERT INTO "Status" ("statusID", "statusName") VALUES
    (1, 'Active'),
    (2, 'Archived')
ON CONFLICT DO NOTHING;

INSERT INTO "UserStatus" ("StatusName") VALUES
    ('Active'),
    ('Inactive')
ON CONFLICT DO NOTHING;

-- Admin account (password: Admin123!)
INSERT INTO "Users" ("UserName", "Password", "Email", "DepartmentID", "role", "UserStatusID", "MustChangePassword", "CreatedAt")
VALUES (
    'Admin',
    '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121',
    'admin@company.com',
    1,
    'admin',
    1,
    false,
    NOW()
)
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_department ON "Document"("departmentID");
CREATE INDEX IF NOT EXISTS idx_document_category ON "Document"("categoriesID");
CREATE INDEX IF NOT EXISTS idx_document_branch ON "Document"("branchID");
CREATE INDEX IF NOT EXISTS idx_document_status ON "Document"("statusID");
CREATE INDEX IF NOT EXISTS idx_documentversion_docid ON "DocumentVersion"("DocumentID");
CREATE INDEX IF NOT EXISTS idx_auditlog_userid ON "AuditLog"("UserID");
CREATE INDEX IF NOT EXISTS idx_auditlog_timestamp ON "AuditLog"("timestamp");
