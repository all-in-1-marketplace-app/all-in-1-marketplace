export async function onRequestGet(context) {
  const { env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Fetch all items that are still available (not sold)
    const { results: items } = await env.DB.prepare(
      "SELECT * FROM marketplace_items WHERE status = 'AVAILABLE' ORDER BY id DESC"
    ).all();

    return new Response(JSON.stringify({ success: true, items: items || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await request.json();
    const { seller_email, seller_name, item_title, item_price, item_image } = body;

    if (!seller_email || !item_title || !item_price) {
      return new Response(JSON.stringify({ error: "Missing required item details" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Insert item into D1 database so it stays permanently until sold
    await env.DB.prepare(
      "INSERT INTO marketplace_items (seller_email, seller_name, item_title, item_price, item_image, status) VALUES (?, ?, ?, ?, ?, 'AVAILABLE')"
    ).bind(seller_email, seller_name || "Seller", item_title, item_price, item_image || "https://via.placeholder.com/150").run();

    return new Response(JSON.stringify({ success: true, message: "Item listed successfully!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
