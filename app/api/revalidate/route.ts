import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paths, tags, secret } = body;

    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    const revalidatedPaths: string[] = [];

    if (Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
        revalidatedPaths.push(path);
      }
    }

    return NextResponse.json({
      revalidated: true,
      revalidatedPaths,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("[Revalidate] Error:", err);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
