// app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openaiClient, SYSTEM_PROMPT } from "@/lib/openai";
import { applyGlossaryToText, getGlossary } from "@/lib/glossary";
import { enforceFormatting } from "@/lib/formatting";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: 'Missing "text" in body' },
        { status: 400 }
      );
    }

    const glossaryEntries = await getGlossary();
    const preprocessed = applyGlossaryToText(text, glossaryEntries);

    const response = await openaiClient.responses.create({
      model: "gpt-4.1-mini",
      instructions: SYSTEM_PROMPT,
      input: preprocessed,
    });

    const outputText = response.output_text ?? "";
    const cleaned = enforceFormatting(outputText);

    return NextResponse.json({ output: cleaned });
  } catch (err: any) {
    console.error("Error in /api/convert:", err);
    return NextResponse.json(
      { error: "Failed to convert resume", details: err?.message },
      { status: 500 }
    );
  }
}
