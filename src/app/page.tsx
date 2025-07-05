// Remove: import Image from "next/image";
import ImageConverter from './ImageConverter';

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center px-2">
      <section className="w-full max-w-3xl text-center mt-12 mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">Convert & Compress Images Instantly</h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6">Bulk upload, convert, and compress images right in your browser. Fast, private, and free. No server upload required.</p>
        <a href="#features" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition">See Features ↓</a>
      </section>
      <section className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-12">
        <ImageConverter />
      </section>
      <section id="features" className="w-full max-w-3xl mb-20">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="grid sm:grid-cols-2 gap-4 text-left text-gray-700 dark:text-gray-200">
          <li>✅ Drag-and-drop or click-to-upload interface</li>
          <li>✅ Bulk upload and batch processing</li>
          <li>✅ Format conversion: WebP, PNG, JPEG, AVIF, SVG</li>
          <li>✅ Adjustable compression slider</li>
          <li>✅ Download all as ZIP or individually</li>
          <li>✅ Progress bars and instant previews</li>
          <li>✅ 100% client-side, privacy-first</li>
          <li>✅ Light & dark mode, mobile-friendly</li>
        </ul>
      </section>
    </main>
  );
}
