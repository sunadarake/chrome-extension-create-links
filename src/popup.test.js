import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CLOSE_DELAY_MS, run } from './popup.js';
import { DEFAULT_OPTIONS } from './lib/options.js';

const loadOptions = async () => DEFAULT_OPTIONS;

describe('run', () => {
  /** @type {HTMLElement} */
  let messageEl;
  /** @type {import('vitest').Mock} */
  let close;

  beforeEach(() => {
    vi.useFakeTimers();
    messageEl = document.createElement('div');
    close = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('リンクをコピーし、メッセージを表示して一定時間後に閉じる', async () => {
    const copy = vi.fn(() => true);
    const queryTabs = async () => [
      { url: 'https://example.com/', title: 'Example' },
    ];

    await run({ queryTabs, loadOptions, copy, messageEl, close });

    expect(copy).toHaveBeenCalledWith(
      '<a href="https://example.com/" target="_blank">Example</a>',
    );
    expect(messageEl.textContent).toBe('✅ コピーしました');
    expect(messageEl.className).toBe('success');
    expect(close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(CLOSE_DELAY_MS);
    expect(close).toHaveBeenCalledOnce();
  });

  it('タブがなければエラーを表示し、コピーも close もしない', async () => {
    const copy = vi.fn();

    await run({
      queryTabs: async () => [],
      loadOptions,
      copy,
      messageEl,
      close,
    });

    expect(messageEl.textContent).toBe('❌ エラー: タブが見つかりません');
    expect(messageEl.className).toBe('error');
    expect(copy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(CLOSE_DELAY_MS);
    expect(close).not.toHaveBeenCalled();
  });

  it('コピーに失敗したらエラーを表示し、close しない', async () => {
    const queryTabs = async () => [
      { url: 'https://example.com/', title: 'Example' },
    ];

    await run({ queryTabs, loadOptions, copy: () => false, messageEl, close });

    expect(messageEl.textContent).toBe('❌ エラー: コピーに失敗しました');
    expect(messageEl.className).toBe('error');
    vi.advanceTimersByTime(CLOSE_DELAY_MS);
    expect(close).not.toHaveBeenCalled();
  });

  it('設定された形式でコピーする', async () => {
    const copy = vi.fn(() => true);
    const queryTabs = async () => [
      { url: 'https://example.com/', title: 'Example' },
    ];

    await run({
      queryTabs,
      loadOptions: async () => ({ ...DEFAULT_OPTIONS, format: 'markdown' }),
      copy,
      messageEl,
      close,
    });

    expect(copy).toHaveBeenCalledWith('[Example](https://example.com/)');
  });
});
