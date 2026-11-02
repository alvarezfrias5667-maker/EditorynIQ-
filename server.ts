import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Rate Limiter (20 requests per minute per IP)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterMs: Math.max(0, record.resetAt - now) };
  }

  record.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Initialize Gemini Client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length === 0) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server Access Authorization Check for Private/Dev Testing
function isAIAccessAuthorized(req: express.Request): boolean {
  // Option 1: Global override for explicit testing environment
  if (process.env.EDITORYNIQ_ALLOW_PUBLIC_AI === 'true') {
    return true;
  }
  // Option 2: Internal header token for controlled backend authorization
  const token = req.headers['x-editoryniq-internal-token'];
  if (token && process.env.EDITORYNIQ_INTERNAL_DEV_TOKEN && token === process.env.EDITORYNIQ_INTERNAL_DEV_TOKEN) {
    return true;
  }
  return false;
}

// API Route: AI Manuscript Generation & Enhancement
app.post('/api/manuscript/generate', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown_client';
  const limit = checkRateLimit(clientIp);
  if (!limit.allowed) {
    return res.status(429).json({
      success: false,
      configured: true,
      status: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute. Please pause before generating again.`,
    });
  }

  // DEFAULT DENY: Verify server authorization BEFORE consuming any Gemini API resources
  if (!isAIAccessAuthorized(req)) {
    return res.status(403).json({
      success: false,
      configured: true,
      status: 'AI_ACCESS_DISABLED',
      message: 'AI execution is currently disabled for public access without server authorization.',
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      success: false,
      configured: false,
      status: 'AI_PROVIDER_NOT_CONFIGURED',
      message: 'GEMINI_API_KEY is not configured in server secrets. Manual author writing mode active.',
    });
  }

  const { action, chapterTitle, sectionTitle, currentText, instructions, language, category, profile } = req.body || {};

  if (!action || !['continue', 'rewrite', 'expand', 'summarize', 'generate_draft'].includes(action)) {
    return res.status(400).json({
      success: false,
      configured: true,
      status: 'INVALID_INPUT',
      message: 'Invalid or missing "action" parameter.',
    });
  }

  if (language && !['en', 'es'].includes(language)) {
    return res.status(400).json({
      success: false,
      configured: true,
      status: 'INVALID_INPUT',
      message: 'Language must be "en" or "es".',
    });
  }

  if (currentText && typeof currentText === 'string' && currentText.length > 100000) {
    return res.status(400).json({
      success: false,
      configured: true,
      status: 'INVALID_INPUT',
      message: 'Current manuscript text exceeds maximum allowed size of 100,000 characters per request.',
    });
  }

  try {
    const prodLang = language === 'es' ? 'Spanish' : 'English';
    const systemInstruction = `You are the AI Manuscript Engine for EditorynIQ™, an enterprise book production platform.
Your task is to write or refine high-quality, professional prose for books (up to 600 pages).
Strictly follow the requested language (${prodLang}), editorial profile (${profile || 'text-first'}), and genre category (${category || 'non-fiction'}).
Produce well-structured, publication-grade manuscript prose. Do not include meta-commentary, markdown outer code blocks, or conversational filler.`;

    const safeTitle = (chapterTitle || 'Chapter').slice(0, 200);
    const safeSecTitle = (sectionTitle || '').slice(0, 200);
    const safeInstructions = (instructions || '').slice(0, 1000);
    const safeText = (currentText || '').slice(0, 100000);

    let prompt = '';
    switch (action) {
      case 'continue':
        prompt = `Chapter: "${safeTitle}" ${safeSecTitle ? `| Section: "${safeSecTitle}"` : ''}\nExisting Manuscript Draft:\n${safeText}\n\nTask: Continue writing the manuscript prose naturally from where it left off in ${prodLang}. Maintain tone, momentum, and depth.`;
        break;

      case 'rewrite':
        prompt = `Chapter: "${safeTitle}" ${safeSecTitle ? `| Section: "${safeSecTitle}"` : ''}\nInstructions: ${safeInstructions || 'Refine prose style, grammar, flow, and vocabulary.'}\n\nDraft Text:\n${safeText}\n\nTask: Rewrite and enhance the provided draft in ${prodLang}.`;
        break;

      case 'expand':
        prompt = `Chapter: "${safeTitle}" ${safeSecTitle ? `| Section: "${safeSecTitle}"` : ''}\nInstructions: ${safeInstructions || 'Expand depth, add relevant examples, elaborate on key arguments.'}\n\nDraft Text:\n${safeText}\n\nTask: Expand the manuscript prose in ${prodLang}.`;
        break;

      case 'summarize':
        prompt = `Draft Text:\n${safeText}\n\nTask: Provide a concise 2-sentence executive summary and key concept points of this chapter in ${prodLang}.`;
        break;

      default:
        prompt = `Chapter: "${safeTitle}" ${safeSecTitle ? `| Section: "${safeSecTitle}"` : ''}\nInstructions: Write a complete initial draft for this chapter in ${prodLang}. Topic/Objective: ${safeInstructions || 'Comprehensive chapter content'}.`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const generatedText = response.text || '';

    return res.json({
      success: true,
      configured: true,
      status: 'SUCCESS',
      generatedText,
    });
  } catch (err: any) {
    console.error('Server Gemini error:', err?.message || 'Generation failed');
    return res.status(500).json({
      success: false,
      configured: true,
      status: 'AI_GENERATION_FAILED',
      message: 'Failed to generate manuscript content.',
    });
  }
});

// API Route: Translation Studio (EN <-> ES)
app.post('/api/manuscript/translate', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown_client';
  const limit = checkRateLimit(clientIp);
  if (!limit.allowed) {
    return res.status(429).json({
      success: false,
      configured: true,
      status: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute. Please pause before translating again.`,
    });
  }

  // DEFAULT DENY: Verify server authorization BEFORE consuming any Gemini API resources
  if (!isAIAccessAuthorized(req)) {
    return res.status(403).json({
      success: false,
      configured: true,
      status: 'AI_ACCESS_DISABLED',
      message: 'AI execution is currently disabled for public access without server authorization.',
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      success: false,
      configured: false,
      status: 'AI_PROVIDER_NOT_CONFIGURED',
      message: 'GEMINI_API_KEY is not configured in server secrets.',
    });
  }

  const { text, sourceLang, targetLang } = req.body || {};

  if (!['en', 'es'].includes(sourceLang) || !['en', 'es'].includes(targetLang) || sourceLang === targetLang) {
    return res.status(400).json({
      success: false,
      configured: true,
      status: 'INVALID_INPUT',
      message: 'Editorial translation supports English <-> Spanish exclusively.',
    });
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      configured: true,
      status: 'INVALID_INPUT',
      message: 'Source text for translation is required.',
    });
  }

  if (text.length > 100000) {
    return res.status(400).json({
      success: false,
      configured: true,
      status: 'INVALID_INPUT',
      message: 'Translation text exceeds maximum allowed size of 100,000 characters per request.',
    });
  }

  try {
    const fromLabel = sourceLang === 'en' ? 'English' : 'Spanish';
    const toLabel = targetLang === 'en' ? 'English' : 'Spanish';

    const systemInstruction = `You are a professional literary translator for EditorynIQ™. Translate book manuscripts from ${fromLabel} to ${toLabel} with literary nuance, accurate technical terminology, and high fidelity. Preserve original formatting, headers, and chapter structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Source Text (${fromLabel}):\n${text.slice(0, 100000)}\n\nTask: Provide a complete, polished translation into ${toLabel}.`,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({
      success: true,
      configured: true,
      status: 'SUCCESS',
      translatedText: response.text || '',
    });
  } catch (err: any) {
    console.error('Server Gemini translation error:', err?.message || 'Translation failed');
    return res.status(500).json({
      success: false,
      configured: true,
      status: 'TRANSLATION_FAILED',
      message: 'Translation failed.',
    });
  }
});

// Vite Middleware Integration in Dev / Static Serving in Prod
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await vite.transformIndexHtml(url, `<!doctype html><html><head></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.use('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EditorynIQ Server running on http://0.0.0.0:${PORT}`);
});
