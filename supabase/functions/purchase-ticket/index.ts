import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get("Authorization")!
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { drawId } = await req.json()

    if (!drawId) {
      return new Response(JSON.stringify({ error: "drawId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get draw details
    const { data: draw, error: drawError } = await supabase
      .from("Draw")
      .select("*")
      .eq("id", drawId)
      .single()

    if (drawError || !draw) {
      return new Response(JSON.stringify({ error: "Draw not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (draw.status !== "OPEN") {
      return new Response(JSON.stringify({ error: "Draw is not open" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (draw.soldTickets >= draw.maxTickets) {
      return new Response(JSON.stringify({ error: "Draw is sold out" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get wallet and check balance
    const { data: wallet } = await supabase
      .from("Wallet")
      .select("*")
      .eq("userId", user.id)
      .single()

    if (!wallet || wallet.balance < draw.ticketPrice) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check if user already has a ticket for this draw
    const { data: existingTicket } = await supabase
      .from("Ticket")
      .select("id")
      .eq("userId", user.id)
      .eq("drawId", drawId)
      .single()

    if (existingTicket) {
      return new Response(JSON.stringify({ error: "Already purchased a ticket for this draw" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Generate ticket code
    const ticketCode = `LV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("Ticket")
      .insert({
        id: crypto.randomUUID(),
        userId: user.id,
        drawId,
        ticketCode,
        status: "ACTIVE",
        purchasePrice: draw.ticketPrice,
      })
      .select()
      .single()

    if (ticketError) {
      return new Response(JSON.stringify({ error: "Failed to create ticket" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Debit wallet
    await supabase
      .from("Wallet")
      .update({ balance: wallet.balance - draw.ticketPrice })
      .eq("id", wallet.id)

    // Create transaction
    await supabase
      .from("Transaction")
      .insert({
        id: crypto.randomUUID(),
        userId: user.id,
        walletId: wallet.id,
        type: "PURCHASE",
        amount: draw.ticketPrice,
        balanceAfter: wallet.balance - draw.ticketPrice,
        status: "COMPLETED",
        description: `Ticket purchase for ${draw.title}`,
      })

    // Update sold tickets count
    await supabase
      .from("Draw")
      .update({ soldTickets: draw.soldTickets + 1 })
      .eq("id", drawId)

    return new Response(JSON.stringify({ data: ticket }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
