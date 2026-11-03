import { describe, expect, it } from 'vitest';
import { createLinkHtml } from './create-link.js';

describe('createLinkHtml', () => {
  it('target="_blank" 付きのリンクを作る', () => {
    expect(createLinkHtml('https://example.com/', 'Example')).toBe(
      '<a href="https://example.com/" target="_blank">Example</a>',
    );
  });

  it('URLのクエリ内の & をエスケープする', () => {
    expect(createLinkHtml('https://example.com/?a=1&b=2', 'x')).toBe(
      '<a href="https://example.com/?a=1&amp;b=2" target="_blank">x</a>',
    );
  });

  it('タイトルの特殊文字をエスケープする', () => {
    expect(createLinkHtml('https://example.com/', '<script>"a"</script>')).toBe(
      '<a href="https://example.com/" target="_blank">&lt;script&gt;&quot;a&quot;&lt;/script&gt;</a>',
    );
  });
});
