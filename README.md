Here's a comprehensive `README.md` file for your Next.js e-commerce store:

```markdown
# Electro Store - Modern E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-blue?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://electro-olive.vercel.app/)

## 📖 Overview

Electro Store is a full-featured e-commerce platform built with Next.js 15, MongoDB, and Tailwind CSS. It includes a complete shopping experience with product management, cart, checkout, payment processing, user authentication, seller dashboard, admin panel, and more.

**Live Demo:** [https://electro-olive.vercel.app/](https://electro-olive.vercel.app/)

---

## ✨ Key Features

### 🛍️ Customer Features
- **Product Browsing** - Browse products with category filters and search
- **Product Details** - View product images, descriptions, ratings, and reviews
- **Shopping Cart** - Add/remove items, update quantities, persistent storage
- **Wishlist** - Save favorite products for later
- **Checkout** - Select addresses, apply promo codes, multiple payment methods
- **Order Management** - View order history and order status
- **User Profile** - Manage profile and saved addresses

### 🔐 Authentication
- Google OAuth Sign-in/Sign-up
- Email/Password authentication
- JWT session management with NextAuth.js
- Protected routes and API endpoints

### 🛒 Seller Dashboard
- **Product Management** - Create, edit, delete products with Cloudinary image uploads
- **Order Management** - View all orders, update order status
- **Promo Code Management** - Create, edit, delete promotional codes
- **Category Management** - Manage product categories
- **Dashboard Stats** - Revenue, orders, products, and order status distribution

### 👑 Admin Features
- **User Management** - View all users, toggle seller/admin roles
- **Comprehensive Control** - Full access to all platform features
- **Role-Based Access** - Different permissions for customers, sellers, and admins

### 💳 Payment Processing
- **Razorpay Integration** - Secure payment processing (test & live modes)
- **Multiple Payment Methods** - COD, Card, UPI, Net Banking
- **Order Verification** - Automatic payment verification

### 📧 Marketing & Communication
- **Newsletter Subscription** - Email capture for marketing
- **Contact Form** - Customer inquiries via Nodemailer
- **Promo Codes** - Discount codes with flexible rules

### 📱 Mobile Support
- **Progressive Web App (PWA)** - Install on mobile devices
- **Responsive Design** - Works seamlessly on all devices
- **Touch-Optimized** - Mobile-first UX

### 🚀 Performance & SEO
- **Next.js 15** - Fast, server-side rendered React
- **Image Optimization** - Lazy loading, responsive images
- **SEO-Ready** - Meta tags, Open Graph, sitemap, robots.txt

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React, React Icons
- **State Management:** React Context API
- **Animations:** Tailwind animations, CSS transitions

### Backend
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js (Google + Credentials)
- **Payment:** Razorpay API
- **File Storage:** Cloudinary (image uploads)
- **Email:** Nodemailer (contact form)

### Deployment
- **Hosting:** Vercel
- **Git:** GitHub
- **Environment:** Production-ready with environment variables

### Development
- **Language:** TypeScript
- **Linting:** ESLint
- **Formatting:** Prettier
- **Package Manager:** npm

---

## 📁 Project Structure

```
electro/
├── app/
│   ├── api/                    # API routes
│   │   ├── address/           # Address CRUD
│   │   ├── auth/              # Authentication
│   │   ├── categories/        # Category management
│   │   ├── newsletter/        # Newsletter subscription
│   │   ├── order/             # Order management
│   │   ├── payment/           # Razorpay integration
│   │   ├── products/          # Product CRUD
│   │   ├── promo/             # Promo code management
│   │   └── user/              # User profile & wishlist
│   ├── auth/                  # Sign in / Sign up pages
│   ├── cart/                  # Shopping cart
│   ├── product/[id]/          # Product details
│   ├── seller/                # Seller dashboard
│   │   ├── add-product/       # Add product form
│   │   ├── categories/        # Category management
│   │   ├── orders/            # Order management
│   │   ├── product-list/      # Product list with actions
│   │   └── promos/            # Promo code management
│   ├── profile/               # User profile
│   ├── wishlist/              # Wishlist page
│   └── ... other pages
├── components/
│   ├── seller/                # Seller dashboard components
│   ├── Banner.tsx             # Promotional banner
│   ├── FeaturedProduct.tsx    # Featured product section
│   ├── HeaderSlider.tsx       # Hero slider
│   ├── HomeProducts.tsx       # Popular products
│   ├── Navbar.tsx             # Main navigation
│   ├── OrderSummary.tsx       # Checkout summary
│   ├── ProductCard.tsx        # Product card component
│   ├── UserButton.tsx         # User menu dropdown
│   └── ... other components
├── context/
│   └── AppContext.tsx         # Global state management
├── lib/                       # Utilities & configs
├── models/                    # Mongoose models
├── public/                    # Static assets
├── types/                     # TypeScript type definitions
├── middleware.ts              # Route protection
├── next.config.ts             # Next.js configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)
- Razorpay account (for payments)
- Google Cloud Console (for OAuth)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Currency
NEXT_PUBLIC_CURRENCY=USD
```

### Installation

```bash
# Clone the repository
git clone https://github.com/bublaisarkar/electro.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔑 Key Features Explained

