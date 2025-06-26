import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  debouncePromise,
  constantTimeEqual,
  normalizeEmail,
  generateSecureRandomString,
  bufferToBase64,
  base64ToBuffer
} from './utils.js';

describe('debouncePromise', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce multiple calls and only execute the last one', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const debouncedFn = debouncePromise(mockFn, 100);

    // Make multiple calls quickly
    const promise1 = debouncedFn('arg1');
    const promise2 = debouncedFn('arg2');
    const promise3 = debouncedFn('arg3');

    // Fast-forward time
    vi.advanceTimersByTime(100);

    // Wait for promises to resolve
    await expect(promise3).resolves.toBe('result');
    
    // First two should be rejected with debounce error
    await expect(promise1).rejects.toThrow('Debounced');
    await expect(promise2).rejects.toThrow('Debounced');

    // Only the last call should have been executed
    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith('arg3', expect.any(AbortSignal));
  });

  it('should handle promise rejection', async () => {
    const error = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(error);
    const debouncedFn = debouncePromise(mockFn, 100);

    const promise = debouncedFn('arg');
    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow('Test error');
  });

  it('should pass AbortSignal to the wrapped function', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const debouncedFn = debouncePromise(mockFn, 100);

    const promise = debouncedFn('arg');
    vi.advanceTimersByTime(100);

    await promise;

    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith('arg', expect.any(AbortSignal));
  });

  it('should use default delay of 500ms', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const debouncedFn = debouncePromise(mockFn);

    const promise = debouncedFn('arg');
    vi.advanceTimersByTime(499);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await promise;
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should handle zero delay', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const debouncedFn = debouncePromise(mockFn, 0);

    const promise = debouncedFn('arg');
    vi.advanceTimersByTime(0);
    
    await promise;
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should handle negative delay by using 0', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const debouncedFn = debouncePromise(mockFn, -100);

    const promise = debouncedFn('arg');
    vi.advanceTimersByTime(0);
    
    await promise;
    expect(mockFn).toHaveBeenCalledOnce();
  });
});

describe('constantTimeEqual', () => {
  it('should return true for identical arrays', () => {
    const a = new Uint8Array([1, 2, 3, 4, 5]);
    const b = new Uint8Array([1, 2, 3, 4, 5]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });

  it('should return false for different arrays of same length', () => {
    const a = new Uint8Array([1, 2, 3, 4, 5]);
    const b = new Uint8Array([1, 2, 3, 4, 6]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });

  it('should return false for arrays of different lengths', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3, 4]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });

  it('should return true for empty arrays', () => {
    const a = new Uint8Array([]);
    const b = new Uint8Array([]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });

  it('should return false when comparing empty with non-empty', () => {
    const a = new Uint8Array([]);
    const b = new Uint8Array([1]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });

  it('should handle arrays with zeros', () => {
    const a = new Uint8Array([0, 0, 0]);
    const b = new Uint8Array([0, 0, 0]);
    expect(constantTimeEqual(a, b)).toBe(true);

    const c = new Uint8Array([0, 0, 1]);
    expect(constantTimeEqual(a, c)).toBe(false);
  });

  it('should handle maximum byte values', () => {
    const a = new Uint8Array([255, 255, 255]);
    const b = new Uint8Array([255, 255, 255]);
    expect(constantTimeEqual(a, b)).toBe(true);

    const c = new Uint8Array([255, 255, 254]);
    expect(constantTimeEqual(a, c)).toBe(false);
  });
});

describe('normalizeEmail', () => {
  it('should convert email to lowercase', () => {
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    expect(normalizeEmail('User@Domain.ORG')).toBe('user@domain.org');
  });

  it('should trim whitespace', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
    expect(normalizeEmail('\tuser@domain.com\n')).toBe('user@domain.com');
  });

  it('should handle both trimming and lowercasing', () => {
    expect(normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
  });

  it('should handle already normalized emails', () => {
    expect(normalizeEmail('test@example.com')).toBe('test@example.com');
  });

  it('should handle empty string', () => {
    expect(normalizeEmail('')).toBe('');
  });

  it('should handle whitespace-only strings', () => {
    expect(normalizeEmail('   ')).toBe('');
    expect(normalizeEmail('\t\n')).toBe('');
  });

  it('should handle complex email formats', () => {
    expect(normalizeEmail('  User.Name+Tag@Sub.Domain.COM  ')).toBe('user.name+tag@sub.domain.com');
  });
});

describe('generateSecureRandomString', () => {
  it('should generate string of correct length', () => {
    expect(generateSecureRandomString(5)).toHaveLength(5);
    expect(generateSecureRandomString(10)).toHaveLength(10);
    expect(generateSecureRandomString(32)).toHaveLength(32);
  });

  it('should only contain characters from the alphabet', () => {
    const alphabet = "abcdefghijklmnpqrstuvwxyz23456789";
    const result = generateSecureRandomString(100);
    
    for (const char of result) {
      expect(alphabet).toContain(char);
    }
  });

  it('should generate different strings on multiple calls', () => {
    const results = new Set();
    for (let i = 0; i < 10; i++) {
      results.add(generateSecureRandomString(16));
    }
    expect(results.size).toBe(10);
  });

  it('should handle length of 1', () => {
    const result = generateSecureRandomString(1);
    expect(result).toHaveLength(1);
    expect("abcdefghijklmnpqrstuvwxyz23456789").toContain(result);
  });

  it('should handle length of 0', () => {
    const result = generateSecureRandomString(0);
    expect(result).toBe('');
  });

  it('should not contain excluded characters', () => {
    const result = generateSecureRandomString(100);
    expect(result).not.toMatch(/[01IO]/);
    expect(result).toMatch(/^[abcdefghijklmnpqrstuvwxyz23456789]*$/);
  });

  it('should generate uniformly distributed characters', () => {
    const result = generateSecureRandomString(1000);
    const charCounts = new Map<string, number>();
    
    for (const char of result) {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);
    }

    // With 1000 characters and 33 possible chars, we expect roughly 30 of each
    // Allow some variance but ensure no character is completely missing or overly frequent
    for (const count of charCounts.values()) {
      expect(count).toBeGreaterThan(10);
      expect(count).toBeLessThan(60);
    }
  });
});

describe('bufferToBase64', () => {
  it('should convert Uint8Array to base64 string', () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]);
    const result = bufferToBase64(buffer);
    expect(result).toBe('SGVsbG8=');
  });

  it('should handle empty buffer', () => {
    const buffer = new Uint8Array([]);
    const result = bufferToBase64(buffer);
    expect(result).toBe('');
  });

  it('should handle single byte', () => {
    const buffer = new Uint8Array([65]); // "A"
    const result = bufferToBase64(buffer);
    expect(result).toBe('QQ==');
  });

  it('should handle binary data', () => {
    const buffer = new Uint8Array([0, 1, 2, 3, 255, 254, 253]);
    const result = bufferToBase64(buffer);
    expect(result).toBe('AAECA//+/Q==');
  });

  it('should handle maximum byte values', () => {
    const buffer = new Uint8Array([255, 255, 255]);
    const result = bufferToBase64(buffer);
    expect(result).toBe('////');
  });
});

