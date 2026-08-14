import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Video, X, Sparkles, Loader2, Check } from "lucide-react";
import { compressImage } from "../utils/imageCompressor";
import { extractVideoFrames } from "../utils/video";

interface MediaUploaderProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  videoFrames: string[];
  setVideoFrames: React.Dispatch<React.SetStateAction<string[]>>;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  images,
  setImages,
  videoFrames,
  setVideoFrames,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    try {
      const newImages: string[] = [];
      const newVideoFrames: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const compressed = await compressImage(file, 1200, 1200, 0.85);
          newImages.push(compressed);
        } else if (file.type.startsWith("video/")) {
          const extracted = await extractVideoFrames(file, 3);
          newVideoFrames.push(...extracted);
        }
      }

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }
      if (newVideoFrames.length > 0) {
        setVideoFrames((prev) => [...prev, ...newVideoFrames]);
      }
    } catch (err) {
      console.error("Error processing files", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideoFrame = (index: number) => {
    setVideoFrames((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Upload Skin Photos / Video
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload clear close-up photos or a short video clip of the affected skin area.
        </p>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center text-center cursor-pointer ${
          dragOver
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-teal-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-3 py-4 text-teal-600 dark:text-teal-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-semibold">
              Compressing photos & extracting video keyframes...
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Drag & Drop or <span className="text-teal-600 dark:text-teal-400 underline">Browse files</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PNG, JPG, WEBP photos and MP4, WEBM short videos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Previews */}
      {(images.length > 0 || videoFrames.length > 0) && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Uploaded Media ({images.length + videoFrames.length} items)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Images */}
            {images.map((imgUrl, index) => (
              <div
                key={`img-${index}`}
                className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 aspect-square shadow-sm"
              >
                <img
                  src={imgUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-white font-medium">
                  Photo #{index + 1}
                </span>
              </div>
            ))}

            {/* Video Extracted Keyframes */}
            {videoFrames.map((frameUrl, index) => (
              <div
                key={`vid-${index}`}
                className="relative group rounded-xl overflow-hidden border border-cyan-500/50 bg-slate-900 aspect-square shadow-sm"
              >
                <img
                  src={frameUrl}
                  alt={`Video Frame ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeVideoFrame(index)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-cyan-900/90 text-cyan-200 text-[10px] font-bold flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Frame #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
