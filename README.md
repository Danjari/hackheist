# hackheist
# Project Setup Guide

This project includes both a Flask backend for object detection and a Next.js frontend for the user interface.

## **Prerequisites**
Ensure you have the following installed on your system:
- Python 3.8+
- pip (Python package manager)
- Node.js (for Next.js frontend)
- Git (optional, for cloning the repository)
- A GPU with CUDA (optional, for better performance)

## **Backend Setup** (Flask API)

### **1. Clone the Repository**
```bash
git clone https://github.com/your-repo/backend.git
cd backend
```

### **2. Create a Virtual Environment (Recommended)**
```bash
python -m venv venv
source venv/bin/activate  # For macOS/Linux
venv\Scripts\activate     # For Windows
```

### **3. Install Dependencies**
```bash
pip install -r requirements.txt
```
If `requirements.txt` is unavailable, install manually:
```bash
pip install flask torch torchvision torchaudio opencv-python numpy openai python-dotenv pillow
```

### **4. Set Up Environment Variables**
Create a `.env` file in the project root directory and add:
```env
OPENAI_API_KEY=your_openai_api_key
```

### **5. Run the Flask Server**
```bash
python ./backend/app.py
```
The API will be available at:
```
http://127.0.0.1:5000
```

### **6. Testing API Endpoints**
Use `curl` or Postman to test the API:
```bash
curl -X POST "http://127.0.0.1:5000/api/describe/" -H "Content-Type: application/json" -d '{"frame": "base64_encoded_image_string"}'
```

---

## **Frontend Setup** (Next.js UI)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### **1. Install Dependencies**
```bash
cd frontend  # Navigate to the frontend directory
npm install
```

### **2. Run the Development Server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

### **3. Deployment**
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## **Learn More**
To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js GitHub Repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

Now your backend and frontend are set up and ready to run! 🚀