const makePrompt = document.querySelector('#make-prompt');

if (location.protocol === 'https:') {
  const skillUrl = new URL('assets/reading-content-pack.zip', location.href);
  makePrompt.value = makePrompt.defaultValue.replace('解压我附上的制书工具包', `下载并解压制书工具包 ${skillUrl.href}`);
}

for (const button of document.querySelectorAll('[data-copy]')) {
  const panel = button.closest('.prompt');
  const prompt = panel.querySelector('textarea');
  const status = panel.querySelector('[role="status"]');
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.value);
      status.textContent = '已复制';
    } catch {
      prompt.focus();
      prompt.select();
      status.textContent = '已选中提示词，请手动复制。';
    }
  });
}
