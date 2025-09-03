import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  const targetUrl = `https://erpexpress-1.onrender.com/api/${
    Array.isArray(path) ? path.join("/") : path
  }`;

  console.log(`Proxying ${req.method} request to: ${targetUrl}`);
  console.log(`Request body:`, req.body);

  try {
    const headers: Record<string, string> = {};

    // Forward important headers
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.headers["x-requested-with"]) {
      headers["X-Requested-With"] = req.headers["x-requested-with"] as string;
    }
    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"] as string;
    }

    // Prepare request body
    let requestBody: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      requestBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: requestBody,
    });

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      targetUrl,
    });
  }
}
