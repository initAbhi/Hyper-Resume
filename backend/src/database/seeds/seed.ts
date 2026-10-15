import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import AppDataSource from '../data-source.js';
import { User, UserRole } from '../../users/entities/user.entity.js';
import { CandidateProfile } from '../../profiles/entities/candidate-profile.entity.js';
import { Resume } from '../../resumes/entities/resume.entity.js';
import { CreditLedger } from '../../credits/entities/credit-ledger.entity.js';

export async function runSeeds() {
  console.log('🌱 Starting database seeding...');

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(CandidateProfile);
  const resumeRepo = AppDataSource.getRepository(Resume);
  const creditRepo = AppDataSource.getRepository(CreditLedger);

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Demo Candidate User
  let demoUser = await userRepo.findOne({ where: { email: 'demo@hyperresume.ai' } });
  if (!demoUser) {
    demoUser = userRepo.create({
      email: 'demo@hyperresume.ai',
      fullName: 'Demo Candidate',
      passwordHash: defaultPasswordHash,
      role: UserRole.USER,
      isActive: true,
      isEmailVerified: true,
    });
    await userRepo.save(demoUser);
    console.log('✅ Created Demo User: demo@hyperresume.ai');
  } else {
    console.log('ℹ️ Demo User demo@hyperresume.ai already exists.');
  }

  // 2. Seed Demo Candidate Profile
  let demoProfile = await profileRepo.findOne({ where: { userId: demoUser.id } });
  if (!demoProfile) {
    demoProfile = profileRepo.create({
      userId: demoUser.id,
      headline: 'Senior Full Stack Engineer',
      summary:
        'Full-stack software engineer with 6+ years of experience architecting distributed cloud systems, real-time reactive applications, and high-throughput microservices using TypeScript, React, Next.js, Node.js, and PostgreSQL.',
      location: 'Bengaluru, India',
      phone: '+91 98765 43210',
      skills: [
        { name: 'TypeScript', category: 'Language', level: 'expert' },
        { name: 'React', category: 'Frontend', level: 'expert' },
        { name: 'Next.js', category: 'Frontend', level: 'expert' },
        { name: 'Node.js', category: 'Backend', level: 'advanced' },
        { name: 'NestJS', category: 'Backend', level: 'advanced' },
        { name: 'PostgreSQL', category: 'Database', level: 'advanced' },
        { name: 'Redis', category: 'Database', level: 'intermediate' },
        { name: 'Docker', category: 'DevOps', level: 'intermediate' },
        { name: 'AWS', category: 'Cloud', level: 'intermediate' },
      ],
      experience: [
        {
          company: 'Acme Cloud Systems',
          title: 'Senior Full Stack Engineer',
          location: 'Bengaluru, India',
          startDate: '2023-01',
          current: true,
          bullets: [
            'Architected high-throughput microservices handling 25,000+ RPS with 99.98% uptime using Node.js, NestJS, and PostgreSQL.',
            'Engineered real-time reactive dashboard using Next.js 15 and Tailwind CSS, reducing average page latency by 42%.',
            'Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time from 4 days to 45 minutes.',
          ],
        },
        {
          company: 'Nexus Tech Labs',
          title: 'Full Stack Software Engineer',
          location: 'Hyderabad, India',
          startDate: '2020-06',
          endDate: '2022-12',
          current: false,
          bullets: [
            'Spearheaded design and development of core fintech payment settlement workflows processing ₹50M+ in daily transaction volume.',
            'Optimized complex SQL queries and created composite indexes, reducing p99 database query response times by 65%.',
            'Collaborated with product designers to implement responsive, accessible WCAG 2.1 AA compliant customer portals.',
          ],
        },
      ],
      education: [
        {
          school: 'National Institute of Technology',
          degree: 'Bachelor of Technology',
          field: 'Computer Science and Engineering',
          graduationDate: '2020-05',
          gpa: '8.8/10.0',
        },
      ],
      projects: [
        {
          name: 'HyperResume Platform',
          description: 'Privacy-centric ATS resume optimization engine with grounded evidence validation.',
          highlights: ['Built with Next.js 15, NestJS, and PostgreSQL', 'Zero hallucination parsing'],
          url: 'https://github.com/initAbhi/Hyper-Resume',
          skillsUsed: ['TypeScript', 'Next.js', 'NestJS', 'TypeORM', 'PostgreSQL'],
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          issueDate: '2023-08',
        },
      ],
    });
    await profileRepo.save(demoProfile);
    console.log('✅ Created Demo Candidate Profile');
  }

  // 3. Seed Master Resume
  let demoResume = await resumeRepo.findOne({ where: { userId: demoUser.id, isMaster: true } });
  if (!demoResume) {
    demoResume = resumeRepo.create({
      userId: demoUser.id,
      name: 'Full Stack Engineer (Master)',
      isMaster: true,
      templateKey: 'clean-modern',
      content: {
        contact: {
          fullName: 'Demo Candidate',
          email: 'demo@hyperresume.ai',
          phone: '+91 98765 43210',
          location: 'Bengaluru, India',
          linkedinUrl: 'https://linkedin.com/in/democandidate',
          githubUrl: 'https://github.com/democandidate',
        },
        headline: 'Senior Full Stack Engineer',
        summary:
          'Full-stack software engineer with 6+ years of experience architecting distributed cloud systems, real-time reactive applications, and high-throughput microservices using TypeScript, React, Next.js, Node.js, and PostgreSQL.',
        skills: [
          { name: 'TypeScript', category: 'Language' },
          { name: 'React', category: 'Frontend' },
          { name: 'Next.js', category: 'Frontend' },
          { name: 'NestJS', category: 'Backend' },
          { name: 'PostgreSQL', category: 'Database' },
          { name: 'Docker', category: 'DevOps' },
          { name: 'AWS', category: 'Cloud' },
        ],
        experience: [
          {
            company: 'Acme Cloud Systems',
            title: 'Senior Full Stack Engineer',
            location: 'Bengaluru, India',
            startDate: '2023-01',
            current: true,
            bullets: [
              'Architected high-throughput microservices handling 25,000+ RPS with 99.98% uptime using Node.js, NestJS, and PostgreSQL.',
              'Engineered real-time reactive dashboard using Next.js 15 and Tailwind CSS, reducing average page latency by 42%.',
              'Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time from 4 days to 45 minutes.',
            ],
          },
          {
            company: 'Nexus Tech Labs',
            title: 'Full Stack Software Engineer',
            location: 'Hyderabad, India',
            startDate: '2020-06',
            endDate: '2022-12',
            current: false,
            bullets: [
              'Spearheaded design and development of core fintech payment settlement workflows processing ₹50M+ in daily transaction volume.',
              'Optimized complex SQL queries and created composite indexes, reducing p99 database query response times by 65%.',
              'Collaborated with product designers to implement responsive, accessible WCAG 2.1 AA compliant customer portals.',
            ],
          },
        ],
        education: [
          {
            school: 'National Institute of Technology',
            degree: 'Bachelor of Technology',
            field: 'Computer Science and Engineering',
            graduationDate: '2020-05',
          },
        ],
        projects: [
          {
            name: 'HyperResume Platform',
            description: 'Privacy-centric ATS resume optimization engine with grounded evidence validation.',
          },
        ],
      },
    });
    await resumeRepo.save(demoResume);
    console.log('✅ Created Demo Master Resume');
  }

  // 4. Seed Welcome Credits for Demo User
  const demoCreditKey = `seed-welcome-${demoUser.id}`;
  const existingDemoCredits = await creditRepo.findOne({ where: { idempotencyKey: demoCreditKey } });
  if (!existingDemoCredits) {
    const creditEntry = creditRepo.create({
      userId: demoUser.id,
      amount: 35,
      transactionType: 'signup_bonus',
      idempotencyKey: demoCreditKey,
      description: 'Initial welcome credit bonus for testing and evaluation',
    });
    await creditRepo.save(creditEntry);
    console.log('✅ Awarded 35 welcome credits to demo@hyperresume.ai');
  }

  // 5. Seed Administrator User
  let adminUser = await userRepo.findOne({ where: { email: 'admin@hyperresume.ai' } });
  if (!adminUser) {
    adminUser = userRepo.create({
      email: 'admin@hyperresume.ai',
      fullName: 'System Administrator',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });
    await userRepo.save(adminUser);
    console.log('✅ Created Admin User: admin@hyperresume.ai');
  } else {
    console.log('ℹ️ Admin User admin@hyperresume.ai already exists.');
  }

  // 6. Seed Admin Credits
  const adminCreditKey = `seed-welcome-${adminUser.id}`;
  const existingAdminCredits = await creditRepo.findOne({ where: { idempotencyKey: adminCreditKey } });
  if (!existingAdminCredits) {
    const adminCreditEntry = creditRepo.create({
      userId: adminUser.id,
      amount: 1000,
      transactionType: 'signup_bonus',
      idempotencyKey: adminCreditKey,
      description: 'System administrator operational credit allocation',
    });
    await creditRepo.save(adminCreditEntry);
    console.log('✅ Awarded 1000 operational credits to admin@hyperresume.ai');
  }

  console.log('🎉 Seeding completed successfully!');
}

// Allow direct execution: bun src/database/seeds/seed.ts
runSeeds()
  .then(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  });
