import { useState } from "react";

const languages = [
  {
    name: "Python",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01.21.03zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"
          fill="currentColor"
        />
      </svg>
    ),
    color: "#00b4d8",
    courses: "45+",
    students: "8.5K",
    code: 'print("Hello World")',
    gradient: "from-[#00b4d8] to-[#00e676]",
  },
  {
    name: "JavaScript",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"
          fill="currentColor"
        />
      </svg>
    ),
    color: "#00e676",
    courses: "52+",
    students: "12K",
    code: 'console.log("Hello");',
    gradient: "from-[#00e676] to-[#8b5cf6]",
  },
  {
    name: "Java",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"
          fill="currentColor"
        />
      </svg>
    ),
    color: "#8b5cf6",
    courses: "38+",
    students: "7K",
    code: "System.out.println();",
    gradient: "from-[#8b5cf6] to-[#e91e63]",
  },
  {
    name: "C++",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79v.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79v.79z"
          fill="currentColor"
        />
      </svg>
    ),
    color: "#e91e63",
    courses: "41+",
    students: "9K",
    code: 'std::cout << "Hi";',
    gradient: "from-[#e91e63] to-[#00d4ff]",
  },
  {
    name: "HTML/CSS",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"
          fill="currentColor"
        />
      </svg>
    ),
    color: "#00d4ff",
    courses: "35+",
    students: "15K",
    code: "<div>Hello</div>",
    gradient: "from-[#00d4ff] to-[#00b4d8]",
  },
];

const dsaCourses = [
  {
    title: "DSA_Fundamentals",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 12h2v5H7v-5zm4-3h2v8h-2V9zm4-3h2v11h-2V6z"
          fill="currentColor"
        />
      </svg>
    ),
    description:
      "Master arrays, linked lists, stacks, queues with hands-on practice",
    difficulty: "// Beginner",
    lessons: "42",
    time: "6 weeks",
    color: "#00b4d8",
    codeSnippet: `function bubbleSort(arr) {
  for(let i = 0; i < arr.length; i++) {
    // Sort implementation
  }
  return arr;
}`,
  },
  {
    title: "Advanced_Algorithms",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"
          fill="currentColor"
        />
      </svg>
    ),
    description:
      "Deep dive into sorting, searching, dynamic programming & graphs",
    difficulty: "// Advanced",
    lessons: "56",
    time: "8 weeks",
    color: "#8b5cf6",
    codeSnippet: `class Graph {
  constructor() {
    this.vertices = [];
    this.edges = {};
  }
}`,
  },
];