describe('base64ToBuffer', () => {
  it('should convert base64 string to Uint8Array', () => {
    const base64 = 'SGVsbG8='; // "Hello"
    const result = base64ToBuffer(base64);
    const expected = new Uint8Array([72, 101, 108, 108, 111]);
    expect(result).toEqual(expected);
  });

  it('should handle empty string', () => {
    const result = base64ToBuffer('');
    expect(result).toEqual(new Uint8Array([]));
  });

  it('should handle single character encoding', () => {
    const result = base64ToBuffer('QQ=='); // "A"
    expect(result).toEqual(new Uint8Array([65]));
  });

  it('should handle binary data', () => {
    const result = base64ToBuffer('AAECA//+/Q==');
    const expected = new Uint8Array([0, 1, 2, 3, 255, 254, 253]);
    expect(result).toEqual(expected);
  });

  it('should handle maximum byte values', () => {
    const result = base64ToBuffer('////');
    const expected = new Uint8Array([255, 255, 255]);
    expect(result).toEqual(expected);
  });

  it('should be inverse of bufferToBase64', () => {
    const originalData = new Uint8Array([1, 2, 3, 4, 5, 255, 0, 128]);
    const base64 = bufferToBase64(originalData);
    const roundTrip = base64ToBuffer(base64);
    expect(roundTrip).toEqual(originalData);
  });
});

describe('integration tests', () => {
  it('should handle base64 round-trip with random data', () => {
    // Generate some random binary data
    const originalData = new Uint8Array(32);
    crypto.getRandomValues(originalData);

    const base64 = bufferToBase64(originalData);
    const roundTrip = base64ToBuffer(base64);

    expect(roundTrip).toEqual(originalData);
  });

  it('should handle email normalization with various inputs', () => {
    const testCases = [
      { input: '  JOHN.DOE+FILTER@GMAIL.COM  ', expected: 'john.doe+filter@gmail.com' },
      { input: 'ADMIN@COMPANY.ORG', expected: 'admin@company.org' },
      { input: '\ttest@example.net\n', expected: 'test@example.net' }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(normalizeEmail(input)).toBe(expected);
    });
  });

  it('should generate secure strings with consistent properties', () => {
    const lengths = [5, 10, 16, 32, 64];
    
    lengths.forEach(length => {
      const result = generateSecureRandomString(length);
      expect(result).toHaveLength(length);
      expect(result).toMatch(/^[abcdefghijklmnpqrstuvwxyz23456789]*$/);
    });
  });
}); 