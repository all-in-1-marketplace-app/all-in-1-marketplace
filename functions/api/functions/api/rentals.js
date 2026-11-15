export async function onRequestGet(context) {
    try {
        const { env } = context;
        const { results } = await env.DB.prepare(
            "SELECT * FROM rentals ORDER BY id DESC"
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

        await env.DB.prepare(
            "INSERT INTO rentals (owner_email, owner_name, rental_type, sub_type, title, price, location, image, all_photos, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
            body.owner_email,
            body.owner_name,
            body.rental_type,
            body.sub_type || '',
            body.title,
            body.price,
            body.location,
            body.image,
            body.all_photos || '[]',
            'AVAILABLE'
        ).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
