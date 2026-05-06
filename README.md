# Kamacam 💖

Kamacam is a premium, adult-oriented random video chat platform built for the modern web. It features instant matchmaking, encrypted P2P video streaming, and real-time text chat with a focus on privacy and adult freedom.

![Kamacam Dark UI](https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000)

## ✨ Features

- **🚀 Instant Matchmaking**: Mutual-preference matching engine powered by Convex.
- **📹 HD Video Chat**: Peer-to-peer (P2P) video and audio using WebRTC.
- **💬 Real-time Text Chat**: Integrated messaging with automatic scrolling and message sync.
- **🔞 Age Gate Compliance**: Mandatory 18+ verification with RTA (Restricted to Adults) labeling.
- **🎨 Premium UI**: Modern "Glassmorphism" design with Tailwind CSS v4 and Framer Motion.
- **🛡️ Privacy First**: Peer-to-peer connections mean video data never touches the server.

## 🛠️ Tech Stack

- **Frontend**: [TanStack Start](https://tanstack.com/router/v1/docs/guide/start/overview) (React, File-based routing)
- **Backend**: [Convex](https://www.convex.dev/) (Real-time database and serverless functions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS)
- NPM or PNPM

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/kamacam.git
   cd kamacam
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file in the root directory and add your Convex URL:
   ```env
   VITE_CONVEX_URL=your_convex_deployment_url
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🏗️ Deployment

### 1. Backend (Convex)
Deploy your database and server functions to Convex Cloud:
```bash
npx convex deploy
```

### 2. Frontend (Vercel)
The easiest way to deploy the frontend is with [Vercel](https://vercel.com):
1. Connect your GitHub repo to Vercel.
2. Add `VITE_CONVEX_URL` to your environment variables.
3. Vercel will automatically build and deploy the app.

## ⚖️ Safety & Compliance

Kamacam maintains a zero-tolerance policy for illegal content (CSAM). 
- **RTA Labeled**: This site is labeled with the Restricted to Adults (RTA) label.
- **P2P Privacy**: All video sessions are encrypted and direct between users.
- **Self-Moderation**: Users can skip or block matches instantly.

## 📝 License

This project is licensed under the MIT License.

---
Built with 💖 using [cto.new](https://cto.new)
