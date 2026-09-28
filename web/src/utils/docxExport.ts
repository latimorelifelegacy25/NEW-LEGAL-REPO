import { Document, Paragraph, TextRun, Packer } from 'docx';
import { Matter, SACParagraph, SACCount } from '../types/matter';

export async function generateAndDownloadSACDocx(
  matter: Matter,
  paragraphs: SACParagraph[],
  _counts: SACCount[]
): Promise<void> {
  const docParagraphs: Paragraph[] = [];

  // Export only loaded paragraph text. A complete pleading requires source review.
  docParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Working paragraph draft — ${matter.docketNumber}`, bold: true })] }));

  for (const para of paragraphs) {
    docParagraphs.push(
      new Paragraph({
        spacing: { after: 140 },
        indent: { left: 360, hanging: 360 },
        children: [
          new TextRun({
            text: `${para.number}. `,
            bold: true,
            font: 'Times New Roman',
            size: 24
          }),
          new TextRun({
            text: para.text,
            font: 'Times New Roman',
            size: 24
          })
        ]
      })
    );
  }

  // Counts, verification, notice and signature are never invented by this export.

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (1440 dxa)
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: docParagraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Working_Paragraph_Draft_${matter.docketNumber}.docx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
