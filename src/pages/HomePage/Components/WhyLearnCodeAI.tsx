import { FaUserGraduate } from "react-icons/fa";
import { BsCodeSlash } from "react-icons/bs";
import { FaWrench } from "react-icons/fa";

export default function WhyLearnCodeAI() {
  const features = [
    {
      icon: <FaUserGraduate className="text-3xl" />,
      title: "For coders, by coders",
      description:
        "We're not just educators—we're developers creating practical resources we wish we had while learning.",
    },
    {
      icon: <BsCodeSlash className="text-3xl" />,
      title: "Coding made simple",
      description:
        "From step-by-step tutorials to an AI Copilot, we break down complex topics into easy lessons that actually stick.",
    },
    {
      icon: <FaWrench className="text-3xl" />,
      title: "Learn by building",
      description:
        "Don't just read—create projects, test your code in the online editor, and apply skills instantly.",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <hr className="border-gray-700" />
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why LearnCode AI?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:gap-40 gap-20 text-justify">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <span className="mr-3">{feature.icon}</span>
              <div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-base">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-700" />
    </div>
  );
}
