export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(JSON.stringify({ exists: false }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const stmt = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first();
    if (stmt) {
      return new Response(JSON.stringify({
        exists: true,
        profile: {
          email: stmt.email,
          picture: stmt.picture,
          sweetName: stmt.sweet_name,
          age: stmt.age,
          maritalStatus: stmt.marital_status,
          children: stmt.children,
          dob: stmt.dob,
          religion: stmt.religion,
          employmentStatus: stmt.employment_status,
          empType: stmt.emp_type,
          aadharNumber: stmt.aadhar_number,
          panNumber: stmt.pan_number,
          faceIdUrl: stmt.face_id_url,
          mobileNumber: stmt.mobile_number
        }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ exists: false }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    if (!data.email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    await env.DB.prepare(
      `INSERT INTO users (
        email, picture, sweet_name, age, marital_status, children, 
        dob, religion, employment_status, emp_type, aadhar_number, pan_number, face_id_url, mobile_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET 
        picture=excluded.picture,
        sweet_name=COALESCE(excluded.sweet_name, sweet_name),
        age=COALESCE(excluded.age, age),
        marital_status=COALESCE(excluded.marital_status, marital_status),
        children=COALESCE(excluded.children, children),
        dob=COALESCE(excluded.dob, dob),
        religion=COALESCE(excluded.religion, religion),
        employment_status=COALESCE(excluded.employment_status, employment_status),
        emp_type=COALESCE(excluded.emp_type, emp_type),
        aadhar_number=COALESCE(excluded.aadhar_number, aadhar_number),
        pan_number=COALESCE(excluded.pan_number, pan_number),
        face_id_url=COALESCE(excluded.face_id_url, face_id_url),
        mobile_number=COALESCE(excluded.mobile_number, mobile_number)`
    ).bind(
      data.email, data.picture || '', data.sweetName || '', data.age || null, 
      data.maritalStatus || '', data.children || '0', data.dob || '', data.religion || '', 
      data.employmentStatus || '', data.empType || '', data.aadharNumber || '', 
      data.panNumber || '', data.faceIdUrl || '', data.mobileNumber || ''
    ).run();

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
