import { FaArrowRight } from "react-icons/fa";

const languages = [
  {
    name: "HTML",
    imgSrc: "/assets/homePage/Html.png",
  },
  {
    name: "Javascript",
    imgSrc: "/assets/homePage/Javascript.png",
  },
  {
    name: "Java",
    imgSrc: "/assets/homePage/Java.png",
  },
  {
    name: "C++",
    imgSrc: "/assets/homePage/Cplusplus.png",
  },
];

const dsaCourses = [
  {
    title: "DSA Fundamentals",
    description:
      "Build a strong foundation with core concepts like arrays, linked lists, stacks, and queues.",
    linkText: "Start Learning",
    imgSrc: "/assets/homePage/Dsa1.png",
  },
  {
    title: "Advanced Algorithms",
    description:
      "Tackle complex problems with sorting, searching, and graph algorithms.",
    linkText: "Dive Deeper",
    imgSrc: "/assets/homePage/Dsa2.png",
  },
];

export default function Languages() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 lg:mb-20">
          Explore Our Languages
        </h2>

        <div className="grid grid-cols-4 gap-8 mb-24">
          {languages.map((lang) => (
            <div key={lang.name} className="flex flex-col items-center">
              <img
                src={lang.imgSrc}
                alt={`${lang.name} logo`}
                className="w-24 h-24 object-contain mb-3 rounded-lg" // Added rounded-lg
              />
              <p className="font-semibold text-gray-700">{lang.name}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 lg:mb-20">
          Master Data Structures & Algorithms
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {dsaCourses.map((course) => (
            <div
              key={course.title}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <img
                src={course.imgSrc}
                alt={course.title}
                className="w-full h-48 object-cover" // Set a fixed height
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <a
                  href="#"
                  className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {course.linkText}
                  <FaArrowRight className="ml-2 text-sm" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

