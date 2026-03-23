const certificatesService = require('./certificates.service');

/**
 * GET /api/certificates/:subjectId
 * Generates and streams a PDF certificate download.
 */
async function downloadCertificate(req, res) {
  const subjectId = parseInt(req.params.subjectId);
  if (isNaN(subjectId)) {
    return res.status(400).json({ error: 'Invalid subject ID' });
  }

  const pdfStream = await certificatesService.generateCertificate(req.user.id, subjectId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="certificate-${subjectId}.pdf"`);
  pdfStream.pipe(res);
}

module.exports = { downloadCertificate };
