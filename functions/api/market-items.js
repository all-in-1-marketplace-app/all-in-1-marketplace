export async function onRequestGet(context) {
    try {
        const { env } = context;
        const { results } = await env.DB.prepare(
            "SELECT * FROM market_items ORDER BY id DESC"
        ).all();

        return Response.json({ success: true, items: results || [] });
    } catch (e) {
        return Response.json({ success: false, error: e.message, items: [] }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        // If updating status or editing item
        if (body.id && body.status) {
            await env.DB.prepare(
                "UPDATE market_items SET status = ?, item_image = ?, all_photos = ? WHERE id = ?"
            ).bind(body.status, body.item_image, body.all_photos, body.id).run();
            return Response.json({ success: true });
        }

        // Inserting a new market item
        await env.DB.prepare(
            "INSERT INTO market_items (seller_email, seller_name, item_title, item_price, item_image, whatsapp, all_photos, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
            body.seller_email,
            body.seller_name,
            body.item_title,
            body.item_price,
            body.item_image,
            body.whatsapp || '',
            body.all_photos || '[]',
            'AVAILABLE'
        ).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
