/**
 * Client-only helpers: render PDF pages to normalised (white-background)
 * PNG images and upload them to the `question-images` storage bucket.
 * Loaded dynamically from the admin PDF import dialog so pdfjs never runs
 * during SSR.
 */
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "question-images";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type PageImage = { page: number; url: string };

async function loadPdfjs() {
  const pdfjs: any = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

/** Stretch levels so the paper background becomes pure white and ink darker. */
function normaliseContrast(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i]! * 0.299 + d[i + 1]! * 0.587 + d[i + 2]! * 0.114) | 0;
    if (lum < min) min = lum;
    if (lum > max) max = lum;
  }
  if (max - min < 8) return;
  const scale = 255 / (max - min);
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = (d[i + c]! - min) * scale;
      d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function luminance(r: number, g: number, b: number) {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function colourDistance(r: number, g: number, b: number, bg: [number, number, number]) {
  const dr = r - bg[0];
  const dg = g - bg[1];
  const db = b - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function median(values: number[]) {
  if (!values.length) return 255;
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)]!;
}

/**
 * Estimates the page/crop background from its border. Exam PDFs often have a
 * pale blue security/watermark layer; the border is normally free of diagram
 * ink and therefore gives a much safer background sample than a global mean.
 */
function estimateBorderBackground(data: Uint8ClampedArray, w: number, h: number): [number, number, number] {
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 80));

  const push = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    // Ignore obviously dark border content when estimating the background.
    if (luminance(r, g, b) > 165) {
      rs.push(r);
      gs.push(g);
      bs.push(b);
    }
  };

  for (let x = 0; x < w; x += step) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y += step) {
    push(0, y);
    push(w - 1, y);
  }

  return [median(rs), median(gs), median(bs)];
}

/**
 * Removes pale paper/security-blue background without turning the diagram
 * itself monochrome. Then trims empty margins around the actual visual ink.
 * Canvas pixel access is used intentionally here; PDF.js renders the PDF to a
 * canvas before the crop is uploaded. citeturn0search4turn0search11
 */
function cleanDiagramCrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const bg = estimateBorderBackground(d, w, h);
  const backgroundTolerance = 48;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]!;
    const g = d[i + 1]!;
    const b = d[i + 2]!;
    const lum = luminance(r, g, b);
    const closeToBg = colourDistance(r, g, b, bg) <= backgroundTolerance;
    const paleBlue = b > r + 7 && b > g + 2 && lum > 178 && Math.max(r, g, b) - Math.min(r, g, b) < 82;

    // Only remove light background-like pixels. Dark diagram strokes and
    // coloured labels remain untouched.
    if (closeToBg && lum > 178) {
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
    } else if (paleBlue && lum > 205 && colourDistance(r, g, b, bg) < 68) {
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);

  // Find the remaining visual content. Keep a small margin so labels and
  // anti-aliased strokes at the edge are never clipped.
  const cleaned = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = cleaned[i]!;
      const g = cleaned[i + 1]!;
      const b = cleaned[i + 2]!;
      const lum = luminance(r, g, b);
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const ink = lum < 242 || chroma > 22;
      if (!ink) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) return;

  const pad = Math.max(8, Math.round(Math.min(w, h) * 0.025));
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  const trimmed = document.createElement("canvas");
  trimmed.width = maxX - minX + 1;
  trimmed.height = maxY - minY + 1;
  const tctx = trimmed.getContext("2d", { willReadFrequently: true });
  if (!tctx) return;
  tctx.fillStyle = "#ffffff";
  tctx.fillRect(0, 0, trimmed.width, trimmed.height);
  tctx.drawImage(ctx.canvas, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);

  ctx.canvas.width = trimmed.width;
  ctx.canvas.height = trimmed.height;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, trimmed.width, trimmed.height);
  ctx.drawImage(trimmed, 0, 0);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Rasmni yaratib bo'lmadi"))), "image/png"),
  );
}

/**
 * Renders every page of the PDF, boosts contrast, uploads each page image and
 * returns long-lived signed URLs. Failures for a single page are skipped.
 */
