import { NextRequest, NextResponse } from "next/server";
import { openaiClient, SYSTEM_PROMPT } from "@/lib/openai";
import { applyGlossaryToText, getGlossary } from "@/lib/glossary";

// Standard Node Runtime for PDF processing
export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "4.5mb",
  },
};

export async function POST(req: NextRequest) {
  try {
    
    // @ts-ignore
    const pdfjs = await import("pdfjs-dist/build/pdf.min.mjs");
    await import("pdfjs-dist/build/pdf.worker.min.mjs");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    // 1. Extract Contact Overrides
    const contactOverridesJson = formData.get("contactOverrides") as string | null;
    const contactOverrides = contactOverridesJson ? JSON.parse(contactOverridesJson) : null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "PDF file missing." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    let extractedText = "";

    // PDF Extraction Logic
    try {
        const loadingTask = pdfjs.getDocument({ data: pdfData });
        const pdfDocument = await loadingTask.promise;
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            extractedText += `\n${pageText}`;
        }
    } catch (parseError: any) {
        console.error("❌ PDF Engine Error:", parseError);
        return NextResponse.json({ error: "Failed to parse PDF structure." }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "No text found. This might be an image-only scan." },
        { status: 400 }
      );
    }

    // Glossary & AI
    const glossary = await getGlossary();
    const preprocessed = applyGlossaryToText(extractedText, glossary);

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Analyze/Translate this military resume:\n${preprocessed}` 
        },
      ],
    });

    const rawOutput = response.choices[0].message.content ?? "";
    const cleanJson = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedResume;
    try {
      parsedResume = JSON.parse(cleanJson);
      
      // 2. APPLY OVERRIDES (The "Source of Truth")
      if (contactOverrides) {
         parsedResume.contactInfo = {
            ...parsedResume.contactInfo, // Keep location if AI found it
            name: contactOverrides.name || parsedResume.contactInfo.name,
            phone: contactOverrides.phone || parsedResume.contactInfo.phone,
            email: contactOverrides.email || parsedResume.contactInfo.email,
         };
      }

    } catch (e) {
      return NextResponse.json({ error: "AI JSON Parse Failed", output: rawOutput });
    }

    return NextResponse.json({ output: parsedResume, originalText: extractedText });

  } catch (err: any) {
    console.error("❌ Route Error:", err);
    return NextResponse.json(
      { error: "Conversion failed", details: err.message },
      { status: 500 }
    );
  }
}