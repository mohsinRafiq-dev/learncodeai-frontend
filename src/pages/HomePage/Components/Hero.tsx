import { Link } from "react-router-dom";

import Java from "/assets/homePage/Java.png";
import Cpp from "/assets/homePage/Cplusplus.png";
import Python from "/assets/homePage/Python.png";
import Html from "/assets/homePage/Html.png";
import Javascript from "/assets/homePage/Javascript.png";

const Hero = () => {
  return (
    <div className="bg-white-50 mt-16 md:mt-38">
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl text-center relative">
          {/* Technology Icons - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:block absolute right-1/2 -top-30 flex flex-col items-center">
            <img
              src={Cpp}
              alt="C++"
              className="w-12 h-12 xl:w-16 xl:h-16 mb-2"
            />
          </div>
          <div className="hidden lg:block absolute -left-42 top-0 flex flex-col items-center">
            <img
              src={Java}
              alt="Java"
              className="w-12 h-12 xl:w-16 xl:h-16 mb-2"
            />
          </div>
          <div className="hidden lg:block absolute -right-42 top-0 flex flex-col items-center">
            <img
              src={Python}
              alt="Python"
              className="w-12 h-12 xl:w-16 xl:h-16 mb-2"
            />
          </div>
          <div className="hidden md:block absolute -left-25 bottom-8 flex flex-col items-center">
            <img
              src={Html}
              alt="HTML"
              className="w-12 h-12 xl:w-16 xl:h-16 mb-2"
            />
          </div>
          <div className="hidden md:block absolute -right-25 bottom-8 flex flex-col items-center">
            <img
              src={Javascript}
              alt="JavaScript"
              className="w-12 h-12 xl:w-16 xl:h-16 mb-2"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
            Learn to{" "}
            <span className="relative inline-block px-2">
              <span className="absolute inset-0 bg-yellow-500 rotate-[5deg] rounded mb-1 -z-10"></span>
              <span className="text-white relative">code</span>
            </span>{" "}
            your
            <br />
            dreams and{" "}
            <span className="relative inline-block px-2">
              <span className="absolute inset-0 bg-blue-500 rotate-[5deg] rounded mt-2 -z-10"></span>
              <span className="text-white relative">design</span>
            </span>{" "}
            your
            <br />
            future
          </h1>

          {/* Subheading */}
          <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Learn to code with step-by-step tutorials and practice instantly
            <br className="hidden sm:block" />
            in our built-in online editor. LearnCode AI makes coding simple,
            <br className="hidden sm:block" />
            interactive, and beginner-friendly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link
              to="/courses"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-[12px] bg-yellow-500 text-white rounded font-medium hover:bg-yellow-600 transition-colors text-center"
            >
              Explore Courses
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto px-6 sm:px-8 py-[10px] sm:py-[10px] border-2 border-gray-800 text-gray-800 rounded font-medium hover:bg-gray-800 hover:text-white transition-colors text-center"
            >
              Join Free Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
