# 🤖 AI Virtual Assistant

> A modern, full-stack, voice-controlled Virtual Assistant web application powered by **React**, **Node.js**, **Express**, **MongoDB**, and **Google Gemini AI**.

---

## ✨ Features

- 🎙️ **Voice Command Recognition**: Talk to your assistant naturally using speech-to-text.
- 🗣️ **Text-to-Speech Output**: Realistic voice responses powered by Web Speech Synthesis.
- 🧠 **Google Gemini AI Integration**: Smart conversational capabilities, answering questions, opening websites, controlling application actions, and more.
- 🤖 **Customizable Personalities & Avatars**: Personalize your assistant's name, avatar image, and voice characteristics.
- 🔐 **User Authentication**: Secure Sign-up and Sign-in functionality with JWT tokens and HttpOnly cookies.
- 🎨 **Sleek UI/UX Design**: Responsive layout with modern dark aesthetics, gradients, and micro-animations.
- ☁️ **Cloud Storage**: Integrated with **Cloudinary** and **Multer** for profile and custom avatar uploads.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (`react-router-dom`)
- **Icons**: Lucide React / Custom SVG Assets
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Token (JWT) & `bcryptjs`
- **File Uploads**: Multer & Cloudinary
- **AI Integration**: Google Gemini AI API (`@google/genai`)

---

## 📁 Project Structure

```
AI_Virtual_Assistant/
├── backend/
│   ├── config/             # DB, Cloudinary, and Token configurations
│   ├── controllers/        # Auth and User request handlers
│   ├── middlewares/        # Authentication and Multer upload middlewares
│   ├── models/             # Mongoose User and Assistant schemas
│   ├── routes/             # API Endpoint routes
│   ├── gemini.js           # Google Gemini AI service handler
│   └── index.js            # Express server entry point
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── assets/         # Images, GIFs, and icons
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (User & Voice Recognition)
│   │   ├── pages/          # Home, SignIn, SignUp, Customize pages
│   │   ├── App.jsx         # Main App router
│   │   └── main.jsx        # React DOM entry point
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas cluster)
- Google Gemini API Key
- Cloudinary Account (for media uploads)

---

### 📥 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Anchal0572/AI_Assistant_Virtual.git
   cd AI_Assistant_Virtual
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file inside the `backend` directory:
   ```env
   PORT=8000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173` to interact with your AI Virtual Assistant!

---

## 👤 Author

Developed with ❤️ by **[Anchal](https://github.com/Anchal0572)**.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
