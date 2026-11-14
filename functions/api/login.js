export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { name, email, picture } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Insert or update user in your D1 database
    await env.DB.prepare(
      `INSERT INTO users (name, email, picture) VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET name=excluded.name, picture=excluded.picture`
    ).bind(name, email, picture).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
