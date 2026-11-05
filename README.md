# ShopEase — E-commerce website with Razorpay

## Stack
React + Vite frontend, Node.js + Express backend, MongoDB database, Razorpay Test Mode payments.

## Setup
1. Install Node.js 18+ and MongoDB (or create a MongoDB Atlas database).
2. In `server`, copy `.env.example` to `.env` and fill in your MongoDB URI and Razorpay **Test Mode** keys.
3. Run the backend:
   `cd server` → `npm install` → `npm run seed` → `npm run dev`
4. In another terminal run the frontend:
   `cd client` → `npm install` → `npm run dev`
5. Open the Vite URL, usually http://localhost:5173.

Never expose `RAZORPAY_KEY_SECRET` in frontend code or upload `.env` to GitHub.
Use Razorpay Test Mode credentials and test payment details from Razorpay's official dashboard/docs. This educational starter needs further security, webhook, shipping, tax, stock and refund work before production use.
