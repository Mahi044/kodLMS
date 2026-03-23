const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
  console.log(`✅ Created user: ${user.email}`);

  // ===========================
  // Subject 1: JavaScript Basics
  // ===========================
  const jsSubject = await prisma.subject.upsert({
    where: { slug: 'javascript-basics' },
    update: {},
    create: {
      title: 'JavaScript Basics',
      slug: 'javascript-basics',
      description: 'Learn the fundamentals of JavaScript programming — variables, functions, loops, and more.',
      is_published: true,
    },
  });

  // JS Section 1: Getting Started
  const jsSection1 = await prisma.section.create({
    data: {
      subject_id: jsSubject.id,
      title: 'Getting Started with JavaScript',
      order_index: 1,
      videos: {
        create: [
          {
            title: 'What is JavaScript?',
            description: 'An introduction to JavaScript and its role in web development.',
            youtube_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            order_index: 1,
            duration_seconds: 480,
          },
          {
            title: 'Setting Up Your Environment',
            description: 'How to set up VS Code and Chrome for JavaScript development.',
            youtube_url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
            order_index: 2,
            duration_seconds: 360,
          },
          {
            title: 'Your First JavaScript Program',
            description: 'Writing and running your first JavaScript code.',
            youtube_url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
            order_index: 3,
            duration_seconds: 600,
          },
        ],
      },
    },
  });

  // JS Section 2: Variables & Data Types
  const jsSection2 = await prisma.section.create({
    data: {
      subject_id: jsSubject.id,
      title: 'Variables & Data Types',
      order_index: 2,
      videos: {
        create: [
          {
            title: 'Variables: var, let, const',
            description: 'Understanding variable declarations and scoping.',
            youtube_url: 'https://www.youtube.com/watch?v=9WIJQDvt4Us',
            order_index: 1,
            duration_seconds: 540,
          },
          {
            title: 'Data Types in JavaScript',
            description: 'Numbers, strings, booleans, null, undefined, and objects.',
            youtube_url: 'https://www.youtube.com/watch?v=O5wlGKCFGHA',
            order_index: 2,
            duration_seconds: 420,
          },
          {
            title: 'Working with Strings',
            description: 'String methods, template literals, and string manipulation.',
            youtube_url: 'https://www.youtube.com/watch?v=09BwruU4kiY',
            order_index: 3,
            duration_seconds: 480,
          },
        ],
      },
    },
  });

  // JS Section 3: Functions
  const jsSection3 = await prisma.section.create({
    data: {
      subject_id: jsSubject.id,
      title: 'Functions',
      order_index: 3,
      videos: {
        create: [
          {
            title: 'Function Declarations & Expressions',
            description: 'Different ways to create functions.',
            youtube_url: 'https://www.youtube.com/watch?v=FOD408a0EzU',
            order_index: 1,
            duration_seconds: 600,
          },
          {
            title: 'Arrow Functions',
            description: 'ES6 arrow function syntax and when to use them.',
            youtube_url: 'https://www.youtube.com/watch?v=h33Srr5J9nY',
            order_index: 2,
            duration_seconds: 480,
          },
        ],
      },
    },
  });

  console.log(`✅ Created subject: ${jsSubject.title} (${3} sections, ${8} videos)`);

  // ===========================
  // Subject 2: React Fundamentals
  // ===========================
  const reactSubject = await prisma.subject.upsert({
    where: { slug: 'react-fundamentals' },
    update: {},
    create: {
      title: 'React Fundamentals',
      slug: 'react-fundamentals',
      description: 'Master React from scratch — components, state, hooks, and building real applications.',
      is_published: true,
    },
  });

  // React Section 1: Introduction
  const reactSection1 = await prisma.section.create({
    data: {
      subject_id: reactSubject.id,
      title: 'Introduction to React',
      order_index: 1,
      videos: {
        create: [
          {
            title: 'What is React?',
            description: 'Understanding React and component-based architecture.',
            youtube_url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
            order_index: 1,
            duration_seconds: 720,
          },
          {
            title: 'Create React App & Project Structure',
            description: 'Setting up your first React project.',
            youtube_url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
            order_index: 2,
            duration_seconds: 540,
          },
          {
            title: 'JSX in Depth',
            description: 'Understanding JSX syntax and expressions.',
            youtube_url: 'https://www.youtube.com/watch?v=7fPXI_MnBOY',
            order_index: 3,
            duration_seconds: 480,
          },
        ],
      },
    },
  });

  // React Section 2: Components & Props
  const reactSection2 = await prisma.section.create({
    data: {
      subject_id: reactSubject.id,
      title: 'Components & Props',
      order_index: 2,
      videos: {
        create: [
          {
            title: 'Functional Components',
            description: 'Creating and using functional components.',
            youtube_url: 'https://www.youtube.com/watch?v=Cla1WwguArA',
            order_index: 1,
            duration_seconds: 600,
          },
          {
            title: 'Props and Data Flow',
            description: 'Passing data between components with props.',
            youtube_url: 'https://www.youtube.com/watch?v=PHaECbrKgs0',
            order_index: 2,
            duration_seconds: 540,
          },
        ],
      },
    },
  });

  // React Section 3: State & Hooks
  const reactSection3 = await prisma.section.create({
    data: {
      subject_id: reactSubject.id,
      title: 'State & Hooks',
      order_index: 3,
      videos: {
        create: [
          {
            title: 'useState Hook',
            description: 'Managing component state with useState.',
            youtube_url: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
            order_index: 1,
            duration_seconds: 660,
          },
          {
            title: 'useEffect Hook',
            description: 'Side effects, data fetching, and cleanup.',
            youtube_url: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
            order_index: 2,
            duration_seconds: 720,
          },
          {
            title: 'Building a Mini Project',
            description: 'Putting it all together with a hands-on project.',
            youtube_url: 'https://www.youtube.com/watch?v=b9eMGE7QtTk',
            order_index: 3,
            duration_seconds: 900,
          },
        ],
      },
    },
  });

  console.log(`✅ Created subject: ${reactSubject.title} (${3} sections, ${8} videos)`);

  // Enroll test user in both subjects
  await prisma.enrollment.createMany({
    data: [
      { user_id: user.id, subject_id: jsSubject.id },
      { user_id: user.id, subject_id: reactSubject.id },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Enrolled user in both subjects`);

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
