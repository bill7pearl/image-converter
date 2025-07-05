"use client";
import { useEffect, useRef, useState } from 'react';
import ImageConverter from './ImageConverter';
import emailjs from 'emailjs-com';

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>("idle");
  const formRef = useRef<HTMLFormElement>(null);

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

  const features = [
    {
      title: "Bulk Upload",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      description: "Drag and drop multiple images at once for batch processing"
    },
    {
      title: "Format Conversion",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      description: "Convert between WebP, PNG, JPEG, AVIF, and SVG formats"
    },
    {
      title: "Smart Compression",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: "Adjustable compression levels to balance quality and file size"
    },
    {
      title: "Real-time Preview",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      description: "See file size and quality changes before downloading"
    },
    {
      title: "Instant Download",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: "Download individual files or a ZIP archive of all converted images"
    },
    {
      title: "Privacy First",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      description: "All processing happens in your browser - your images never leave your device"
    },
    {
      title: "Mobile Friendly",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: "Optimized for mobile devices with touch-friendly interface"
    }
  ];

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
            href="#converter" 
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

      <section id="converter" className="w-full max-w-3xl bg-zinc-900 rounded-2xl shadow-2xl p-8 mb-16 border border-zinc-700 relative z-10 scroll-animate opacity-0 translate-y-8">
        <ImageConverter />
      </section>

      <section id="features" className="w-full max-w-6xl mb-20 relative z-10 scroll-animate opacity-0 translate-y-8">
        <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Powerful Features
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-center">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl scroll-animate opacity-0 translate-y-8 flex flex-col h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex flex-col h-full items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-gray-200 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors flex-grow">
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
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Let&apos;s Connect</h3>
              <p className="text-gray-400 mb-6">Have questions, suggestions, or want to collaborate? We&apos;d love to hear from you!</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400">📧</span>
                </div>
                <div>
                  <div className="font-medium text-gray-200">Email</div>
                  <a href="billel.chami.dev@gmail.com" className="text-blue-400 hover:text-blue-300 transition">billel.chami.dev@gmail.com</a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  {/* LinkedIn SVG icon */}
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
                </div>
                <div>
                  <div className="font-medium text-gray-200">LinkedIn</div>
                  <a href="https://www.linkedin.com/in/billal-chami/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">Connect on LinkedIn</a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form 
              ref={formRef}
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setFormStatus('sending');
                try {
                  await emailjs.sendForm(
                    'service_iigpica', // <-- Replace with your EmailJS service ID
                    'template_vdktank', // <-- Replace with your EmailJS template ID
                    formRef.current!,
                    'dVdFc5R-_JsiC4aNE' // <-- Replace with your EmailJS public key
                  );
                  setFormStatus('success');
                  formRef.current?.reset();
                } catch {
                  setFormStatus('error');
                }
              }}
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Tell us what's on your mind..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-60"
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {formStatus === 'success' && (
                <div className="mt-2 text-green-400 text-center">Message sent successfully!</div>
              )}
              {formStatus === 'error' && (
                <div className="mt-2 text-red-400 text-center">Failed to send message. Please try again.</div>
              )}
            </form>
          </div>
    </div>
      </section>
    </main>
  );
}
