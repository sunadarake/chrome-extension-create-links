import { describe, expect, it } from 'vitest';
import { createLink } from './create-link.js';
import { DEFAULT_OPTIONS } from './options.js';

/** @param {Partial<import('./options.js').Options>} overrides */
const opts = (overrides) => ({ ...DEFAULT_OPTIONS, ...overrides });

describe('createLink (html)', () => {
  it('初期値では target="_blank" 付きのリンクを作る', () => {
    expect(createLink('https://example.com/', 'Example', DEFAULT_OPTIONS)).toBe(
      '<a href="https://example.com/" target="_blank">Example</a>',
    );
  });

  it('URLのクエリ内の & をエスケープする', () => {
    expect(
      createLink('https://example.com/?a=1&b=2', 'x', DEFAULT_OPTIONS),
    ).toBe('<a href="https://example.com/?a=1&amp;b=2" target="_blank">x</a>');
  });

  it('タイトルの特殊文字をエスケープする', () => {
    expect(
      createLink(
        'https://example.com/',
        '<script>"a"</script>',
        DEFAULT_OPTIONS,
      ),
    ).toBe(
      '<a href="https://example.com/" target="_blank">&lt;script&gt;&quot;a&quot;&lt;/script&gt;</a>',
    );
  });

  it('target を指定しなければ属性を出さない', () => {
    expect(createLink('https://e.com/', 'x', opts({ target: '' }))).toBe(
      '<a href="https://e.com/">x</a>',
    );
  });

  it('target に _self を指定できる', () => {
    expect(createLink('https://e.com/', 'x', opts({ target: '_self' }))).toBe(
      '<a href="https://e.com/" target="_self">x</a>',
    );
  });

  it('noopener を有効にすると rel を付ける', () => {
    expect(createLink('https://e.com/', 'x', opts({ noopener: true }))).toBe(
      '<a href="https://e.com/" target="_blank" rel="noopener noreferrer">x</a>',
    );
  });
});

describe('createLink (その他の形式)', () => {
  it('Markdown のリンクを作る', () => {
    expect(
      createLink('https://e.com/', 'Example', opts({ format: 'markdown' })),
    ).toBe('[Example](https://e.com/)');
  });

  it('Markdown ではタイトルの [] と URL の空白・括弧をエスケープする', () => {
    expect(
      createLink('https://e.com/a b_(c)', '[x]', opts({ format: 'markdown' })),
    ).toBe('[\\[x\\]](https://e.com/a%20b_%28c%29)');
  });

  it('URLのみを返す', () => {
    expect(
      createLink('https://e.com/?a=1&b=2', 'x', opts({ format: 'url' })),
    ).toBe('https://e.com/?a=1&b=2');
  });

  it('タイトルのみを返す（エスケープしない）', () => {
    expect(
      createLink('https://e.com/', 'A & B', opts({ format: 'title' })),
    ).toBe('A & B');
  });
});

describe('createLink (タイトル整形)', () => {
  it('有効なら前後の空白を除き、連続する空白を1つにする', () => {
    expect(
      createLink(
        'https://e.com/',
        '  a \n  b\t c ',
        opts({ format: 'title', tidyTitle: true }),
      ),
    ).toBe('a b c');
  });

  it('無効ならタイトルをそのまま使う', () => {
    expect(
      createLink('https://e.com/', '  a  b ', opts({ format: 'title' })),
    ).toBe('  a  b ');
  });
});
