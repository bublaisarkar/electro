"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, MapPin, Plus, Edit, Trash2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";

type Address = {
  _id: string;
  fullName: string;
  phoneNumber: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
};

// Dummy addresses
const initialAddresses: Address[] = [
  {
    _id: "addr1",
    fullName: "John Doe",
    phoneNumber: "+1 234 567 8901",
    pincode: "10001",
    area: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
  },
  {
    _id: "addr2",
    fullName: "John Doe",
    phoneNumber: "+1 987 654 3210",
    pincode: "90210",
    area: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
  },
];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit handlers
  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setAddresses(addresses.filter((a) => a._id !== id));
    }
  };

  const handleSaveAddress = (updated: Address) => {
    setAddresses(addresses.map((a) => (a._id === updated._id ? updated : a)));
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleAddNew = () => {
    // For simplicity, we'll redirect to the existing add-address page
    router.push("/add-address");
  };

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <Loading />
        <Footer />
      </>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/account");
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Redirecting to sign in...</p>
        </div>
        <Footer />
      </>
    );
  }

  const user = session?.user;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Account
                </span>
              </h1>
              <div className="mt-1 h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-6">
              <Image
                src={user?.image || "/default-avatar.png"}
                alt={user?.name || "User"}
                width={80}
                height={80}
                className="rounded-full border-2 border-gray-200"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500 flex items-center gap-1">
                  <Mail size={16} /> {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MapPin size={20} /> Saved Addresses
              </h3>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
              >
                <Plus size={16} />
                Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">No saved addresses yet.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">{addr.area}</p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(addr)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        aria-label="Edit address"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(addr._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        aria-label="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Address Modal */}
      {isModalOpen && editingAddress && (
        <EditAddressModal
          address={editingAddress}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveAddress}
        />
      )}

      <Footer />
    </>
  );
}

// ---------- Edit Address Modal Component ----------
function EditAddressModal({
  address,
  onClose,
  onSave,
}: {
  address: Address;
  onClose: () => void;
  onSave: (updated: Address) => void;
}) {
  const [form, setForm] = useState(address);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Address</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Area and Street)
              </label>
              <input
                type="text"
                name="area"
                value={form.area}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}