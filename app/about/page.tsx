import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'About Us - Electro Store',
  description: 'Learn more about Electro Store – your trusted electronics shop.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Electro
          </span>
        </h1>
        <div className="prose prose-lg text-gray-700 space-y-4">
          <p>
            Welcome to <strong>Electro Store</strong> – your one‑stop shop for the
            latest and greatest in electronics, gadgets, and tech accessories.
          </p>
          <p>
            Founded in 2025, we set out with a simple mission: to bring cutting‑edge
            technology to everyone at affordable prices. Whether you're a gamer,
            a creative professional, or a tech enthusiast, we have something for you.
          </p>
          <p>
            We carefully curate our product range to include only the most trusted
            brands – from Apple and Samsung to Sony, Logitech, and more. Every
            product is handpicked for quality, performance, and value.
          </p>
          <p>
            Our team is passionate about tech and customer satisfaction. We offer
            fast shipping, secure payments, and a hassle‑free return policy. If
            you have any questions, our support team is just a click away.
          </p>
          <div className="bg-gray-50 rounded-xl p-6 mt-6 border border-gray-200/60">
            <h2 className="text-xl font-semibold text-gray-800">Our Values</h2>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
              <li>Quality above all</li>
              <li>Customer first</li>
              <li>Innovation and authenticity</li>
              <li>Sustainability and responsibility</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}