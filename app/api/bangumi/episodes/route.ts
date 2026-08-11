import { NextResponse } from "next/server";
import { patchEpisodeProgress } from "@/lib/bangumi";

export const dynamic = "force-dynamic";

const SECRET = process.env.SITE_EDIT_SECRET;

export async function POST(req: Request) {
  if (SECRET) {
    const auth = req.headers.get("x-site-secret");
    if (auth !== SECRET) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).origin !== new URL(siteUrl).origin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const token = process.env.BANGUMI_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "BANGUMI_TOKEN 未配置" },
      { status: 500 },
    );
  }

  let body: { subjectId?: unknown; episodeId?: unknown; type?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const subjectId = Number(body?.subjectId);
  const episodeId = Number(body?.episodeId);
  const type = Number(body?.type);
  if (
    !Number.isInteger(subjectId) ||
    !Number.isInteger(episodeId) ||
    ![0, 1, 2, 3].includes(type)
  ) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    await patchEpisodeProgress(
      subjectId,
      [episodeId],
      type as 0 | 1 | 2 | 3,
      token,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "写回 Bangumi 失败",
      },
      { status: 502 },
    );
  }
}
