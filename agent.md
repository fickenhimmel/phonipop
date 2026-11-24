# PhoniPop / 拼读泡泡电视安装指南（给 AI 助手）

本指南用于在用户指定的 Android 电视或盒子上，安装或覆盖更新拼读泡泡，然后核实应用入口和启动结果。使用能在用户电脑上执行命令且能访问该电视所在局域网的助手。家长在电视上负责开启调试、配对和确认系统弹窗。

## 1. 确认用户指定的目标

- 向用户确认电视品牌、型号、IP 或调试端口。电脑和电视应在同一可互通的局域网，不扫描网段或操作其他设备。电脑无权访问本地网络时，请用户允许，或换用 U 盘教程。
- 使用 Google [Android SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools) 的 ADB。先查看 `adb version`；缺少工具时，按电脑操作系统安装官方 Platform Tools。
- 安装目标是电视的应用列表。PhoniPop 已声明 `android.intent.category.LEANBACK_LAUNCHER`。桌面磁贴是否出现、位置如何排列由电视启动器决定，必要时请家长在「我的应用」里找 PhoniPop。
- 只安装 `com.phonipop.tv`。保留旧应用、电视桌面和用户数据，不修改系统验证、默认桌面、网络调试配置或其他应用。完成后可断开本次建立的连接，请用户按需关闭调试。

## 2. 取得并校验 APK

首先读取[官网版本清单](https://phonipop.space/releases.json)。公开版由 Agent 自行下载。预览阶段 `status` 为 `preview`，没有公开下载。用户已持有官方提供的内测 APK 时，可以使用该本地文件，核验包名和发布证书，并告知用户将安装内测版本。没有可信的 APK 就停在这一步，勿从其他站点搜包，也不要使用旧的 `com.reading.tv` 自用测试包。

公开发布后，确认清单中 `schemaVersion` 为 1、`packageName` 为 `com.phonipop.tv`、`status` 为 `available`，且 `release` 含 `versionName`、整数 `versionCode`、整数 `minSdk`、完整 HTTPS 地址 `apkUrl` 和 `sha256`。以该清单公布的地址为准，可以是本站文件或项目的 GitHub Release 附件。

在本次新建的临时目录下载，将占位符替换为清单中的 URL。macOS / Linux 可运行：

```sh
curl --fail --location --proto "=https" --proto-redir "=https" --output PhoniPop.apk "<apkUrl>"
shasum -a 256 PhoniPop.apk
```

Linux 也可用 `sha256sum PhoniPop.apk`。Windows PowerShell 可运行：

```powershell
curl.exe --fail --location --proto "=https" --proto-redir "=https" --output PhoniPop.apk "<apkUrl>"
Get-FileHash -Algorithm SHA256 -LiteralPath .\PhoniPop.apk
```

核对下载成功，实际 SHA-256 与清单完全一致（忽略大小写）。主下载地址连接失败或返回 HTTP 错误时，如果同一 release 提供了 HTTPS 字段 `fallbackApkUrl`，可改用该地址重试并核对同一摘要。没有备用地址或摘要不一致时停止并报告错误。用官方 Android SDK Build Tools 核验包名、版本、最低 API 和 APK 签名：

```text
aapt dump badging <APK 本地路径>
apksigner verify --print-certs <APK 本地路径>
```

当前 PhoniPop 正式签名证书 SHA-256：

```text
b1e8214ea3441d6691af8c5d6bcaf611bfff2987914416fe8fce2492ca39e3f0
```

签名不通过、证书或包名不匹配，以及公开包校验和或版本不匹配，都停止安装。缺少核验工具时，使用官方 SDK 补齐后再继续。命令里的尖括号是占位符；把实际路径作为一个参数传递。

## 3. 连接、检查和安装

按电视当前提供的调试方式选一个路径：

| 电视上的入口 | 操作 |
| --- | --- |
| 小米电视等已开启 ADB 调试，显示或确认使用 5555 | 运行 `adb connect <电视IP>:5555` |
| 支持配对码的无线调试 | 请家长打开配对码页面，运行 `adb pair <电视IP>:<配对端口>` 并交互输入配对码；再用无线调试主页面的连接端口运行 `adb connect <电视IP>:<连接端口>`。两个端口可能不同。 |
| 连接超时、固件不提供 ADB，或电脑无法访问电视 | 检查电视是否唤醒、IP 是否变化、电脑与电视能否互通。仍无法连接时，转到官网「用 U 盘安装」一节。 |

运行 `adb devices -l`，目标状态须为 `device`。出现 `unauthorized` 时，请家长在电视上核对这台电脑的授权提示并按遥控器「允许」；再查询状态。后续命令一律使用 `adb -s <目标序列号>` 明确指定这一台电视。

```text
adb -s <目标序列号> shell getprop ro.build.version.sdk
adb -s <目标序列号> shell pm path com.phonipop.tv
adb -s <目标序列号> shell dumpsys package com.phonipop.tv
```

确认电视的 API 不低于 APK 的最低要求。当前内测包最低 API 23（Android 6.0）；目前已验证的设备是小米 MiTV-AETP0（Android 9）。读取已装的 `versionCode`。相同版本可直接验收，较新的已装版本不降级。未安装或待装版本更高时运行：

```text
adb -s <目标序列号> install -r <APK 本地路径>
```

以安装器实际返回的 `Success` 为准。签名冲突、固件限制或空间不足时向家长报告原始错误。签名冲突时保留原应用和数据；若设备拒绝 ADB 安装，请家长尝试官方 APK 的 U 盘安装路径。不要绕过校验。

## 4. 验收并回复家长

```text
adb -s <目标序列号> shell pm path com.phonipop.tv
adb -s <目标序列号> shell dumpsys package com.phonipop.tv
adb -s <目标序列号> shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.LEANBACK_LAUNCHER -p com.phonipop.tv
adb -s <目标序列号> shell am start -W -a android.intent.action.MAIN -c android.intent.category.LEANBACK_LAUNCHER -n <解析出的电视启动组件>
```

当前 APK 的启动组件是 `com.phonipop.tv/com.reading.tv.MainActivity`。如果旧系统没有 `cmd package resolve-activity`，可从已校验 APK 的 `aapt dump badging` 输出读取 `leanback-launchable-activity`。报告设备型号、实际包名、`versionName`、`versionCode` 和启动结果。只有安装结果、版本及启动状态均已核对，才报告完整验收通过。启动结果不能证明某个厂商的首页已自动固定磁贴；若家长需要确认该位置，请他们查看电视首页或应用列表。

这条流程到打开 App 为止。导入书籍由家长单独选择 ZIP 并确认，按官网「导书」一节操作。
