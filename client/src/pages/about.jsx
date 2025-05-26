import React, { useEffect, useRef } from "react";
import "../assets/style/about.css";
import aboutHeroImg from "../assets/images/pexels-srihari-jaddu-1006683-3066025.jpg";
import teamImg1 from "../assets/images/person/pexels-danxavier-1239291.jpg";
import teamImg2 from "../assets/images/person/pexels-olly-712513.jpg";
import teamImg3 from "../assets/images/person/pexels-simon-robben-55958-614810.jpg";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
  FaTwitter,
  FaLinkedinIn,
  FaLeaf,
  FaGlobe,
  FaChartLine,
} from "react-icons/fa";

function About() {
  const sections = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !sections.current.includes(el)) {
      sections.current.push(el);
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        ref={addToRefs}
        className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <img
          src={aboutHeroImg}
          alt="Farmify fields"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-green-400">Our</span> Story
          </h1>
          <p className="text-lg md:text-2xl max-w-2xl leading-relaxed">
            Pioneering sustainable agriculture through innovation and technology
          </p>
          <div className="mt-8 animate-bounce">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={addToRefs} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold">OUR MISSION</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">
              Cultivating the future of farming
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Bridging technology and agriculture
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At Farmify, we're revolutionizing agriculture by empowering
                farmers with AI-driven insights that optimize every aspect of
                their operations. Our platform combines cutting-edge technology
                with deep agricultural expertise to deliver actionable
                recommendations.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We believe sustainable farming isn't just possible—it's
                profitable. By reducing waste, improving yields, and conserving
                resources, we're helping farmers thrive while protecting our
                planet.
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg">
                See how it works
              </button>
            </div>

            <div className="bg-green-50 p-8 rounded-xl border border-green-100">
              <div className="space-y-6">
                {[
                  {
                    icon: <FaLeaf className="text-green-600 text-2xl" />,
                    title: "Sustainability First",
                    desc: "Our solutions prioritize environmental health without compromising productivity.",
                  },
                  {
                    icon: <FaGlobe className="text-green-600 text-2xl" />,
                    title: "Global Impact",
                    desc: "Designed to work across diverse climates and farming practices worldwide.",
                  },
                  {
                    icon: <FaChartLine className="text-green-600 text-2xl" />,
                    title: "Data-Driven Results",
                    desc: "Proven to increase yields by 30% on average while reducing resource use.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-800">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={addToRefs} className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold">OUR TEAM</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">
              The minds behind Farmify
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              A diverse team of agricultural experts, data scientists, and
              technologists united by a common vision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "John Doe",
                role: "CEO & Founder",
                image: teamImg1,
                desc: "20+ years in agricultural technology and sustainable farming practices.",
                social: {
                  twitter: "#",
                  linkedin: "#",
                },
              },
              {
                name: "Jane Smith",
                role: "CTO",
                image: teamImg2,
                desc: "Machine learning specialist focused on agricultural applications.",
                social: {
                  twitter: "#",
                  linkedin: "#",
                },
              },
              {
                name: "Alice Brown",
                role: "COO",
                image: teamImg3,
                desc: "Operations expert with a passion for sustainable business growth.",
                social: {
                  twitter: "#",
                  linkedin: "#",
                },
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {member.name}
                      </h3>
                      <p className="text-green-300">{member.role}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{member.desc}</p>
                  <div className="flex space-x-4">
                    <a
                      href={member.social.twitter}
                      className="text-gray-500 hover:text-green-600 transition-colors duration-300"
                      aria-label={`${member.name}'s Twitter`}
                    >
                      <FaTwitter className="w-5 h-5" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="text-gray-500 hover:text-green-600 transition-colors duration-300"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <FaLinkedinIn className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Join Our Growing Team
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              We're always looking for passionate individuals to help us
              transform agriculture.
            </p>
            <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-medium py-2 px-6 rounded-lg transition-all duration-300">
              View Open Positions
            </button>
          </div>
        </div>
      </section>

      {/* History Timeline Section */}
      <section ref={addToRefs} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold">OUR JOURNEY</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">
              Milestones in agricultural innovation
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 h-full w-1 bg-green-100 transform -translate-x-1/2"></div>

            {/* Timeline items */}
            <div className="space-y-12 md:space-y-0">
              {[
                {
                  year: "2010",
                  title: "Farmify Founded",
                  desc: "Established with a vision to bridge technology and agriculture for sustainable farming solutions.",
                  icon: "🌱",
                },
                {
                  year: "2015",
                  title: "First Platform Launch",
                  desc: "Released our initial AI-powered recommendation system to local farming communities.",
                  icon: "🚀",
                },
                {
                  year: "2018",
                  title: "Global Expansion",
                  desc: "Expanded operations to 10+ countries across North America, Europe, and Asia.",
                  icon: "🌍",
                },
                {
                  year: "2021",
                  title: "1 Million Users",
                  desc: "Reached a major milestone serving over 1 million farmers worldwide.",
                  icon: "👥",
                },
                {
                  year: "2024",
                  title: "Next-Gen Platform",
                  desc: "Launched our most advanced system with real-time analytics and predictive modeling.",
                  icon: "⚡",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`relative md:flex ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center justify-between`}
                >
                  <div
                    className={`md:w-5/12 mb-6 md:mb-0 ${
                      index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                    }`}
                  >
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 h-full">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-green-600 text-white text-2xl font-bold mx-auto z-10">
                    {item.icon}
                  </div>

                  <div
                    className={`md:w-5/12 ${
                      index % 2 === 0 ? "md:pl-8" : "md:pr-8"
                    }`}
                  >
                    <div className="text-3xl font-bold text-green-600 md:text-center">
                      {item.year}
                    </div>
                  </div>

                  {/* Mobile dot */}
                  <div className="md:hidden absolute left-0 top-6 w-4 h-4 rounded-full bg-green-600 transform -translate-x-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={addToRefs}
        className="py-16 md:py-24 bg-green-700 text-white"
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-green-300 font-semibold">BY THE NUMBERS</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Measuring our impact
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                value: "1M+",
                label: "Farmers empowered across 15+ countries",
                desc: "Our technology is helping small and large farms alike",
              },
              {
                value: "30%",
                label: "Average yield increase",
                desc: "While reducing water and fertilizer usage by up to 20%",
              },
              {
                value: "24/7",
                label: "Real-time monitoring",
                desc: "Our systems provide continuous insights and alerts",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-green-600/20 rounded-xl backdrop-blur-sm"
              >
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
                <p className="text-green-100">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-4">
              Ready to join the movement?
            </h3>
            <button className="bg-white text-green-700 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;
