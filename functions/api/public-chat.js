export async function onRequestGet(context) {
    try {
        const { env } = context;
        const { results } = await env.DB.prepare("SELECT * FROM public_chats ORDER BY created_at ASC LIMIT 100").all();
        return Response.json({ success: true, messages: results || [] });
    } catch (e) {
        return Response.json({ success: false, messages: [], error: e.message });
    }
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { sender_email, sender_name, message } = body;

        if (!message || !message.trim()) {
            return Response.json({ success: false, error: "Message cannot be empty." }, { status: 400 });
        }

        await env.DB.prepare(
            "INSERT INTO public_chats (sender_email, sender_name, message, created_at) VALUES (?, ?, ?, ?)"
        ).bind(sender_email, sender_name, message, new Date().toISOString()).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
