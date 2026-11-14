export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, businessName, category, phone, address } = await request.json();

    if (!email || !businessName || !category) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(
      `INSERT INTO businesses (user_email, business_name, category, phone, address) VALUES (?, ?, ?, ?, ?)`
    ).bind(email, businessName, category, phone, address).run();

    return new Response(JSON.stringify({ success: true, message: "Business registered successfully!" }), {
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
