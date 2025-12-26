import { useState } from "react";
import { subscribeToNewsletter } from "../../services/subscriptionAPI";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

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
      setMessage(result.message);
      setMessageType("success");

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
    <footer className="bg-[#060913] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 circuit-pattern opacity-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Newsletter Section */}
        <div className="mb-16 text-center">
          <div className="mb-4">
            <span className="text-[#6272a4] font-mono text-sm">{"// "}</span>
            <span className="text-[#00e676] font-mono text-sm">
              Stay Connected
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-3 md:mb-4 px-4">
            <span className="text-[#6272a4]">{"function "}</span>
            <span className="neon-text-cyan">subscribe</span>
            <span className="text-white">(</span>
            <span className="neon-text-green">email</span>
            <span className="text-white">)</span>
          </h2>
          <p className="text-[#6272a4] font-mono text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            {"// Get exclusive tutorials & updates"}
          </p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="terminal-window backdrop-blur-xl p-3 md:p-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#00b4d8]/20">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#e91e63]"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#00e676]"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#00b4d8]"></div>
                <span className="text-[#6272a4] font-mono text-xs">
                  newsletter.sh
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-[#00e676] font-mono">$</span>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-[#6272a4] font-mono disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 neon-border-cyan bg-[#0a0e27] rounded font-mono font-semibold hover:bg-[#1a1f3a] transition-all disabled:opacity-50 neon-text-cyan"
                >
                  {isSubmitting ? "..." : "→"}
                </button>
              </div>
            </div>
            {message && (
              <p
                className={`text-sm mt-4 font-medium ${
                  messageType === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">&lt;/&gt;</div>
              <h3 className="text-2xl font-bold font-mono neon-text-cyan">
                LearnCode AI
              </h3>
            </div>
            <p className="text-[#6272a4] font-mono text-sm leading-relaxed">
              {
                "// Empowering developers worldwide with AI-powered coding education"
              }
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors font-mono"
              >
                fb
              </a>
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors font-mono"
              >
                in
              </a>
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors font-mono"
              >
                ig
              </a>
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors font-mono"
              >
                tw
              </a>
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors font-mono"
              >
                yt
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-mono neon-text-purple">
              {"{ company }"}
            </h3>
            <ul className="space-y-3 font-mono text-sm">
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00b4d8] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00b4d8] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; contact_us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00b4d8] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; about_us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00b4d8] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; get_started
                </a>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-mono neon-text-green">
              {"[ account ]"}
            </h3>
            <ul className="space-y-3 font-mono text-sm">
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00e676] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; profile
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00e676] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; my_account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00e676] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; preferences
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#00e676] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; certificates
                </a>
              </li>
            </ul>
          </div>

          {/* Courses Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-mono text-[#e91e63]">
              {"<courses />"}
            </h3>
            <ul className="space-y-3 font-mono text-sm">
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#e91e63] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; html_css
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#e91e63] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; javascript
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#e91e63] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; react_js
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6272a4] hover:text-[#e91e63] hover:translate-x-2 inline-block transition-all"
                >
                  &gt; node_js
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#00b4d8]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#6272a4] font-mono text-sm">
              <span className="text-[#00e676]">©</span>{" "}
              {new Date().getFullYear()} LearnCode AI{" "}
              <span className="text-[#6272a4]">{"// Made with "}</span>
              <span className="text-[#e91e63]">&lt;3</span>
              <span className="text-[#6272a4]">{" by devs"}</span>
            </p>
            <div className="flex gap-6 text-sm font-mono">
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors"
              >
                privacy.md
              </a>
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors"
              >
                terms.md
              </a>
              <a
                href="#"
                className="text-[#6272a4] hover:text-[#00b4d8] transition-colors"
              >
                cookies.md
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
