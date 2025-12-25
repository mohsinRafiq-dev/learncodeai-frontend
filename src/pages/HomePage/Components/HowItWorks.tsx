import { FaUser, FaBrain, FaUsers } from "react-icons/fa";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FaUser />,
      title: "1: Register",
      description:
        "Sign up for free and get access to tutorials, coding challenges, and the built-in code editor.",
    },
    {
      icon: <FaBrain />,
      title: "2: Learn & Practice",
      description:
        "Follow structured DSA, web dev, and AI tutorials, and practice directly in your browser.",
    },
    {
      icon: <FaUsers />,
      title: "3: Collaborate & Build",
      description:
        "Work with peers, get AI chatbot support, and use Copilot to speed up your coding journey.",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <hr className="border-gray-800" />
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          How Does It Work?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:gap-40 gap-20 text-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-yellow-500 text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-base">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
      <hr className="border-gray-800" />
    </div>
  );
}

