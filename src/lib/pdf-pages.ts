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
