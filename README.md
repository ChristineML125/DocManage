# Medical Document Management System

A web-based document management system developed for organizations to manage, store, and retrieve documents efficiently.

The system provides document uploading, document management, user management, audit logging, and AI-powered document summarization features.

---

## Features

### User Authentication
- User login and authentication
- Role-based access control
- Admin and Staff permissions

### Document Management
- Upload documents
- View document details
- Preview documents
- Download documents
- Manage document status

### User Management
- Create users
- Update user information
- Activate / deactivate users
- Reset password

### Audit Log
- Record user activities
- Track document preview actions
- Track document status changes

### AI Document Summary
- Generate automatic document summaries using AI
- Extract important information from PDF documents

---

## Technology Stack

### Frontend
- Lit.js
- JavaScript
- HTML
- CSS
- Vite

### Backend
- Node.js
- Express.js
- SQL Server

### AI Service
- Python
- Flask
- Hugging Face Transformers
- BART Summarization Model

### Database
- Microsoft SQL Server

---

## Project Structure

```
MedicalDocManage
│
├── frontend        # Web interface
├── backend         # REST API server
├── ai-model        # AI summarization service
└── storage         # Uploaded documents (ignored)
```

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>

```
## Frontend Setup

Go to frontend folder:

cd frontend

Install dependencies:

npm install

Create .env file:

VITE_API_URL=http://localhost:3000/api

Run frontend:

npm run dev

## Backend Setup

Go to backend folder:

cd backend

Install dependencies:

npm install

Create .env file:

Example:

SQL_SERVER=
SQL_PORT=
SQL_DATABASE=
SQL_USER=
SQL_PASSWORD=
JWT_SECRET=

Run backend:

npm start

## AI Service Setup

Go to AI service folder:

cd ai-model

Create Python environment:

python -m venv venv

Activate environment:

Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create .env:

MODEL_NAME=facebook/bart-large-cnn
AI_PORT=5000

Run AI service:

python ai_service.py
System Architecture

Frontend:

Lit.js
   |
   |
Backend API
   |
   |
SQL Server Database

AI:

Backend
   |
   |
Flask AI Service
   |
   |
Hugging Face Model


## Security
- Environment variables are used for sensitive configuration
- Database credentials are excluded from GitHub
- Uploaded documents are excluded from Git tracking

## Author
Christine Chung Mee Ling
GitHub: ChristineML125