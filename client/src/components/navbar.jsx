import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-green-700 font-bold text-xl"
          >
            <i className="fa-solid fa-tractor"></i>
            <span>Farmify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="relative text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-green-600 after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="relative text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-green-600 after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
            >
              About
            </Link>
            <Link
              to="/weatherreport"
              className="relative text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-green-600 after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
            >
              Weather Report
            </Link>
            <Link
              to="/blog"
              className="relative text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-green-600 after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
            >
              Blog
            </Link>
            <Link
              to="/contact"
              className="relative text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-green-600 after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
            >
              Contact
            </Link>

            {isLoggedIn && (
              <>
                <Link
                  to="/profile"
                  className="relative text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-green-600 after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
                >
                  Profile
                </Link>
                <Link
                  to="/crop-recommendations"
                  className="relative text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-green-600 after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
                >
                  Crop Recommendations
                </Link>
              </>
            )}
          </div>

          {/* Profile Icon and Login/Logout Button */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && (
              <Link
                to="/profile"
                className="text-green-600 hover:text-green-800 text-2xl transition-colors duration-300 transform hover:scale-110"
              >
                <i className="fa-solid fa-user-circle"></i>
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 hover:shadow-md transform hover:scale-105"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 hover:shadow-md transform hover:scale-105"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden ${isOpen ? "block" : "hidden"} animate-fadeIn`}
      >
        <div className="px-2 pt-2 pb-4 space-y-1 bg-white border-t">
          <Link
            to="/"
            className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            About
          </Link>
          <Link
            to="/weatherreport"
            className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Weather Report
          </Link>
          <Link
            to="/blog"
            className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Contact
          </Link>

          {isLoggedIn && (
            <>
              <Link
                to="/profile"
                className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded transition-colors duration-300"
                onClick={toggleMenu}
              >
                Profile
              </Link>
              <Link
                to="/crop-recommendations"
                className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded transition-colors duration-300"
                onClick={toggleMenu}
              >
                Crop Recommendations
              </Link>
            </>
          )}

          <div className="pt-2 px-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  toggleMenu();
                }}
                className="w-full px-4 py-2 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
