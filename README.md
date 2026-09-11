# Nour.AI 🤖

**Nour.AI** is an AI-powered conversational web application built with **Django**.
The project provides a clean and simple chat interface where users can interact with an AI assistant through natural language.

The current version focuses on **AI-powered conversations and prompt engineering**, with the architecture prepared for future integration of **RAG (Retrieval-Augmented Generation)** and document-based knowledge.

---

## ✨ Features

* 🤖 AI-powered conversational chatbot
* 💬 Real-time chat experience
* 🧠 Prompt engineering for better AI responses
* 🌐 Django-based backend
* 🎨 Clean and responsive web interface
* 📱 Responsive design for different screen sizes
* 🔌 API-based communication with the AI model
* 🏗️ Architecture prepared for future RAG integration

---

## 🛠️ Tech Stack

### Backend

* **Python**
* **Django**
* Django REST/API architecture

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript**

### AI

* Large Language Model API
* Prompt Engineering
* AI-powered conversational responses

### Development Tools

* Git & GitHub
* VS Code
* Virtual Environment

---

## 📂 Project Structure

```text
Nour.AI/
│
├── manage.py
│
├── nour/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── chat/
│   ├── migrations/
│   ├── templates/
│   │   └── chat/
│   ├── static/
│   │   └── chat/
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   ├── views.py
│   └── ...
│
├── static/
│
├── templates/
│
├── requirements.txt
│
├── .env
│
├── .gitignore
│
└── README.md
```

> The exact structure may vary depending on the current project configuration.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Nour.AI.git
```

Move into the project directory:

```bash
cd Nour.AI
```

---

### 2. Create a virtual environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Linux / macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
AI_API_KEY=your_api_key_here
```

> Never commit your API keys or other secrets to GitHub.

Make sure `.env` is included in `.gitignore`.

---

### 5. Apply database migrations

```bash
python manage.py migrate
```

---

### 6. Run the development server

```bash
python manage.py runserver
```

Open the application in your browser:

```text
http://127.0.0.1:8000/
```

---

## 💬 How It Works

The application follows a simple conversational flow:

```text
User
  │
  ▼
Chat Interface
  │
  ▼
Django Backend
  │
  ▼
Prompt Construction
  │
  ▼
AI Model API
  │
  ▼
Generated Response
  │
  ▼
Chat Interface
```

The user's message is sent from the frontend to the Django backend.
The backend prepares the prompt and sends the request to the configured AI model. The generated response is then returned to the user through the chat interface.

---

## 🧠 Prompt Engineering

Nour.AI uses **Prompt Engineering** to control the behavior and quality of AI responses.

The goal is to provide the model with clear instructions, context, and conversational constraints so that responses are more relevant and consistent.

The project can later be extended with:

* System prompts
* Conversation memory
* Context management
* Structured outputs
* Tool calling
* RAG pipelines

---

## 🔮 Future Development

The main planned direction for Nour.AI is integrating **Retrieval-Augmented Generation (RAG)**.

### Planned RAG Architecture

```text
Documents
    │
    ▼
Document Processing
    │
    ▼
Text Splitting
    │
    ▼
Embeddings
    │
    ▼
Vector Database
    │
    ▼
User Question
    │
    ▼
Similarity Search
    │
    ▼
Relevant Context
    │
    ▼
LLM
    │
    ▼
AI Response
```

Future versions may support:

* 📄 Uploading documents
* 🔍 Semantic search
* 🧠 RAG-based question answering
* 📚 Personal knowledge bases
* 💾 Conversation history
* 👤 User authentication
* 🔐 User-specific documents
* ⚡ Local AI models
* 🗃️ Vector databases such as Chroma
* 🔗 LangChain/LangGraph integration

---

## 🔒 Security

For production deployment:

* Store API keys in environment variables.
* Never expose API keys in frontend JavaScript.
* Add authentication and authorization.
* Validate and sanitize user input.
* Configure Django's `SECRET_KEY` securely.
* Set `DEBUG=False`.
* Configure `ALLOWED_HOSTS`.
* Use HTTPS.
* Protect sensitive endpoints.

---

## 🧪 Development

To check the Django project:

```bash
python manage.py check
```

To create migrations after changing models:

```bash
python manage.py makemigrations
```

Then apply them:

```bash
python manage.py migrate
```

---

## 📌 Project Status

**Current Status:** 🚧 In Development

### Current Version

The current version provides:

* Django web application
* AI chat functionality
* Prompt-engineered responses
* Responsive chat interface

### Next Major Step

The next development stage is integrating **RAG** to allow Nour.AI to answer questions using information retrieved from user-provided documents.

---

## 👩‍💻 Author

**Asma Al-Garably**

Computer Science Graduate
AI / Machine Learning & AI Integration

---

## 📄 License

This project is currently intended for educational and development purposes.

A formal open-source license can be added in the future if the project is released for public use.