export async function renderAndUploadPdfPages(
  file: File,
  opts: { maxPages?: number; scale?: number } = {},
): Promise<PageImage[]> {
  const pdfjs = await loadPdfjs();
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const total = Math.min(doc.numPages, opts.maxPages ?? 40);
  const scale = opts.scale ?? 1.6;
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const out: PageImage[] = [];

  for (let p = 1; p <= total; p++) {
    try {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) continue;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, background: "#ffffff" }).promise;
      normaliseContrast(ctx, canvas.width, canvas.height);

      const blob = await canvasToBlob(canvas);
      const path = `pdf/${stamp}/${file.name.replace(/[^\w.-]+/g, "_")}-p${p}.png`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: "image/png",
        upsert: true,
      });
      if (error) throw error;
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, TEN_YEARS);
      if (signed?.signedUrl) out.push({ page: p, url: signed.signedUrl });
    } catch (e) {
      console.error(`PDF sahifa ${p} qayta ishlanmadi`, e);
    }
  }
  return out;
}

/** A single diagram crop request expressed in page percentages (0-100). */
export type CropRequest = {
  key: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Crops ONLY the requested diagram regions out of the PDF pages, removes the
 * pale paper/security background, trims excess margins and uploads each crop.
 * Invalid or full-page-sized regions are skipped (no whole-page fallback).
 */
export async function cropAndUploadRegions(
  file: File,
  requests: CropRequest[],
  opts: { scale?: number } = {},
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (requests.length === 0) return out;

  const pdfjs = await loadPdfjs();
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const scale = opts.scale ?? 2;
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeName = file.name.replace(/[^\w.-]+/g, "_");

  const byPage = new Map<number, CropRequest[]>();
  for (const r of requests) {
    if (r.page < 1 || r.page > doc.numPages) continue;
    byPage.set(r.page, [...(byPage.get(r.page) ?? []), r]);
  }

  for (const [pageNum, reqs] of byPage) {
    let pageCanvas: HTMLCanvasElement;
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      pageCanvas = document.createElement("canvas");
      pageCanvas.width = Math.ceil(viewport.width);
      pageCanvas.height = Math.ceil(viewport.height);
      const ctx = pageCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) continue;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      await page.render({ canvasContext: ctx, viewport, background: "#ffffff" }).promise;
    } catch (e) {
      console.error(`PDF sahifa ${pageNum} render qilinmadi`, e);
      continue;
    }

    for (const r of reqs) {
      try {
        // Small padding so the diagram is not clipped by AI estimation error.
        const pad = 1.5;
        const x0 = Math.max(0, r.x - pad) / 100;
        const y0 = Math.max(0, r.y - pad) / 100;
        const w0 = Math.min(100, r.width + pad * 2) / 100;
        const h0 = Math.min(100, r.height + pad * 2) / 100;

        const sx = Math.round(x0 * pageCanvas.width);
        const sy = Math.round(y0 * pageCanvas.height);
        const sw = Math.min(Math.round(w0 * pageCanvas.width), pageCanvas.width - sx);
        const sh = Math.min(Math.round(h0 * pageCanvas.height), pageCanvas.height - sy);
        if (sw < 24 || sh < 24) continue;

        const crop = document.createElement("canvas");
        crop.width = sw;
        crop.height = sh;
        const cctx = crop.getContext("2d", { willReadFrequently: true });
        if (!cctx) continue;
        cctx.fillStyle = "#ffffff";
        cctx.fillRect(0, 0, sw, sh);
        cctx.drawImage(pageCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
        cleanDiagramCrop(cctx, sw, sh);

        const blob = await canvasToBlob(crop);
        const path = `pdf/${stamp}/${safeName}-p${pageNum}-${r.key.replace(/[^\w-]+/g, "_")}.png`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
          contentType: "image/png",
          upsert: true,
        });
        if (error) throw error;
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(path, TEN_YEARS);
        if (signed?.signedUrl) out[r.key] = signed.signedUrl;
      } catch (e) {
        console.error(`Diagramma kesilmadi (${r.key})`, e);
      }
    }
  }

  return out;
}
