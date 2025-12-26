export default function WhyLearnCodeAI() {
  const features = [
    {
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "built_by_developers",
      subtitle: "For Coders, By Coders",
      description:
        "We're not just educators—we're developers creating practical resources we wish we had while learning.",
      code: `const team = {
  passion: "coding",
  mission: "educate"
};`,
      color: "#00b4d8",
    },
    {
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm1.61-9.96c-2.06-.3-3.88.97-4.43 2.79-.18.58.26 1.17.87 1.17h.2c.41 0 .74-.29.88-.67.32-.89 1.27-1.5 2.3-1.28.95.2 1.65 1.13 1.57 2.1-.1 1.34-1.62 1.63-2.45 2.88 0 .01-.01.01-.01.02-.01.02-.02.03-.03.05-.09.15-.18.32-.25.5-.01.03-.03.05-.04.08-.01.02-.01.04-.02.07-.12.34-.2.75-.2 1.25h2c0-.42.11-.77.28-1.07.02-.03.03-.06.05-.09.08-.14.18-.27.28-.39.01-.01.02-.03.03-.04.1-.12.21-.23.33-.34.96-.91 2.26-1.65 1.99-3.56-.24-1.74-1.61-3.21-3.35-3.47z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "simple_learning",
      subtitle: "Coding Made Simple",
      description:
        "From step-by-step tutorials to AI Copilot, we break down complex topics into easy lessons that stick.",
      code: `function learn() {
  return easy && fun;
}`,
      color: "#8b5cf6",
    },
    {
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
          <path
            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            fill="currentColor"
          />
        </svg>
      ),
      title: "hands_on_practice",
      subtitle: "Learn by Building",
      description:
        "Don't just read—create projects, test your code in the online editor, and apply skills instantly.",
      code: `while(true) {
  build();
  deploy();
}`,
      color: "#00e676",
    },
  ];

  return (
    <div className="bg-[#060913] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 circuit-pattern opacity-10"></div>
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[150px] opacity-5"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00e676] rounded-full mix-blend-screen filter blur-[150px] opacity-5"></div>

      <section className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <span className="text-[#6272a4] font-mono text-xs md:text-sm">
              {"// "}
            </span>
            <span className="text-[#8b5cf6] font-mono text-xs md:text-sm">
              Why choose us
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-4 px-4">
            <span className="text-[#6272a4]">{"if ("}</span>
            <span className="neon-text-purple">needToLearn</span>
            <span className="text-[#6272a4]">{" === "}</span>
            <span className="neon-text-cyan">true</span>
            <span className="text-[#6272a4]">{")} {"}</span>
          </h2>
          <p className="text-[#6272a4] font-mono text-sm md:text-base px-4">
            {"// Choose LearnCode AI"}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              {/* Hover Glow */}
              <div
                className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}, transparent)`,
                }}
              ></div>

              {/* Card */}
              <div className="relative terminal-window backdrop-blur-xl p-8 h-full hover:bg-[#1a1f3a]/50 transition-all">
                {/* Icon */}
                <div
                  className="mb-6 transform group-hover:scale-110 transition-transform"
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <div className="mb-4">
                  <h3
                    className="text-xl font-bold font-mono mb-2"
                    style={{ color: feature.color }}
                  >
                    {feature.title}
                  </h3>
                  <div className="text-white font-semibold mb-3">
                    {feature.subtitle}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#6272a4] font-mono text-sm mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Code Snippet */}
                <div className="code-block bg-[#0a0e27] rounded p-3">
                  <pre className="text-xs font-mono">
                    <code style={{ color: feature.color }}>{feature.code}</code>
                  </pre>
                </div>

                {/* Line Number Decoration */}
                <div className="absolute left-2 top-8 text-[#6272a4] font-mono text-xs opacity-30">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
