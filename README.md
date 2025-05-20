# TextHuman – AI Text Humanizer Application

Transform AI-generated text into natural, human-like writing that bypasses AI detection tools. TextHuman is a modern web app built with React, TypeScript, Vite, Supabase, and Tailwind CSS, offering advanced customization and document management for users who want their content to sound authentically human.

---

## ✨ Features

- **AI Text Humanization**: Paste your AI-generated text and convert it into undetectable, natural-sounding writing.
- **Bypass Detection**: Designed to evade tools like Turnitin, GPTZero, and more.
- **Customizable Output**: Adjust readability (High School, University, etc.), purpose (Essay, Article, Marketing, etc.), and humanization strength.
- **Document Management**: Save, edit, search, and organize your humanized documents.
- **User Dashboard**: Track your credit usage, recent activity, and document stats.
- **Authentication**: Secure sign up, login, and protected routes for your documents and dashboard.
- **Pricing Plans**: Free and paid plans with monthly character quotas and feature tiers.
- **Contact & Support**: Built-in contact form and support information.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/texthuman-ai-humanizer.git
cd texthuman-ai-humanizer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root with your Supabase and Undetectable AI API keys:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_UNDETECTABLE_API_KEY=your-undetectable-ai-api-key
```

### 4. Run the development server
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) to view the app.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, autoprefixer
- **State Management**: Zustand, React Context
- **Routing**: React Router DOM
- **UI Icons**: Lucide React
- **Notifications**: react-hot-toast
- **Backend/DB**: Supabase (auth, storage, documents, credits)
- **AI Service**: [Undetectable AI](https://undetectable.ai/) API for text humanization

---

## 📄 Project Structure
```
├── src/
│   ├── components/         # UI and feature components
│   ├── contexts/           # React context providers
│   ├── pages/              # Main app pages (Home, Dashboard, etc.)
│   ├── services/           # API and Supabase service logic
│   ├── main.tsx            # App entry point
│   └── App.tsx             # Main app and routing
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── ...
```

---

## 💡 Usage
1. **Sign up** for a free account or log in.
2. **Paste your AI-generated text** into the humanizer tool.
3. **Customize** the output (readability, purpose, strength, model).
4. **Humanize** your text and copy, download, or save it as a document.
5. **Manage your documents** from the dashboard.
6. **Upgrade** your plan for higher quotas and advanced features.

---

## 📦 Scripts
- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run preview` – Preview the production build
- `npm run lint` – Lint the codebase

---

## 📝 License
MIT

---

## 📬 Contact & Support
- Email: support@texthuman.com
- Contact form: `/contact` page in the app

---

## 🙏 Acknowledgements
- [Supabase](https://supabase.com/)
- [Undetectable AI](https://undetectable.ai/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/) 