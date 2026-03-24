const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const courses = [
  {
    title: 'JavaScript Basics',
    description: 'Learn the fundamentals of JavaScript programming — variables, functions, loops, and more.',
  },
  {
    title: 'React Fundamentals',
    description: 'Master React from scratch — components, state, hooks, and building real applications.',
  },
  {
    title: 'Advanced Node.js',
    description: 'Deep dive into Node.js architecture, event loop, streams, and performance optimization.',
  },
  {
    title: 'Python for Beginners',
    description: 'Start your programming journey with Python. Learn syntax, data structures, and basic algorithms.',
  },
  {
    title: 'Data Structures & Algorithms',
    description: 'Master core CS concepts. Arrays, Trees, Graphs, sorting algorithms, and Big O notation.',
  },
  {
    title: 'HTML & CSS Masterclass',
    description: 'Build beautiful, responsive websites using modern HTML5 semantic tags and CSS3 Flexbox/Grid.',
  },
  {
    title: 'UI/UX Design Principles',
    description: 'Learn color theory, typography, user research, and wireframing in Figma.',
  },
  {
    title: 'Full-Stack Web Development',
    description: 'Connect frontend and backend. Learn REST APIs, authentication, and database integration.',
  },
  {
    title: 'SQL & Database Design',
    description: 'Design robust schemas, write complex queries, and understand database normalization.',
  },
  {
    title: 'Machine Learning with Python',
    description: 'A practical introduction to ML using scikit-learn, pandas, and neural networks.',
  },
  {
    title: 'React Native Mobile Dev',
    description: 'Build cross-platform iOS and Android applications using React Native.',
  },
  {
    title: 'DevOps & CI/CD Pipelines',
    description: 'Automate your deployments using GitHub Actions, Docker, and Kubernetes.',
  },
  {
    title: 'Cybersecurity Essentials',
    description: 'Understand common web vulnerabilities, OWASP Top 10, and how to secure your applications.',
  },
  {
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services. EC2, S3, Lambda, and Serverless architecture.',
  },
  {
    title: 'Agile Project Management',
    description: 'Learn Scrum, Kanban, sprint planning, and modern software lifecycle management.',
  }
];

// Helper to create dummy sections
function generateSections() {
  return [
    {
      title: 'Course Introduction',
      order_index: 1,
      videos: [
        { title: 'Welcome to the Course', duration_seconds: 120, order_index: 1 },
        { title: 'Syllabus Overview', duration_seconds: 300, order_index: 2 },
        { title: 'Required Software setup', duration_seconds: 450, order_index: 3 },
      ]
    },
    {
      title: 'Core Concepts',
      order_index: 2,
      videos: [
        { title: 'Theory & Fundamentals', duration_seconds: 600, order_index: 1 },
        { title: 'First Practical Example', duration_seconds: 900, order_index: 2 },
        { title: 'Common Pitfalls', duration_seconds: 300, order_index: 3 },
      ]
    },
    {
      title: 'Advanced Topics',
      order_index: 3,
      videos: [
        { title: 'Deep Dive', duration_seconds: 1200, order_index: 1 },
        { title: 'Best Practices', duration_seconds: 600, order_index: 2 },
      ]
    }
  ];
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user (password: "password123")
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'student@test.com',
      password_hash: passwordHash,
    },
  });
  console.log(`✅ Created test user: ${user.email}`);

  let enrolledSubjectIds = [];

  for (const course of courses) {
    const slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const subject = await prisma.subject.upsert({
      where: { slug },
      update: {},
      create: {
        title: course.title,
        slug,
        description: course.description
      },
    });

    // Check if sections exist (to prevent duplicates on re-run)
    const sectionCount = await prisma.section.count({ where: { subject_id: subject.id } });
    
    if (sectionCount === 0) {
      const sections = generateSections();
      for (const sect of sections) {
        await prisma.section.create({
          data: {
            subject_id: subject.id,
            title: sect.title,
            order_index: sect.order_index,
            videos: {
              create: sect.videos.map(v => ({
                title: v.title,
                description: 'Detailed explanation of ' + v.title.toLowerCase(),
                youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                order_index: v.order_index,
                duration_seconds: v.duration_seconds
              }))
            }
          }
        });
      }
    }

    console.log(`✅ Seeded subject: ${course.title}`);
    enrolledSubjectIds.push(subject.id);
  }

  // Enroll test user in all subjects
  await prisma.enrollment.createMany({
    data: enrolledSubjectIds.map(id => ({ user_id: user.id, subject_id: id })),
    skipDuplicates: true,
  });
  console.log(`✅ Enrolled user in all 15 subjects`);

  console.log('\n🎉 Seeding complete!');
  console.log('   Test credentials: student@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
