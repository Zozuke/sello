import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getTrialInfo, type Profile } from "@/lib/access";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  // Re-validar acceso en el servidor: nunca confiar en el estado del cliente.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }

  const trialInfo = getTrialInfo(profile as Profile);
  if (!trialInfo.hasAccess) {
    return NextResponse.json(
      { error: "Tu día de prueba terminó. Activá tu plan para seguir generando propuestas." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { clientName, projectTitle, scope, timeline, price } = body;

  if (!clientName || !projectTitle || !scope || !timeline || !price) {
    return NextResponse.json({ error: "Faltan campos del formulario." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "El servicio de generación no está configurado todavía." },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Eres un asistente que redacta propuestas de proyecto profesionales para freelancers en español latinoamericano. Escribe una propuesta completa, clara y persuasiva, en tono profesional pero cercano, sin relleno ni frases genéricas vacías.

Datos del proyecto:
- Cliente: ${clientName}
- Título del proyecto: ${projectTitle}
- Qué necesita el cliente: ${scope}
- Tiempo estimado: ${timeline}
- Tarifa o presupuesto: ${price}

Estructura la propuesta con estas secciones, usando texto plano (sin markdown, sin asteriscos, sin numerales como ## o **):

RESUMEN
(2-3 frases sobre el proyecto y el valor que se entrega)

ALCANCE DEL TRABAJO
(lista clara de lo que incluye, en frases cortas separadas por salto de línea)

CRONOGRAMA
(desglose simple del tiempo de ${timeline} en etapas)

INVERSIÓN
(el precio ${price}, explicando la forma de pago de manera profesional)

CONDICIONES
(2-3 condiciones razonables: validez de la propuesta, qué pasa con cambios de alcance, próximos pasos)

Escribe en español, directo, sin exagerar con adjetivos. El objetivo es que el cliente sienta confianza y claridad, no que lo abrumen con texto de venta.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    const { data: savedProposal, error: insertError } = await supabase
      .from("proposals")
      .insert({
        user_id: userData.user.id,
        client_name: clientName,
        project_title: projectTitle,
        content,
        price_quoted: price,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "La propuesta se generó pero no se pudo guardar." },
        { status: 500 }
      );
    }

    return NextResponse.json({ proposal: savedProposal });
  } catch (err) {
    console.error("Error generando propuesta:", err);
    return NextResponse.json(
      { error: "No se pudo generar la propuesta. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
