export interface VisualAIGenerationResponse {
  success: boolean;
  configured: boolean;
  status: 'SUCCESS' | 'VISUAL_AI_NOT_CONFIGURED' | 'VISUAL_AI_ACCESS_DISABLED' | 'RATE_LIMIT_EXCEEDED' | 'GENERATION_FAILED';
  imageUrl?: string;
  message?: string;
}

export const visualAIAdapter = {
  async checkVisualAIAvailability(): Promise<{ configured: boolean; authorized: boolean; status: string; message: string }> {
    try {
      const response = await fetch('/api/manuscript/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });

      if (response.status === 403) {
        return {
          configured: true,
          authorized: false,
          status: 'VISUAL_AI_ACCESS_DISABLED',
          message: 'Visual AI generation is disabled for public access without server authorization.',
        };
      }

      if (response.status === 503) {
        return {
          configured: false,
          authorized: false,
          status: 'VISUAL_AI_NOT_CONFIGURED',
          message: 'GEMINI_API_KEY is not configured in server secrets. Vector editor & upload tools remain active.',
        };
      }

      return {
        configured: true,
        authorized: true,
        status: 'AUTHORIZED',
        message: 'Visual AI service authorized.',
      };
    } catch {
      return {
        configured: false,
        authorized: false,
        status: 'VISUAL_AI_NOT_CONFIGURED',
        message: 'Unable to verify remote visual AI server route. Vector editor & asset uploads available.',
      };
    }
  },
};
