import { NextResponse } from "next/server";
import { getFear, setFear, incFear, decFear, MAX_FEAR } from "@/lib/fearStore";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ value: getFear(), max: MAX_FEAR });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action as "inc" | "dec" | "set";
    const n = Number(body?.value);

    let value = getFear();
    if (action === "inc") value = incFear(1);
    else if (action === "dec") value = decFear(1);
    else if (action === "set") value = setFear(n);

    return NextResponse.json({ value, max: MAX_FEAR });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
