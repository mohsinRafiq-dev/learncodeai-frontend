import { useState } from "react";

export default function Testimonial() {
  const [activeTab, setActiveTab] = useState("readme");

  const testimonials = [
    {
      name: "Muhammad_Saad",
      role: "Software Engineer",
      avatar: "🧑‍💻",
      company: "@TechCorp",
      quote:
        "LearnCode AI feels like having a mentor 24/7. The AI Copilot and instant feedback accelerated my learning 10x.",
      stats: {
        contributions: 847,
        streak: 156,
        projects: 23,
      },
      skills: ["Python", "React", "Node.js"],
      color: "#00b4d8",
    },
    {
      name: "Sarah_Chen",
      role: "Full Stack Dev",
      avatar: "👩‍💻",
      company: "@StartupXYZ",
      quote:
        "From zero to deployed projects in 3 months. The structured learning path and real-world projects made all the difference.",
      stats: {
        contributions: 1205,
        streak: 203,
        projects: 31,
      },
      skills: ["JavaScript", "TypeScript", "AWS"],
      color: "#8b5cf6",
    },
    {
      name: "Alex_Kumar",
      role: "Data Scientist",
      avatar: "🧑‍🔬",
      company: "@DataLabs",
      quote:
        "The DSA tutorials and algorithm visualizations helped me ace my tech interviews. Landed my dream job!",
      stats: {
        contributions: 623,
        streak: 89,
        projects: 18,
      },
      skills: ["Python", "C++", "Algorithms"],
      color: "#00e676",
    },
  ];

  return (
    <section className="bg-[#0a0e27] py-16 md:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <span className="text-[#6272a4] font-mono text-xs md:text-sm">
              {"// "}
            </span>
            <span className="text-[#00e676] font-mono text-xs md:text-sm">
              Success Stories
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-4 px-4">
            <span className="text-[#6272a4]">{"const "}</span>
            <span className="neon-text-cyan">testimonials</span>
            <span className="text-white"> = [];</span>
          </h2>
          <p className="text-[#6272a4] font-mono text-sm md:text-base px-4">
            {"// Real developers, real results"}
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative">
              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${testimonial.color}, transparent)`,
                }}
              ></div>

              {/* GitHub-Style Card */}
              <div className="relative terminal-window backdrop-blur-xl overflow-hidden h-full">
                {/* Profile Header */}
                <div className="p-6 border-b border-[#00b4d8]/20">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{testimonial.avatar}</div>
                    <div className="flex-1">
                      <h3
                        className="font-mono font-bold text-xl"
                        style={{ color: testimonial.color }}
                      >
                        {testimonial.name}
                      </h3>
                      <p className="text-[#6272a4] font-mono text-sm">
                        {testimonial.role}
                      </p>
                      <p className="text-[#6272a4] font-mono text-xs mt-1">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-[#060913] border-b border-[#00b4d8]/20">
                  <div className="text-center">
                    <div className="text-[#00e676] font-mono font-bold text-lg">
                      {testimonial.stats.contributions}
                    </div>
                    <div className="text-[#6272a4] font-mono text-xs">
                      commits
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#00b4d8] font-mono font-bold text-lg">
                      {testimonial.stats.streak}
                    </div>
                    <div className="text-[#6272a4] font-mono text-xs">
                      day streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#8b5cf6] font-mono font-bold text-lg">
                      {testimonial.stats.projects}
                    </div>
                    <div className="text-[#6272a4] font-mono text-xs">
                      projects
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-[#6272a4] font-mono text-2xl">"</span>
                    <p className="text-[#6272a4] font-mono text-sm leading-relaxed inline">
                      {testimonial.quote}
                    </p>
                    <span className="text-[#6272a4] font-mono text-2xl">"</span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {testimonial.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs font-mono rounded"
                        style={{
                          background: `${testimonial.color}20`,
                          color: testimonial.color,
                          border: `1px solid ${testimonial.color}40`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-4 right-4">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded"
                    style={{ background: `${testimonial.color}20` }}
                  >
                    <span style={{ color: testimonial.color }}>✓</span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: testimonial.color }}
                    >
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
