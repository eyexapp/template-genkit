import { describe, it, expect, vi } from 'vitest';

vi.mock('@genkit-ai/google-genai', () => ({
  googleAI: Object.assign(vi.fn(() => ({})), {
    model: vi.fn((name: string) => name),
  }),
}));

vi.mock('@genkit-ai/vertexai', () => ({
  vertexAI: vi.fn(() => ({})),
}));

vi.mock('genkit', async () => {
  const { z } = await import('zod');

  const mockPromptFn = vi.fn().mockResolvedValue({ text: 'Mocked response' });

  const mockGenkit = vi.fn(() => ({
    defineFlow: vi.fn((_config: unknown, handler: (input: unknown) => unknown) => handler),
    definePrompt: vi.fn(() => mockPromptFn),
    defineTool: vi.fn((_config: unknown, handler: (input: unknown) => unknown) => handler),
  }));

  return { genkit: mockGenkit, z };
});

describe('exampleFlow', () => {
  it('should return text from prompt response', async () => {
    const { exampleFlow } = await import('@/flows/example.flow.js');
    const result = await exampleFlow({ prompt: 'Hello' });
    expect(result).toEqual({ text: 'Mocked response' });
  });
});