export default function Languages() {
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  return (
    <section className="bg-[#0a0e27] py-20 relative overflow-hidden">
      {/* Circuit Pattern Background */}
      <div className="absolute inset-0 circuit-pattern opacity-20"></div>

      {/* Glowing Orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Languages Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-[#6272a4] font-mono text-sm">{"/* "}</span>
            <span className="text-[#00b4d8] font-mono text-sm">Languages</span>
            <span className="text-[#6272a4] font-mono text-sm">{" */"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            <span className="neon-text-cyan">Choose</span>
            <span className="text-white"> Your </span>
            <span className="neon-text-purple">Stack</span>
          </h2>
          <p className="text-[#6272a4] font-mono">
            {"// Master multiple languages with interactive tutorials"}
          </p>
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-32">
          {languages.map((lang) => (
            <div
              key={lang.name}
              onMouseEnter={() => setHoveredLang(lang.name)}
              onMouseLeave={() => setHoveredLang(null)}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
              ></div>
              <div className="relative terminal-window p-6 backdrop-blur-xl hover:bg-[#1a1f3a]/80 transition-all duration-300 cursor-pointer h-full">
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className="mb-2 transform group-hover:scale-110 transition-transform"
                    style={{ color: lang.color }}
                  >
                    {lang.icon}
                  </div>
                  <h3
                    className="font-mono font-bold text-xl"
                    style={{ color: lang.color }}
                  >
                    {lang.name}
                  </h3>
                  <div className="w-full text-center space-y-1">
                    <div className="text-[#6272a4] text-xs font-mono">
                      <span className="text-[#00e676]">{lang.courses}</span>{" "}
                      courses
                    </div>
                    <div className="text-[#6272a4] text-xs font-mono">
                      <span className="text-[#00b4d8]">{lang.students}</span>{" "}
                      learners
                    </div>
                  </div>
                  {hoveredLang === lang.name && (
                    <div className="w-full mt-3 p-2 bg-[#060913] rounded border border-[#00b4d8]/20 animate-code-appear">
                      <code className="text-[#a5ff90] text-xs font-mono">
                        {lang.code}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DSA Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-[#6272a4] font-mono text-sm">{"/* "}</span>
            <span className="text-[#00e676] font-mono text-sm">Algorithms</span>
            <span className="text-[#6272a4] font-mono text-sm">{" */"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            <span className="neon-text-green">Master</span>
            <span className="text-white"> DSA</span>
          </h2>
          <p className="text-[#6272a4] font-mono">
            {"// Data Structures & Algorithms made simple"}
          </p>
        </div>

        {/* DSA Course Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {dsaCourses.map((course) => (
            <div
              key={course.title}
              onMouseEnter={() => setHoveredCourse(course.title)}
              onMouseLeave={() => setHoveredCourse(null)}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00b4d8] via-[#8b5cf6] to-[#00e676] rounded-lg blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative terminal-window backdrop-blur-xl overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#00b4d8]/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#e91e63]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#00e676]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#00b4d8]"></div>
                    <span className="ml-2 text-[#6272a4] font-mono text-xs">
                      {course.title}.jsx
                    </span>
                  </div>
                  <div style={{ color: course.color }}>{course.icon}</div>
                </div>

                {/* Code Preview */}
                <div className="p-4 bg-[#060913]">
                  <pre className="text-xs font-mono overflow-x-auto">
                    <code>
                      <span className="text-[#6272a4]">
                        {course.difficulty}
                      </span>
                      {"\n"}
                      <span className="text-[#ff79c6]">class</span>
                      <span className="text-white"> </span>
                      <span style={{ color: course.color }}>
                        {course.title}
                      </span>
                      <span className="text-white"> {"{"}</span>
                      {"\n  "}
                      <span className="text-[#6272a4]">
                        {"// " + course.description}
                      </span>
                      {"\n"}
                      <span className="text-white">{"}"}</span>
                    </code>
                  </pre>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-2xl font-bold font-mono mb-3"
                    style={{ color: course.color }}
                  >
                    {course.title.replace(/_/g, " ")}
                  </h3>
                  <p className="text-[#6272a4] font-mono text-sm mb-6">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4 text-sm font-mono">
                    <div>
                      <span className="text-[#6272a4]">lessons: </span>
                      <span className="text-[#00e676]">{course.lessons}</span>
                    </div>
                    <div>
                      <span className="text-[#6272a4]">duration: </span>
                      <span className="text-[#00b4d8]">{course.time}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full group/btn relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] to-[#00e676] rounded-lg blur opacity-50 group-hover/btn:opacity-100 transition-opacity"></div>
                    <div className="relative px-6 py-3 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all flex items-center justify-center gap-2">
                      <span className="text-[#00e676]">$</span>
                      <span className="text-[#00b4d8]">enroll_now</span>
                      <span className="text-[#6272a4]">()</span>
                    </div>
                  </button>
                </div>

                {/* Hover Code Snippet */}
                {hoveredCourse === course.title && (
                  <div className="absolute inset-0 bg-[#060913]/95 backdrop-blur-sm flex items-center justify-center p-6 animate-code-appear">
                    <pre className="text-xs font-mono text-left w-full">
                      <code className="text-[#a5ff90]">
                        {course.codeSnippet}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
