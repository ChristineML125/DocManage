FROM node:22-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    python3 \
    python3-venv \
    fonts-liberation \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# LibreOffice can export DOCX, but does not reliably import PDF as an editable
# Writer document. pdf2docx is used for the PDF -> DOCX path instead.
RUN python3 -m venv /opt/pdf2docx-env && \
    /opt/pdf2docx-env/bin/pip install --no-cache-dir pdf2docx
ENV PYTHON_BIN=/opt/pdf2docx-env/bin/python

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/

EXPOSE 3000
CMD ["node", "backend/server.js"]
