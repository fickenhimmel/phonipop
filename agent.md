# 拼读泡泡 PhoniPop · 电视安装指南

给能在家长电脑上执行命令的 AI 助手。请先读完整份指南，再亲自下载、校验并安装 App，最后在指定电视上打开拼读泡泡。家长负责查看电视设置和确认遥控器弹窗。若当前助手只能聊天，请说明需要换用能访问本机文件和局域网的桌面助手。

## 1. 准备电脑和电视

1. 使用家长给出的电视 IP。若消息里还是占位符，请家长在电视「设置 → 网络 → 当前连接」查看 IP。电脑和电视接入同一可互通的局域网。目标系统须为 Android TV 或 Android 盒子，当前正式版最低 Android 6.0（API 23）。
2. 在电脑运行 `adb version`。若命令不存在，先查 Android SDK 的 `platform-tools` 目录，再按电脑系统下载并解压 [Google 官方 Platform Tools](https://developer.android.com/tools/releases/platform-tools)。可用解压后的 adb 完整路径执行下文命令，Windows 使用 adb.exe。
3. 校验 APK 还需要同一 SDK 下的 Build Tools。查找 `build-tools/<版本>/aapt` 和 `apksigner`（Windows 为 aapt.exe 和 apksigner.bat）。缺少时可用已安装的 SDK Manager 运行 `sdkmanager "build-tools;36.0.0"`，或从 [Android 官方 SDK 工具](https://developer.android.com/studio#command-line-tools-only) 获取命令行工具。若许可证需要用户接受或工具无法运行，说明当前所缺条件。

## 2. 获取官方 APK

先读取[官网版本清单](https://phonipop.space/releases.json)。官网连接失败、证书校验失败或返回网页时，改读[GitHub 备用清单](https://raw.githubusercontent.com/fickenhimmel/phonipop/main/releases.json)。使用同一份清单完成本次校验。确认 schemaVersion 为 1、packageName 为 com.phonipop.tv、status 为 available；release 中须有 versionName、整数 versionCode、整数 minSdk、HTTPS 下载地址 apkUrl 和 64 位十六进制 sha256。

在新建的临时目录下载 apkUrl。以下尖括号均须替换为实际值，路径作为单独参数传入。每条命令看退出状态，下载成功后才计算摘要。

```sh
# macOS / Linux；Linux 也可用 sha256sum PhoniPop.apk
curl --fail --location --proto "=https" --proto-redir "=https" --output PhoniPop.apk "<apkUrl>"
shasum -a 256 PhoniPop.apk
```

```powershell
# Windows PowerShell
curl.exe --fail --location --proto "=https" --proto-redir "=https" --output PhoniPop.apk "<apkUrl>"
Get-FileHash -Algorithm SHA256 -LiteralPath .\PhoniPop.apk
```

主地址不可用时，尝试清单中的 fallbackApkUrl。若某个来源返回旧文件或 HTML 导致摘要不符，记录该地址和实际摘要，丢弃本次临时下载的文件。每次都与同一清单的 sha256 比对；没有任何副本匹配就停止。始终启用 HTTPS 证书校验。

```text
aapt dump badging "<APK 本地路径>"
apksigner verify --verbose --print-certs "<APK 本地路径>"
```

检查 aapt 输出中的包名、versionName、versionCode、sdkVersion 与清单一致，记下 leanback-launchable-activity。apksigner 必须退出成功，Signer #1 certificate SHA-256 digest 必须等于下列正式证书指纹（忽略大小写）。文件摘要与证书指纹用途不同，两项都要核对。

```text
b1e8214ea3441d6691af8c5d6bcaf611bfff2987914416fe8fce2492ca39e3f0
```

若清单明确标为 preview 且没有公开版本，仅在家长已提供官方内测 APK 时走本地文件流程。仍须核对签名、正式包名和最低 API，并告知家长将安装的实际版本。

## 3. 连接家长指定的电视

先运行 `adb devices -l`。已有连接且能与家长指定的电视对应时，直接使用；否则按电视显示的调试方式连接。

| 电视端情况 | 助手和家长的操作 |
| --- | --- |
| 小米电视有「ADB 调试」 | 请家长在设置中打开 ADB 调试。部分机型需先在「关于」中连续按产品型号以打开开发者选项。电视确认使用 5555 时，运行 `adb connect <电视IP>:5555`。 |
| 设置中只有「无线调试」 | 请家长打开「使用配对码配对设备」，运行 `adb pair <配对IP>:<配对端口>` 并交互输入屏幕上的配对码。成功后返回无线调试主页，按主页显示的地址运行 `adb connect <连接IP>:<连接端口>`。 |
| 显示 unauthorized 或 offline | unauthorized 时，请家长核对电视上的调试授权弹窗，按遥控器选择「允许」。offline 时，确认电视已唤醒、IP 和端口仍有效，再仅重连这台电视。 |

再次运行 `adb devices -l`，只对已确认且状态为 device 的那一行执行后续操作。把以下命令的「目标序列号」替换为那一行的首列。若仍不能对应，先请家长确认。连接受限时，可请家长按[官网 U 盘安装教程](https://phonipop.space/#install)手动安装。

## 4. 判断首次安装或升级

```text
adb -s <目标序列号> shell getprop ro.product.model
adb -s <目标序列号> shell getprop ro.build.version.sdk
adb -s <目标序列号> shell pm path com.phonipop.tv
adb -s <目标序列号> shell dumpsys package com.phonipop.tv
```

确认设备 API 达到已校验 APK 的 minSdk。若查询报连接或权限错误，先解决错误。只有设备正常响应且包管理器确认未安装，才按首次安装处理。

- 首次安装或目标 versionCode 更高时，运行下面的覆盖安装命令。按整数 versionCode 比较；同一个显示版本可能对应不同构建。
- versionCode 相同时可跳过重装。先用 pm path 返回的 base.apk 路径（去掉 package: 前缀），通过 `adb -s <目标序列号> pull "<电视上的 base.apk 路径>" "<本机临时文件>"` 取回已装包，按第 2 节核对实际签名；对当前单 APK 正式版也核对文件摘要。若无法读取，说明无法确认已装副本；可对同版本使用已校验的官方 APK 执行覆盖安装，由 Android 校验签名兼容性。
- 已装 versionCode 更高时保留该版本，并报告已装和清单中的两个版本号。若要启动并验收已有新版，先按上一步读取已装包、核对正式签名并读取其电视启动组件。新版的文件摘要应以对应版本的发布信息为准。

```text
adb -s <目标序列号> install -r "<APK 本地路径>"
```

保留安装器的原始输出。若电视要求安装确认，提醒家长用遥控器选择「安装」。收到 Success 后再验收。签名冲突（INSTALL_FAILED_UPDATE_INCOMPATIBLE）时停止；空间不足时请家长释放空间；固件限制 ADB 安装时可走 U 盘流程。不得通过卸载、清数据、强制降级或关闭系统校验解决错误。旧测试包 com.reading.tv 的书库与正式包独立。

## 5. 验收并回复家长

在仍然连接的同一台电视上逐条执行，贴出实际命令和原始输出。如果刚做了安装，同时贴出安装器结果；跳过重装时说明原因。

```text
adb -s <目标序列号> shell pm path com.phonipop.tv
adb -s <目标序列号> shell "dumpsys package com.phonipop.tv | grep -e versionName= -e versionCode="
adb -s <目标序列号> shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.LEANBACK_LAUNCHER -p com.phonipop.tv
adb -s <目标序列号> shell am start -W -a android.intent.action.MAIN -c android.intent.category.LEANBACK_LAUNCHER -n <解析出的电视启动组件>
```

1. 第一条应返回 package: 路径，第二条的实际版本应符合第 4 节的判断。电视缺少 grep 时运行完整 dumpsys package 命令，从包信息中原样摘录两个版本字段。
2. 第三条须返回 com.phonipop.tv 的组件，替换到第四条。旧系统缺少 resolve-activity 时，保留错误，按已校验 APK 的包名和 leanback-launchable-activity 拼成组件；当前正式版使用 com.phonipop.tv/com.reading.tv.MainActivity。走此替代路径时，注明电视应用列表入口尚未通过系统查询确认。系统支持查询但没有匹配项时，报告入口异常。
3. 第四条须无 Error 或超时，检查 Status 和实际 Activity。若提示已有任务被带到前台，或家长看到闪退、黑屏，运行 `adb -s <目标序列号> shell dumpsys activity activities`，查看当前 resumed Activity 所属包；无法确认时请家长描述屏幕。声称已看到书架需要实际画面或家长确认。
4. 若任一步失败，报告设备型号、失败步骤和原始错误，指出已验证到哪一步。覆盖安装成功只能证明安装器完成了更新；书库和阅读进度是否保留，需要打开已有书目核实。

本流程到打开拼读泡泡为止。导书和固定首页磁贴由家长按需操作。验收结束后，对本次新建的网络连接运行 `adb disconnect <连接IP>:<连接端口>`；家长可在电视设置中关闭调试。
