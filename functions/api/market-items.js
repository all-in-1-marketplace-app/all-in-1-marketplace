export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM market_items ORDER BY id DESC").all();
      return Response.json({ success: true, items: results }, { headers: corsHeaders });
    }

    if (method === "POST") {
      const data = await request.json();
      if (data.id) {
        // Update existing item / vehicle (status, photos, description)
        await env.DB.prepare(
          `UPDATE market_items SET item_title = ?, item_price = ?, item_image = ?, all_photos = ?, whatsapp = ?, status = ?, description = ? WHERE id = ?`
        ).bind(
          data.item_title,
          data.item_price,
          data.item_image,
          data.all_photos,
          data.whatsapp,
          data.status || 'AVAILABLE',
          data.description || '',
          data.id
        ).run();
      } else {
        // Insert new item or vehicle listing
        await env.DB.prepare(
          `INSERT INTO market_items (seller_email, seller_name, item_title, item_price, item_image, all_photos, whatsapp, status, description, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          data.seller_email,
          data.seller_name,
          data.item_title,
          data.item_price,
          data.item_image,
          data.all_photos,
          data.whatsapp,
          data.status || 'AVAILABLE',
          data.description || '',
          data.category || 'GENERAL'
        ).run();
      }
      return Response.json({ success: true }, { headers: corsHeaders });
    }
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
