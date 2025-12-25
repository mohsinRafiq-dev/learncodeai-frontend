import { FaChevronRight } from "react-icons/fa";

function CollaborationSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-gray-900">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Collaboration that goes beyond code
          </h2>
          <p className="text-lg text-gray-700 lg:mb-8 mb-4">
            Work smarter, not harder—with LearnCode AI's AI-powered
            collaboration tools. Code together in real time, chat with our
            intelligent AI assistant, and let Copilot guide you through complex
            problems. Share projects, review code, and build faster as a team.
          </p>

          <a
            href="#"
            className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-lg lg:mb-16 mb-8"
          >
            Learn more <FaChevronRight className="ml-2 text-sm" />
          </a>

          <p className="text-4xl font-extrabold text-yellow-500 lg:mb-4 leading-none">
            &#8220;
          </p>
          <p className="text-xl font-medium text-gray-800 mb-4">
            LearnCode AI makes learning and building effortless. The AI Copilot
            feels like a teammate who’s always ready to help.
          </p>
          <p className="text-gray-600 text-sm">
            Sarah, Computer Science Student // LearnCode AI User
          </p>
        </div>

        <div className="hidden lg:block">
          <img
            src="/assets/homePage/copilot.png"
            alt="GitHub Copilot interface showing code generation"
            className="rounded-lg shadow-lg max-w-[500px] ml-auto  h-auto"
          />
        </div>
      </div>
    </section>
  );
}

export default CollaborationSection;
