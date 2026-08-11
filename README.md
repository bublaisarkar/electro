
```markdown
# Electro - Modern E-Commerce Platform

**Electro** is a full-stack e-commerce platform built with Next.js, MongoDB, and Tailwind CSS. It provides a complete online shopping experience with product management, cart, checkout, payment processing, user authentication, seller dashboard, admin panel, and more.

🔗 **Live Demo:** [https://electro-olive.vercel.app/](https://electro-olive.vercel.app/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

---

## Features

### Customer Features
- **Product Browsing** – Browse products with category filters and search.
- **Product Details** – View product images, descriptions, ratings, and reviews.
- **Shopping Cart** – Add/remove items, update quantities, persistent storage.
- **Wishlist** – Save favorite products for later.
- **Checkout** – Select addresses, apply promo codes, multiple payment methods.
- **Order Management** – View order history and order status.
- **User Profile** – Manage profile and saved addresses.

### Authentication
- **Google OAuth** – Sign in with Google.
- **Email/Password** – Traditional sign up and login.
- **JWT Sessions** – Secure session management with NextAuth.js.
- **Protected Routes** – API and page protection with middleware.

### Seller Dashboard
- **Product Management** – Create, edit, delete products with Cloudinary image uploads.
- **Order Management** – View all orders, update order status (pending → shipped → delivered → cancelled).
- **Promo Code Management** – Create, edit, delete promotional codes with flexible rules.
- **Category Management** – Manage product categories (CRUD).
- **Dashboard Analytics** – View revenue, order counts, products, and order status distribution.

### Admin Panel
- **User Management** – View all users, toggle seller/admin roles.
- **Full Control** – Access to all platform features and data.
- **Role-Based Access** – Different permissions for customers, sellers, and admins.

### Payment Processing
- **Razorpay Integration** – Secure payment processing (test & live modes).
- **Multiple Methods** – COD, Card, UPI, Net Banking.
- **Payment Verification** – Automatic payment verification server-side.

### Marketing & Communication
- **Newsletter Subscription** – Email capture for marketing.
- **Contact Form** – Customer inquiries via Nodemailer.
- **Promo Codes** – Discount codes with flexible rules.

### Performance & SEO
- **Next.js 15** – Fast, server-side rendered React.
- **Image Optimization** – Lazy loading, responsive images with Next.js Image.
- **SEO-Ready** – Meta tags, Open Graph, sitemap, robots.txt.
- **PWA Ready** – Progressive Web App support (installable).

### Mobile Support
- **Responsive Design** – Works seamlessly on all screen sizes.
- **Touch-Optimized** – Mobile-first user experience.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety and better DX |
| Tailwind CSS | Utility-first styling |
| Lucide React | Modern icon library |
| React Context | Global state management |
| NextAuth.js | Authentication with JWT |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| NextAuth.js | Authentication with Google & Credentials |
| Razorpay API | Payment processing |
| Cloudinary | Image upload and storage |
| Nodemailer | Email sending |

### Deployment
| Technology | Purpose |
|------------|---------|
| Vercel | Hosting and deployment |
| MongoDB Atlas | Cloud database |
| GitHub | Version control |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)
- Razorpay account (for payments)
- Google Cloud Console (for OAuth)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/bublaisarkar/electro.git
cd electro
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables** (see below)

4. **Run the development server**

```bash
npm run dev
```

5. **Open the application**

Visit `http://localhost:3000`

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay Payment
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Application Settings
NEXT_PUBLIC_CURRENCY=USD
```

> **Note:** Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32` or use any random string.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
electro/
├── app/
│   ├── api/                    # API routes
│   │   ├── address/           # Address CRUD operations
│   │   ├── auth/              # Authentication endpoints
│   │   ├── categories/        # Category management
│   │   ├── newsletter/        # Newsletter subscription
│   │   ├── order/             # Order management
│   │   ├── payment/           # Razorpay integration
│   │   ├── products/          # Product CRUD operations
│   │   ├── promo/             # Promo code management
│   │   └── user/              # User profile & wishlist
│   ├── auth/                  # Sign in / Sign up pages
│   ├── cart/                  # Shopping cart page
│   ├── product/[id]/          # Product detail page
│   ├── seller/                # Seller dashboard
│   │   ├── add-product/       # Add product form
│   │   ├── categories/        # Category management
│   │   ├── orders/            # Order management
│   │   ├── product-list/      # Product list with actions
│   │   └── promos/            # Promo code management
│   ├── profile/               # User profile page
│   ├── wishlist/              # Wishlist page
│   └── ... other pages
├── components/
│   ├── seller/                # Seller dashboard components
│   ├── Banner.tsx             # Promotional banner
│   ├── CloudinaryUpload.tsx   # Cloudinary upload widget
│   ├── FeaturedProduct.tsx    # Featured product section
│   ├── Footer.tsx             # Site footer
│   ├── HeaderSlider.tsx       # Hero slider
│   ├── HomeProducts.tsx       # Popular products section
│   ├── Loading.tsx            # Loading component
│   ├── Navbar.tsx             # Main navigation
│   ├── NewsLetter.tsx         # Newsletter signup
│   ├── OrderSummary.tsx       # Checkout order summary
│   ├── ProductCard.tsx        # Product card component
│   ├── UserButton.tsx         # User menu dropdown
│   └── ...
├── context/
│   └── AppContext.tsx         # Global state management
├── lib/                       # Utilities & configurations
│   ├── auth.ts               # NextAuth configuration
│   ├── mongodb-adapter.ts    # MongoDB adapter
│   ├── mongodb.ts            # Database connection
│   └── razorpay.ts           # Razorpay instance
├── models/                    # Mongoose models
│   ├── Address.ts
│   ├── Category.ts
│   ├── Order.ts
│   ├── Product.ts
│   ├── PromoCode.ts
│   └── User.ts
├── public/                    # Static assets
├── types/                     # TypeScript type definitions
├── middleware.ts              # Route protection (proxy)
├── next.config.ts             # Next.js configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

---

## Deployment

The application is deployed on Vercel. To deploy your own instance:

### Vercel Deployment

1. **Push your code to GitHub**

```bash
git push origin main
```

2. **Import your repository in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Select your repository

3. **Add environment variables**
   - Add all variables from your `.env.local` file
   - Set `NEXTAUTH_URL` to your production URL (e.g., `https://electro.vercel.app`)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

5. **Update Google OAuth redirect URI** (if using Google)
   - Add `https://your-domain.vercel.app/api/auth/callback/google`

### Environment Variables on Vercel

```env
MONGODB_URI=
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
NEXT_PUBLIC_CURRENCY=USD
```

### Database Configuration

Make sure your MongoDB Atlas cluster allows connections from Vercel's IP addresses. You can:
- Use `0.0.0.0/0` (allow all) for testing
- Restrict to Vercel's IP range for production

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) – React framework
- [Tailwind CSS](https://tailwindcss.com/) – CSS framework
- [MongoDB](https://www.mongodb.com/) – Database
- [NextAuth.js](https://next-auth.js.org/) – Authentication
- [Razorpay](https://razorpay.com/) – Payment processing
- [Cloudinary](https://cloudinary.com/) – Image hosting
- [Lucide](https://lucide.dev/) – Icons
- [Vercel](https://vercel.com/) – Hosting

---

## Contact

**Developer:** Bublai Sarkar
- GitHub: [@bublaisarkar](https://github.com/bublaisarkar)
- Email: bublaisarkar01@gmail.com
- Live Demo: [https://electro-olive.vercel.app/](https://electro-olive.vercel.app/)

---

**Built with ❤️ using Next.js**
```

---
