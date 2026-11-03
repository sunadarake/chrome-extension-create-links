import { describe, expect, it } from 'vitest';
import { escapeHtml } from './escape-html.js';

describe('escapeHtml', () => {
  it.each([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#039;'],
  ])('%s を %s に変換する', (input, expected) => {
    expect(escapeHtml(input)).toBe(expected);
  });

  it('複数の特殊文字が混在していてもすべて変換する', () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#039;&lt;/a&gt;',
    );
  });

  it('変換不要な文字列はそのまま返す', () => {
    expect(escapeHtml('こんにちは hello')).toBe('こんにちは hello');
  });
});
