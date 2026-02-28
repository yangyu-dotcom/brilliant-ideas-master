export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      return Response.redirect("https://space.bilibili.com/266986139", 301);
    }

    const allowedMethods = ["PUT", "GET", "OPTIONS"];
    if (!allowedMethods.includes(request.method)) {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const origin = request.headers.get("Origin");
    const ALLOWED_ORIGIN = "https://www.douyin.com";

    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden: Invalid Origin", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "PUT, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const key = url.pathname.slice(4);

    if (!key || !key.startsWith("id=")) {
      return jsonError("format error", 400, ALLOWED_ORIGIN);
    }

    if (key.length > 41) {
      return jsonError("long", 400, ALLOWED_ORIGIN);
    }

    const frontendApiKey = request.headers.get("Authorization");
    const VALID_API_KEY = "API_KEY";
    if (frontendApiKey !== `Bearer ${VALID_API_KEY}`) {
      return jsonError("Unauthorized", 401, ALLOWED_ORIGIN);
    }

    try {
      if (request.method === "PUT") {
        const body = await request.json();
        const { value } = body;

        if (value !== "1") {
          return jsonError("error", 400, ALLOWED_ORIGIN);
        }

        const exists = await env.KV_NAMESPACE.get(key);
        if (exists !== null) {
          return jsonError("repeat", 409, ALLOWED_ORIGIN);
        }

        await env.KV_NAMESPACE.put(key, "1");
        return jsonOK("ok", ALLOWED_ORIGIN);
      }

      if (request.method === "GET") {
        const value = await env.KV_NAMESPACE.get(key);
        if (value === null) {
          return jsonError("no", 404, ALLOWED_ORIGIN);
        }
        return jsonData(value, ALLOWED_ORIGIN);
      }
    } catch (error) {
      return jsonError(error.message, 500, ALLOWED_ORIGIN);
    }
  },
};

function jsonError(msg, status, origin) {
  return new Response(JSON.stringify({ success: false, message: msg }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
    },
  });
}

function jsonOK(msg, origin) {
  return new Response(JSON.stringify({ success: true, message: msg }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
    },
  });
}

function jsonData(data, origin) {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
    },
  });
}
