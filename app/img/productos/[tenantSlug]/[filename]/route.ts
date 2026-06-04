import { NextResponse } from "next/server";

type RouteProps = {
  params: Promise<{
    tenantSlug: string;
    filename: string;
  }>;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getLabel(tenantSlug: string) {
  if (tenantSlug === "demo-neumaticos") return "Demo Neumáticos";
  if (tenantSlug === "demo-iluminacion") return "Demo Iluminación";
  if (tenantSlug === "demo-materiales") return "Demo Materiales";
  if (tenantSlug === "demo-gastronomia") return "Demo Gastronomía";
  return "Producto demo";
}

function placeholderSvg(tenantSlug: string) {
  const safeLabel = escapeXml(getLabel(tenantSlug));

  return `
    <svg width="900" height="900" viewBox="0 0 900 900" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="900" fill="#f1f5f9"/>
      <rect x="120" y="120" width="660" height="660" rx="42" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      <circle cx="450" cy="370" r="90" fill="#d1fae5"/>
      <path d="M260 620L390 480L500 590L570 520L660 620H260Z" fill="#a7f3d0"/>
      <text x="450" y="715" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#334155">${safeLabel}</text>
      <text x="450" y="765" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">Imagen en preparación</text>
    </svg>
  `.trim();
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { tenantSlug, filename } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return new NextResponse(placeholderSvg(tenantSlug), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const storageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${encodeURIComponent(
    tenantSlug
  )}/${encodeURIComponent(filename)}`;

  try {
    const response = await fetch(storageUrl, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      return new NextResponse(placeholderSvg(tenantSlug), {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/webp",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(placeholderSvg(tenantSlug), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
