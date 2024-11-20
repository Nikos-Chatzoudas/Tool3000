"use client";
import React, { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileUp, Cog, Maximize2, Coffee } from "lucide-react";
import heic2any from "heic2any";

const Tool3000: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("Drop files here or click to upload");
  const [outputFormat, setOutputFormat] = useState<string>("");
  const [dimensions, setDimensions] = useState<{
    width: string;
    height: string;
  }>({ width: "", height: "" });
  const [preserveAspect, setPreserveAspect] = useState<boolean>(true);
  const [disableField, setDisableField] = useState<"width" | "height" | null>(
    null
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const conversionOptions = ["jpg", "png", "webp", "gif"];

  const handleDimensionChange =
    (dimension: "width" | "height") => (e: ChangeEvent<HTMLInputElement>) => {
      setDimensions((prev) => ({ ...prev, [dimension]: e.target.value }));

      if (preserveAspect) {
        setDisableField(dimension === "width" ? "height" : "width");
      } else {
        setDisableField(null);
      }
    };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const processHeicFile = async (file: File): Promise<Blob> => {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92,
      });

      return Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    } catch (error) {
      console.error("Error converting HEIC file:", error);
      throw new Error("Failed to convert HEIC file");
    }
  };

  const handleFiles = async (files: File[]) => {
    const processedFiles: File[] = [];
    setStatus("Processing files...");

    for (const file of files) {
      try {
        if (
          file.type === "image/heic" ||
          file.name.toLowerCase().endsWith(".heic")
        ) {
          const convertedBlob = await processHeicFile(file);
          const convertedFile = new File(
            [convertedBlob],
            file.name.replace(/\.heic$/i, ".jpg"),
            { type: "image/jpeg" }
          );
          processedFiles.push(convertedFile);
        } else {
          processedFiles.push(file);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        setStatus(`Error processing ${file.name}. Please try again.`);
        return;
      }
    }

    setUploadedFiles(processedFiles);
    setStatus(`${processedFiles.length} file(s) ready for conversion`);
  };

  const handleConvert = async () => {
    if (!outputFormat || uploadedFiles.length === 0) {
      setStatus("Please select a format and upload files first");
      return;
    }

    setStatus("Converting files...");

    for (const file of uploadedFiles) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) return;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) return;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const convertedURL = canvas.toDataURL(`image/${outputFormat}`);
          downloadFile(convertedURL, file.name);
        };
        img.src = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }

    setStatus("Conversion complete!");
  };

  const handleResize = async () => {
    if (uploadedFiles.length === 0) {
      setStatus("Please upload files first");
      return;
    }

    setStatus("Resizing files...");

    for (const file of uploadedFiles) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) return;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) return;

          let { width, height } = dimensions;

          if (preserveAspect) {
            const aspectRatio = img.width / img.height;
            if (width && !height) {
              height = String(Math.round(parseInt(width) / aspectRatio));
            } else if (!width && height) {
              width = String(Math.round(parseInt(height) * aspectRatio));
            }
          }

          canvas.width = parseInt(width) || img.width;
          canvas.height = parseInt(height) || img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const resizedURL = canvas.toDataURL(`image/${outputFormat || "png"}`);
          downloadFile(resizedURL, file.name);
        };
        img.src = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }

    setStatus("Resize complete!");
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.[^/.]+$/, `.${outputFormat || "png"}`);
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* header */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
            Tool 3000
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Supports JPG, PNG, WEBP, GIF, and HEIC files
          </p>
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
            accept="image/*,.heic"
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* File Converter Section */}
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg shadow-md border border-zinc-800 h-full">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-zinc-50">
              File Converter
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

          {/* Image Resizer Section */}
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
                disabled={preserveAspect && disableField === "width"}
                className={`w-full p-2 sm:p-3 rounded text-zinc-50 border border-zinc-700 
                  focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm sm:text-base 
                  bg-zinc-800 ${
                    preserveAspect && disableField === "width"
                      ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      : "bg-zinc-800"
                  }`}
              />
              <input
                type="number"
                placeholder="Height"
                value={dimensions.height}
                onChange={handleDimensionChange("height")}
                disabled={preserveAspect && disableField === "height"}
                className={`w-full p-2 sm:p-3 rounded text-zinc-50 border border-zinc-700 
                  focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm sm:text-base 
                  bg-zinc-800 ${
                    preserveAspect && disableField === "height"
                      ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      : "bg-zinc-800"
                  }`}
              />

              <label className="flex items-center gap-2 text-zinc-300 text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={preserveAspect}
                  onChange={(e) => {
                    setPreserveAspect(e.target.checked);
                    if (!e.target.checked) setDisableField(null);
                  }}
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

export default Tool3000;
