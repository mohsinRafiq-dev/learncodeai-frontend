import { useState } from "react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { subscribeToNewsletter } from "../../services/subscriptionAPI";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Basic validation
    if (!email.trim()) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const result = await subscribeToNewsletter(email);
      
      // Handle both success and already subscribed cases as success
      setMessage(result.message);
      setMessageType("success");
      
      // Only clear email on new subscription, not on already subscribed
      if (!result.message.includes("already subscribed")) {
        setEmail("");
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-700">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6 md:mb-0">Code Hub</h1>
        <div className="flex space-x-5 text-2xl">
          <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
          <FaLinkedinIn className="hover:text-blue-400 cursor-pointer" />
          <FaInstagram className="hover:text-pink-500 cursor-pointer" />
          <FaXTwitter className="hover:text-sky-400 cursor-pointer" />
          <FaYoutube className="hover:text-red-600 cursor-pointer" />
        </div>
      </div>

      <hr className="border-gray-700 my-8" />

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-300">
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-white inline-block">
            Company
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Contact us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                About us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Get Started
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-white inline-block">
            Account
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="hover:text-white">
                Profile
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                My Account
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Preferences
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Purchase
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-white inline-block">
            Courses
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="hover:text-white">
                Html & CSS
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Javascript
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                React JS
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Node JS
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-white inline-block">
            Newsletter
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Subscribe to get the latest coding tutorials and updates from LearnCode AI!
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-4 text-white">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-md border-gray-700 focus:border-white border-1 focus:outline-none text-black disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-100 text-black font-semibold py-3 rounded-md hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
            {message && (
              <p className={`text-sm mt-2 ${
                messageType === "success" 
                  ? "text-green-400" 
                  : "text-red-400"
              }`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </footer>
  );
}

