import { NextRequest, NextResponse } from "next/server";
import { openaiClient, SYSTEM_PROMPT } from "@/lib/openai";
import { applyGlossaryToText, getGlossary } from "@/lib/glossary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided." },
        { status: 400 }
      );
    }

    // 1. Glossary Preprocessing (Offline Mode)
    const glossary = await getGlossary();
    const preprocessed = applyGlossaryToText(text, glossary);

    // 2. OpenAI Call
    const response = await openaiClient.responses.create({
      model: "gpt-4.1-mini", // Or "gpt-4o-mini"
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `
            Analyze the following military resume text.
            Translate it and format it into the strict JSON structure defined in the system prompt.
            
            USER RESUME TEXT:
            ${preprocessed}
          `.trim(),
        },
      ],
    });

    const rawOutput = response.output_text ?? "";

    // 3. Clean and Parse JSON
    const cleanJson = rawOutput
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedResume;
    try {
      parsedResume = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({
        error: "Failed to parse resume structure",
        output: rawOutput,
        originalText: text 
      });
    }

    // 4. Return Success
    return NextResponse.json({
      output: parsedResume,
      originalText: text, // Pass back the original text for the comparison view
    });

  } catch (err: any) {
    console.error("❌ Error in /api/convert:", err);
    return NextResponse.json(
      {
        error: "Conversion failed",
        details: err.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}