export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const itemId = url.searchParams.get('item_id');
  const userEmail = url.searchParams.get('email');

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // AUTOMATIC 1-YEAR EXPIRY CLEANUP:
    // Deletes any message where created_at is older than 365 days
    await env.DB.prepare(
      "DELETE FROM item_messages WHERE created_at < datetime('now', '-365 days')"
    ).run();

    let query = "SELECT * FROM item_messages";
    let params = [];

    if (itemId) {
      if (userEmail === 'dayaandjetalal18@gmail.com') {
        query = "SELECT * FROM item_messages WHERE item_id = ? ORDER BY id ASC";
        params = [itemId];
      } else {
        query = "SELECT * FROM item_messages WHERE item_id = ? AND (sender_email = ? OR recipient_email = ?) ORDER BY id ASC";
        params = [itemId, userEmail, userEmail];
      }
    }

    const { results } = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify({ success: true, messages: results || [] }), {
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
    const { item_id, sender_email, sender_name, recipient_email, message } = body;

    if (!item_id || !sender_email || !recipient_email || !message) {
      return new Response(JSON.stringify({ error: "Missing required details" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(
      "INSERT INTO item_messages (item_id, sender_email, sender_name, recipient_email, message) VALUES (?, ?, ?, ?, ?)"
    ).bind(item_id, sender_email, sender_name, recipient_email, message).run();

    return new Response(JSON.stringify({ success: true, message: "Sent!" }), {
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
