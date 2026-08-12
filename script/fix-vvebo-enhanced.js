/**
 * VVebo 用户主页时间线修复 v4 —— user_timeline 补 uid 直连方案
 *
 * 背景：微博改版后，无 uid 的 user_timeline 不再返回数据。
 *       VVebo 旧版请求不带 uid → 主页空白。
 *       （已实测：user_timeline?uid=xxx 返回完整原生 statuses，接口有效）
 *
 * v4 方案：
 *   - user_timeline 带 uid → 原样透传（看别人主页，微博原生返回）
 *   - user_timeline 无 uid → 补上缓存 uid（看自己主页，微博按 uid 返回）
 *   - 响应是 VVebo 原生 statuses 格式，无需 tab 转换
 *   - 原生 max_id/since_id 翻页保留，上拉加载/下拉刷新都正常
 *
 * uid 缓存（保证 = 当前查看的账号）：
 *   - users/show 请求 URL 捕获（http-request）
 *   - users/show 响应体 id 捕获（http-response）← 新增，最可靠
 *   - remind/unread_count URL 捕获（当前登录账号）
 */

let url = $request.url;

function getUidFrom(u) {
  let m = u.match(/[?&]uid=(\d+)/);
  if (m) return m[1];
  m = u.match(/containerid=230413(\d+)_/);
  if (m) return m[1];
  return undefined;
}

if (url.includes("remind/unread_count")) {
  let uid = getUidFrom(url);
  if (uid) $persistentStore.write(uid, "vvebo_uid");
  $done({});
} else if (url.includes("users/show")) {
  if ($response) {
    // ===== http-response 阶段：从响应体捕获 id（最可靠） =====
    try {
      let d = JSON.parse($response.body);
      if (d && d.id) {
        $persistentStore.write(String(d.id), "vvebo_uid");
      }
    } catch (e) {
      console.log("[VVebo] users/show body parse error: " + e.message);
    }
    $done({});
  } else {
    // ===== http-request 阶段：URL 带 uid 则捕获 =====
    let uid = getUidFrom(url);
    if (uid) $persistentStore.write(uid, "vvebo_uid");
    $done({});
  }
} else if (url.includes("statuses/user_timeline")) {
  let urlUid = getUidFrom(url);
  let cached = $persistentStore.read("vvebo_uid") || $persistentStore.read("uid");
  if (!urlUid && cached) {
    // 无 uid → 补缓存 uid（微博改版后无 uid 不返回数据）
    let sep = url.includes("?") ? "&" : "?";
    $done({ url: url + sep + "uid=" + cached });
  } else {
    // 带 uid → 原样透传
    $done({});
  }
} else {
  $done({});
}
