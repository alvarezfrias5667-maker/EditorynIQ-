export interface AIGenerationRequest {
  action: 'continue' | 'rewrite' | 'expand' | 'summarize' | 'generate_draft';
  chapterTitle: string;
  sectionTitle?: string;
  currentText: string;
  instructions?: string;
  language: 'en' | 'es';
  targetPageCount?: number;
  category?: string;
  profile?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  configured: boolean;
  status: 'SUCCESS' | 'AI_PROVIDER_NOT_CONFIGURED' | 'AI_ACCESS_DISABLED' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_INPUT' | 'AI_GENERATION_FAILED';
  generatedText?: string;
  message?: string;
}

export interface AITranslationRequest {
  text: string;
  sourceLang: 'en' | 'es';
  targetLang: 'en' | 'es';
}

export interface AITranslationResponse {
  success: boolean;
  configured: boolean;
  status: 'SUCCESS' | 'AI_PROVIDER_NOT_CONFIGURED' | 'AI_ACCESS_DISABLED' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_INPUT' | 'TRANSLATION_FAILED';
  translatedText?: string;
  message?: string;
}

export const manuscriptAIAdapter = {
  async generateManuscriptProse(req: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const response = await fetch('/api/manuscript/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 403) {
        return {
          success: false,
          configured: true,
          status: 'AI_ACCESS_DISABLED',
          message: data?.message || 'AI execution is currently disabled for public access without server authorization.',
        };
      }

      if (response.status === 503) {
        return {
          success: false,
          configured: false,
          status: 'AI_PROVIDER_NOT_CONFIGURED',
          message: data?.message || 'GEMINI_API_KEY is not configured in server secrets. Manual author writing mode active.',
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          configured: true,
          status: 'RATE_LIMIT_EXCEEDED',
          message: data?.message || 'Rate limit reached. Please pause before generating again.',
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          configured: true,
          status: 'INVALID_INPUT',
          message: data?.message || 'Invalid manuscript generation request.',
        };
      }

      if (!response.ok || !data) {
        return {
          success: false,
          configured: false,
          status: 'AI_GENERATION_FAILED',
          message: data?.message || 'Server returned an error during generation.',
        };
      }

      return data;
    } catch {
      return {
        success: false,
        configured: false,
        status: 'AI_PROVIDER_NOT_CONFIGURED',
        message: 'Unable to connect to AI server route. Manual author writing active.',
      };
    }
  },

  async translateProse(req: AITranslationRequest): Promise<AITranslationResponse> {
    try {
      const response = await fetch('/api/manuscript/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 403) {
        return {
          success: false,
          configured: true,
          status: 'AI_ACCESS_DISABLED',
          message: data?.message || 'AI execution is currently disabled for public access without server authorization.',
        };
      }

      if (response.status === 503) {
        return {
          success: false,
          configured: false,
          status: 'AI_PROVIDER_NOT_CONFIGURED',
          message: data?.message || 'GEMINI_API_KEY is not configured in server secrets.',
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          configured: true,
          status: 'RATE_LIMIT_EXCEEDED',
          message: data?.message || 'Rate limit reached. Please pause before translating again.',
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          configured: true,
          status: 'INVALID_INPUT',
          message: data?.message || 'Invalid translation request payload.',
        };
      }

      if (!response.ok || !data) {
        return {
          success: false,
          configured: false,
          status: 'TRANSLATION_FAILED',
          message: data?.message || 'Server translation error.',
        };
      }

      return data;
    } catch {
      return {
        success: false,
        configured: false,
        status: 'AI_PROVIDER_NOT_CONFIGURED',
        message: 'Translation API route unavailable.',
      };
    }
  },
};
