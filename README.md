# Sello — Generador de propuestas para freelancers

PWA que genera propuestas profesionales con IA (Gemini). Día gratis de 24
horas, luego suscripción de $14.99/mes vía Stripe. Base de datos y
autenticación con Supabase.

---

## 0. Qué necesitás antes de empezar

- Una cuenta de [Supabase](https://supabase.com) (gratis)
- Una API key de [Gemini](https://aistudio.google.com/apikey) (gratis para empezar)
- Una cuenta de [Stripe](https://stripe.com) (gratis, cobra comisión solo por venta real)
- Una cuenta de [Vercel](https://vercel.com) para desplegar (gratis)
- Una cuenta de GitHub (gratis) para subir el código

No necesitás saber programar para seguir estos pasos, pero sí necesitás
seguirlos en orden.

---

## 1. Crear el proyecto en Supabase

1. Entrá a supabase.com → **New Project**.
2. Elegí nombre, contraseña de base de datos (guardala) y región.
3. Cuando el proyecto esté listo, ve a **SQL Editor** → **New query**.
4. Abrí el archivo `supabase/schema.sql` de este proyecto, copiá **todo** su
   contenido, pegalo en el editor de Supabase y hacé clic en **Run**.
   Esto crea las tablas `profiles` y `proposals`, y la lógica que asigna
   el día gratis automáticamente a cada nuevo usuario.
5. Ve a **Settings → API**. Vas a necesitar tres valores:
   - **Project URL**
   - **anon public key**
   - **service_role key** (en la misma página, más abajo — es secreta)
6. Ve a **Authentication → Providers** y confirmá que **Email** esté
   habilitado (lo está por defecto). Esto es lo que permite el login por
   "magic link" (enlace mágico sin contraseña).
7. Ve a **Authentication → URL Configuration** y en **Redirect URLs**
   agregá (más adelante, cuando tengas tu dominio de Vercel):
   `https://tu-dominio.vercel.app/auth/callback`

---

## 2. Obtener tu API key de Gemini

1. Entrá a [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Creá una API key nueva.
3. Guardala — es el valor de `GEMINI_API_KEY`.

---

## 3. Configurar Stripe

1. Entrá a tu [dashboard de Stripe](https://dashboard.stripe.com). Trabajá
   primero en **modo de prueba** (toggle "Test mode" arriba a la derecha).
2. Ve a **Product catalog → Add product**.
   - Nombre: `Sello — Plan mensual`
   - Precio: `$14.99 USD`, recurrente, **Monthly**.
   - Guardá y copiá el **Price ID** (empieza con `price_...`).
3. Ve a **Developers → API keys** y copiá la **Secret key** (`sk_test_...`).
4. El **webhook** lo vas a configurar en el paso 5, después de desplegar
   (Stripe necesita una URL pública real para mandar los eventos).

---

## 4. Subir el código a GitHub

Si no tenés Git instalado o nunca usaste GitHub, la forma más simple:

1. Entrá a [github.com/new](https://github.com/new) y creá un repositorio
   nuevo (puede ser privado).
2. Subí todos los archivos de esta carpeta usando la opción **"uploading an
   existing file"** en la página del repo (arrastrás la carpeta completa).

---

## 5. Desplegar en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) y conectá tu cuenta de
   GitHub.
2. Elegí el repositorio que subiste.
3. Antes de hacer clic en "Deploy", abrí la sección **Environment
   Variables** y agregá cada una de estas (los valores que ya copiaste):

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | tu Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | tu service_role key |
   | `GEMINI_API_KEY` | tu API key de Gemini |
   | `STRIPE_SECRET_KEY` | tu secret key de Stripe (modo test por ahora) |
   | `STRIPE_PRICE_ID` | el price ID que copiaste |
   | `STRIPE_WEBHOOK_SECRET` | dejalo vacío por ahora, lo completás en el paso 6 |
   | `NEXT_PUBLIC_SITE_URL` | dejalo vacío por ahora |

4. Hacé clic en **Deploy**. En 1-2 minutos vas a tener una URL como
   `https://sello-tunombre.vercel.app`.
5. Volvé a **Settings → Environment Variables** en Vercel y completá
   `NEXT_PUBLIC_SITE_URL` con esa URL real. Volvé a desplegar (Vercel →
   Deployments → ⋯ → Redeploy) para que tome el cambio.
6. Volvé a Supabase → **Authentication → URL Configuration** y agregá tu
   URL real de Vercel + `/auth/callback` en Redirect URLs (paso 1.7).

---

## 6. Conectar el webhook de Stripe (paso final, importante)

Este paso es lo que hace que, cuando alguien paga, su cuenta se active
automáticamente.

1. En Stripe → **Developers → Webhooks → Add endpoint**.
2. **Endpoint URL**: `https://tu-dominio.vercel.app/api/stripe-webhook`
3. **Eventos a escuchar** — seleccioná estos cuatro:
   - `checkout.session.completed`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Guardá. Stripe te muestra un **Signing secret** (`whsec_...`) — copialo.
5. Volvé a Vercel → Environment Variables → completá
   `STRIPE_WEBHOOK_SECRET` con ese valor → Redeploy.

---

## 7. Probar todo de punta a punta

1. Abrí tu sitio en el navegador del celular y agregalo a la pantalla de
   inicio (esto la instala como PWA).
2. Registrate con tu correo → revisá el correo → entrá con el enlace.
3. Generá una propuesta de prueba.
4. Para probar el pago: usá la [tarjeta de prueba de
   Stripe](https://docs.stripe.com/testing) `4242 4242 4242 4242`, cualquier
   fecha futura y cualquier CVC.
5. Confirmá en Supabase (Table editor → profiles) que tu usuario pasó a
   `subscription_status = active` después de pagar.

Cuando todo funcione en modo de prueba, repetí los pasos 3 y 6 con tus
claves **reales** (modo "Live") de Stripe para empezar a cobrar de verdad.

---

## Cómo funciona el día gratis

- Cada usuario nuevo arranca con `subscription_status = 'trial'` y
  `trial_started_at = ahora`.
- `lib/access.ts` calcula si pasaron menos de 24 horas desde ese momento.
- Si pasaron más de 24h y no hay suscripción activa, se muestra la
  pantalla de pago (`PaywallScreen`) en vez del generador.
- Esta validación se hace **también en el servidor** (no solo en la
  pantalla) en `app/api/generate-proposal/route.ts`, así que nadie puede
  saltarse el límite manipulando el navegador.

## Cambiar el precio o la duración del trial

- Precio: cambialo directamente en Stripe (Product catalog) y actualizá
  `STRIPE_PRICE_ID` si creás un precio nuevo. También actualizá los textos
  `$14.99` en `app/page.tsx` y `components/PaywallScreen.tsx`.
- Duración del trial: cambiá `TRIAL_HOURS` en `lib/access.ts`.
