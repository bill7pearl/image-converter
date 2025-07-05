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

const formatOptions = [
  { 
    value: "webp", 
    label: "WebP (Best for web)", 
    color: "green", 
    description: "Modern format with excellent compression and quality",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    value: "jpeg", 
    label: "JPEG", 
    color: "blue", 
    description: "Widely supported, good for photographs",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    value: "png", 
    label: "PNG", 
    color: "purple", 
    description: "Lossless format, perfect for graphics and transparency",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    value: "avif", 
    label: "AVIF", 
    color: "pink", 
    description: "Next-generation format with superior compression",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    value: "svg", 
    label: "SVG (no conversion, passthrough)", 
    color: "yellow", 
    description: "Vector format, no conversion applied",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  }
];

export default function ImageConverter() {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [outputFormat, setOutputFormat] = useState("webp");
  const [compression, setCompression] = useState(80);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const totalFiles = acceptedFiles.length;
    let processedFiles = 0;
    
    const processFiles = () => {
      const batch = acceptedFiles.slice(processedFiles, processedFiles + 1);
      
      batch.forEach((file) => {
        const mapped = {
          file,
          preview: URL.createObjectURL(file),
        };
        setFiles((curr) => [...curr, mapped]);
        processedFiles++;
        
        // Update progress
        const progress = Math.round((processedFiles / totalFiles) * 100);
        setUploadProgress(progress);
        
        if (processedFiles < totalFiles) {
          // Process next batch with a small delay to show progress
          setTimeout(processFiles, 100);
        } else {
          // Upload complete
          setTimeout(() => {
            setUploading(false);
            setUploadProgress(0);
            setConverted([]);
            setProgress([]);
            toast.success(`${totalFiles} image${totalFiles > 1 ? 's' : ''} uploaded successfully!`);
          }, 200);
        }
      });
    };
    
    processFiles();
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

  const handleFormatChange = (format: string) => {
    setOutputFormat(format);
    setConverted([]);
    setProgress([]);
    setIsDropdownOpen(false);
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

  const selectedFormat = formatOptions.find(option => option.value === outputFormat);

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <section className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-8 hover:border-zinc-600 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        
        <div {...getRootProps()} className={`relative cursor-pointer transition-all duration-300 ${isDragActive ? 'scale-105' : 'hover:scale-[1.02]'}`}>
          <input {...getInputProps()} />
          
          <div className="text-center">
            {/* Upload Icon */}
            <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
              {uploading ? (
                <div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              {uploading ? 'Uploading...' : isDragActive ? 'Drop images here' : 'Upload Images'}
            </h3>
            <p className="text-gray-400 mb-4">
              {uploading ? 'Processing your images...' : 'Drag & drop images here, or click to browse'}
            </p>
            
            {/* Upload Progress Bar */}
            {uploading && (
              <div className="mb-4">
                <div className="w-full h-3 bg-zinc-700 rounded-full relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-300 font-bold px-1">
                    {uploadProgress}%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Uploading {uploadProgress}% complete</p>
              </div>
            )}
            
            <button 
              className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </button>
          </div>
        </div>
      </section>

      {/* Image Previews */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Uploaded Images ({files.length})</h3>
            <button 
              onClick={clearAll} 
              className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400" 
              aria-label="Clear all images"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {files.map((f, idx) => (
              <div
                key={idx}
                className="group relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-3 hover:border-zinc-600 transition-all duration-300 transform hover:scale-105"
              >
                <button
                  className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500/30 rounded-full p-1 text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  aria-label={`Remove image ${f.file.name}`}
                  onClick={() => {
                    setFiles(files.filter((_, i) => i !== idx));
                    setProgress(progress.filter((_, i) => i !== idx));
                    toast.info('Image removed');
                  }}
                  tabIndex={0}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="w-full h-20 object-cover rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                  tabIndex={0}
                />
                
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-300 truncate block" title={f.file.name}>
                    {f.file.name}
                  </span>
                  <span className="text-[10px] text-gray-400">{(f.file.size/1024).toFixed(1)} KB</span>
                </div>
                
                {/* Progress bar for conversion */}
                {progress[idx] === 100 ? (
                  <div className="w-full flex justify-center items-center mt-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ) : (processing || progress[idx] > 0) ? (
                  <div className="w-full h-3 bg-zinc-700 rounded-full mt-2 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress[idx] || 0}%` }}
                    />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-bold px-1">
                      {progress[idx] ? `${Math.round(progress[idx])}%` : '0%'}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Format Selection */}
      <section className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all duration-300 overflow-visible z-10">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Select Output Format
          </h2>
          
          {/* Custom Dropdown */}
          <div className="relative overflow-visible">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={processing}
              className="w-full px-4 py-3 bg-zinc-800/50 backdrop-blur-sm border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-zinc-500 flex items-center justify-between cursor-pointer"
              aria-label="Select output format"
            >
              <div className="flex items-center gap-3">
                {/* Format Icon */}
                {outputFormat === "webp" && (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {outputFormat === "jpeg" && (
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {outputFormat === "png" && (
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {outputFormat === "avif" && (
                  <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {outputFormat === "svg" && (
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                )}
                <span>{selectedFormat?.label}</span>
              </div>
              <div className={`w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 right-0 mt-2 bg-zinc-800/95 backdrop-blur-sm border border-zinc-600 rounded-lg shadow-2xl overflow-hidden z-[999999] transition-all duration-300 ease-out ${
              isDropdownOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}>
              {formatOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleFormatChange(option.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-${option.color}-500/20 hover:to-purple-500/20 transition-all duration-300 flex items-center gap-3 group ${
                    outputFormat === option.value ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    transform: isDropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
                    opacity: isDropdownOpen ? 1 : 0,
                    transition: `all 0.3s ease ${index * 50}ms`
                  }}
                >
                  {/* Format Icon */}
                  {option.value === "webp" && (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {option.value === "jpeg" && (
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {option.value === "png" && (
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {option.value === "avif" && (
                    <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {option.value === "svg" && (
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  )}
                  <span className="text-gray-200 group-hover:text-white transition-colors duration-300">{option.label}</span>
                  {outputFormat === option.value && (
                    <svg className="w-4 h-4 text-purple-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Format description */}
          <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <div className="text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 bg-${selectedFormat?.color}-400 rounded-full animate-pulse`}></span>
                <strong>{selectedFormat?.value.toUpperCase()}:</strong> {selectedFormat?.description}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Compression Slider */}
      <section className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 via-yellow-500/10 to-orange-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Compression Level
          </h2>
          <div className="space-y-3">
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={compression} 
              onChange={handleCompressionChange} 
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-green-500 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg" 
              disabled={processing} 
              aria-label="Compression level" 
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>High Quality</span>
              <span className="font-semibold text-green-400">{compression}%</span>
              <span>Small Size</span>
            </div>
          </div>
        </div>
      </section>

      {/* Convert Button */}
      <section className="flex justify-center">
        <button
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          onClick={convertAll}
          disabled={files.length === 0 || processing}
          aria-label="Convert all images"
        >
          <span className="relative z-10 flex items-center gap-2">
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Converting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Convert All Images
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </section>

      {/* Converted Images Preview */}
      {converted.length > 0 && (
        <section className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all duration-300">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Converted Images
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {converted.map((f, idx) => (
                <div
                  key={idx}
                  className="group relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-3 hover:border-zinc-600 transition-all duration-300 transform hover:scale-105"
                >
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-full h-20 object-cover rounded-lg shadow-lg cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
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
                  
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-300 truncate block" title={f.name}>
                      {f.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {((f.compressedSize || 0) / 1024).toFixed(1)} KB
                      {f.compressedSize && f.originalSize ? (
                        <>
                          {" "}
                          <span className="text-green-400 font-bold">
                            ({Math.round(100 - (f.compressedSize / f.originalSize) * 100)}% smaller)
                          </span>
                        </>
                      ) : null}
                    </span>
                  </div>
                  
                  {/* Progress bar for conversion */}
                  {progress[idx] === 100 ? (
                    <div className="w-full flex justify-center items-center mt-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (processing || progress[idx] > 0) ? (
                    <div className="w-full h-3 bg-zinc-700 rounded-full mt-2 relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress[idx] || 0}%` }}
                      />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-bold px-1">
                        {progress[idx] ? `${Math.round(progress[idx])}%` : '0%'}
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Download Section */}
      <section className="flex justify-center">
        <button
          className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          onClick={downloadZip}
          disabled={converted.length === 0}
          aria-label="Download all as ZIP"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download ZIP
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </section>
    </div>
  );
}