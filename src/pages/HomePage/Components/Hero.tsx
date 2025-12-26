import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
  const [displayText, setDisplayText] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const codeLines = [
    "$ initialize_learning_mode",
    "> Loading LearnCode AI...",
    "> System: Ready",
    "$ start_coding --now",
  ];

  useEffect(() => {
    if (currentLine < codeLines.length) {
      const text = codeLines[currentLine];
      let currentChar = 0;

      const typingInterval = setInterval(() => {
        if (currentChar <= text.length) {
          setDisplayText(text.substring(0, currentChar));
          currentChar++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            if (currentLine < codeLines.length - 1) {
              setCurrentLine(currentLine + 1);
            }
          }, 500);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [currentLine]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Memoize matrix rain characters to prevent regeneration on every render
  const matrixChars = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      chars: Array.from({ length: 15 }, () =>
        String.fromCharCode(33 + Math.floor(Math.random() * 94))
      ).join("\n"),
      left: i * 8.3,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
  )[0];

  const mobileMatrixChars = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      chars: Array.from({ length: 8 }, () =>
        String.fromCharCode(33 + Math.floor(Math.random() * 94))
      ).join("\n"),
      left: i * 33,
      delay: i * 0.5,
    }))
  )[0];

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden bg-[#0a0e27]">
      {/* Optimized Matrix Rain - GPU accelerated with fewer elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none will-change-transform">
        {matrixChars.map((col) => (
          <div
            key={col.id}
            className="absolute text-[#00e676] font-mono text-xs hidden md:block"
            style={{
              left: `${col.left}%`,
              animation: `matrix-fall-optimized ${col.duration}s linear infinite`,
              animationDelay: `${col.delay}s`,
              willChange: "transform",
            }}
          >
            {col.chars}
          </div>
        ))}
        {/* Mobile version */}
        {mobileMatrixChars.map((col) => (
          <div
            key={`mobile-${col.id}`}
            className="absolute text-[#00e676] font-mono text-xs md:hidden"
            style={{
              left: `${col.left}%`,
              animation: `matrix-fall-optimized 4s linear infinite`,
              animationDelay: `${col.delay}s`,
              willChange: "transform",
            }}
          >
            {col.chars}
          </div>
        ))}
      </div>

      {/* Circuit Pattern Overlay */}
      <div className="absolute inset-0 circuit-pattern"></div>

      {/* Animated Grid Lines */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>

      {/* Glowing Orbs - Reduced blur for better performance */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#00e676] rounded-full mix-blend-screen filter blur-[80px] opacity-10 animate-pulse delay-500"></div>

      {/* Floating Code Symbols */}
      <div className="hidden lg:block absolute left-[8%] top-[20%] animate-float">
        <div className="terminal-window p-4 backdrop-blur-xl">
          <div className="text-[#00b4d8] font-mono text-2xl">&lt;/&gt;</div>
        </div>
      </div>
      <div className="hidden lg:block absolute right-[8%] top-[25%] animate-float delay-300">
        <div className="terminal-window p-4 backdrop-blur-xl">
          <div className="text-[#8b5cf6] font-mono text-2xl">{"{ }"}</div>
        </div>
      </div>
      <div className="hidden lg:block absolute left-[12%] bottom-[25%] animate-float delay-500">
        <div className="terminal-window p-4 backdrop-blur-xl">
          <div className="text-[#00e676] font-mono text-2xl">[ ]</div>
        </div>
      </div>
      <div className="hidden lg:block absolute right-[12%] bottom-[30%] animate-float delay-700">
        <div className="terminal-window p-4 backdrop-blur-xl">
          <div className="text-[#e91e63] font-mono text-2xl">( )</div>
        </div>
      </div>
      <div className="hidden md:block absolute left-[20%] top-[15%] animate-float delay-1000">
        <div className="terminal-window p-4 backdrop-blur-xl">
          <div className="text-[#00d4ff] font-mono text-2xl">=&gt;</div>
        </div>
      </div>
      <div className="hidden md:block absolute right-[20%] bottom-[15%] animate-float delay-300">
        <div className="terminal-window p-4 backdrop-blur-xl">
          <div className="text-[#a5ff90] font-mono text-2xl">##</div>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="scanline-effect absolute inset-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-cyan backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg shadow-lg">
            <span className="text-[#00b4d8] font-mono text-sm animate-pulse">
              ●
            </span>
            <span className="text-[#00b4d8] font-mono text-sm font-medium">
              System Online | AI-Powered
            </span>
          </div>

          {/* Terminal Window with Typing Effect */}
          <div className="max-w-4xl mx-auto terminal-window p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#00b4d8]/20">
              <div className="w-3 h-3 rounded-full bg-[#e91e63]"></div>
              <div className="w-3 h-3 rounded-full bg-[#00e676]"></div>
              <div className="w-3 h-3 rounded-full bg-[#00b4d8]"></div>
              <span className="ml-2 text-[#6272a4] font-mono text-sm">
                terminal@learncodeai
              </span>
            </div>
            <div className="space-y-2 font-mono text-left">
              {codeLines.slice(0, currentLine).map((line, i) => (
                <div key={i} className="animate-code-appear">
                  <span
                    className={
                      line.startsWith("$") ? "text-[#00e676]" : "text-[#00b4d8]"
                    }
                  >
                    {line}
                  </span>
                </div>
              ))}
              <div className="flex items-center">
                <span
                  className={
                    displayText.startsWith("$")
                      ? "text-[#00e676]"
                      : "text-[#00b4d8]"
                  }
                >
                  {displayText}
                </span>
                {showCursor && (
                  <span className="ml-1 text-[#00e676] animate-pulse">▋</span>
                )}
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight font-mono">
            <span className="text-[#6272a4]">{"/* "}</span>
            <span className="text-[#00b4d8]">Code</span>
            <span className="text-[#6272a4]">{" */"}</span>
            <br />
            <span className="text-[#8b5cf6]">Learn</span>
            <span className="text-white">.</span>
            <span className="text-[#00e676]">Build</span>
            <span className="text-white">.</span>
            <span className="text-[#e91e63]">Master</span>
          </h1>

          {/* Code Comment Style Subheading */}
          <div className="max-w-3xl mx-auto space-y-3">
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Master programming with
              AI-powered tutorials
            </p>
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Real-time code
              execution & instant feedback
            </p>
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Join{" "}
              <span className="neon-text-green">10,000+</span> developers
              worldwide
            </p>
          </div>

          {/* Stats with Glowing Effect */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 py-8">
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow">
              <div className="text-3xl sm:text-4xl font-bold neon-text-cyan font-mono">
                10K+
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"<learners />"}
              </div>
            </div>
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow delay-300">
              <div className="text-3xl sm:text-4xl font-bold neon-text-purple font-mono">
                500+
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"{ challenges }"}
              </div>
            </div>
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow delay-500">
              <div className="text-3xl sm:text-4xl font-bold neon-text-green font-mono">
                50+
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                ["courses"]
              </div>
            </div>
          </div>

          {/* Terminal Command Style CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/tutorials" className="group relative w-full sm:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] via-[#8b5cf6] to-[#00e676] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative px-8 py-4 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all duration-300 flex items-center justify-center gap-3">
                <span className="text-[#00e676]">$</span>
                <span className="text-[#00b4d8]">start-learning</span>
                <span className="text-[#6272a4]">--free</span>
              </div>
            </Link>
            <Link
              to="/editor"
              className="group w-full sm:w-auto px-8 py-4 neon-border-purple backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span className="text-[#8b5cf6]">{">"}</span>
              <span className="text-white">code_editor</span>
              <span className="text-[#6272a4]">()</span>
            </Link>
          </div>

          {/* Trust Indicators with Code Style */}
          <div className="pt-12 flex flex-wrap items-center justify-center gap-6 text-[#6272a4] text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#00e676]">{"["}</span>
              <div className="flex gap-1">
                {["cyan", "purple", "green", "pink"].map((color, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full bg-[var(--color-neon-${color})] animate-pulse`}
                    style={{ animationDelay: `${i * 200}ms` }}
                  ></div>
                ))}
              </div>
              <span className="text-[#00e676]">{"]"}</span>
              <span className="ml-2">Active Community</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#e91e63]">{"★".repeat(5)}</span>
              <span className="ml-2 text-[#00b4d8]">4.9/5</span>
              <span>Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave - Circuit Style */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 55C1200 50 1320 50 1380 50L1440 50V120H0V50Z"
            fill="url(#circuit-gradient)"
          />
          <defs>
            <linearGradient
              id="circuit-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#00e676" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
