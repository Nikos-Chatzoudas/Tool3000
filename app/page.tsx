"use client";
import React from "react";
import { FileUp, Cog, Maximize2, Copy, Coffee } from "lucide-react";

const tool3000 = () => {
  const fileInputRef = React.useRef(null);
  const [status, setStatus] = React.useState(
    "Drop files here or click to upload"
  );
  const [outputFormat, setOutputFormat] = React.useState("");
  const [dimensions, setDimensions] = React.useState({ width: "", height: "" });
  const [preserveAspect, setPreserveAspect] = React.useState(true);
  const [extractedText, setExtractedText] = React.useState("");

  const conversionOptions = ["jpg", "png", "webp", "gif"];

  const handleDimensionChange = (dimension) => (e) => {
    setDimensions((prev) => ({ ...prev, [dimension]: e.target.value }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
  };

  const handleFiles = (files) => {};

  const handleConvert = () => {};

  const handleResize = () => {};

  const handleExtractText = () => {};

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* header */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
            Tool 3000
          </h1>
        </header>

        {/* drop zone */}
        <div
          className="border-4 border-dashed border-zinc-700 rounded-lg p-4 sm:p-8 text-center cursor-pointer 
            hover:border-zinc-500 transition-colors bg-zinc-900 touch-manipulation"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-zinc-400" />
          <p className="mt-2 text-sm sm:text-base text-zinc-400">{status}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg shadow-md border border-zinc-800 h-full">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-zinc-50">
              Converter
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 sm:p-3 rounded bg-zinc-800 text-zinc-50 border border-zinc-700 
                  focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm sm:text-base"
              >
                <option value="">Select format</option>
                {conversionOptions.map((format) => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
              <button
                onClick={handleConvert}
                className="w-full bg-zinc-800 text-zinc-50 p-2 sm:p-3 rounded flex items-center 
                  justify-center gap-2 hover:bg-zinc-700 transition-colors text-sm sm:text-base"
              >
                <span>Convert</span>
                <Cog className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* resizer Section */}
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg shadow-md border border-zinc-800 h-full">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-zinc-50">
              Image Resizer
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <input
                type="number"
                placeholder="Width"
                value={dimensions.width}
                onChange={handleDimensionChange("width")}
                className="w-full p-2 sm:p-3 rounded bg-zinc-800 text-zinc-50 border border-zinc-700 
                  focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm sm:text-base"
              />
              <input
                type="number"
                placeholder="Height"
                value={dimensions.height}
                onChange={handleDimensionChange("height")}
                className="w-full p-2 sm:p-3 rounded bg-zinc-800 text-zinc-50 border border-zinc-700 
                  focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm sm:text-base"
              />
              <label className="flex items-center gap-2 text-zinc-300 text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={preserveAspect}
                  onChange={(e) => setPreserveAspect(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-zinc-500 focus:ring-zinc-500"
                />
                <span>Preserve Aspect Ratio</span>
              </label>
              <button
                onClick={handleResize}
                className="w-full bg-zinc-800 text-zinc-50 p-2 sm:p-3 rounded flex items-center 
                  justify-center gap-2 hover:bg-zinc-700 transition-colors text-sm sm:text-base"
              >
                <span>Resize</span>
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* footer */}
        <footer className="text-center text-sm sm:text-base text-zinc-400 pt-4 sm:pt-6">
          <a
            href="https://ko-fi.com/chatzoudas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors 
              p-2 rounded-lg hover:bg-zinc-900"
          >
            <Coffee className="h-4 w-4" />
            Support me
          </a>
        </footer>
      </div>
    </div>
  );
};

export default tool3000;
