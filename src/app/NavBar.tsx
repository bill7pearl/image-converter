/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";

export default function NavBar() {
  return (
    <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <img src="/favicon.ico" alt="Logo" className="w-8 h-8 rounded" />
        <span className="font-bold text-xl tracking-tight">ImgConverter</span>
      </div>
      <ul className="flex items-center gap-6 text-sm font-medium">
        <li><a href="#features" className="hover:text-blue-400 transition">Features</a></li>
        <li><a href="#pricing" className="hover:text-blue-400 transition">Pricing</a></li>
        <li><a href="#faq" className="hover:text-blue-400 transition">FAQ</a></li>
        <li><a href="#contact" className="hover:text-blue-400 transition">Contact</a></li>
      </ul>
    </nav>
  );
} 