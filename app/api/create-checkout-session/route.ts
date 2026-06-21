import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripeSecretKey || !priceId) {
    return NextResponse.json(
      { error: "El cobro no está configurado todavía." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", userData.user.id)
    .single();

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : profile?.email,
      client_reference_id: userData.user.id,
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=canceled`,
      metadata: { supabase_user_id: userData.user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creando sesión de Stripe:", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
