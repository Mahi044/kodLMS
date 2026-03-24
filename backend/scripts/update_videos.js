const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VIDEO_MAPPING = {
  'JavaScript Basics': 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
  'React Fundamentals': 'https://www.youtube.com/watch?v=bMknfKXIFA8',
  'Advanced Node.js': 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
  'Python for Beginners': 'https://www.youtube.com/watch?v=rfscVS0vtbw',
  'Data Structures & Algorithms': 'https://www.youtube.com/watch?v=8hly31xKli0',
  'HTML & CSS Masterclass': 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
  'UI/UX Design Principles': 'https://www.youtube.com/watch?v=c9Wg6ndoxag',
  'Full-Stack Web Development': 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
  'SQL & Database Design': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
  'Machine Learning with Python': 'https://www.youtube.com/watch?v=GwIo3gDZCVQ',
  'React Native Mobile Dev': 'https://www.youtube.com/watch?v=fis26HvvDII',
  'DevOps & CI/CD Pipelines': 'https://www.youtube.com/watch?v=j5ZcaNfL284',
  'Cybersecurity Essentials': 'https://www.youtube.com/watch?v=nzj7Wg4DAbs',
  'Cloud Computing with AWS': 'https://www.youtube.com/watch?v=EN4fPBzRf58',
  'Agile Project Management': 'https://www.youtube.com/watch?v=8mGf9eZ74kU'
};

async function main() {
  console.log('🚀 Starting educational content update...');
  
  const subjects = await prisma.subject.findMany({
    include: {
      sections: {
        include: {
          videos: true
        }
      }
    }
  });

  for (const subject of subjects) {
    const newUrl = VIDEO_MAPPING[subject.title];
    if (!newUrl) {
      console.log(`⚠️ No mapping found for subject: ${subject.title}`);
      continue;
    }

    console.log(`\n📚 Updating COURSE: ${subject.title}`);
    
    for (const section of subject.sections) {
      console.log(`   Updating SECTION: ${section.title}`);
      
      for (const video of section.videos) {
        // We use the same URL but with a description that matches the title
        await prisma.video.update({
          where: { id: video.id },
          data: {
            youtube_url: newUrl,
            description: `A detailed lecture on "${video.title}" within the context of ${subject.title}.`
          }
        });
        console.log(`      ✅ VIDEO: ${video.title}`);
      }
    }
  }

  console.log('\n✨ Content update complete!');
}

main()
  .catch(e => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
