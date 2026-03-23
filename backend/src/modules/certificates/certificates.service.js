const prisma = require('../../utils/prisma');
const PDFDocument = require('pdfkit');

/**
 * Generate a completion certificate PDF for a user+subject.
 * Verifies 100% completion before generating.
 * Returns a readable stream of the PDF.
 */
async function generateCertificate(userId, subjectId) {
  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
  });
  if (!enrollment) {
    const err = new Error('Not enrolled in this course');
    err.statusCode = 403;
    throw err;
  }

  // Get subject with all video IDs
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        include: { videos: { select: { id: true } } },
      },
    },
  });
  if (!subject) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }

  const allVideoIds = subject.sections.flatMap((s) => s.videos.map((v) => v.id));
  const totalVideos = allVideoIds.length;

  if (totalVideos === 0) {
    const err = new Error('Course has no content yet');
    err.statusCode = 400;
    throw err;
  }

  // Check completion
  const completedCount = await prisma.videoProgress.count({
    where: {
      user_id: userId,
      video_id: { in: allVideoIds },
      is_completed: true,
    },
  });

  if (completedCount < totalVideos) {
    const err = new Error(
      `Course not fully completed (${completedCount}/${totalVideos} videos done)`
    );
    err.statusCode = 400;
    throw err;
  }

  // Fetch user
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Store certificate record (idempotent)
  await prisma.certificate.upsert({
    where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    create: { user_id: userId, subject_id: subjectId },
    update: {},
  });

  // Generate PDF
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 60, bottom: 60, left: 72, right: 72 },
  });

  // Decorative border
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .lineWidth(3)
    .strokeColor('#6366f1')
    .stroke();

  doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
    .lineWidth(1)
    .strokeColor('#a5b4fc')
    .stroke();

  // Header
  doc.moveDown(2);
  doc.fontSize(14)
    .fillColor('#6366f1')
    .font('Helvetica')
    .text('LEARNFLOW', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(36)
    .fillColor('#1e1b4b')
    .font('Helvetica-Bold')
    .text('Certificate of Completion', { align: 'center' });

  // Divider line
  doc.moveDown(0.5);
  const lineY = doc.y;
  doc.moveTo(200, lineY).lineTo(doc.page.width - 200, lineY)
    .lineWidth(2).strokeColor('#6366f1').stroke();

  // Body
  doc.moveDown(1.5);
  doc.fontSize(14)
    .fillColor('#475569')
    .font('Helvetica')
    .text('This is to certify that', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(28)
    .fillColor('#1e1b4b')
    .font('Helvetica-Bold')
    .text(user.name, { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(14)
    .fillColor('#475569')
    .font('Helvetica')
    .text('has successfully completed the course', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(22)
    .fillColor('#6366f1')
    .font('Helvetica-Bold')
    .text(subject.title, { align: 'center' });

  doc.moveDown(1);
  doc.fontSize(12)
    .fillColor('#64748b')
    .font('Helvetica')
    .text(`Completed ${totalVideos} lessons`, { align: 'center' });

  doc.moveDown(0.3);
  doc.text(`Issued on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

  // Footer
  doc.moveDown(2);
  const footerY = doc.y;
  doc.moveTo(180, footerY).lineTo(380, footerY)
    .lineWidth(1).strokeColor('#94a3b8').stroke();
  doc.fontSize(10).fillColor('#64748b').text('LearnFlow Platform', 180, footerY + 5, { width: 200, align: 'center' });

  doc.end();
  return doc;
}

module.exports = { generateCertificate };
