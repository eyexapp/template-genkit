import { describe, it, expect } from 'vitest';
import { ExampleInputSchema, ExampleOutputSchema } from '@/schemas/example.schema.js';

describe('ExampleInputSchema', () => {
  it('should accept valid input', () => {
    const result = ExampleInputSchema.safeParse({ prompt: 'Hello' });
    expect(result.success).toBe(true);
  });

  it('should reject empty prompt', () => {
    const result = ExampleInputSchema.safeParse({ prompt: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing prompt', () => {
    const result = ExampleInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('ExampleOutputSchema', () => {
  it('should accept valid output', () => {
    const result = ExampleOutputSchema.safeParse({ text: 'Hello world' });
    expect(result.success).toBe(true);
  });

  it('should reject missing text', () => {
    const result = ExampleOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
