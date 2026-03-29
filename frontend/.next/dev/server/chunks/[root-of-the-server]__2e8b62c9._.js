module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/frontend/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "pool",
    ()=>pool
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const getPgConnectionString = ()=>{
    if (process.env.DIRECT_DATABASE_URL) return process.env.DIRECT_DATABASE_URL;
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    return null;
};
const connectionString = getPgConnectionString();
if (!connectionString) {
    console.error('[DB] CRITICAL: No connection string found in .env');
}
// Global pool to prevent connection leaks during hot reloading in Next.js
const globalForPool = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const pool = globalForPool.pool ?? new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
    connectionString: connectionString || '',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: connectionString?.includes('supabase') || connectionString?.includes('neon') ? {
        rejectUnauthorized: false
    } : undefined
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPool.pool = pool;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/frontend/src/lib/gemini.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildTrekEmbeddingText",
    ()=>buildTrekEmbeddingText,
    "cosineSimilarity",
    ()=>cosineSimilarity,
    "generateEmbedding",
    ()=>generateEmbedding
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY || '');
async function generateEmbedding(text) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-embedding-001'
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
}
function buildTrekEmbeddingText(trek) {
    const parts = [
        trek.title,
        trek.description,
        `Difficulty: ${trek.difficulty}`,
        `Location: ${trek.location}`,
        `Duration: ${trek.durationDays} days`
    ];
    if (trek.maxAltitude) parts.push(`Max Altitude: ${trek.maxAltitude}m`);
    if (trek.bestSeason) parts.push(`Best Season: ${trek.bestSeason}`);
    if (trek.highlights?.length) parts.push(`Highlights: ${trek.highlights.join(', ')}`);
    return parts.join('. ');
}
function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for(let i = 0; i < a.length; i++){
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}
}),
"[project]/frontend/src/app/api/treks/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$gemini$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/gemini.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET(req) {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].connect();
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');
        const difficulty = searchParams.get('difficulty');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const minDays = searchParams.get('minDays');
        const maxDays = searchParams.get('maxDays');
        const sort = searchParams.get('sort');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');
        const offset = (page - 1) * limit;
        // ─── Semantic AI Search ───
        if (q && q.trim().length > 0) {
            try {
                const queryEmbedding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$gemini$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateEmbedding"])(q);
                // Fetch all treks with embeddings (filtering in memory for demo simplicity)
                // In production, you would use pgvector on Supabase/Neon.
                const res = await client.query('SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights, "coverImage", embedding FROM "Trek"');
                let treks = res.rows;
                // Apply filters
                if (difficulty) treks = treks.filter((t)=>t.difficulty === difficulty);
                if (minPrice) treks = treks.filter((t)=>t.price >= parseFloat(minPrice));
                if (maxPrice) treks = treks.filter((t)=>t.price <= parseFloat(maxPrice));
                if (minDays) treks = treks.filter((t)=>t.durationDays >= parseInt(minDays));
                if (maxDays) treks = treks.filter((t)=>t.durationDays <= parseInt(maxDays));
                // Score similarity
                const scored = treks.map((trek)=>{
                    const similarity = trek.embedding && trek.embedding.length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$gemini$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cosineSimilarity"])(queryEmbedding, trek.embedding) : 0;
                    return {
                        trek,
                        similarity
                    };
                }).filter((item)=>item.similarity > 0.6); // Reasonable threshold
                // Sort
                if (sort === 'price_asc') scored.sort((a, b)=>a.trek.price - b.trek.price);
                else if (sort === 'price_desc') scored.sort((a, b)=>b.trek.price - a.trek.price);
                else scored.sort((a, b)=>b.similarity - a.similarity);
                const total = scored.length;
                const paged = scored.slice(offset, offset + limit);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    treks: paged.map(({ trek, similarity })=>{
                        const { embedding, ...rest } = trek;
                        return {
                            ...rest,
                            _relevance: Math.round(similarity * 100)
                        };
                    }),
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    },
                    searchMode: 'semantic'
                });
            } catch (e) {
                console.warn('Semantic search failed, falling back to keyword:', e.message);
            }
        }
        // ─── Traditional Keyword Search / Browse ───
        let query = 'SELECT COUNT(*) FROM "Trek" WHERE 1=1';
        let dataQuery = 'SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights, "coverImage" FROM "Trek" WHERE 1=1';
        const params = [];
        let pCount = 0;
        const addFilter = (condition, value)=>{
            pCount++;
            query += ` AND ${condition} $${pCount}`;
            dataQuery += ` AND ${condition} $${pCount}`;
            params.push(value);
        };
        if (q) {
            pCount++;
            const searchStr = `%${q}%`;
            query += ` AND (title ILIKE $${pCount} OR description ILIKE $${pCount})`;
            dataQuery += ` AND (title ILIKE $${pCount} OR description ILIKE $${pCount})`;
            params.push(searchStr);
        }
        if (difficulty) addFilter('difficulty =', difficulty);
        if (minPrice) addFilter('price >=', parseFloat(minPrice));
        if (maxPrice) addFilter('price <=', parseFloat(maxPrice));
        if (minDays) addFilter('"durationDays" >=', parseInt(minDays));
        if (maxDays) addFilter('"durationDays" <=', parseInt(maxDays));
        // Sort
        if (sort === 'price_asc') dataQuery += ' ORDER BY price ASC';
        else if (sort === 'price_desc') dataQuery += ' ORDER BY price DESC';
        else dataQuery += ' ORDER BY "createdAt" DESC';
        // Pagination
        dataQuery += ` LIMIT $${pCount + 1} OFFSET $${pCount + 2}`;
        const countRes = await client.query(query, params);
        const dataRes = await client.query(dataQuery, [
            ...params,
            limit,
            offset
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            treks: dataRes.rows,
            pagination: {
                total: parseInt(countRes.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit)
            },
            searchMode: q ? 'keyword' : 'browse'
        });
    } catch (error) {
        console.error('Error fetching treks:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch treks'
        }, {
            status: 500
        });
    } finally{
        client.release();
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2e8b62c9._.js.map