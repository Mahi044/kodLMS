const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const certificatesController = require('./certificates.controller');

const router = Router();

router.get('/:subjectId', authenticate, certificatesController.downloadCertificate);

module.exports = router;
