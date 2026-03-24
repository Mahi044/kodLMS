const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Auditing Course Content...');
  const subjects = await prisma.subject.findMany({
    include: {
      sections: {
        include: {
          videos: true
        }
      }
    }
  });
  
  subjects.forEach(s => {
    console.log(`\nCOURSE: ${s.title}`);
    s.sections.forEach(sec => {
      console.log(`  SECTION: ${sec.title}`);
      sec.videos.forEach(v => {
        console.log(`    VIDEO: ${v.title} - ${v.youtube_url}`);
      });
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
