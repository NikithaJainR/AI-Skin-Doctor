/**
 * Extracts keyframes from an HTML5 video file using Canvas API.
 */
export async function extractVideoFrames(
  videoFile: File,
  frameCount = 3
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    const frames: string[] = [];

    video.onloadedmetadata = async () => {
      canvas.width = Math.min(video.videoWidth || 640, 800);
      canvas.height = Math.min(video.videoHeight || 480, 600);

      const duration = video.duration || 1;
      const timestamps = [];
      for (let i = 1; i <= frameCount; i++) {
        timestamps.push((duration / (frameCount + 1)) * i);
      }

      try {
        for (const time of timestamps) {
          await seekToTime(video, time);
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL("image/jpeg", 0.85));
          }
        }
        URL.revokeObjectURL(objectUrl);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video file for frame extraction."));
    };
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}
