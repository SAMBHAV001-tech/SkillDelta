# 🎯 SkillDelta

SkillDelta is a modern full-stack application designed to help users track and manage skill development over time. It features a personalized dashboard that provides insights into learning progress with an intuitive, visually appealing interface.

**Live Demo:** [https://skilldelta.vercel.app](https://skilldelta.vercel.app)  
**Repository:** [SAMBHAV001-tech/SkillDelta](https://github.com/SAMBHAV001-tech/SkillDelta)

## 🔧 Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts
- **Backend:** FastAPI, Python 3.13, PostgreSQL (SQLAlchemy)
- **Document Processing & AI:** PyTesseract (OCR), PDFPlumber, Groq API
- **Deployment:** Vercel (Frontend), Docker + Render.com (Backend)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/SAMBHAV001-tech/SkillDelta.git
cd SkillDelta
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The app will open at `http://localhost:5173/`.

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn skillrot_app.main:app --host 0.0.0.0 --port 10000
```
API runs on port `10000`. 
Alternatively, use Docker: `docker run -p 10000:10000 $(docker build -q .)`

## 📊 Key Features
- ✨ Blazing-fast React frontend with a modern Tailwind CSS gradient design.
- 📚 Comprehensive document/PDF processing and analysis using Tesseract OCR.
- 🤖 Intelligent AI integration via the Groq API.
- 🔐 Secure JWT authentication & PostgreSQL database.

## 🤝 Contributing
We welcome contributions! Please create an issue or submit a pull request.

**Support & Docs:**
- Live Project: [https://skilldelta.vercel.app](https://skilldelta.vercel.app)
- Repo: [https://github.com/SAMBHAV001-tech/SkillDelta](https://github.com/SAMBHAV001-tech/SkillDelta)
