export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const itemId = url.searchParams.get('item_id');

        const { results } = await env.DB.prepare(
            "SELECT * FROM item_messages WHERE item_id = ? ORDER BY created_at ASC"
        ).bind(itemId).all();

        return Response.json({ success: true, messages: results || [] });
    } catch (e) {
        return Response.json({ success: false, messages: [], error: e.message });
    }
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { item_id, sender_email, sender_name, recipient_email, message } = body;

        await env.DB.prepare(
            "INSERT INTO item_messages (item_id, sender_email, sender_name, recipient_email, message, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(item_id, sender_email, sender_name, recipient_email, message, new Date().toISOString()).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
