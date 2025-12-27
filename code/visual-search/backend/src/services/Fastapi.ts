// this service file is the one which communicates with the external
//serveeer in this case fastapi server

// src/services/fastapi.ts
import axios from "axios";
import FormData from "form-data";

/**
 * Forward an uploaded image (in memory) to the FastAPI /query/ endpoint.
 * - fileBuffer: Buffer of the uploaded file
 * - originalname: filename (used by FastAPI if you want)
 * - mimetype: MIME type (image/jpeg etc)
 * - k: number of neighbors to request
 *
 * Returns the FastAPI JSON response as-is.
 */
export async function forwardToFastAPI(
  fileBuffer: Buffer,
  originalname: string,
  mimetype: string,
  k = 5
): Promise<any> {
  const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

  // Build multipart/form-data body
  const form = new FormData();
  // append buffer as 'file' field (same name FastAPI expects)
  form.append("file", fileBuffer, {
    filename: originalname,
    contentType: mimetype,
  });

  // If FastAPI expects k as query param, append to URL
  const url = `${FASTAPI_URL.replace(/\/$/, "")}/query/?k=${encodeURIComponent(
    String(k)
  )}`;

  // axios must be given headers from form.getHeaders()
  const headers = {
    ...form.getHeaders(),
    // optional: additional headers (auth etc) can be added here
  };

  // Send request. timeout can be adjusted via env var if needed
  const timeoutMs = Number(process.env.FASTAPI_TIMEOUT_MS) || 120000; // 120s default

  const resp = await axios.post(url, form, {
    headers,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: timeoutMs,
  });

  return resp.data;
}
