import { NextRequest, NextResponse } from "next/server";
import { openaiClient, SYSTEM_PROMPT } from "@/lib/openai";
import { applyGlossaryToText, getGlossary } from "@/lib/glossary";

export async function POST(req: NextRequest) {
  try {
    // 1. Read Body
    const body = await req.json();
    const { text, contactOverrides } = body;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // 2. Glossary Processing
    const glossary = await getGlossary();
    const preprocessed = applyGlossaryToText(text, glossary);

    // 3. AI Processing
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Analyze/Translate this military resume text:\n${preprocessed}` 
        },
      ],
    });

    const rawOutput = response.choices[0].message.content ?? "";
    const cleanJson = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedResume;
    try {
      parsedResume = JSON.parse(cleanJson);

      // 4. APPLY OVERRIDES (The "Source of Truth")
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

    return NextResponse.json({ 
        output: parsedResume,
        originalText: text 
    });

  } catch (error: any) {
    console.error("Error processing text:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}