### User Authentication
The app supports both Google OAuth and email/password authentication using NextAuth.js. Sessions are stored in MongoDB via the MongoDB adapter.

### Product Management
Sellers can add products with multiple images uploaded to Cloudinary. Each product includes name, description, category, price, offer price, stock status, and ratings.

### Shopping Cart
Cart data is stored in localStorage and synced with the context API. Users can add/remove items, update quantities, and see real-time totals.

### Checkout Process
1. Select saved address or add a new one
2. Apply promo code (optional)
3. Choose payment method (COD, Card, Razorpay)
4. For Razorpay, complete payment via the checkout modal
5. Order confirmation and redirect

### Order Management
Customers can view their order history in "My Orders". Sellers can view all orders and update status (pending → shipped → delivered → cancelled).

### Promo Codes
Sellers can create promo codes with:
- Percentage or fixed discount
- Minimum order amount
- Maximum discount (for percentage)
- Date range validity
- Usage limit

### Admin Panel
Admins have additional capabilities:
- View all users
- Toggle seller status
- Toggle admin status
- Delete users

### Wishlist
Users can add/remove products to their wishlist. The wishlist is stored in the database and persists across sessions.

### Categories
Admins/sellers can create, edit, and delete categories. Products can be assigned to categories, and the shop page supports category filtering.

### Newsletter
Users can subscribe to the newsletter. Email addresses are stored in the database for future marketing campaigns.

### Contact Form
Users can send messages via the contact form. Messages are sent to the store email via Nodemailer.

### Payment Integration
The app uses Razorpay for online payments. It supports both test and live modes. Payment verification is handled server-side to ensure security.

### Responsive Design
Built with Tailwind CSS, the app is fully responsive and works on all device sizes. The mobile version includes a hamburger menu and touch-optimized interactions.

---

## 📊 Database Models

- **User** - Authentication, roles, addresses, wishlist
- **Product** - Product details, images, categories, ratings
- **Order** - Order items, total, status, payment details
- **Address** - User shipping addresses
- **Category** - Product categories
- **PromoCode** - Discount codes with rules
- **Newsletter** - Subscribed email addresses

---

## 🔒 Security Features

- **JWT Authentication** - Secure session management
- **Password Hashing** - bcrypt for credential security
- **Role-Based Access** - Different permissions per role
- **API Protection** - Protected routes with middleware
- **Input Validation** - Mongoose schema validation
- **CSRF Protection** - NextAuth built-in protection
- **Secure Headers** - Vercel production security defaults

---

## 🚀 Deployment

The app is deployed on Vercel. To deploy your own instance:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables
4. Deploy

**Live Demo:** [https://electro-olive.vercel.app/](https://electro-olive.vercel.app/)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Razorpay](https://razorpay.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [Lucide](https://lucide.dev/) - Icons
- [Vercel](https://vercel.com/) - Hosting

---

## 📧 Contact

**Developer:** Bublai Sarkar
- GitHub: [@bublaisarkar](https://github.com/bublaisarkar)
- Live Demo: [https://electro-olive.vercel.app/](https://electro-olive.vercel.app/)

---

## ⭐ Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

Built with ❤️ using Next.js
```
