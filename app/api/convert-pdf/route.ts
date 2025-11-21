import { NextRequest, NextResponse } from "next/server";
import { openaiClient, SYSTEM_PROMPT } from "@/lib/openai";
import { applyGlossaryToText, getGlossary } from "@/lib/glossary";

// Force Node.js runtime
export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "4.5mb",
  },
};

export async function POST(req: NextRequest) {
  try {
    // 1. LAZY LOAD THE LIBRARY
    // We require it here so it doesn't break the build time analysis
    const pdfLib = require("pdf-parse");

    // 2. UNWRAP LOGIC (The Fix for Next.js 15)
    // Sometimes Next.js wraps the library in 'default', sometimes it doesn't.
    // We check both.
    let pdfParser = pdfLib;
    if (typeof pdfParser !== 'function' && pdfParser.default) {
        pdfParser = pdfParser.default;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    // Extract Contact Overrides
    const contactOverridesJson = formData.get("contactOverrides") as string | null;
    const contactOverrides = contactOverridesJson ? JSON.parse(contactOverridesJson) : null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "PDF file missing." }, { status: 400 });
    }

    // 3. Prepare Buffer
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    try {
        // 4. EXECUTE PARSER
        // We use the unwrapped function.
        const data = await pdfParser(pdfBuffer);
        extractedText = data.text.trim();
        
        console.log(`📄 Success! Extracted ${extractedText.length} characters.`);
        
    } catch (parseError: any) {
        console.error("❌ PDF Parse Error:", parseError);
        return NextResponse.json({ error: "Failed to read PDF file." }, { status: 400 });
    }

    // 5. Validation
    if (!extractedText || extractedText.length < 50) {
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
      
      // 7. APPLY OVERRIDES
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