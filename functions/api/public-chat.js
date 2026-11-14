export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // 1. Get user chat warning & ban status
    let userRecord = { chat_warnings: 0, chat_banned: 0 };
    if (email) {
      const userRes = await env.DB.prepare(
        "SELECT chat_warnings, chat_banned FROM users WHERE email = ?"
      ).bind(email).first();
      if (userRes) userRecord = userRes;
    }

    // 2. Fetch last 50 public messages
    const { results: messages } = await env.DB.prepare(
      "SELECT sweet_name, message, created_at FROM public_chats ORDER BY id DESC LIMIT 50"
    ).all();

    return new Response(JSON.stringify({
      chat_warnings: userRecord.chat_warnings || 0,
      chat_banned: userRecord.chat_banned || 0,
      messages: (messages || []).reverse()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await request.json();
    const { email, sweet_name, message } = body;

    if (!email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Check if user is already chat banned
    const userRecord = await env.DB.prepare(
      "SELECT chat_warnings, chat_banned FROM users WHERE email = ?"
    ).bind(email).first();

    if (userRecord && userRecord.chat_banned === 1) {
      return new Response(JSON.stringify({ error: "Your chat access is permanently blocked due to terms violations." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Backend Profanity / Vernacular Filter List
    const restrictedWords = ["badword1", "badword2", "abuse", "idiot", "fool", "vernacular_insult_placeholder"];
    const lowerMsg = message.toLowerCase();
    const isProfane = restrictedWords.some(word => lowerMsg.includes(word));

    let warnings = userRecord ? userRecord.chat_warnings : 0;
    let bannedTriggered = false;
    let warningTriggered = false;

    if (isProfane) {
      warnings += 1;
      if (warnings >= 3) {
        bannedTriggered = true;
        await env.DB.prepare(
          "UPDATE users SET chat_warnings = ?, chat_banned = 1 WHERE email = ?"
        ).bind(warnings, email).run();
      } else {
        warningTriggered = true;
        await env.DB.prepare(
          "UPDATE users SET chat_warnings = ? WHERE email = ?"
        ).bind(warnings, email).run();
      }
    }

    // 3. Insert message into public_chats table if not banned on this submission
    if (!bannedTriggered) {
      await env.DB.prepare(
        "INSERT INTO public_chats (email, sweet_name, message) VALUES (?, ?, ?)"
      ).bind(email, sweet_name || "Member", message).run();
    }

    return new Response(JSON.stringify({
      success: true,
      warning_triggered: warningTriggered,
      banned_triggered: bannedTriggered,
      chat_warnings: warnings
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
