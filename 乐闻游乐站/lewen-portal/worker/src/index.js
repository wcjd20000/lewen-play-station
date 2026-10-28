const ALLOWED_CATEGORIES = ["科技", "游戏", "生活", "综合"];
function textOf(node, names) {
  for (const name of names) {
    const el = node.getElementsByTagName(name)[0] || node.getElementsByTagNameNS("*", name)[0];
    if (el && el.textContent) return el.textContent.trim();
  }
  return "";
}
function parseFeed(xml, feedUrl) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return [];
  const nodes = [...doc.querySelectorAll("item"), ...doc.getElementsByTagNameNS("*", "entry")];
  return nodes.slice(0, 30).map((node, i) => {
    const title = textOf(node, ["title"]);
    const summary = textOf(node, ["description", "summary", "content"]);
    let articleUrl = textOf(node, ["link"]);
    const linkNode = node.getElementsByTagName("link")[0] || node.getElementsByTagNameNS("*", "link")[0];
    if (linkNode) articleUrl = linkNode.getAttribute("href") || articleUrl;
    let date = textOf(node, ["pubDate", "published", "updated"]);
    try { date = date ? new Date(date).toISOString().slice(0, 10) : ""; } catch { date = ""; }
    let category = textOf(node, ["category"]) || "综合";
    if (!ALLOWED_CATEGORIES.includes(category)) category = "综合";
    try { if (new URL(articleUrl).protocol !== "https:") articleUrl = ""; } catch { articleUrl = ""; }
    return { id: `${feedUrl}-${i}`, category, date, title: title.slice(0, 180), summary: summary.replace(/<[^>]*>/g, " ").slice(0, 500), source: new URL(feedUrl).hostname, url: articleUrl };
  }).filter(x => x.title && x.url);
}
export default {
  async fetch(request, env) {
    const headers = {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"GET, OPTIONS", "Access-Control-Allow-Headers":"Content-Type", "Content-Type":"application/json; charset=utf-8", "Cache-Control":"public, max-age=300"};
    if (request.method === "OPTIONS") return new Response(null, {headers});
    const url = new URL(request.url);
    if (url.pathname !== "/news") return Response.json({ok:true, service:"lewen-news-api", endpoint:"/news"}, {headers});
    if (request.method !== "GET") return Response.json({error:"Method not allowed"}, {status:405, headers});
    const feeds = (env.RSS_FEEDS || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 8);
    if (!feeds.length) return Response.json({items:[], warning:"请在 Worker 环境变量 RSS_FEEDS 中配置已获许可的 HTTPS RSS 源。"}, {headers});
    const items = [];
    for (const feed of feeds) {
      try {
        const feedUrl = new URL(feed);
        if (feedUrl.protocol !== "https:") continue;
        const response = await fetch(feedUrl.href, {headers:{"User-Agent":"LewenPortalRSS/1.0"}, signal:AbortSignal.timeout(8000)});
        if (!response.ok) continue;
        const xml = await response.text();
        if (xml.length > 1_000_000) continue;
        items.push(...parseFeed(xml, feedUrl.href));
      } catch {}
    }
    items.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
    return Response.json({updatedAt:new Date().toISOString(), items:items.slice(0, 60)}, {headers});
  }
};
