import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_OPTIONS, loadOptions, saveOptions } from './options.js';

describe('options', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loadOptions は初期値を渡して storage から読む', async () => {
    const stored = { ...DEFAULT_OPTIONS, format: 'markdown' };
    const get = vi.fn(async () => stored);
    vi.stubGlobal('chrome', { storage: { local: { get } } });

    expect(await loadOptions()).toEqual(stored);
    expect(get).toHaveBeenCalledWith(DEFAULT_OPTIONS);
  });

  it('saveOptions は storage に保存する', async () => {
    const set = vi.fn(async () => {});
    vi.stubGlobal('chrome', { storage: { local: { set } } });

    await saveOptions(DEFAULT_OPTIONS);

    expect(set).toHaveBeenCalledWith(DEFAULT_OPTIONS);
  });
});
