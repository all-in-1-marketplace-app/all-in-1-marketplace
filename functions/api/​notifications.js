export async function onRequestGet(context) {
  const { request, env } = context;
  const email = new URL(request.url).searchParams.get("email");
  
  if (!email) {
    return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM notifications WHERE email = ? ORDER BY created_at DESC`
  ).bind(email).all();

  return new Response(JSON.stringify({ notifications: results || [] }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { notifId, reaction, email, message } = await request.json();

  if (notifId && reaction) {
    await env.DB.prepare(`UPDATE notifications SET reaction = ? WHERE id = ?`)
      .bind(reaction, notifId)
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } 
  
  if (email && message) {
    await env.DB.prepare(`INSERT INTO notifications (email, message) VALUES (?, ?)`)
      .bind(email, message)
      .run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "Invalid parameters" }), { status: 400 });
}
