import { useAuth } from "../../../hooks/useAuth";
import { useState, useEffect } from "react";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
import { useCountUp } from "../../../hooks/useCountUp";

export default function StartJourney() {
  const { isAuthenticated } = useAuth();
  const [showCursor, setShowCursor] = useState(true);
  const [commandText, setCommandText] = useState("");
  const fullCommand = "$ npm install @learncode/skills";

  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation(0.3);
  const users = useCountUp(10000000, 2000);
  const projects = useCountUp(500000, 2000);
  const courses = useCountUp(50, 1500);

  useEffect(() => {
    if (statsVisible) {
      users.startAnimation();
      projects.startAnimation();
      courses.startAnimation();
    }
  }, [statsVisible]);

  useEffect(() => {
    let currentChar = 0;
    const typingInterval = setInterval(() => {
      if (currentChar <= fullCommand.length) {
        setCommandText(fullCommand.substring(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <section className="bg-[#0a0e27] text-white py-32 text-center relative overflow-hidden">
      {/* Background Effects - Optimized */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Optimized Matrix Rain - Fewer elements for better performance */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-[#00e676] font-mono text-xs opacity-20"
            style={{
              left: `${i * 12.5}%`,
              animation: `matrix-fall-optimized ${
                3 + (i % 3)
              }s linear infinite`,
              animationDelay: `${(i % 4) * 0.5}s`,
              willChange: "transform",
            }}
          >
            {Array.from({ length: 12 }, () =>
              String.fromCharCode(33 + Math.floor(Math.random() * 94))
            ).join("\n")}
          </div>
        ))}
      </div>

      {/* Glowing Orbs - Reduced blur for better performance */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse delay-500"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Terminal Window */}
        <div className="max-w-4xl mx-auto terminal-window backdrop-blur-xl p-8 mb-12">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#00b4d8]/20">
            <div className="w-3 h-3 rounded-full bg-[#e91e63]"></div>
            <div className="w-3 h-3 rounded-full bg-[#00e676]"></div>
            <div className="w-3 h-3 rounded-full bg-[#00b4d8]"></div>
            <span className="ml-2 text-[#6272a4] font-mono text-sm">
              terminal@learncodeai:~
            </span>
          </div>

          {/* Typing Animation */}
          <div className="font-mono text-left mb-8">
            <div className="text-[#00e676] text-lg">
              {commandText}
              {showCursor && <span className="animate-pulse">▋</span>}
            </div>
            {commandText === fullCommand && (
              <div className="mt-4 space-y-1 text-[#6272a4] text-sm animate-code-appear">
                <div>✓ Installing dependencies...</div>
                <div>✓ Downloading tutorials...</div>
                <div className="text-[#00b4d8]">✓ Ready to start coding!</div>
              </div>
            )}
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-mono mb-4 md:mb-6 px-4">
            <span className="text-[#6272a4]">{"// "}</span>
            <span className="neon-text-cyan">Start</span>
            <span className="text-white"> Your </span>
            <span className="neon-text-green">Journey</span>
          </h1>

          {/* Subheading */}
          <p className="text-[#6272a4] font-mono text-base md:text-lg mb-6 md:mb-8 px-4">
            <span className="text-[#00b4d8]">10M+</span> developers are already
            learning.
            <br />
            <span className="text-[#00e676]">Join them today.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full sm:w-auto px-4">
            {isAuthenticated ? (
              <a
                href="/editor"
                className="group relative inline-block w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] via-[#8b5cf6] to-[#00e676] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-6 md:px-8 py-3 md:py-4 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all flex items-center justify-center gap-3 text-sm md:text-base">
                  <span className="text-[#00e676]">$</span>
                  <span className="text-[#00b4d8]">open_code_editor</span>
                  <span className="text-[#6272a4]">()</span>
                </div>
              </a>
            ) : (
              <>
                <a href="/signup" className="group relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] via-[#8b5cf6] to-[#00e676] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative px-8 py-4 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all flex items-center gap-3">
                    <span className="text-[#00e676]">$</span>
                    <span className="text-[#00b4d8]">register_now</span>
                    <span className="text-[#6272a4]">--free</span>
                  </div>
                </a>
                <a
                  href="/signin"
                  className="px-8 py-4 neon-border-purple backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all flex items-center gap-3"
                >
                  <span className="text-[#8b5cf6]">{">>"}</span>
                  <span className="text-white">login</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div
          ref={statsRef}
          className="flex flex-wrap justify-center gap-6 md:gap-8 text-center px-4"
        >
          <div className={statsVisible ? "fade-in-up" : ""}>
            <div className="text-2xl md:text-3xl font-bold neon-text-cyan font-mono">
              {users.count >= 1000000
                ? `${Math.floor(users.count / 1000000)}M+`
                : `${users.count}+`}
            </div>
            <div className="text-[#6272a4] font-mono text-xs md:text-sm">
              active_users
            </div>
          </div>
          <div
            className={statsVisible ? "fade-in-up" : ""}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-2xl md:text-3xl font-bold neon-text-purple font-mono">
              {projects.count >= 1000
                ? `${Math.floor(projects.count / 1000)}K+`
                : `${projects.count}+`}
            </div>
            <div className="text-[#6272a4] font-mono text-xs md:text-sm">
              projects_built
            </div>
          </div>
          <div
            className={statsVisible ? "fade-in-up" : ""}
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-2xl md:text-3xl font-bold neon-text-green font-mono">
              {courses.count}+
            </div>
            <div className="text-[#6272a4] font-mono text-sm">courses</div>
          </div>
        </div>
      </div>
    </section>
  );
}
