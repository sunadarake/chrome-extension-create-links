document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 現在のアクティブなタブを取得
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab) {
      throw new Error('タブが見つかりません');
    }

    const url = tab.url;
    const title = tab.title;

    // HTML文字列を生成
    const html = `<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(title)}</a>`;

    // textareaを使った確実なコピー方法
    const textarea = document.createElement('textarea');
    textarea.value = html;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      // 成功メッセージを表示
      document.getElementById('message').textContent = 'コピーしました';
      
      // 1.5秒後に自動で閉じる
      setTimeout(() => window.close(), 500);
    } else {
      throw new Error('コピーに失敗しました');
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('message').textContent = `エラー: ${error.message}`;
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