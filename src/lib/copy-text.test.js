import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from './copy-text.js';

describe('copyText', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('コピーに成功すると true を返す', () => {
    document.execCommand = vi.fn(() => true);
    expect(copyText('abc')).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('コピーに失敗すると false を返す', () => {
    document.execCommand = vi.fn(() => false);
    expect(copyText('abc')).toBe(false);
  });

  it('コピー時に textarea へ対象の文字列が入っている', () => {
    let copied;
    document.execCommand = vi.fn(() => {
      copied = document.querySelector('textarea')?.value;
      return true;
    });
    copyText('<a>link</a>');
    expect(copied).toBe('<a>link</a>');
  });

  it('textarea を後始末する', () => {
    document.execCommand = vi.fn(() => true);
    copyText('abc');
    expect(document.querySelector('textarea')).toBeNull();
  });
});
