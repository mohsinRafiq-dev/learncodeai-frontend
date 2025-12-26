import { useState } from "react";

function CollaborationSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: "realtime",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "Real-Time Collaboration",
      description:
        "Code together with live cursor tracking, instant sync, and seamless pair programming.",
      code: `// Live Session
socket.on('codeChange', (data) => {
  editor.update(data);
  sync.broadcast();
});`,
    },
    {
      id: "copilot",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "AI Copilot Assistant",
      description:
        "Your intelligent coding companion that understands context and provides smart suggestions.",
      code: `// AI-Powered Help
const copilot = await ai.suggest({
  context: currentCode,
  task: 'optimize'
});`,
    },
    {
      id: "review",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "Code Review & Share",
      description:
        "Share projects instantly, get feedback, and collaborate with the community.",
      code: `// Share Project
project.share({
  visibility: 'public',
  allowForks: true
});`,
    },
  ];

  return (
    <section className="bg-[#0a0e27] py-16 md:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 circuit-pattern opacity-10"></div>
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <span className="text-[#6272a4] font-mono text-xs md:text-sm">
                {"// "}
              </span>
              <span className="text-[#8b5cf6] font-mono text-xs md:text-sm">
                Beyond Code
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-4 md:mb-6 leading-tight">
              <span className="neon-text-purple">Collaboration</span>
              <br />
              <span className="text-white">that goes </span>
              <span className="neon-text-cyan">beyond code</span>
            </h2>

            <p className="text-[#6272a4] font-mono text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">
              Work smarter with AI-powered tools. Code in real-time, chat with
              our intelligent assistant, and let Copilot guide you through
              complex challenges. Share, review, and build faster as a team.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  onMouseEnter={() => setActiveFeature(index)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    activeFeature === index
                      ? "neon-border-cyan bg-[#1a1f3a]"
                      : "border border-[#00b4d8]/20 hover:bg-[#1a1f3a]/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div className="flex-1">
                      <h3
                        className={`font-mono font-bold mb-2 ${
                          activeFeature === index
                            ? "neon-text-cyan"
                            : "text-white"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-[#6272a4] text-sm font-mono">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="terminal-window p-6 backdrop-blur-xl">
              <div className="flex items-start gap-2 mb-4">
                <span className="text-[#6272a4] text-2xl">"</span>
                <p className="text-[#6272a4] font-mono text-sm">
                  LearnCode AI makes learning effortless. The AI Copilot feels
                  like a teammate who's always ready to help.
                </p>
                <span className="text-[#6272a4] text-2xl">"</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#8b5cf6] flex items-center justify-center">
                  <span className="text-white font-mono font-bold">S</span>
                </div>
                <div>
                  <div className="text-[#00b4d8] font-mono text-sm">
                    Sarah_Chen
                  </div>
                  <div className="text-[#6272a4] font-mono text-xs">
                    CS Student • @LearnCodeAI
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Code Preview */}
          <div className="hidden lg:block">
            <div className="terminal-window backdrop-blur-xl p-6 group hover:scale-105 transition-transform">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#00b4d8]/20">
                <div className="w-3 h-3 rounded-full bg-[#e91e63]"></div>
                <div className="w-3 h-3 rounded-full bg-[#00e676]"></div>
                <div className="w-3 h-3 rounded-full bg-[#00b4d8]"></div>
                <span className="ml-2 text-[#6272a4] font-mono text-sm">
                  {features[activeFeature].id}.js
                </span>
              </div>

              {/* Code Display */}
              <div className="code-block bg-[#060913] rounded p-4">
                <div className="flex gap-4">
                  <div className="text-[#6272a4] font-mono text-sm space-y-2">
                    <div>01</div>
                    <div>02</div>
                    <div>03</div>
                    <div>04</div>
                    <div>05</div>
                  </div>
                  <pre className="font-mono text-sm flex-1">
                    <code className="text-[#a5ff90]">
                      {features[activeFeature].code}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Feature Info */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-3">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeFeature === index
                          ? "bg-[#00b4d8] w-8"
                          : "bg-[#6272a4]"
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="text-[#6272a4] font-mono text-xs">
                  {activeFeature + 1} / {features.length}
                </div>
              </div>
            </div>

            {/* Floating Code Symbols */}
            <div className="relative mt-8">
              <div className="absolute -top-4 left-10 text-[#00b4d8] text-4xl opacity-50 animate-float">
                {"{ }"}
              </div>
              <div className="absolute top-8 right-10 text-[#8b5cf6] text-4xl opacity-50 animate-float delay-300">
                {"< />"}
              </div>
              <div className="absolute -bottom-4 left-1/2 text-[#00e676] text-4xl opacity-50 animate-float delay-700">
                {"[ ]"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CollaborationSection;
