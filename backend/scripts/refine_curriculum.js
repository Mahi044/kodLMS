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

// Timestamps (in seconds) for each video slot (1-8)
const TIMESTAMPS = [0, 120, 300, 600, 1200, 1800, 2400, 3600];

async function main() {
  console.log('🚀 Starting topic-by-topic content refinement...');
  
  const subjects = await prisma.subject.findMany({
    include: {
      sections: {
        include: {
          videos: true
        },
        orderBy: { order_index: 'asc' }
      }
    }
  });

  for (const subject of subjects) {
    const baseUrl = VIDEO_MAPPING[subject.title];
    if (!baseUrl) continue;

    console.log(`\n📚 Refining COURSE: ${subject.title}`);
    
    // Flatten all videos in this subject to assign timestamps sequentially
    const allVideos = subject.sections
      .flatMap(section => section.videos)
      .sort((a, b) => {
        // Sort by section order then video order
        const secA = subject.sections.find(s => s.id === a.section_id).order_index;
        const secB = subject.sections.find(s => s.id === b.section_id).order_index;
        if (secA !== secB) return secA - secB;
        return a.order_index - b.order_index;
      });

    for (let i = 0; i < allVideos.length; i++) {
      const video = allVideos[i];
      const offset = TIMESTAMPS[i] || (i * 600); // Fallback to 10 min increments
      const separator = baseUrl.includes('?') ? '&' : '?';
      const timestampedUrl = `${baseUrl}${separator}t=${offset}`;

      await prisma.video.update({
        where: { id: video.id },
        data: {
          youtube_url: timestampedUrl,
          description: `Educational segment starting at ${Math.floor(offset / 60)} minutes.`
        }
      });
      console.log(`      ✅ VIDEO: ${video.title} -> t=${offset}s`);
    }
  }

  console.log('\n✨ Curriculum refinement complete!');
}

main()
  .catch(e => {
    console.error('❌ Refinement failed:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
