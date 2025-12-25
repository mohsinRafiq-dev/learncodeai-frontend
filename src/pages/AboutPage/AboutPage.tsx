import { BsStars } from "react-icons/bs";
import { TbCode } from "react-icons/tb";
import { BiBrain } from "react-icons/bi";
import { BiBookOpen } from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai";
import { BsRocketTakeoff } from "react-icons/bs";
import React from "react";
import { FaTwitter, FaLinkedin } from "react-icons/fa";

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section
        className="text-white text-center py-20 px-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/assets/aboutPage/aboutbg.png')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Empowering the Next Generation of Developers.
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            LearnCode AI was created to make high-quality coding education accessible
            to everyone, everywhere. We're here to help you solve today's
            problems and build the future.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10 ">
          Our Mission & Vision
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-6 text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl">
              <BsRocketTakeoff className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p>
              We aim to make high-quality coding education accessible to
              everyone, everywhere.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl">
              <AiOutlineEye className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Vision</h3>
            <p>
              To build the world’s most supportive and innovative community for
              learners and developers.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10">
          What We Offer
        </h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-50 rounded-2xl shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl">
              <BiBookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Comprehensive Tutorials</h3>
            <p>
              Learn Python, JavaScript, Java, C++, and more through step-by-step
              guides.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl">
              <BiBrain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Global Library</h3>
            <p>
              Master data structures, algorithms, and system design with curated
              content.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl">
              <TbCode className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Interactive Code Labs</h3>
            <p>
              Write, run, and test your code in real time with an interactive
              coding playground.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl">
              <BsStars className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">AI-Powered Assistance</h3>
            <p>
              Get help on your coding projects, debug errors, and accelerate
              your learning.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 px-6 text-center bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10">
          Meet the Team
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Team Member 1 */}
          <div className="bg-white rounded-2xl shadow p-6">
            <img
              src="/assets/aboutPage/asad.jpg"
              alt="Muhammad Asad Ullah Turab"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-bold">Muhammad Asad Ullah Turab</h3>
            <p className="text-gray-500 mb-3">CEO & Founder</p>
            <p className="text-sm mb-4">
              Passionate about empowering developers through accessible coding
              education.
            </p>
            <div className="flex justify-center gap-4 text-gray-600">
              <FaTwitter />
              <FaLinkedin />
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-2xl shadow p-6">
            <img
              src="/assets/aboutPage/israr.jpg"
              alt="Israr Ahmad"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-bold">Israr Ahmad</h3>
            <p className="text-gray-500 mb-3">CTO</p>
            <p className="text-sm mb-4">
              Leads the technical vision and architecture of our learning
              platform.
            </p>
            <div className="flex justify-center gap-4 text-gray-600">
              <FaTwitter />
              <FaLinkedin />
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-2xl shadow p-6">
            <img
              src="/assets/aboutPage/saad.jpg"
              alt="Muhammad Saad"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-bold">Muhammad Saad</h3>
            <p className="text-gray-500 mb-3">Head of Education</p>
            <p className="text-sm mb-4">
              Designs and curates content to help learners grow from beginner to
              expert.
            </p>
            <div className="flex justify-center gap-4 text-gray-600">
              <FaTwitter />
              <FaLinkedin />
            </div>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-16 px-6 text-center bg-gray-900 text-white">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Join Us on Our Mission
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          Be part of the LearnCode AI journey. Whether you’re looking to share your
          knowledge, learn, or build a community — we welcome you!
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Start Learning More
          </button>
          <button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition">
            Join Our Community
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

