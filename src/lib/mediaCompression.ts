export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  reduction: string;
  format: string;
  dimensions?: { width: number; height: number };
  duration?: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpeg", "image/jpg": "jpeg", "image/png": "png",
  "image/webp": "webp", "image/gif": "gif", "image/bmp": "bmp",
  "image/tiff": "tiff", "image/avif": "avif", "image/heic": "heic",
  "image/heif": "heic", "image/svg+xml": "svg",
};

const VIDEO_MIME_TYPES: Record<string, string> = {
  "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
  "video/x-msvideo": "avi", "video/x-matroska": "mkv", "video/x-flv": "flv",
  "video/x-ms-wmv": "wmv", "video/mpeg": "mpeg",
};

const AUDIO_MIME_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/aac": "aac",
  "audio/wav": "wav", "audio/flac": "flac", "audio/ogg": "ogg",
  "audio/x-m4a": "m4a", "audio/m4a": "m4a", "audio/x-ms-wma": "wma",
  "audio/aiff": "aiff", "audio/x-aiff": "aiff",
};

export function detectMediaType(file: File): "image" | "video" | "audio" | "unknown" {
  const mime = file.type.toLowerCase();
  if (IMAGE_MIME_TYPES[mime]) return "image";
  if (VIDEO_MIME_TYPES[mime]) return "video";
  if (AUDIO_MIME_TYPES[mime]) return "audio";
  const ext = file.name.split(".").pop()?.toLowerCase();
  const imgExts = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "tif", "avif", "heic", "heif", "svg"];
  const vidExts = ["mp4", "webm", "mov", "avi", "mkv", "flv", "wmv", "mpeg", "mpg", "m4v", "3gp"];
  const audExts = ["mp3", "aac", "wav", "flac", "ogg", "m4a", "wma", "aiff", "au"];
  if (ext && imgExts.includes(ext)) return "image";
  if (ext && vidExts.includes(ext)) return "video";
  if (ext && audExts.includes(ext)) return "audio";
  return "unknown";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function compressImage(file: File, options: CompressionOptions = {}): Promise<CompressionResult> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.92 } = options;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const aspectRatio = width / height;
        if (width > maxWidth) { width = maxWidth; height = width / aspectRatio; }
        if (height > maxHeight) { height = maxHeight; width = height * aspectRatio; }
        width = Math.round(width); height = Math.round(height);
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: true })!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif") {
          ctx.clearRect(0, 0, width, height);
        } else {
          ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        let outputFormat = "image/jpeg";
        if (file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif") {
          outputFormat = file.type;
        } else {
          try {
            const webpTest = canvas.toDataURL("image/webp", quality);
            if (webpTest.startsWith("data:image/webp")) outputFormat = "image/webp";
          } catch {}
        }
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        const compressedSize = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 3 / 4);
        resolve({ dataUrl, originalSize: file.size, compressedSize, reduction: `${((1 - compressedSize / file.size) * 100).toFixed(1)}%`, format: outputFormat.replace("image/", ""), dimensions: { width, height } });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function generateVideoThumbnail(file: File, atTime?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata"; video.playsInline = true; video.muted = true; video.crossOrigin = "anonymous";
    const url = URL.createObjectURL(file);
    video.src = url;
    video.onloadedmetadata = () => { video.currentTime = atTime || Math.min(1, video.duration / 4); };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const aspectRatio = video.videoWidth / video.videoHeight;
      canvas.width = 1280; canvas.height = Math.round(1280 / aspectRatio);
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.88);
      URL.revokeObjectURL(url);
      resolve(thumbnail);
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to generate thumbnail")); };
    setTimeout(() => { URL.revokeObjectURL(url); reject(new Error("Thumbnail timeout")); }, 15000);
  });
}

export interface UniversalMediaResult {
  type: "image" | "video" | "audio" | "unknown";
  file: File;
  result: CompressionResult | null;
  thumbnail: string | null;
  error: string | null;
}

export async function processMediaFile(file: File, options?: CompressionOptions): Promise<UniversalMediaResult> {
  const type = detectMediaType(file);
  const result: UniversalMediaResult = { type, file, result: null, thumbnail: null, error: null };
  try {
    if (type === "image") {
      result.result = await compressImage(file, options);
      result.thumbnail = result.result.dataUrl;
    } else if (type === "video") {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => { reader.onload = (e) => resolve(e.target?.result as string); reader.onerror = reject; reader.readAsDataURL(file); });
      const thumbnail = await generateVideoThumbnail(file);
      const video = document.createElement("video");
      video.preload = "metadata"; video.src = URL.createObjectURL(file);
      const metadata = await new Promise<{ width: number; height: number; duration: number }>((resolve, reject) => {
        video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration }); };
        video.onerror = () => reject(new Error("Video load failed"));
      });
      result.result = { dataUrl, originalSize: file.size, compressedSize: file.size, reduction: "0%", format: "mp4", dimensions: { width: metadata.width, height: metadata.height }, duration: metadata.duration };
      result.thumbnail = thumbnail;
    } else if (type === "audio") {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => { reader.onload = (e) => resolve(e.target?.result as string); reader.onerror = reject; reader.readAsDataURL(file); });
      const audio = document.createElement("audio");
      const aurl = URL.createObjectURL(file); audio.src = aurl;
      const duration = await new Promise<number>((resolve) => { audio.onloadedmetadata = () => { URL.revokeObjectURL(aurl); resolve(audio.duration || 0); }; audio.onerror = () => { URL.revokeObjectURL(aurl); resolve(0); }; });
      const canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 120;
      const ctx = canvas.getContext("2d")!;
      const gradient = ctx.createLinearGradient(0, 0, 640, 0);
      gradient.addColorStop(0, "#d4a853"); gradient.addColorStop(0.5, "#e8c87a"); gradient.addColorStop(1, "#d4a853");
      ctx.fillStyle = gradient;
      for (let i = 0; i < 80; i++) { const height = 20 + Math.random() * 80; const x = i * 6; const y = (120 - height) / 2; ctx.fillRect(x, y, 5, height); }
      ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.moveTo(300, 40); ctx.lineTo(340, 60); ctx.lineTo(300, 80); ctx.closePath(); ctx.fill();
      result.result = { dataUrl, originalSize: file.size, compressedSize: file.size, reduction: "0%", format: "mp3", duration };
      result.thumbnail = canvas.toDataURL("image/png", 0.9);
    } else {
      result.error = `Unsupported file type: ${file.type || file.name}`;
    }
  } catch (err: any) {
    result.error = err.message || "Processing failed";
  }
  return result;
}

export async function processMediaFiles(files: File[], options?: CompressionOptions): Promise<UniversalMediaResult[]> {
  const results: UniversalMediaResult[] = [];
  for (const file of files) {
    const result = await processMediaFile(file, options);
    results.push(result);
  }
  return results;
}

export function calculateTotalSavings(results: UniversalMediaResult[]) {
  let originalTotal = 0, compressedTotal = 0, imageCount = 0, videoCount = 0, audioCount = 0, failedCount = 0;
  for (const r of results) {
    if (r.error || !r.result) { failedCount++; continue; }
    originalTotal += r.result.originalSize; compressedTotal += r.result.compressedSize;
    if (r.type === "image") imageCount++; else if (r.type === "video") videoCount++; else if (r.type === "audio") audioCount++;
  }
  const saved = originalTotal > 0 ? `${(((originalTotal - compressedTotal) / originalTotal) * 100).toFixed(1)}%` : "0%";
  return { originalTotal, compressedTotal, saved, imageCount, videoCount, audioCount, failedCount };
}