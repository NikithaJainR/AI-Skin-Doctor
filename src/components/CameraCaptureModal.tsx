import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Camera, Video, RefreshCw, AlertTriangle, Loader2, Square, Circle } from "lucide-react";
import { extractVideoFrames } from "../utils/video";

interface CameraCaptureModalProps {
  isOpen: boolean;
  mode: "photo" | "video";
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
  onVideoRecorded: (extractedFrames: string[]) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  mode,
  onClose,
  onPhotoCaptured,
  onVideoRecorded,
}) => {
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMsg(null);

    const videoConstraints: MediaTrackConstraints = {
      facingMode: facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    };

    try {
      let mediaStream: MediaStream;
      if (mode === "video") {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: true,
          });
        } catch (e) {
          // Fallback to video without audio if audio fails
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });
        }
      } else {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Camera access was denied. You can still upload an existing image or video.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMsg("Camera not available on this device.");
      } else {
        setErrorMsg("Unable to access camera. You can still upload an existing file.");
      }
    }
  }, [facingMode, mode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      setIsRecording(false);
      setRecordedSeconds(0);
      setIsProcessing(false);
      startCamera();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      stopStream();
      onPhotoCaptured(dataUrl);
      onClose();
    }
  };

  const handleStartRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    let options: MediaRecorderOptions = {};
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        options = { mimeType: "video/webm;codecs=vp9" };
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        options = { mimeType: "video/webm" };
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        options = { mimeType: "video/mp4" };
      }
    }

    try {
      const recorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        const mimeType = recorder.mimeType || "video/webm";
        const videoBlob = new Blob(chunksRef.current, { type: mimeType });
        const videoFile = new File([videoBlob], "captured_video.webm", { type: mimeType });

        try {
          const frames = await extractVideoFrames(videoFile, 3);
          if (frames && frames.length > 0) {
            onVideoRecorded(frames);
          }
        } catch (err) {
          console.error("Frame extraction error", err);
        } finally {
          setIsProcessing(false);
          stopStream();
          onClose();
        }
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordedSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordedSeconds((prev) => {
          if (prev >= 14) {
            // Reached max limit (15s)
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRecording(false);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      setErrorMsg("Failed to start video recorder on this device.");
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              {mode === "photo" ? <Camera className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {mode === "photo" ? "Capture Skin Image" : "Record Skin Video"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {mode === "photo"
                  ? "Center the skin concern in clear light"
                  : "Record up to 15 seconds showing affected area"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Preview Area */}
        <div className="relative bg-slate-950 flex-1 min-h-[260px] max-h-[400px] flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center space-y-3 max-w-xs">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-200">{errorMsg}</p>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Close & Use Upload Instead
              </button>
            </div>
          ) : isProcessing ? (
            <div className="p-6 text-center space-y-3 text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-400" />
              <p className="text-xs font-bold">Extracting video frames for AI analysis...</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[380px]"
              />

              {/* Recording Status Bar */}
              {mode === "video" && isRecording && (
                <div className="absolute top-3 left-3 bg-rose-600/90 text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>Recording 00:{recordedSeconds.toString().padStart(2, "0")} / 00:15</span>
                </div>
              )}

              {/* Switch Camera Button Overlay */}
              <button
                type="button"
                onClick={toggleCamera}
                disabled={isRecording}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-teal-600 transition shadow-md border border-white/20 disabled:opacity-50"
                title="Switch Camera (Front/Rear)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Action Controls */}
        {!errorMsg && !isProcessing && (
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>

            {mode === "photo" ? (
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={!stream}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            ) : isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={!stream}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
              >
                <Circle className="w-4 h-4 fill-current text-white" />
                <span>Start Recording</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
