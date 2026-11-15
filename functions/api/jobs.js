export async function onRequestGet(context) {
    try {
        const { env, request } = context;
        const url = new URL(request.url);
        const maxKm = parseInt(url.searchParams.get('max_km')) || 150;

        const { results } = await env.DB.prepare(
            "SELECT * FROM job_vacancies WHERE distance_km <= ? ORDER BY distance_km ASC"
        ).bind(maxKm).all();

        return Response.json({ success: true, items: results || [] });
    } catch (e) {
        return Response.json({ success: false, error: e.message, items: [] }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        // If posting a new job vacancy
        if (body.action === 'post_job') {
            await env.DB.prepare(
                "INSERT INTO job_vacancies (employer_email, title, company, salary, distance_km, location, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(
                body.employer_email || '',
                body.title || '',
                body.company || '',
                body.salary || '',
                parseFloat(body.distance_km) || 5,
                body.location || '',
                body.description || '',
                'ACTIVE'
            ).run();
            return Response.json({ success: true });
        }

        // If submitting a job application
        if (body.action === 'apply_job') {
            await env.DB.prepare(
                "INSERT INTO job_applications (job_id, applicant_email, applicant_name, contact, note) VALUES (?, ?, ?, ?, ?)"
            ).bind(
                body.job_id,
                body.applicant_email || '',
                body.applicant_name || '',
                body.contact || '',
                body.note || ''
            ).run();
            return Response.json({ success: true });
        }

        return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
