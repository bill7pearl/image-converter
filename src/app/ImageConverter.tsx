"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { toast } from 'react-toastify';

/* eslint-disable @next/next/no-img-element */

interface PreviewFile {
  file: File;
  preview: string;
}

interface ConvertedFile {
  name: string;
  blob: Blob;
  url: string;
  originalSize: number;
  compressedSize: number;
}

const formatMime: Record<string, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
  svg: "image/svg+xml", // SVG conversion is not supported by canvas, will fallback
};

export default function ImageConverter() {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [outputFormat, setOutputFormat] = useState("webp");
  const [compression, setCompression] = useState(80);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mapped = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((curr) => [...curr, ...mapped]);
    setConverted([]);
    setProgress([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
  });

  // Clean up previews on unmount
  React.useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.preview));
  }, [files]);

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutputFormat(e.target.value);
    setConverted([]);
    setProgress([]);
  };

  const handleCompressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompression(Number(e.target.value));
    setConverted([]);
    setProgress([]);
  };

  const clearAll = () => {
    setFiles([]);
    setConverted([]);
    setProgress([]);
    toast.info('Cleared all images');
  };

  const convertAll = async () => {
    setProcessing(true);
    setProgress(Array(files.length).fill(0));
    const results: ConvertedFile[] = [];
    let errorOccurred = false;
    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];
      let convertedBlob: Blob | null = null;
      const outName = file.name.replace(/\.[^.]+$/, "." + outputFormat);
      const originalSize = file.size;
      let compressedSize = 0;
      try {
        if (outputFormat === "svg") {
          // SVG conversion not supported, just pass through
          convertedBlob = file;
        } else {
          const options = {
            maxSizeMB: 5,
            maxWidthOrHeight: 4096,
            initialQuality: compression / 100,
            fileType: formatMime[outputFormat],
            useWebWorker: true,
            onProgress: (p: number) => {
              setProgress((curr) => {
                const next = [...curr];
                next[i] = p;
                return next;
              });
            },
          };
          convertedBlob = await imageCompression(file, options);
        }
        if (!convertedBlob) throw new Error("Conversion failed");
        compressedSize = convertedBlob.size;
        results.push({
          name: outName,
          blob: convertedBlob,
          url: URL.createObjectURL(convertedBlob),
          originalSize,
          compressedSize,
        });
      } catch {
        errorOccurred = true;
        results.push({
          name: outName,
          blob: file,
          url: URL.createObjectURL(file),
          originalSize,
          compressedSize: originalSize,
        });
      }
    }
    setConverted(results);
    setProgress(Array(files.length).fill(100));
    setProcessing(false);
    if (errorOccurred) {
      toast.error('Some images failed to convert.');
    } else {
      toast.success('All images converted successfully!');
    }
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    converted.forEach((f) => {
      zip.file(f.name, f.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-images.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('ZIP downloaded!');
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <section className="border rounded-lg p-4 bg-zinc-900 border-zinc-700">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">1. Upload Images</h2>
          {files.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-500 hover:underline hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 rounded transition" aria-label="Clear all images">Clear All</button>
          )}
        </div>
        <div
          {...getRootProps()}
          className={`h-32 flex items-center justify-center border-2 border-dashed rounded-lg bg-zinc-800 transition cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400 active:scale-105 ${
            isDragActive ? "border-blue-600 bg-zinc-700 shadow-lg scale-105" : "border-zinc-600 text-gray-400"
          }`}
          tabIndex={0}
          aria-label="Image upload dropzone"
        >
          <input {...getInputProps()} aria-label="Upload images" />
          {isDragActive ? (
            <span className="font-semibold text-blue-700">Drop the images here ...</span>
          ) : (
            <span>Drag & drop or click to upload images</span>
          )}
        </div>
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-6 text-gray-400 animate-fadein" aria-live="polite">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 16.5V14a5 5 0 0110 0v2.5M12 11v.01" /></svg>
            <span className="text-sm">No images uploaded yet.<br />Start by dragging or clicking above.</span>
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {files.map((f, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center transition-all duration-500 ease-in-out opacity-0 scale-95 animate-fadein relative"
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'forwards' }}
              >
                <button
                  className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 z-10 transition"
                  aria-label={`Remove image ${f.file.name}`}
                  onClick={() => {
                    setFiles(files.filter((_, i) => i !== idx));
                    setProgress(progress.filter((_, i) => i !== idx));
                    toast.info('Image removed');
                  }}
                  tabIndex={0}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="w-20 h-20 object-cover rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  tabIndex={0}
                />
                <span className="text-xs mt-1 truncate w-20" title={f.file.name}>
                  {f.file.name}
                </span>
                <span className="text-[10px] text-gray-400">{(f.file.size/1024).toFixed(1)} KB</span>
                {/* Progress bar for conversion */}
                {progress[idx] === 100 ? (
                  <div className="w-full flex justify-center items-center mt-1">
                    <svg className="w-5 h-5 text-green-500 animate-pop" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                ) : (processing || progress[idx] > 0) ? (
                  <div className="w-full h-1 bg-gray-200 rounded mt-1 relative">
                    <div
                      className="h-1 bg-blue-500 rounded transition-all"
                      style={{ width: `${progress[idx] || 0}%` }}
                    />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-blue-700 font-bold">{progress[idx] ? `${Math.round(progress[idx])}%` : '0%'}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Format Selection */}
      <section className="border rounded-lg p-4 bg-zinc-900 border-zinc-700">
        <h2 className="font-semibold mb-2">2. Select Output Format</h2>
        <select className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-zinc-800 border-zinc-600 text-gray-200" value={outputFormat} onChange={handleFormatChange} disabled={processing} aria-label="Select output format">
          <option value="webp">WebP (Best for web)</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="avif">AVIF</option>
          <option value="svg">SVG (no conversion, passthrough)</option>
        </select>
      </section>

      {/* Compression Slider */}
      <section className="border rounded-lg p-4 bg-zinc-900 border-zinc-700">
        <h2 className="font-semibold mb-2">3. Compression Level</h2>
        <input type="range" min={0} max={100} value={compression} onChange={handleCompressionChange} className="w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-zinc-800" disabled={processing} aria-label="Compression level" />
        <div className="text-xs text-gray-400 mt-1">{compression} – Adjust for size vs. quality</div>
      </section>

      {/* Convert Button */}
      <section className="flex justify-center">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
          onClick={convertAll}
          disabled={files.length === 0 || processing}
          aria-label="Convert all images"
        >
          {processing ? "Converting..." : "Convert All"}
        </button>
      </section>

      {/* Converted Images Preview */}
      {converted.length > 0 && (
        <section className="border rounded-lg p-4 bg-zinc-900 border-zinc-700">
          <h2 className="font-semibold mb-2">4. Converted Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {converted.map((f, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center transition-all duration-500 ease-in-out opacity-0 scale-95 animate-fadein"
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'forwards' }}
              >
                <img
                  src={f.url}
                  alt={f.name}
                  className="w-20 h-20 object-cover rounded shadow cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform transition"
                  title="Click to download"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = f.url;
                    a.download = f.name;
                    a.click();
                    toast.success('Image downloaded!');
                  }}
                  tabIndex={0}
                  aria-label={`Download image ${f.name}`}
                />
                <span className="text-xs mt-1 truncate w-20" title={f.name}>
                  {f.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {((f.compressedSize || 0) / 1024).toFixed(1)} KB
                  {f.compressedSize && f.originalSize ? (
                    <>
                      {" "}
                      <span className="text-green-600 font-bold">
                        ({Math.round(100 - (f.compressedSize / f.originalSize) * 100)}% smaller)
                      </span>
                    </>
                  ) : null}
                </span>
                {/* Progress bar for conversion */}
                {progress[idx] === 100 ? (
                  <div className="w-full flex justify-center items-center mt-1">
                    <svg className="w-5 h-5 text-green-500 animate-pop" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                ) : (processing || progress[idx] > 0) ? (
                  <div className="w-full h-1 bg-gray-200 rounded mt-1">
                    <div
                      className="h-1 bg-blue-500 rounded transition-all"
                      style={{ width: `${progress[idx] || 0}%` }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Download Section */}
      <section className="flex justify-center">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition disabled:opacity-50"
          onClick={downloadZip}
          disabled={converted.length === 0}
          aria-label="Download all as ZIP"
        >
          Download ZIP
        </button>
      </section>
    </div>
  );
}