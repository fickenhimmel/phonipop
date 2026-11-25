const tvIP = document.querySelector('#tv-ip');
const installPrompt = document.querySelector('#agent-prompt');
const ipStatus = document.querySelector('#tv-ip-status');
const installCopyStatus = document.querySelector('#copy-status');

function updateInstallPrompt() {
  const ip = tvIP.value.trim();
  const valid = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)
    && ip.split('.').every(part => Number(part) <= 255);
  installPrompt.value = installPrompt.defaultValue.replace('<电视 IP>', valid ? ip : '<电视 IP>');
  tvIP.setAttribute('aria-invalid', String(ip !== '' && !valid));
  ipStatus.textContent = valid ? '已填入下方安装提示词。'
    : ip ? '请输入电视上显示的 IP，例如 192.168.1.20。' : '';
  installCopyStatus.textContent = '';
}

document.querySelector('#usb-install-shortcut').addEventListener('click', () => {
  document.querySelector('#install-usb').checked = true;
});
tvIP.addEventListener('input', updateInstallPrompt);
window.addEventListener('pageshow', updateInstallPrompt);

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
