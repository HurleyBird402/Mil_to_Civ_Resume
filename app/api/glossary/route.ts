import { NextRequest, NextResponse } from "next/server";
import { redis, isRedisConfigured } from "@/lib/redis";

// --- CONFIGURATION ---
// Force Next.js to not cache this route, so we always get fresh DB data
export const dynamic = 'force-dynamic'; 

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "objective-omega-secret"; 

export async function GET() {
    try {
      // 1. Debug Log (This will show in your VS Code terminal)
      console.log("🔍 Checking Database Connection...");
      
      if (!isRedisConfigured()) {
        console.warn("⚠️ Database not configured. Returning empty list.");
        return NextResponse.json([]);
      }

      // 2. Attempt Fetch
      console.log("✅ Connection found. Fetching terms...");
      const glossaryMap = await redis.hgetall("glossary:terms");
      
      const glossaryArray = Object.entries(glossaryMap || {}).map(([term, definition]) => ({
        term,
        definition: definition as string,
      }));
      
      console.log(`📦 Fetched ${glossaryArray.length} terms.`);
      return NextResponse.json(glossaryArray);

    } catch (error: any) {
      // 3. CRITICAL LOGGING
      console.error("❌ FATAL DATABASE ERROR:", error);
      
      // Return the actual error message to the frontend so we can see it
      return NextResponse.json(
        { error: "Failed to fetch", details: error.message }, 
        { status: 500 }
      );
    }
  }

export async function POST(req: NextRequest) {
  try {
    const password = req.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { military, civilian } = body; 

    if (isRedisConfigured()) {
        await redis.hset("glossary:terms", { [military]: civilian });
        return NextResponse.json({ success: true });
    } 
    return NextResponse.json({ error: "Database not connected" }, { status: 500 });

  } catch (error) {
    console.error("❌ POST ERROR:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}