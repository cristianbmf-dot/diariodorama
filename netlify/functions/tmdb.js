// Proxy do TMDB: a chave fica só aqui (variável de ambiente TMDB_API_KEY),
// nunca vai para o navegador. Só duas consultas são permitidas.
// Gêneros que não são doramas: reality (10764), talk (10767), notícias (10763), documentário (99), infantil (10762), animação (16)
const BLOCK = [10764, 10767, 10763, 99, 10762, 16];
const RULES = {
  discover: {
    path: "discover/tv",
    fixed: { with_original_language: "ko", with_genres: "18|35", without_genres: BLOCK.join(","), sort_by: "popularity.desc", "vote_count.gte": "150" },
    clean: (q) => ({ page: String(Math.min(Math.max(parseInt(q.page, 10) || 1, 1), 5)) }),
  },
  search: {
    path: "search/tv",
    fixed: {},
    clean: (q) => ({ query: String(q.query || "").trim().slice(0, 80) }),
  },
};

const json = (status, obj, extra = {}) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json; charset=utf-8", ...extra },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Método não permitido" });
  const key = process.env.TMDB_API_KEY;
  if (!key) return json(500, { error: "Chave do TMDB não configurada" });

  const q = event.queryStringParameters || {};
  const rule = RULES[q.action];
  if (!rule) return json(400, { error: "Ação inválida" });
  const extra = rule.clean(q);
  if (q.action === "search" && extra.query.length < 2) return json(400, { error: "Busca muito curta" });

  const url = new URL("https://api.themoviedb.org/3/" + rule.path);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", "pt-BR");
  for (const [k, v] of Object.entries({ ...rule.fixed, ...extra })) url.searchParams.set(k, v);

  try {
    const r = await fetch(url);
    const data = await r.json();
    if (q.action === "search" && Array.isArray(data.results))
      data.results = data.results.filter((x) => !(x.genre_ids || []).some((g) => BLOCK.includes(g)));
    if (!r.ok) return json(r.status === 429 ? 429 : 502, { error: "Falha ao consultar o TMDB" }, { "Cache-Control": "no-store" });
    return json(200, data, {
      "Cache-Control": "public, max-age=3600",
      "Netlify-CDN-Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    });
  } catch (e) {
    return json(502, { error: "TMDB indisponível" }, { "Cache-Control": "no-store" });
  }
};
