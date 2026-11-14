export async function onRequestGet(context) {
  const { request, env } = context;
  const email = new URL(request.url).searchParams.get("email");
  
  if (!email) {
    return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
  }

  const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first();
  
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({
    profile: {
      email: user.email,
      sweetName: user.sweet_name || user.sweetName,
      age: user.age,
      maritalStatus: user.marital_status || user.maritalStatus,
      children: user.children,
      dob: user.dob,
      religion: user.religion,
      employmentStatus: user.employment_status || user.employmentStatus,
      panNumber: user.pan_number || user.panNumber,
      mobileNumber: user.mobile_number || user.mobileNumber,
      faceIdUrl: user.face_id_url || user.faceIdUrl
    }
  }), { headers: { "Content-Type": "application/json" } });
}
