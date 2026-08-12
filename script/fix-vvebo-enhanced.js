/**
 * VVebo 用户主页时间线修复 v3 —— 修复分页游标语义
 * 核心修复：原版把 max_id（加载更早）错误映射成 since_id（加载更新），导致翻页返回空 → 主页空白
 *   v3 方案：
 *     - 无游标（打开/刷新）：tab + page=1，重置分页计数
 *     - since_id（下拉刷新拉新）：去掉游标 → 返回最新（不增量但不空白）
 *     - max_id（上拉加载更多）：转成 tab 的 page=N 翻页，N 由计数器维护
 *   uid 多源捕获 + 卡片自适应 + 去重保留
 */
let url = $request.url;

function getUidFrom(u) {
  let m = u.match(/[?&]uid=(\d+)/);
  if (m) return m[1];
  m = u.match(/containerid=230413(\d+)_/);
  if (m) return m[1];
  return undefined;
}

function flattenCards(cards, out) {
  for (let c of (cards || [])) {
    if (!c) continue;
    out.push(c);
    if (Array.isArray(c.card_group) && c.card_group.length) flattenCards(c.card_group, out);
  }
  return out;
}

if (url.includes("users/show") || url.includes("remind/unread_count")) {
  let uid = getUidFrom(url);
  if (uid) $persistentStore.write(uid, "vvebo_uid");
  $done({});
} else if (url.includes("statuses/user_timeline")) {
  let uid = getUidFrom(url) || $persistentStore.read("vvebo_uid") || $persistentStore.read("uid");
  let newUrl = url.replace("statuses/user_timeline", "profile/statuses/tab");

  if (/max_id=/.test(newUrl)) {
    // ===== 上拉加载更多：max_id → page 翻页 =====
    let page = parseInt($persistentStore.read("vvebo_page") || "1", 10) + 1;
    if (isNaN(page) || page < 1) page = 2;
    newUrl = newUrl.replace(/[?&]max_id=[^&]*/, "");
    newUrl = newUrl + "&page=" + page;
    $persistentStore.write(String(page), "vvebo_page");
  } else {
    // ===== 打开/下拉刷新：page=1 重置计数（since_id 一并丢弃，避免增量语义返回空） =====
    newUrl = newUrl.replace(/[?&]since_id=[^&]*/, "").replace(/[?&]max_id=[^&]*/, "");
    newUrl = newUrl + "&page=1";
    $persistentStore.write("1", "vvebo_page");
  }

  if (!/containerid=/.test(newUrl)) {
    newUrl = newUrl + "&containerid=230413" + uid + "_-_WEIBO_SECOND_PROFILE_WEIBO";
  }
  $done({ url: newUrl });
} else if (url.includes("profile/statuses/tab")) {
  try {
    let data = JSON.parse($response.body);
    let flat = flattenCards(data.cards, []);
    let statuses = flat.filter(c => c && c.mblog).map(c => c.mblog);
    if (!statuses.length) {
      statuses = flat.filter(c => c && c.card_type === 9).map(c => c.mblog);
    }
    let seen = new Set();
    statuses = statuses.filter(s => {
      let k = (s && (s.idstr || s.id || s.mid)) || "";
      if (!k) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    // since_id 置空：避免 VVebo 下次带 since_id 刷新导致增量空响应
    $done({ body: JSON.stringify({ statuses, since_id: "", total_number: 100 }) });
  } catch (e) {
    console.log("[VVebo] error: " + e.message);
    $done({});
  }
} else {
  $done({});
}
