const messages = {
  'zh-CN': {
    ipPlaceholder: '<电视 IP>',
    ipFilled: '已填入下方安装提示词。',
    ipInvalid: '请输入电视上显示的 IP，例如 192.168.1.20。',
    toolkitAttachment: '解压我附上的制书工具包',
    toolkitDownload: url => `下载并解压制书工具包 ${url}`,
    copied: '已复制',
    selected: '已选中提示词，请手动复制。'
  },
  en: {
    ipPlaceholder: '<TV IP>',
    ipFilled: 'Added to your installation prompt.',
    ipInvalid: 'Enter the IP address shown on your TV, such as 192.168.1.20.',
    toolkitAttachment: 'Extract the toolkit I’ve attached',
    toolkitDownload: url => `Download and extract the toolkit from ${url}`,
    copied: 'Copied',
    selected: 'The prompt is selected. Copy it manually.'
  },
  'zh-Hant': {
    ipPlaceholder: '<電視 IP>',
    ipFilled: '已帶入下方的安裝提示詞。',
    ipInvalid: '請輸入電視顯示的 IP 位址，例如 192.168.1.20。',
    toolkitAttachment: '請解壓縮我附上的繪本製作工具包',
    toolkitDownload: url => `請下載並解壓縮繪本製作工具包 ${url}`,
    copied: '已複製',
    selected: '已選取提示詞，請手動複製。'
  }
}[document.documentElement.lang];

function syncLanguageLinks() {
  for (const link of document.querySelectorAll('[data-language]')) {
    const target = new URL(link.href);
    target.hash = location.hash;
    link.href = target.href;
  }
}
syncLanguageLinks();
window.addEventListener('hashchange', syncLanguageLinks);

const tvIP = document.querySelector('#tv-ip');
const installPrompt = document.querySelector('#agent-prompt');
const ipStatus = document.querySelector('#tv-ip-status');
const installCopyStatus = document.querySelector('#copy-status');

function updateInstallPrompt() {
  const ip = tvIP.value.trim();
  const valid = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)
    && ip.split('.').every(part => Number(part) <= 255);
  installPrompt.value = installPrompt.defaultValue.replace(messages.ipPlaceholder, valid ? ip : messages.ipPlaceholder);
  tvIP.setAttribute('aria-invalid', String(ip !== '' && !valid));
  ipStatus.textContent = valid ? messages.ipFilled : ip ? messages.ipInvalid : '';
  installCopyStatus.textContent = '';
}

document.querySelector('#usb-install-shortcut').addEventListener('click', () => {
  document.querySelector('#install-usb').checked = true;
});
tvIP.addEventListener('input', updateInstallPrompt);
window.addEventListener('pageshow', updateInstallPrompt);

const makePrompt = document.querySelector('#make-prompt');

if (location.protocol === 'https:') {
  const skillUrl = document.querySelector('#make a[download]').href;
  makePrompt.value = makePrompt.defaultValue.replace(messages.toolkitAttachment, messages.toolkitDownload(skillUrl));
}

for (const button of document.querySelectorAll('[data-copy]')) {
  const panel = button.closest('.prompt');
  const prompt = panel.querySelector('textarea');
  const status = panel.querySelector('[role="status"]');
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.value);
      status.textContent = messages.copied;
    } catch {
      prompt.focus();
      prompt.select();
      status.textContent = messages.selected;
    }
  });
}
