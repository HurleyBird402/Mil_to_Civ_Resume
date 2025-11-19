import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  TabStopPosition, 
  TabStopType 
} from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "./types";

export const generateAndDownloadDocx = async (data: ResumeData) => {
  // 1. Create the Document
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // --- HEADER (Name & Contact) ---
        new Paragraph({
          text: data.contactInfo.name,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun(`${data.contactInfo.email} | ${data.contactInfo.phone}`),
            data.contactInfo.location ? new TextRun(` | ${data.contactInfo.location}`) : new TextRun(""),
          ],
          spacing: { after: 400 },
        }),

        // --- SUMMARY ---
        ...createSectionHeader("Professional Summary"),
        new Paragraph({
          text: data.professionalSummary,
          spacing: { after: 400 },
        }),

        // --- EXPERIENCE ---
        ...createSectionHeader("Professional Experience"),
        ...data.experience.flatMap(job => [
          // Row 1: Role (Left) ... Date (Right)
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: job.role, bold: true, size: 24 }), // 12pt font (size is half-points)
              new TextRun({ text: `\t${job.duration}`, bold: true }),
            ],
          }),
          // Row 2: Company | Location
          new Paragraph({
            children: [
              new TextRun({ text: `${job.company} | ${job.location}`, italics: true }),
            ],
            spacing: { after: 100 },
          }),
          // Bullets
          ...job.achievements.map(bullet => 
            new Paragraph({
              text: bullet,
              bullet: { level: 0 }, // Standard bullet point
            })
          ),
          // Spacer between jobs
          new Paragraph({ text: "", spacing: { after: 200 } }),
        ]),

        // --- SKILLS ---
        ...createSectionHeader("Core Competencies"),
        new Paragraph({
          text: data.skills.join(", "),
          spacing: { after: 400 },
        }),

        // --- EDUCATION ---
        ...createSectionHeader("Education"),
        ...data.education.map(edu => 
          new Paragraph({
            text: edu,
            bullet: { level: 0 },
          })
        ),
      ],
    }],
  });

  // 2. Generate blob and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Civilian_Resume_${data.contactInfo.name.replace(/\s+/g, "_")}.docx`);
};

// Helper to make consistent section headers
function createSectionHeader(title: string) {
  return [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      thematicBreak: true, // Adds a line underneath
      spacing: { before: 200, after: 100 },
    }),
  ];
}