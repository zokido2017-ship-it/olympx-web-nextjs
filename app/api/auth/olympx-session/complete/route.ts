import type { NextRequest } from "next/server";



import { handleSessionCompletePost } from "@/lib/olympx/session-complete-post";



export const dynamic = "force-dynamic";

export const runtime = "nodejs";



/** Form POST target (must not share a segment with page.tsx — Next.js forbids route+page). */

export async function POST(request: NextRequest) {

  return handleSessionCompletePost(request);

}


