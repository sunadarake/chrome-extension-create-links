import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CLOSE_DELAY_MS, run } from './popup.js';

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

    await run({ queryTabs, copy, messageEl, close });

    expect(copy).toHaveBeenCalledWith(
      '<a href="https://example.com/" target="_blank">Example</a>',
    );
    expect(messageEl.textContent).toBe('コピーしました');
    expect(close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(CLOSE_DELAY_MS);
    expect(close).toHaveBeenCalledOnce();
  });

  it('タブがなければエラーを表示し、コピーも close もしない', async () => {
    const copy = vi.fn();

    await run({ queryTabs: async () => [], copy, messageEl, close });

    expect(messageEl.textContent).toBe('エラー: タブが見つかりません');
    expect(copy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(CLOSE_DELAY_MS);
    expect(close).not.toHaveBeenCalled();
  });

  it('コピーに失敗したらエラーを表示し、close しない', async () => {
    const queryTabs = async () => [
      { url: 'https://example.com/', title: 'Example' },
    ];

    await run({ queryTabs, copy: () => false, messageEl, close });

    expect(messageEl.textContent).toBe('エラー: コピーに失敗しました');
    vi.advanceTimersByTime(CLOSE_DELAY_MS);
    expect(close).not.toHaveBeenCalled();
  });
});
