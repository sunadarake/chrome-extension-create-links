// ページ読み込み時に自動実行
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 現在のアクティブなタブを取得
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    const url = tab.url;
    const title = tab.title;

    // HTML文字列を生成
    const html = `<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(title)}</a>`;

    // クリップボードにコピー
    await navigator.clipboard.writeText(html);

    // 成功メッセージを表示
    document.getElementById('message').textContent = 'コピーしました';

    // 1.5秒後に自動で閉じる
    setTimeout(() => window.close(), 1500);
  } catch (error) {
    // エラーメッセージを表示
    document.getElementById('message').textContent = 'エラーが発生しました';
  }
});

// HTML特殊文字をエスケープする関数
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
