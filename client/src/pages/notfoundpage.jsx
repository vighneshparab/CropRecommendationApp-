import { useState, useEffect, useRef } from "react";
import { Leaf, Cloud, ArrowLeft, Sun, Droplets } from "lucide-react";

export default function NotFound() {
  const [falling, setFalling] = useState([]);
  const [sunPosition, setSunPosition] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isRaining, setIsRaining] = useState(false);
  const [raindrops, setRaindrops] = useState([]);
  const [growthStage, setGrowthStage] = useState(0);
  const containerRef = useRef(null);

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Create falling leaves effect with more variety
  useEffect(() => {
    const interval = setInterval(() => {
      if (falling.length < 20) {
        setFalling((prev) => [
          ...prev,
          {
            id: Date.now(),
            left: Math.random() * 100,
            delay: Math.random() * 3,
            size: Math.random() * 0.7 + 0.3,
            rotation: Math.random() * 360,
            duration: Math.random() * 5 + 5,
            wobble: Math.random() * 5 + 2,
            color: Math.random() > 0.7 ? "text-yellow-500" : "text-green-500",
          },
        ]);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [falling]);

  // Move sun in circular motion
  useEffect(() => {
    const timer = setInterval(() => {
      setSunPosition((prev) => (prev + 0.01) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Create rain animation when it's raining
  useEffect(() => {
    if (isRaining) {
      const interval = setInterval(() => {
        if (raindrops.length < 50) {
          setRaindrops((prev) => [
            ...prev,
            {
              id: Date.now(),
              left: Math.random() * 100,
              delay: Math.random(),
              speed: Math.random() * 0.5 + 0.8,
              size: Math.random() * 0.3 + 0.2,
            },
          ]);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setRaindrops([]);
    }
  }, [isRaining, raindrops.length]);

  // Plant growth animation
  useEffect(() => {
    const growTimer = setTimeout(() => {
      if (growthStage < 3) {
        setGrowthStage((prevStage) => prevStage + 1);
      }
    }, 2000);

    return () => clearTimeout(growTimer);
  }, [growthStage]);

  // Clean up leaves and raindrops that have completed their animation
  useEffect(() => {
    const cleanupTimer = setInterval(() => {
      const now = Date.now();
      setFalling((prev) =>
        prev.filter((leaf) => now - leaf.id < leaf.duration * 1000)
      );
      setRaindrops((prev) => prev.filter((drop) => now - drop.id < 2000));
    }, 5000);

    return () => clearInterval(cleanupTimer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-blue-200 to-green-100 flex flex-col items-center justify-center text-center p-4 overflow-hidden relative"
    >
      {/* Sun */}
      <div
        className="absolute"
        style={{
          top: `${Math.sin(sunPosition) * 20 + 30}%`,
          left: `${Math.cos(sunPosition) * 20 + 75}%`,
          transition: "top 0.5s ease, left 0.5s ease",
          filter: "drop-shadow(0 0 20px rgba(255, 236, 168, 0.8))",
        }}
      >
        <Sun
          size={80}
          className="text-yellow-400"
          onClick={() => setIsRaining(!isRaining)}
        />
      </div>

      {/* Clouds */}
      <div
        className="absolute top-16 left-16 opacity-80"
        style={{
          transform: `translateX(${mousePosition.x * -10}px)`,
          transition: "transform 1s ease-out",
        }}
      >
        <Cloud size={64} className="text-white" />
      </div>

      <div
        className="absolute top-24 right-24 opacity-70"
        style={{
          transform: `translateX(${mousePosition.x * 15}px)`,
          transition: "transform 1.2s ease-out",
        }}
      >
        <Cloud size={48} className="text-white" />
      </div>

      {/* Falling leaves with parallax effect */}
      {falling.map((leaf) => (
        <div
          key={leaf.id}
          className={`absolute ${leaf.color} animate-bounce`}
          style={{
            left: `${leaf.left}%`,
            top: "-30px",
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            opacity: 0.8,
            transform: `scale(${leaf.size}) rotate(${leaf.rotation}deg)`,
            filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.2))",
            zIndex: Math.floor(leaf.size * 20),
            animation: `fall ${leaf.duration}s ease-in-out ${leaf.delay}s forwards, 
                      sway ${leaf.wobble}s ease-in-out infinite alternate`,
          }}
        >
          <Leaf size={28} />
        </div>
      ))}

      {/* Raindrops */}
      {isRaining &&
        raindrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute bg-blue-400 rounded-full opacity-70"
            style={{
              left: `${drop.left}%`,
              top: "-10px",
              width: `${drop.size * 5}px`,
              height: `${drop.size * 15}px`,
              animationDuration: `${1 / drop.speed}s`,
              animationDelay: `${drop.delay}s`,
              animation: `rainfall ${1 / drop.speed}s linear ${
                drop.delay
              }s infinite`,
            }}
          />
        ))}

      {/* Main content with parallax effect */}
      <div
        className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl max-w-md z-20 backdrop-blur-sm"
        style={{
          transform: `translateX(${mousePosition.x * -8}px) translateY(${
            mousePosition.y * -5
          }px)`,
          transition: "transform 0.6s ease-out",
        }}
      >
        <div className="text-8xl font-bold text-red-500 mb-2">404</div>

        {/* Animated growing plant */}
        <div className="flex justify-center my-8 relative h-48">
          <div className="relative">
            {/* Soil */}
            <div className="w-32 h-8 bg-amber-800 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>

            {/* Plant stem growing animation */}
            <div
              className="w-4 bg-green-700 mx-auto absolute left-1/2 bottom-4 transform -translate-x-1/2 transition-all duration-1000 ease-out rounded-full"
              style={{
                height: `${growthStage * 30 + 10}px`,
                opacity: growthStage > 0 ? 1 : 0,
              }}
            ></div>

            {/* Leaves */}
            {growthStage >= 2 && (
              <>
                <Leaf
                  className="text-green-500 absolute transform -translate-x-10 transition-all duration-700 ease-out"
                  style={{
                    bottom: `${30 + growthStage * 10}px`,
                    left: "50%",
                    transform: "translateX(-100%) rotate(-45deg) scale(1.2)",
                    opacity: growthStage >= 2 ? 1 : 0,
                  }}
                  size={32}
                />
                <Leaf
                  className="text-green-500 absolute transform translate-x-10 transition-all duration-700 ease-out"
                  style={{
                    bottom: `${30 + growthStage * 10}px`,
                    left: "50%",
                    transform: "rotate(45deg) scale(1.2)",
                    opacity: growthStage >= 2 ? 1 : 0,
                  }}
                  size={32}
                />
              </>
            )}

            {/* Top leaves */}
            {growthStage >= 3 && (
              <>
                <Leaf
                  className="text-green-600 absolute transition-all duration-1000 ease-out"
                  style={{
                    bottom: `${growthStage * 30 + 10}px`,
                    left: "50%",
                    transform:
                      "translateX(-50%) translateY(-100%) rotate(0deg) scale(1.5)",
                    opacity: growthStage >= 3 ? 1 : 0,
                  }}
                  size={36}
                />
                <div
                  className="absolute w-6 h-6 rounded-full bg-red-500 transition-all duration-700 ease-out"
                  style={{
                    bottom: `${growthStage * 30 + 20}px`,
                    left: "50%",
                    transform: "translateX(-50%) translateY(-100%)",
                    opacity: growthStage >= 3 ? 1 : 0,
                  }}
                ></div>
              </>
            )}

            {/* Water droplets on hover */}
            {hovering && (
              <Droplets
                className="text-blue-400 absolute transition-all duration-300 ease-out animate-bounce"
                style={{
                  bottom: `${growthStage * 30 + 30}px`,
                  left: "50%",
                  transform: "translateX(-50%) translateY(-100%)",
                  filter: "drop-shadow(0 0 5px rgba(96, 165, 250, 0.5))",
                }}
                size={24}
              />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-700 mb-6">
          This crop doesn't seem to be in our database! The page you're looking
          for has either been harvested or was planted in the wrong field.
        </p>

        {/* Interactive return button */}
        <button
          onClick={() => (window.location.href = "/")}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="group relative inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300 overflow-hidden shadow-lg hover:shadow-green-200"
        >
          <div className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:bg-green-600"></div>
          <div className="absolute inset-0 w-0 bg-green-800 transition-all duration-300 ease-out group-hover:w-full"></div>
          <div className="relative flex items-center justify-center gap-2">
            <ArrowLeft
              className="transition-transform duration-300 group-hover:-translate-x-1"
              size={20}
            />
            <span className="font-medium">Return to Crops</span>
          </div>
        </button>
      </div>

      {/* Ground/field */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-green-600"></div>
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 bg-green-500 rounded-t-full"
            style={{
              left: `${i * 5}%`,
              height: `${Math.sin(i * 0.5) * 10 + 30}px`,
              width: "20px",
              transform: `rotate(${Math.sin(i * 0.8) * 10}deg)`,
              filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.1))",
            }}
          ></div>
        ))}
      </div>

      {/* Additional style for animations */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) scale(${Math.random() * 0.5 + 0.5})
              rotate(0deg);
          }
          100% {
            transform: translateY(100vh) scale(${Math.random() * 0.5 + 0.5})
              rotate(${Math.random() * 720}deg);
          }
        }
        @keyframes sway {
          0% {
            transform: translateX(-15px) rotate(-10deg);
          }
          100% {
            transform: translateX(15px) rotate(10deg);
          }
        }
        @keyframes rainfall {
          0% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(110vh);
          }
        }
      `}</style>
    </div>
  );
}
