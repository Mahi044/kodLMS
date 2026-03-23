const analyticsService = require('./analytics.service');

async function getOverview(req, res) {
  const stats = await analyticsService.getOverviewStats();
  res.json(stats);
}

async function getCourses(req, res) {
  const stats = await analyticsService.getCourseStats();
  res.json(stats);
}

module.exports = { getOverview, getCourses };
