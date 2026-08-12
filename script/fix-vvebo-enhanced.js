/**
 * VVebo 用户主页时间线修复 —— 增强版 + 诊断
 * 相对原版 (suiyuran/fix-vvebo-user-timeline.js) 的改进：
 *   1. uid 多源捕获：users/show / user_timeline URL / remind/unread_count / containerid / 缓存，逐级兜底
 *   2. 卡片过滤自适应：不再硬编码 card_type===9，任何携带 mblog 的卡片都收集（含多层 card_group 展开）
 *   3. 输出去重 + 空结果时发诊断通知（定位微博接口是否改版）
 * 兼容 Loon 脚本 API（$request / $response / $persistentStore / $notification / $done）
 */
let url = $request.url;

function getUidFrom(u) {
  let m = u.match(/[?&]uid=(\d+)/);
  if (m) return m[1];
  m = u.match(/containerid=230413(\d+)_/);
  if (m) return m[1];
  m = u.match(/\/users\/show[^?]*\?[^]*?uid=(\d+)/);
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
  let newUrl = url
    .replace("statuses/user_timeline", "profile/statuses/tab")
    .replace("max_id", "since_id");
  if (!/containerid=/.test(newUrl)) {
    newUrl = newUrl + "&containerid=230413" + uid + "_-_WEIBO_SECOND_PROFILE_WEIBO";
  }
  $done({ url: newUrl });
} else if (url.includes("profile/statuses/tab")) {
  try {
    let data = JSON.parse($response.body);
    let flat = flattenCards(data.cards, []);
    // 优先取所有带 mblog 的卡片（结构自适应）；兜底传统 card_type===9
    let statuses = flat.filter(c => c && c.mblog).map(c => c.mblog);
    if (!statuses.length) {
      statuses = flat.filter(c => c && c.card_type === 9).map(c => c.mblog);
    }
    // 去重（按 idstr / id / mid）
    let seen = new Set();
    statuses = statuses.filter(s => {
      let k = (s && (s.idstr || s.id || s.mid)) || "";
      if (!k) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    let sinceId = (data.cardlistInfo && data.cardlistInfo.since_id) || "";
    if (!statuses.length) {
      let typeCount = {};
      flat.forEach(c => { let t = c.card_type; typeCount[t] = (typeCount[t] || 0) + 1; });
      // ===== 诊断：完整响应体进 console.log，前 400 字符进通知 =====
      console.log("[VVebo] RAW BODY >>> " + $response.body);
      flat.forEach((c, i) => {
        let brief = { card_type: c.card_type, itemid: c.itemid, title: c.title, desc: c.desc, text: (c.mblog ? c.mblog.text : undefined), show_type: c.show_type };
        console.log("[VVebo] CARD[" + i + "] " + JSON.stringify(brief).slice(0, 400));
      });
      let rawBrief = String($response.body).slice(0, 400);
      $notification.post("VVebo诊断", "RAW> " + rawBrief, "详见Loon脚本日志");
      console.log("[VVebo] " + "cards=" + ((data.cards || []).length) + " flat=" + flat.length + " types=" + JSON.stringify(typeCount));
    }
    $done({ body: JSON.stringify({ statuses, since_id: sinceId, total_number: 100 }) });
  } catch (e) {
    $notification.post("VVebo诊断：脚本异常", e.message, url.slice(0, 120));
    $done({});
  }
} else {
  $done({});
}
