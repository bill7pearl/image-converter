"use client";
import { useEffect, useRef } from 'react';
import ImageConverter from './ImageConverter';

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer for scroll-triggered animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          } else {
            // Optional: Remove animation when element goes out of view
            // entry.target.classList.remove('animate-fade-in-up');
            // entry.target.classList.add('opacity-0', 'translate-y-8');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <main className="w-full flex flex-col items-center px-2 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-float-medium"></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-float-fast"></div>
        <div className="absolute top-60 left-1/2 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-float-slow"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute top-32 left-8 animate-float-slow">
        <div className="text-4xl opacity-20">🖼️</div>
      </div>
      <div className="absolute top-48 right-12 animate-float-medium">
        <div className="text-3xl opacity-20">⚡</div>
      </div>
      <div className="absolute bottom-32 left-16 animate-float-fast">
        <div className="text-2xl opacity-20">🎯</div>
      </div>

      <section className="w-full max-w-4xl text-center mt-16 mb-12 relative z-10 scroll-animate opacity-0 translate-y-8">
        <div className="relative">
          {/* Animated underline effect */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-expand-line"></div>
          
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Free Unlimited
            <br />
            <span className="block mt-2 animate-pulse-slow">Image Converter</span>
          </h1>
        </div>
        
        <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
          Convert and compress images instantly. Bulk upload, format conversion, and compression.
          <br />
          <span className="text-blue-400 font-semibold animate-glow">100% free and unlimited.</span>
        </p>
        
        <div>
          <a 
            href="#features" 
            className="group inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 transform relative overflow-hidden"
          >
            <span className="relative z-10">Start Converting Now ↓</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </div>

        {/* Stats section */}
        <div className="mt-12 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 animate-count-up">∞</div>
            <div className="text-sm text-gray-400">Unlimited Conversions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 animate-count-up">5</div>
            <div className="text-sm text-gray-400">Supported Formats</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400 animate-count-up">100%</div>
            <div className="text-sm text-gray-400">Client-Side</div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-3xl bg-zinc-900 rounded-2xl shadow-2xl p-8 mb-16 border border-zinc-700 relative z-10 scroll-animate opacity-0 translate-y-8">
        <ImageConverter />
      </section>

      <section id="features" className="w-full max-w-6xl mb-20 relative z-10 scroll-animate opacity-0 translate-y-8">
        <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Powerful Features
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "📁",
              title: "Drag & Drop Upload",
              description: "Intuitive drag-and-drop interface or click to browse files",
              color: "blue"
            },
            {
              icon: "📦",
              title: "Bulk Processing",
              description: "Upload and convert multiple images simultaneously",
              color: "purple"
            },
            {
              icon: "🔄",
              title: "Format Conversion",
              description: "Convert between WebP, PNG, JPEG, AVIF, and SVG formats",
              color: "green"
            },
            {
              icon: "⚡",
              title: "Smart Compression",
              description: "Adjustable compression slider for optimal file sizes",
              color: "yellow"
            },
            {
              icon: "📊",
              title: "Progress Tracking",
              description: "Real-time progress bars and instant previews",
              color: "pink"
            },
            {
              icon: "💾",
              title: "Batch Download",
              description: "Download all files as ZIP or individually",
              color: "indigo"
            },
            {
              icon: "🔒",
              title: "Privacy First",
              description: "100% client-side processing, your files never leave your device",
              color: "red"
            },
            {
              icon: "📱",
              title: "Mobile Friendly",
              description: "Responsive design that works perfectly on all devices",
              color: "teal"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl scroll-animate opacity-0 translate-y-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  <span className="animate-bounce-slow">{feature.icon}</span>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-gray-200 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
                
                {/* Hover effect line */}
                <div className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 group-hover:w-full transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="w-full max-w-4xl mb-20 relative z-10 scroll-animate opacity-0 translate-y-8">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Get In Touch</h2>
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Let's Connect</h3>
              <p className="text-gray-400 mb-6">Have questions, suggestions, or want to collaborate? We'd love to hear from you!</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400">📧</span>
                </div>
                <div>
                  <div className="font-medium text-gray-200">Email</div>
                  <a href="mailto:hello@imgconverter.com" className="text-blue-400 hover:text-blue-300 transition">hello@imgconverter.com</a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-400">💬</span>
                </div>
                <div>
                  <div className="font-medium text-gray-200">Discord</div>
                  <a href="#" className="text-purple-400 hover:text-purple-300 transition">Join our community</a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <span className="text-pink-400">🐙</span>
                </div>
                <div>
                  <div className="font-medium text-gray-200">GitHub</div>
                  <a href="#" className="text-pink-400 hover:text-pink-300 transition">View source code</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Tell us what's on your mind..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
