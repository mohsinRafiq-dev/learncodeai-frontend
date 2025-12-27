import { BsStars } from "react-icons/bs";
import { TbCode } from "react-icons/tb";
import { BiBrain } from "react-icons/bi";
import { BiBookOpen } from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai";
import { BsRocketTakeoff } from "react-icons/bs";
import React from "react";
import { FaTwitter, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#0a0e27] text-white font-mono">
      {/* Hero Section with Terminal Style */}
      <section className="relative min-h-[60vh] text-center py-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse delay-1000"></div>
        </div>
        
        {/* Circuit Pattern */}
        <div className="absolute inset-0 circuit-pattern"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-cyan backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg mb-8">
            <span className="text-[#00b4d8] font-mono text-sm animate-pulse">●</span>
            <span className="text-[#00b4d8] font-mono text-sm font-medium">About.init()</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-[#6272a4]">{"/* "}</span>
            <span className="text-[#00b4d8]">Empowering</span>
            <span className="text-[#6272a4]">{" */"}</span>
            <br />
            <span className="text-[#8b5cf6]">Next Generation</span>
            <br />
            <span className="text-[#00e676]">Developers</span>
            <span className="text-white">.</span>
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-[#6272a4] text-base md:text-lg mb-2">
              <span className="text-[#00b4d8]">//</span> Making high-quality coding education accessible
            </p>
            <p className="text-[#6272a4] text-base md:text-lg">
              <span className="text-[#00b4d8]">//</span> Building the future, one developer at a time
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            <span className="text-[#6272a4]">{"<"}</span>
            <span className="neon-text-cyan">Mission & Vision</span>
            <span className="text-[#6272a4]">{" />"}</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="terminal-window p-8 backdrop-blur-xl group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00b4d8]/10 neon-border-cyan rounded-2xl mb-4">
                <BsRocketTakeoff className="w-8 h-8 text-[#00b4d8]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#00b4d8]">
                {"{ "}<span className="text-white">Our Mission</span>{" }"}
              </h3>
              <p className="text-[#6272a4] leading-relaxed">
                We aim to make high-quality coding education accessible to
                everyone, everywhere through AI-powered learning experiences.
              </p>
            </div>
            <div className="terminal-window p-8 backdrop-blur-xl group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8b5cf6]/10 neon-border-purple rounded-2xl mb-4">
                <AiOutlineEye className="w-8 h-8 text-[#8b5cf6]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#8b5cf6]">
                {"[ "}<span className="text-white">Our Vision</span>{" ]"}
              </h3>
              <p className="text-[#6272a4] leading-relaxed">
                To build the world's most supportive and innovative community for
                learners and developers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            <span className="text-[#6272a4]">{"function "}</span>
            <span className="neon-text-purple">WhatWeOffer</span>
            <span className="text-[#6272a4]">{"() { "}</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="terminal-window p-6 backdrop-blur-xl group hover:scale-105 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00b4d8]/10 neon-border-cyan rounded-2xl mb-4">
                <BiBookOpen className="w-8 h-8 text-[#00b4d8]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#00b4d8]">Comprehensive Tutorials</h3>
              <p className="text-[#6272a4] text-sm">
                Learn Python, JavaScript, Java, C++, and more through step-by-step
                guides.
              </p>
            </div>
            <div className="terminal-window p-6 backdrop-blur-xl group hover:scale-105 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8b5cf6]/10 neon-border-purple rounded-2xl mb-4">
                <BiBrain className="w-8 h-8 text-[#8b5cf6]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#8b5cf6]">Global Library</h3>
              <p className="text-[#6272a4] text-sm">
                Master data structures, algorithms, and system design with curated
                content.
              </p>
            </div>
            <div className="terminal-window p-6 backdrop-blur-xl group hover:scale-105 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00e676]/10 neon-border-green rounded-2xl mb-4">
                <TbCode className="w-8 h-8 text-[#00e676]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#00e676]">Interactive Code Labs</h3>
              <p className="text-[#6272a4] text-sm">
                Write, run, and test your code in real time with an interactive
                coding playground.
              </p>
            </div>
            <div className="terminal-window p-6 backdrop-blur-xl group hover:scale-105 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e91e63]/10 neon-border-pink rounded-2xl mb-4">
                <BsStars className="w-8 h-8 text-[#e91e63]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#e91e63]">AI-Powered Assistance</h3>
              <p className="text-[#6272a4] text-sm">
                Get help on your coding projects, debug errors, and accelerate
                your learning.
              </p>
            </div>
          </div>
          <p className="text-center text-[#6272a4] mt-8">{"}"}</p>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            <span className="text-[#6272a4]">{"const "}</span>
            <span className="neon-text-green">team</span>
            <span className="text-[#6272a4]">{" = ["}</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Team Member 1 */}
            <div className="terminal-window p-8 backdrop-blur-xl group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 neon-border-cyan rounded-full blur-md opacity-50"></div>
                <img
                  src="/assets/aboutPage/asad.jpg"
                  alt="Muhammad Asad Ullah Turab"
                  className="relative w-24 h-24 rounded-full mx-auto neon-border-cyan"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Muhammad Asad Ullah Turab</h3>
              <p className="text-[#00b4d8] mb-3 font-mono text-sm">{"<CEO & Founder />"}</p>
              <p className="text-[#6272a4] text-sm mb-4">
                Passionate about empowering developers through accessible coding
                education.
              </p>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-[#00b4d8] hover:text-[#00e676] transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#00b4d8] hover:text-[#00e676] transition-colors">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="terminal-window p-8 backdrop-blur-xl group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 neon-border-purple rounded-full blur-md opacity-50"></div>
                <img
                  src="/assets/aboutPage/israr.jpg"
                  alt="Israr Ahmad"
                  className="relative w-24 h-24 rounded-full mx-auto neon-border-purple"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Israr Ahmad</h3>
              <p className="text-[#8b5cf6] mb-3 font-mono text-sm">{"{ CTO }"}</p>
              <p className="text-[#6272a4] text-sm mb-4">
                Leads the technical vision and architecture of our learning
                platform.
              </p>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-[#8b5cf6] hover:text-[#00e676] transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#8b5cf6] hover:text-[#00e676] transition-colors">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="terminal-window p-8 backdrop-blur-xl group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 neon-border-green rounded-full blur-md opacity-50"></div>
                <img
                  src="/assets/aboutPage/saad.jpg"
                  alt="Muhammad Saad"
                  className="relative w-24 h-24 rounded-full mx-auto neon-border-green"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Muhammad Saad</h3>
              <p className="text-[#00e676] mb-3 font-mono text-sm">{"[ Head of Education ]"}</p>
              <p className="text-[#6272a4] text-sm mb-4">
                Designs and curates content to help learners grow from beginner to
                expert.
              </p>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-[#00e676] hover:text-[#00b4d8] transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#00e676] hover:text-[#00b4d8] transition-colors">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <p className="text-center text-[#6272a4] mt-8">{"];"}</p>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00e676] rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="terminal-window p-12 backdrop-blur-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-[#6272a4]">{"// "}</span>
              <span className="neon-text-cyan">Join Us</span>
              <span className="text-white"> on Our </span>
              <span className="neon-text-purple">Mission</span>
            </h2>
            <p className="text-[#6272a4] max-w-2xl mx-auto mb-8 text-base md:text-lg">
              Be part of the LearnCode AI journey. Whether you're looking to share your
              knowledge, learn, or build a community — we welcome you!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/tutorials"
                className="group relative w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] via-[#8b5cf6] to-[#00e676] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-8 py-4 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all duration-300 flex items-center justify-center gap-3">
                  <span className="text-[#00e676]">$</span>
                  <span className="text-[#00b4d8]">start-learning</span>
                  <span className="text-[#6272a4]">--now</span>
                </div>
              </Link>
              <Link
                to="/contact"
                className="group w-full sm:w-auto px-8 py-4 neon-border-purple backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-[#8b5cf6]">{">"}</span>
                <span className="text-white">join_community</span>
                <span className="text-[#6272a4]">()</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
