import { NextRequest, NextResponse } from "next/server";
import { openaiClient, SYSTEM_PROMPT } from "@/lib/openai";
import { applyGlossaryToText, getGlossary } from "@/lib/glossary";

// Force Node.js runtime (Standard for PDF processing)
export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "4.5mb",
  },
};

export async function POST(req: NextRequest) {
  try {
    // 1. Dynamic Import (CORRECTED PATHS)
    // We use the 'legacy' build which is optimized for Node.js environments.
    // We removed '.min' because those files don't exist in the npm package.
    // We use @ts-ignore because we are bypassing standard TS checks for these specific files.
    
    // @ts-ignore
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    
    // @ts-ignore
    await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    // Extract Contact Overrides
    const contactOverridesJson = formData.get("contactOverrides") as string | null;
    const contactOverrides = contactOverridesJson ? JSON.parse(contactOverridesJson) : null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "PDF file missing." }, { status: 400 });
    }

    // 2. Prepare Data
    const arrayBuffer = await file.arrayBuffer();
    // pdfjs-dist expects a Uint8Array
    const pdfData = new Uint8Array(arrayBuffer);

    let extractedText = "";

    try {
        // 3. Load Document
        const loadingTask = pdfjs.getDocument({ data: pdfData });
        const pdfDocument = await loadingTask.promise;

        console.log(`📄 PDF Loaded. Pages: ${pdfDocument.numPages}`);

        // 4. Extract Text Page by Page
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            
            // Join the text items
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
                
            extractedText += `\n${pageText}`;
        }
        
        console.log(`✅ Success! Extracted ${extractedText.length} characters.`);

    } catch (parseError: any) {
        console.error("❌ PDF Engine Error:", parseError);
        return NextResponse.json({ error: "Failed to parse PDF structure." }, { status: 400 });
    }

    // 5. Validation
    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "No text found. This might be an image-only scan." },
        { status: 400 }
      );
    }

    // 6. Glossary & AI Processing
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
      
      // 7. APPLY OVERRIDES (The "Source of Truth")
      if (contactOverrides) {
         parsedResume.contactInfo = {
            ...parsedResume.contactInfo,
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