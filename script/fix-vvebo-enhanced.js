/**
 * VVebo 用户主页时间线修复 v4.1 —— user_timeline 补 uid 直连（最简方案）
 *
 * 实测结论（gsid 有效期内）：
 *   - user_timeline?uid=xxx → 返回完整原生 statuses（50条+翻页）✅ 接口没废
 *   - user_timeline 无 uid  → 微博改版后不返回数据（VVebo 旧版请求恰好无 uid → 空白）
 *   - tab 重写方案 → 翻页不稳、跨用户访问异常（v3 已废弃）
 *
 * 方案：
 *   - user_timeline 带 uid（看别人）→ 原样透传
 *   - user_timeline 无 uid（看自己）→ 补缓存 uid
 *   - 响应是原生 statuses 格式，max_id/since_id 翻页原生保留
 *
 * uid 缓存 = 当前查看账号（看谁缓存谁）：
 *   - users/show 响应体 id（VVebo 进任何主页都先发此请求，最可靠）
 *   - remind/unread_count URL uid（当前登录账号兜底）
 */

let url = $request.url;

function uidFrom(u) {
  let m = u.match(/[?&]uid=(\d+)/);
  return m ? m[1] : undefined;
}

if (url.includes("users/show") && $response) {
  // ===== users/show 响应体：捕获当前查看账号（URL 无 uid 也能拿） =====
  try {
    let d = JSON.parse($response.body);
    if (d && d.id) $persistentStore.write(String(d.id), "vvebo_uid");
  } catch (e) {
    console.log("[VVebo] users/show parse error: " + e.message);
  }
  $done({});
} else if (url.includes("remind/unread_count")) {
  // ===== remind：捕获当前登录账号 =====
  let uid = uidFrom(url);
  if (uid) $persistentStore.write(uid, "vvebo_uid");
  $done({});
} else if (url.includes("statuses/user_timeline")) {
  // ===== user_timeline：带 uid 透传，无 uid 补缓存 uid =====
  let urlUid = uidFrom(url);
  if (!urlUid) {
    let cached = $persistentStore.read("vvebo_uid");
    if (cached) {
      $done({ url: url + (url.includes("?") ? "&" : "?") + "uid=" + cached });
    } else {
      $done({});
    }
  } else {
    $done({});
  }
} else {
  $done({});
}
