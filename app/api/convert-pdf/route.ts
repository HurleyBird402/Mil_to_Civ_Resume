// app/api/convert-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openaiClient, SYSTEM_PROMPT } from "@/lib/openai";
import { applyGlossaryToText, getGlossary } from "@/lib/glossary";

export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "20mb",
  },
};

export async function POST(req: NextRequest) {
  try {
    // Dynamic import for pdf-extraction (CommonJS module)
    const { default: pdf } = await import("pdf-extraction");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "PDF file missing or invalid." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 1. Extract PDF text
    const data = await pdf(pdfBuffer);
    // We keep this 'extractedText' to send back to the frontend for the comparison view
    const extractedText = data.text?.trim() ?? "";

    if (!extractedText) {
      return NextResponse.json(
        { error: "Unable to extract text from PDF." },
        { status: 400 }
      );
    }

    // 2. Glossary preprocessing
    const glossary = await getGlossary();
    const preprocessed = applyGlossaryToText(extractedText, glossary);

    // 3. Call OpenAI (asking for JSON output via the updated SYSTEM_PROMPT)
    const response = await openaiClient.responses.create({
      model: "gpt-4.1-mini", 
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

    // 4. Parse the Output into JSON
    // OpenAI often wraps JSON in markdown code blocks (e.g. ```json ... ```). We strip them.
    const cleanJson = rawOutput
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedResume;
    
    try {
      parsedResume = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw Output meant for JSON:", rawOutput);
      
      // Fallback: If JSON parsing fails, return an object with the error and raw text
      // This prevents the frontend from crashing entirely
      return NextResponse.json({
        error: "Failed to parse resume structure",
        output: rawOutput, 
        originalText: extractedText
      });
    }

    // 5. Return the Structured Data AND the Original Text
    return NextResponse.json({
      output: parsedResume,      // The polished JSON object
      originalText: extractedText, // The raw text for the "Before" view
    });

  } catch (err: any) {
    console.error("❌ Error in /api/convert-pdf:", err);
    return NextResponse.json(
      {
        error: "PDF conversion failed",
        details: err.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}