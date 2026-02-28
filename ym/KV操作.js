const KV = (() => {
  const BASE_URL = "KV_API";
  const API_KEY = "KV_KEY";

  async function putKV(key, value = "1") {
    try {
      const res = await fetch(`${BASE_URL}/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ value })
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { success: false, message: "invalid response" };
      }
      return json.success === true;
    } catch (err) {
      console.error("[KV putKV] Error:", err);
      return false;
    }
  }

  async function getKV(key) {
    try {
      const res = await fetch(`${BASE_URL}/${key}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_KEY}`
        }
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { success: false, message: "invalid response" };
      }
      return json.success === true ? json.data : false;
    } catch (err) {
      console.error("[KV getKV] Error:", err);
      return false;
    }
  }

  return { putKV, getKV };
})();
