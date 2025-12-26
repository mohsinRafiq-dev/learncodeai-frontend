import { useState } from "react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      number: "01",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "register_account",
      subtitle: "Sign Up",
      description:
        "Create your free account and unlock access to tutorials, challenges, and the built-in code editor.",
      code: `const user = {
  username: "coder",
  level: "beginner"
};
user.register();`,
      color: "#00b4d8",
    },
    {
      number: "02",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 1v6h6V1h2v6h2V1h2v6a2 2 0 01-2 2h-2v2a2 2 0 01-2 2H9v8h6v2H3v-2h4v-8a2 2 0 01-2-2V9H3a2 2 0 01-2-2V1h2v6h2V1h2v6h6V1h2z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "learn_practice",
      subtitle: "Start Learning",
      description:
        "Follow structured tutorials in DSA, web dev, and AI. Practice directly in the browser with real-time feedback.",
      code: `function practice() {
  while(learning) {
    code();
    debug();
    improve();
  }
}`,
      color: "#8b5cf6",
    },
    {
      number: "03",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path
            d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4zM21 3v2H3V3h18z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "build_projects",
      subtitle: "Create & Collaborate",
      description:
        "Work with peers, get AI chatbot support, and use Copilot to accelerate your coding journey.",
      code: `async function build() {
  await collaborate();
  const project = 
    create();
  return success;
}`,
      color: "#00e676",
    },
  ];

  return (
    <div className="bg-[#0a0e27] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse delay-500"></div>

      <section className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-block mb-4">
            <span className="text-[#6272a4] font-mono text-xs md:text-sm">
              {"// "}
            </span>
            <span className="text-[#00e676] font-mono text-xs md:text-sm">
              How it works
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold font-mono mb-4 px-4">
            <span className="text-[#6272a4]">{"function "}</span>
            <span className="neon-text-cyan">getStarted</span>
            <span className="text-white">{"() {"}</span>
          </h2>
          <p className="text-[#6272a4] font-mono text-sm md:text-base px-4">
            {"// Your journey in 3 simple steps"}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(null)}
              className="group relative"
            >
              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}20)`,
                }}
              ></div>

              {/* Card */}
              <div className="relative terminal-window backdrop-blur-xl p-8 h-full hover:bg-[#1a1f3a]/80 transition-all duration-300">
                {/* Step Number */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="text-6xl font-bold font-mono opacity-20"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </div>
                  <div
                    className="transform group-hover:scale-110 transition-transform"
                    style={{ color: step.color }}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <div className="text-[#6272a4] font-mono text-xs mb-1">
                    Step {step.number}
                  </div>
                  <h3
                    className="text-2xl font-bold font-mono mb-1"
                    style={{ color: step.color }}
                  >
                    {step.title}
                  </h3>
                  <div className="text-white font-semibold">
                    {step.subtitle}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#6272a4] font-mono text-sm mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Code Snippet */}
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity rounded`}
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${step.color}, transparent)`,
                    }}
                  ></div>
                  <div className="relative code-block bg-[#060913] rounded p-4 overflow-hidden">
                    <pre className="text-xs font-mono">
                      <code style={{ color: step.color }}>{step.code}</code>
                    </pre>
                  </div>
                </div>

                {/* Connection Line (visible on larger screens) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div
                      className="w-8 h-0.5 opacity-30"
                      style={{ background: step.color }}
                    ></div>
                    <div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full animate-pulse"
                      style={{ background: step.color }}
                    ></div>
                  </div>
                )}

                {/* Hover Border Effect */}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    border: `1px solid ${step.color}40`,
                    boxShadow: `0 0 20px ${step.color}20`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing Bracket */}
        <div className="text-center mt-16">
          <div className="text-4xl md:text-6xl font-bold font-mono text-white">
            {"}"}
          </div>
          <div className="mt-8">
            <button className="group/btn relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] via-[#8b5cf6] to-[#00e676] rounded-lg blur-lg opacity-75 group-hover/btn:opacity-100 transition-opacity"></div>
              <div className="relative px-8 py-4 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all flex items-center gap-3">
                <span className="text-[#00e676]">$</span>
                <span className="text-[#00b4d8]">start_journey</span>
                <span className="text-[#6272a4]">--now</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
