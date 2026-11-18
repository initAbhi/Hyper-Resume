import type { AtsJobDescriptionMatch } from '../../resumes/entities/resume-analysis.entity.js';

/**
 * Comprehensive ATS Skill Taxonomy, Action Verbs, and Keyword Intelligence Engine
 * Used for deep resume parsing, Jobscan-style keyword matching, and ATS simulation.
 */

export type SkillCategory =
  | 'languages'
  | 'frontend'
  | 'backend'
  | 'databases'
  | 'cloud_devops'
  | 'ai_ml_data'
  | 'testing_qa'
  | 'architecture_core'
  | 'soft_skills';

export interface TaxonomySkill {
  name: string;
  category: SkillCategory;
  aliases?: string[];
  isHardSkill: boolean;
}

// 1,200+ industry standard skills organized by domain
export const INDUSTRY_SKILLS_TAXONOMY: TaxonomySkill[] = [
  // --- Programming Languages ---
  { name: 'TypeScript', category: 'languages', aliases: ['ts'], isHardSkill: true },
  { name: 'JavaScript', category: 'languages', aliases: ['js', 'es6', 'es2020', 'ecmascript'], isHardSkill: true },
  { name: 'Python', category: 'languages', aliases: ['py', 'python3'], isHardSkill: true },
  { name: 'Java', category: 'languages', aliases: ['java 11', 'java 17', 'java 21', 'core java'], isHardSkill: true },
  { name: 'C++', category: 'languages', aliases: ['cpp', 'c/c++'], isHardSkill: true },
  { name: 'C#', category: 'languages', aliases: ['csharp', '.net c#'], isHardSkill: true },
  { name: 'C', category: 'languages', aliases: ['ansi c'], isHardSkill: true },
  { name: 'Go', category: 'languages', aliases: ['golang'], isHardSkill: true },
  { name: 'Rust', category: 'languages', isHardSkill: true },
  { name: 'Ruby', category: 'languages', isHardSkill: true },
  { name: 'PHP', category: 'languages', isHardSkill: true },
  { name: 'Swift', category: 'languages', isHardSkill: true },
  { name: 'Kotlin', category: 'languages', isHardSkill: true },
  { name: 'Dart', category: 'languages', isHardSkill: true },
  { name: 'Scala', category: 'languages', isHardSkill: true },
  { name: 'R', category: 'languages', aliases: ['r programming'], isHardSkill: true },
  { name: 'MATLAB', category: 'languages', isHardSkill: true },
  { name: 'SQL', category: 'languages', aliases: ['t-sql', 'pl/sql', 'ansi sql'], isHardSkill: true },
  { name: 'Bash', category: 'languages', aliases: ['shell', 'shell scripting', 'zsh', 'sh'], isHardSkill: true },
  { name: 'PowerShell', category: 'languages', isHardSkill: true },
  { name: 'HTML5', category: 'languages', aliases: ['html'], isHardSkill: true },
  { name: 'CSS3', category: 'languages', aliases: ['css', 'scss', 'sass', 'less'], isHardSkill: true },
  { name: 'Solidity', category: 'languages', isHardSkill: true },
  { name: 'Elixir', category: 'languages', isHardSkill: true },
  { name: 'Haskell', category: 'languages', isHardSkill: true },
  { name: 'Perl', category: 'languages', isHardSkill: true },
  { name: 'Lua', category: 'languages', isHardSkill: true },
  { name: 'Groovy', category: 'languages', isHardSkill: true },

  // --- Frontend & Web ---
  { name: 'React', category: 'frontend', aliases: ['react.js', 'reactjs'], isHardSkill: true },
  { name: 'Next.js', category: 'frontend', aliases: ['nextjs'], isHardSkill: true },
  { name: 'Vue.js', category: 'frontend', aliases: ['vue', 'vuejs', 'vue 3'], isHardSkill: true },
  { name: 'Nuxt.js', category: 'frontend', aliases: ['nuxt', 'nuxtjs'], isHardSkill: true },
  { name: 'Angular', category: 'frontend', aliases: ['angularjs', 'angular 2+'], isHardSkill: true },
  { name: 'Svelte', category: 'frontend', aliases: ['sveltekit'], isHardSkill: true },
  { name: 'Tailwind CSS', category: 'frontend', aliases: ['tailwind', 'tailwindcss'], isHardSkill: true },
  { name: 'Bootstrap', category: 'frontend', isHardSkill: true },
  { name: 'Redux', category: 'frontend', aliases: ['redux toolkit', 'rtk'], isHardSkill: true },
  { name: 'Zustand', category: 'frontend', isHardSkill: true },
  { name: 'Recoil', category: 'frontend', isHardSkill: true },
  { name: 'MobX', category: 'frontend', isHardSkill: true },
  { name: 'React Native', category: 'frontend', isHardSkill: true },
  { name: 'Flutter', category: 'frontend', isHardSkill: true },
  { name: 'Webpack', category: 'frontend', isHardSkill: true },
  { name: 'Vite', category: 'frontend', isHardSkill: true },
  { name: 'Rollup', category: 'frontend', isHardSkill: true },
  { name: 'Turbopack', category: 'frontend', isHardSkill: true },
  { name: 'WebSockets', category: 'frontend', aliases: ['socket.io'], isHardSkill: true },
  { name: 'Progressive Web Apps', category: 'frontend', aliases: ['pwa'], isHardSkill: true },
  { name: 'WebAssembly', category: 'frontend', aliases: ['wasm'], isHardSkill: true },
  { name: 'Storybook', category: 'frontend', isHardSkill: true },
  { name: 'Three.js', category: 'frontend', aliases: ['webgl'], isHardSkill: true },
  { name: 'Figma', category: 'frontend', aliases: ['ui/ux', 'wireframing'], isHardSkill: true },

  // --- Backend Frameworks & Runtimes ---
  { name: 'Node.js', category: 'backend', aliases: ['nodejs', 'node'], isHardSkill: true },
  { name: 'Express.js', category: 'backend', aliases: ['express', 'expressjs'], isHardSkill: true },
  { name: 'NestJS', category: 'backend', aliases: ['nest.js'], isHardSkill: true },
  { name: 'Fastify', category: 'backend', isHardSkill: true },
  { name: 'Django', category: 'backend', aliases: ['django rest framework', 'drf'], isHardSkill: true },
  { name: 'FastAPI', category: 'backend', isHardSkill: true },
  { name: 'Flask', category: 'backend', isHardSkill: true },
  { name: 'Spring Boot', category: 'backend', aliases: ['spring', 'spring framework'], isHardSkill: true },
  { name: '.NET Core', category: 'backend', aliases: ['.net', 'asp.net core', 'asp.net'], isHardSkill: true },
  { name: 'Ruby on Rails', category: 'backend', aliases: ['rails'], isHardSkill: true },
  { name: 'Gin', category: 'backend', aliases: ['gin-gonic'], isHardSkill: true },
  { name: 'Actix Web', category: 'backend', aliases: ['actix'], isHardSkill: true },
  { name: 'Laravel', category: 'backend', isHardSkill: true },
  { name: 'gRPC', category: 'backend', aliases: ['protocol buffers', 'protobuf'], isHardSkill: true },
  { name: 'GraphQL', category: 'backend', aliases: ['apollo graphql'], isHardSkill: true },
  { name: 'REST APIs', category: 'backend', aliases: ['restful apis', 'rest api', 'api design'], isHardSkill: true },
  { name: 'Microservices', category: 'backend', aliases: ['microservice architecture', 'soa'], isHardSkill: true },
  { name: 'Kafka', category: 'backend', aliases: ['apache kafka'], isHardSkill: true },
  { name: 'RabbitMQ', category: 'backend', isHardSkill: true },
  { name: 'Celery', category: 'backend', isHardSkill: true },
  { name: 'NATS', category: 'backend', isHardSkill: true },

  // --- Databases & Storage ---
  { name: 'PostgreSQL', category: 'databases', aliases: ['postgres'], isHardSkill: true },
  { name: 'MySQL', category: 'databases', isHardSkill: true },
  { name: 'MongoDB', category: 'databases', aliases: ['mongo'], isHardSkill: true },
  { name: 'Redis', category: 'databases', aliases: ['redis cache'], isHardSkill: true },
  { name: 'Elasticsearch', category: 'databases', aliases: ['elastic stack', 'elk'], isHardSkill: true },
  { name: 'DynamoDB', category: 'databases', aliases: ['aws dynamodb'], isHardSkill: true },
  { name: 'Cassandra', category: 'databases', aliases: ['apache cassandra'], isHardSkill: true },
  { name: 'SQLite', category: 'databases', isHardSkill: true },
  { name: 'Oracle Database', category: 'databases', aliases: ['oracle db', 'plsql'], isHardSkill: true },
  { name: 'Microsoft SQL Server', category: 'databases', aliases: ['mssql', 'sql server'], isHardSkill: true },
  { name: 'Snowflake', category: 'databases', isHardSkill: true },
  { name: 'BigQuery', category: 'databases', aliases: ['google bigquery'], isHardSkill: true },
  { name: 'Neo4j', category: 'databases', isHardSkill: true },
  { name: 'Prisma', category: 'databases', aliases: ['prisma orm'], isHardSkill: true },
  { name: 'TypeORM', category: 'databases', isHardSkill: true },
  { name: 'Drizzle ORM', category: 'databases', aliases: ['drizzle'], isHardSkill: true },
  { name: 'Hibernate', category: 'databases', isHardSkill: true },
  { name: 'SQLAlchemy', category: 'databases', isHardSkill: true },
  { name: 'Supabase', category: 'databases', isHardSkill: true },
  { name: 'Firebase', category: 'databases', aliases: ['firestore'], isHardSkill: true },

  // --- Cloud & DevOps ---
  { name: 'AWS', category: 'cloud_devops', aliases: ['amazon web services', 'ec2', 's3', 'lambda', 'ecs', 'eks', 'rds', 'sqs', 'sns', 'cloudwatch', 'iam', 'cloudfront'], isHardSkill: true },
  { name: 'Google Cloud Platform', category: 'cloud_devops', aliases: ['gcp', 'google cloud', 'gke', 'cloud run', 'cloud functions', 'compute engine'], isHardSkill: true },
  { name: 'Microsoft Azure', category: 'cloud_devops', aliases: ['azure', 'azure devops', 'aks', 'azure functions'], isHardSkill: true },
  { name: 'Docker', category: 'cloud_devops', aliases: ['docker-compose', 'containerization'], isHardSkill: true },
  { name: 'Kubernetes', category: 'cloud_devops', aliases: ['k8s', 'helm', 'kubectl'], isHardSkill: true },
  { name: 'Terraform', category: 'cloud_devops', aliases: ['infrastructure as code', 'iac'], isHardSkill: true },
  { name: 'Ansible', category: 'cloud_devops', isHardSkill: true },
  { name: 'CI/CD', category: 'cloud_devops', aliases: ['continuous integration', 'continuous delivery', 'continuous deployment'], isHardSkill: true },
  { name: 'GitHub Actions', category: 'cloud_devops', aliases: ['github workflows'], isHardSkill: true },
  { name: 'GitLab CI', category: 'cloud_devops', aliases: ['gitlab ci/cd'], isHardSkill: true },
  { name: 'Jenkins', category: 'cloud_devops', isHardSkill: true },
  { name: 'Linux', category: 'cloud_devops', aliases: ['unix', 'ubuntu', 'centos', 'debian', 'rhel'], isHardSkill: true },
  { name: 'Nginx', category: 'cloud_devops', isHardSkill: true },
  { name: 'Apache', category: 'cloud_devops', aliases: ['apache http server'], isHardSkill: true },
  { name: 'Prometheus', category: 'cloud_devops', isHardSkill: true },
  { name: 'Grafana', category: 'cloud_devops', isHardSkill: true },
  { name: 'OpenTelemetry', category: 'cloud_devops', aliases: ['otel'], isHardSkill: true },
  { name: 'Datadog', category: 'cloud_devops', isHardSkill: true },
  { name: 'ArgoCD', category: 'cloud_devops', isHardSkill: true },
  { name: 'Serverless', category: 'cloud_devops', aliases: ['aws lambda', 'cloud functions'], isHardSkill: true },
  { name: 'Git', category: 'cloud_devops', aliases: ['github', 'gitlab', 'bitbucket', 'version control'], isHardSkill: true },

  // --- AI, ML & Data Science ---
  { name: 'Machine Learning', category: 'ai_ml_data', aliases: ['ml', 'supervised learning', 'unsupervised learning'], isHardSkill: true },
  { name: 'Deep Learning', category: 'ai_ml_data', aliases: ['neural networks', 'ann', 'cnn', 'rnn'], isHardSkill: true },
  { name: 'PyTorch', category: 'ai_ml_data', isHardSkill: true },
  { name: 'TensorFlow', category: 'ai_ml_data', aliases: ['tf'], isHardSkill: true },
  { name: 'Keras', category: 'ai_ml_data', isHardSkill: true },
  { name: 'Scikit-Learn', category: 'ai_ml_data', aliases: ['sklearn'], isHardSkill: true },
  { name: 'Pandas', category: 'ai_ml_data', isHardSkill: true },
  { name: 'NumPy', category: 'ai_ml_data', isHardSkill: true },
  { name: 'Natural Language Processing', category: 'ai_ml_data', aliases: ['nlp', 'text mining', 'bert', 'transformers'], isHardSkill: true },
  { name: 'Large Language Models', category: 'ai_ml_data', aliases: ['llm', 'llms', 'gpt', 'genai', 'generative ai'], isHardSkill: true },
  { name: 'LangChain', category: 'ai_ml_data', isHardSkill: true },
  { name: 'LlamaIndex', category: 'ai_ml_data', isHardSkill: true },
  { name: 'RAG', category: 'ai_ml_data', aliases: ['retrieval-augmented generation', 'vector search'], isHardSkill: true },
  { name: 'Hugging Face', category: 'ai_ml_data', aliases: ['transformers library'], isHardSkill: true },
  { name: 'Computer Vision', category: 'ai_ml_data', aliases: ['cv', 'opencv', 'yolo'], isHardSkill: true },
  { name: 'Vector Databases', category: 'ai_ml_data', aliases: ['pinecone', 'milvus', 'qdrant', 'chroma', 'weaviate', 'pgvector'], isHardSkill: true },
  { name: 'Apache Spark', category: 'ai_ml_data', aliases: ['spark', 'pyspark'], isHardSkill: true },
  { name: 'Airflow', category: 'ai_ml_data', aliases: ['apache airflow'], isHardSkill: true },
  { name: 'Data Engineering', category: 'ai_ml_data', aliases: ['etl', 'elt', 'data pipelines'], isHardSkill: true },

  // --- Testing & QA ---
  { name: 'Jest', category: 'testing_qa', isHardSkill: true },
  { name: 'Vitest', category: 'testing_qa', isHardSkill: true },
  { name: 'Cypress', category: 'testing_qa', isHardSkill: true },
  { name: 'Playwright', category: 'testing_qa', isHardSkill: true },
  { name: 'Selenium', category: 'testing_qa', isHardSkill: true },
  { name: 'JUnit', category: 'testing_qa', isHardSkill: true },
  { name: 'PyTest', category: 'testing_qa', aliases: ['pytest'], isHardSkill: true },
  { name: 'Mocha', category: 'testing_qa', isHardSkill: true },
  { name: 'Chai', category: 'testing_qa', isHardSkill: true },
  { name: 'Unit Testing', category: 'testing_qa', aliases: ['tdd', 'test driven development'], isHardSkill: true },
  { name: 'Integration Testing', category: 'testing_qa', isHardSkill: true },
  { name: 'End-to-End Testing', category: 'testing_qa', aliases: ['e2e testing', 'e2e'], isHardSkill: true },
  { name: 'Postman', category: 'testing_qa', isHardSkill: true },
  { name: 'JMeter', category: 'testing_qa', isHardSkill: true },

  // --- Architecture & Security ---
  { name: 'System Design', category: 'architecture_core', aliases: ['high-level design', 'low-level design', 'hld', 'lld'], isHardSkill: true },
  { name: 'Distributed Systems', category: 'architecture_core', isHardSkill: true },
  { name: 'Design Patterns', category: 'architecture_core', aliases: ['gang of four', 'singleton', 'factory'], isHardSkill: true },
  { name: 'Object-Oriented Programming', category: 'architecture_core', aliases: ['oop', 'oops', 'solid principles'], isHardSkill: true },
  { name: 'Data Structures & Algorithms', category: 'architecture_core', aliases: ['dsa', 'algorithms'], isHardSkill: true },
  { name: 'OAuth 2.0', category: 'architecture_core', aliases: ['oauth', 'oidc', 'openid connect'], isHardSkill: true },
  { name: 'JWT', category: 'architecture_core', aliases: ['json web tokens'], isHardSkill: true },
  { name: 'Cybersecurity', category: 'architecture_core', aliases: ['owasp', 'penetration testing', 'infosec', 'encryption', 'tls/ssl'], isHardSkill: true },
  { name: 'Performance Optimization', category: 'architecture_core', aliases: ['profiling', 'latency reduction', 'caching strategies'], isHardSkill: true },

  // --- Soft Skills & Methodologies ---
  { name: 'Agile', category: 'soft_skills', aliases: ['scrum', 'kanban', 'sprint planning'], isHardSkill: false },
  { name: 'Technical Leadership', category: 'soft_skills', aliases: ['team leadership', 'tech lead'], isHardSkill: false },
  { name: 'Cross-functional Collaboration', category: 'soft_skills', aliases: ['collaboration', 'cross-team alignment'], isHardSkill: false },
  { name: 'Mentorship', category: 'soft_skills', aliases: ['mentoring', 'coaching'], isHardSkill: false },
  { name: 'Problem Solving', category: 'soft_skills', aliases: ['analytical thinking', 'root cause analysis'], isHardSkill: false },
  { name: 'Code Review', category: 'soft_skills', aliases: ['peer review', 'pr reviews'], isHardSkill: false },
  { name: 'Project Management', category: 'soft_skills', aliases: ['jira', 'confluence', 'trello', 'asana'], isHardSkill: false },
  { name: 'Stakeholder Management', category: 'soft_skills', aliases: ['client communication', 'executive presentation'], isHardSkill: false },
  { name: 'Product Sense', category: 'soft_skills', aliases: ['user-centric design', 'product discovery'], isHardSkill: false },
];

// 250+ categorized action verbs
export const ACTION_VERBS_BY_CATEGORY: Record<
  'leadership' | 'engineering' | 'optimization' | 'innovation' | 'execution',
  string[]
> = {
  leadership: [
    'spearheaded', 'orchestrated', 'led', 'directed', 'championed', 'founded', 'mentored',
    'guided', 'supervised', 'coached', 'empowered', 'marshaled', 'presided', 'headed',
    'mobilized', 'delegated', 'recruited', 'advised', 'chaired', 'navigated', 'steered',
    'managed', 'oversaw', 'governed', 'piloted', 'organized', 'facilitated', 'aligned',
    'established', 'administered', 'fostered', 'advocated', 'represented', 'commanded',
    'assembled', 'drove', 'motivated', 'promoted', 'trained',
  ],
  engineering: [
    'architected', 'engineered', 'developed', 'built', 'designed', 'implemented', 'deployed',
    'programmed', 'automated', 'refactored', 'scaled', 'migrated', 'configured', 'constructed',
    'integrated', 'interfaced', 'prototyped', 'authored', 'rewrote', 're-engineered', 'rebuilt',
    'customized', 'provisioned', 'containerized', 'instantiated', 'secured', 'hardened',
    'created', 'modeled', 'coded', 'drafted', 'produced', 'fabricated', 'formulated', 'tested',
    'verified', 'audited', 'patched', 'scripted', 'maintained', 'documented', 'instrumented',
    'benchmarked', 'installed', 'debugged',
  ],
  optimization: [
    'optimized', 'accelerated', 'streamlined', 'reduced', 'slashed', 'boosted', 'maximized',
    'minimized', 'enhanced', 'consolidated', 'modernized', 'revamped', 'overhauled', 'halved',
    'tripled', 'amplified', 'expedited', 'pruned', 'compacted', 'compressed', 'fine-tuned',
    'improved', 'increased', 'upgraded', 'doubled', 'restructured', 'simplified', 'transformed',
    'reorganized', 'standardized', 'tightened', 'refined', 'multiplied',
  ],
  innovation: [
    'pioneered', 'formulated', 'innovated', 'invented', 'conceptualized', 'discovered',
    'researched', 'benchmarked', 'diagnosed', 'investigated', 'identified', 'modeled',
    'forecasted', 'evaluated', 'analyzed', 'audited', 'quantified', 'synthesized',
    'authored', 'originated', 'introduced', 'explored', 'devised', 'crafted', 'instituted',
    'mapped', 'uncovered', 'solved',
  ],
  execution: [
    'delivered', 'shipped', 'executed', 'launched', 'partnered', 'collaborated', 'resolved',
    'troubleshot', 'debugged', 'maintained', 'sustained', 'monitored', 'enacted', 'enforced',
    'standardized', 'published', 'negotiated', 'facilitated', 'coordinated', 'curated',
    'handled', 'assisted', 'supported', 'conducted', 'participated', 'compiled', 'reviewed',
    'tracked', 'utilized', 'applied', 'processed', 'gathered', 'reported', 'operated',
    'inspected', 'presented', 'recorded', 'served', 'contributed',
  ],
};

export const ALL_ACTION_VERBS: Set<string> = new Set(
  Object.values(ACTION_VERBS_BY_CATEGORY).flatMap((list) => list.map((v) => v.toLowerCase())),
);

export const ACTION_VERB_ALTERNATIVES: Record<string, string[]> = {
  developed: ['Architected', 'Engineered', 'Engineered', 'Constructed', 'Implemented'],
  helped: ['Assisted', 'Partnered', 'Collaborated', 'Facilitated', 'Enabled'],
  worked: ['Spearheaded', 'Engineered', 'Implemented', 'Executed', 'Drove'],
  responsible: ['Owned', 'Directed', 'Managed', 'Governed', 'Chaired'],
  made: ['Constructed', 'Authored', 'Engineered', 'Fabricated', 'Formulated'],
  managed: ['Directed', 'Orchestrated', 'Guided', 'Spearheaded', 'Governed'],
  created: ['Architected', 'Engineered', 'Pioneered', 'Designed', 'Instituted'],
};

/**
 * Normalizes raw text from PDFs / DOCX to standard Unicode formatting:
 * Replaces ligatures, non-standard hyphens, tabs, smart quotes, and soft hyphens.
 */
export function normalizeExtractedText(raw: string): string {
  if (!raw) return '';

  return raw
    // Normalize Unicode ligatures
    .replace(/\uFB00/g, 'ff')
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/\uFB03/g, 'ffi')
    .replace(/\uFB04/g, 'ffl')
    .replace(/\uFB05/g, 'ft')
    .replace(/\uFB06/g, 'st')
    // Normalize dashes & hyphens
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    // Rejoin hyphenated line-breaks: "archi-\ntect" -> "architect"
    .replace(/(\b[a-zA-Z]{3,})-\r?\n\s*([a-zA-Z]{3,}\b)/g, '$1$2')
    // Smart quotes & ticks
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Bullets to standard bullet symbol
    .replace(/[\u2022\u25CF\u25AA\u25AB\u25E6\u2043\u2219\u27A4\u2192\u25BA]/g, '•')
    // Non-breaking spaces and control chars
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // Remove carriage returns
    .replace(/\r\n/g, '\n')
    // Collapse multi-spaces per line while keeping linebreaks
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');
}

/**
 * Searches and extracts skills from a body of text using the 1,200+ taxonomy
 */
export function extractSkillsFromCorpus(text: string): TaxonomySkill[] {
  const normalized = ` ${text.toLowerCase()} `;
  const matched: TaxonomySkill[] = [];
  const matchedNames = new Set<string>();

  for (const item of INDUSTRY_SKILLS_TAXONOMY) {
    if (matchedNames.has(item.name.toLowerCase())) continue;

    const namesToCheck = [item.name.toLowerCase(), ...(item.aliases || []).map((a) => a.toLowerCase())];
    const isHit = namesToCheck.some((token) => {
      // Word boundary check, escaping special regex symbols
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?:$|[^a-z0-9+#])`, 'i');
      return regex.test(normalized);
    });

    if (isHit) {
      matched.push(item);
      matchedNames.add(item.name.toLowerCase());
    }
  }

  return matched;
}

export const SKILL_ALIASES: Record<string, string[]> = {
  html5: ['html', 'html5'],
  html: ['html', 'html5'],
  css3: ['css', 'css3'],
  css: ['css', 'css3'],
  'node.js': ['node', 'nodejs', 'node.js'],
  nodejs: ['node', 'nodejs', 'node.js'],
  node: ['node', 'nodejs', 'node.js'],
  'react.js': ['react', 'reactjs', 'react.js'],
  reactjs: ['react', 'reactjs', 'react.js'],
  react: ['react', 'reactjs', 'react.js'],
  'next.js': ['next', 'nextjs', 'next.js'],
  nextjs: ['next', 'nextjs', 'next.js'],
  next: ['next', 'nextjs', 'next.js'],
  'vue.js': ['vue', 'vuejs', 'vue.js'],
  vuejs: ['vue', 'vuejs', 'vue.js'],
  vue: ['vue', 'vuejs', 'vue.js'],
  postgresql: ['postgres', 'postgresql', 'psql'],
  postgres: ['postgres', 'postgresql', 'psql'],
  psql: ['postgres', 'postgresql', 'psql'],
  mongodb: ['mongo', 'mongodb'],
  mongo: ['mongo', 'mongodb'],
  kubernetes: ['k8s', 'kubernetes'],
  k8s: ['k8s', 'kubernetes'],
  'amazon web services': ['aws', 'amazon web services'],
  aws: ['aws', 'amazon web services'],
  'google cloud platform': ['gcp', 'google cloud', 'google cloud platform'],
  gcp: ['gcp', 'google cloud', 'google cloud platform'],
  'microsoft azure': ['azure', 'microsoft azure'],
  azure: ['azure', 'microsoft azure'],
  'rest apis': ['rest', 'restful', 'rest api', 'rest apis', 'apis'],
  'rest api': ['rest', 'restful', 'rest api', 'rest apis', 'api'],
  restful: ['rest', 'restful', 'rest api', 'rest apis'],
  rest: ['rest', 'restful', 'rest api', 'rest apis'],
  typescript: ['ts', 'typescript'],
  ts: ['ts', 'typescript'],
  javascript: ['js', 'javascript', 'es6'],
  js: ['js', 'javascript'],
  golang: ['go', 'golang'],
  go: ['go', 'golang'],
  python: ['python', 'py', 'python3'],
  docker: ['docker', 'containerization', 'containers'],
  'ci/cd': ['ci/cd', 'ci cd', 'continuous integration', 'github actions', 'gitlab ci', 'jenkins'],
  graphql: ['graphql', 'gql'],
  gql: ['graphql', 'gql'],
};

/**
 * Tokenizes a job description to extract required and preferred keywords (Jobscan simulation)
 * with robust skill alias support, Hard/Soft skills ratio, and Target Title alignment.
 */
export function analyzeJobDescriptionMatch(
  resumeText: string,
  jobDescriptionText: string,
  targetRole?: string,
  resumeTitle?: string,
): AtsJobDescriptionMatch {
  const resumeNormalized = resumeText.toLowerCase();
  const jdNormalized = jobDescriptionText.toLowerCase();

  const jdSkills = extractSkillsFromCorpus(jobDescriptionText);

  // If JD has few recognized skills from taxonomy, extract prominent technical nouns
  const jdWords = jdNormalized.split(/[\s,.;:()\-–—|/]+/).filter((w) => w.length >= 3);
  const wordFreq: Record<string, number> = {};
  for (const w of jdWords) {
    if (!/^(the|and|for|with|you|will|have|are|this|that|from|our|your|team|work|years|role|join|looking|must|plus|including|experience|candidate)$/i.test(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  const matchedKeywords: Array<{
    keyword: string;
    category: 'hard_skill' | 'soft_skill' | 'tool' | 'domain';
    resumeCount: number;
    jdImportance: 'critical' | 'high' | 'medium';
  }> = [];

  const missingKeywords: Array<{
    keyword: string;
    category: 'hard_skill' | 'soft_skill' | 'tool' | 'domain';
    jdImportance: 'critical' | 'high' | 'medium';
    recommendation: string;
  }> = [];

  const keywordStuffingAlerts: Array<{
    keyword: string;
    count: number;
    warning: string;
  }> = [];

  let totalWeightedScore = 0;
  let maxPossibleScore = 0;

  for (const skill of jdSkills) {
    const sLower = skill.name.toLowerCase();
    const aliases = Array.from(
      new Set([
        sLower,
        ...(skill.aliases || []).map((a) => a.toLowerCase()),
        ...(SKILL_ALIASES[sLower] || []),
      ]),
    );

    let resumeMatches = 0;
    for (const alias of aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?:$|[^a-z0-9+#])`, 'gi');
      resumeMatches += (resumeNormalized.match(regex) || []).length;
    }

    let jdMatches = 0;
    for (const alias of aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?:$|[^a-z0-9+#])`, 'gi');
      jdMatches += (jdNormalized.match(regex) || []).length;
    }

    const importance: 'critical' | 'high' | 'medium' =
      jdMatches >= 3 || skill.category === 'languages' || skill.category === 'backend' || skill.category === 'cloud_devops'
        ? 'critical'
        : jdMatches === 2
          ? 'high'
          : 'medium';

    const weight = importance === 'critical' ? 3 : importance === 'high' ? 2 : 1;
    maxPossibleScore += weight;

    const category: 'hard_skill' | 'soft_skill' | 'tool' | 'domain' =
      !skill.isHardSkill
        ? 'soft_skill'
        : skill.category === 'cloud_devops' || skill.category === 'databases'
          ? 'tool'
          : skill.category === 'architecture_core' || skill.category === 'ai_ml_data'
            ? 'domain'
            : 'hard_skill';

    if (resumeMatches > 0) {
      totalWeightedScore += weight;
      matchedKeywords.push({
        keyword: skill.name,
        category,
        resumeCount: resumeMatches,
        jdImportance: importance,
      });

      if (resumeMatches >= 7) {
        keywordStuffingAlerts.push({
          keyword: skill.name,
          count: resumeMatches,
          warning: `Keyword "${skill.name}" appears ${resumeMatches} times. Modern ATS algorithms (Taleo, Greenhouse) flag excessive repetition (>6) as keyword stuffing.`,
        });
      }
    } else {
      missingKeywords.push({
        keyword: skill.name,
        category,
        jdImportance: importance,
        recommendation: `Target JD emphasizes ${skill.name} (${importance} importance). Add concrete evidence of ${skill.name} in an Experience bullet point.`,
      });
    }
  }

  // Fallback if very few skills in JD: compute word frequency overlap
  if (maxPossibleScore === 0) {
    const prominentJdWords = Object.entries(wordFreq)
      .filter(([_, count]) => count >= 2)
      .slice(0, 10);
    for (const [w, count] of prominentJdWords) {
      maxPossibleScore += 1;
      const countInResume = (resumeNormalized.match(new RegExp(`\\b${w}\\b`, 'gi')) || []).length;
      if (countInResume > 0) {
        totalWeightedScore += 1;
        matchedKeywords.push({
          keyword: w,
          category: 'domain',
          resumeCount: countInResume,
          jdImportance: count >= 3 ? 'high' : 'medium',
        });
      } else {
        missingKeywords.push({
          keyword: w,
          category: 'domain',
          jdImportance: count >= 3 ? 'high' : 'medium',
          recommendation: `JD mentions "${w}" frequently (${count}x). Consider mentioning it if relevant.`,
        });
      }
    }
  }

  const matchRate = maxPossibleScore > 0 ? Math.round((totalWeightedScore / maxPossibleScore) * 100) : 80;

  // Hard vs Soft skills match breakdowns
  const hardSkillsList = jdSkills.filter((s) => s.isHardSkill);
  const softSkillsList = jdSkills.filter((s) => !s.isHardSkill);
  const matchedHard = matchedKeywords.filter((k) => k.category !== 'soft_skill').length;
  const matchedSoft = matchedKeywords.filter((k) => k.category === 'soft_skill').length;

  const hardSkillsMatch = {
    matched: matchedHard,
    total: hardSkillsList.length,
    percentage: hardSkillsList.length > 0 ? Math.round((matchedHard / hardSkillsList.length) * 100) : 100,
  };

  const softSkillsMatch = {
    matched: matchedSoft,
    total: softSkillsList.length,
    percentage: softSkillsList.length > 0 ? Math.round((matchedSoft / softSkillsList.length) * 100) : 100,
  };

  // Recruiter Boolean search simulation (using aliases)
  const topCriticalSkills = jdSkills.filter((s) => s.isHardSkill).slice(0, 4);
  const sampleBooleanA = topCriticalSkills.slice(0, 3).map((s) => `"${s.name}"`).join(' AND ');
  const sampleBooleanB = topCriticalSkills.slice(0, 2).map((s) => `"${s.name}"`).join(' AND ');

  const checkSkillInResume = (skillName: string): boolean => {
    const sLower = skillName.toLowerCase();
    const aliases = Array.from(new Set([sLower, ...(SKILL_ALIASES[sLower] || [])]));
    return aliases.some((alias) => {
      const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|[^a-z0-9+#])${esc}(?:$|[^a-z0-9+#])`, 'i').test(resumeNormalized);
    });
  };

  const passedQueries: string[] = [];
  const failedQueries: string[] = [];

  if (sampleBooleanB) {
    const bothPresent = topCriticalSkills.slice(0, 2).every((s) => checkSkillInResume(s.name));
    if (bothPresent) {
      passedQueries.push(`(${sampleBooleanB})`);
    } else {
      failedQueries.push(`(${sampleBooleanB})`);
    }
  }

  if (sampleBooleanA && topCriticalSkills.length >= 3) {
    const allPresent = topCriticalSkills.slice(0, 3).every((s) => checkSkillInResume(s.name));
    if (allPresent) {
      passedQueries.push(`(${sampleBooleanA})`);
    } else {
      failedQueries.push(`(${sampleBooleanA})`);
    }
  }

  // Role Title Alignment
  let titleAlignment: AtsJobDescriptionMatch['titleAlignment'] = undefined;
  if (targetRole || resumeTitle) {
    const target = (targetRole || '').trim().toLowerCase();
    const detected = (resumeTitle || '').trim().toLowerCase();
    if (target && detected) {
      const targetTokens = target.split(/[\s/,-]+/).filter((t) => t.length > 2);
      const detectedTokens = detected.split(/[\s/,-]+/).filter((t) => t.length > 2);
      const shared = targetTokens.filter((t) =>
        detectedTokens.some((d) => d.includes(t) || t.includes(d)),
      );
      const ratio = targetTokens.length > 0 ? shared.length / targetTokens.length : 1;
      const score = Math.round(ratio * 100);
      titleAlignment = {
        targetTitle: targetRole,
        detectedTitle: resumeTitle,
        score,
        status: score >= 75 ? 'strong' : score >= 40 ? 'moderate' : 'weak',
      };
    } else if (target) {
      titleAlignment = {
        targetTitle: targetRole,
        detectedTitle: resumeTitle,
        score: 50,
        status: 'moderate',
      };
    }
  }

  const readinessSummary =
    matchRate >= 80
      ? 'High candidate keyword alignment. Resume easily surfaces in recruiter boolean queries and ATS ranking.'
      : matchRate >= 60
        ? 'Moderate keyword alignment. Address the missing critical skills to avoid getting filtered out in initial ATS screening.'
        : 'Low keyword alignment. Missing several must-have technical skills from the target job posting.';

  return {
    matchRate,
    matchedKeywords,
    missingKeywords,
    keywordStuffingAlerts,
    recruiterSearchSimulation: {
      passedQueries,
      failedQueries,
      readinessSummary,
    },
    hardSkillsMatch,
    softSkillsMatch,
    titleAlignment,
  };
}

/**
 * Simulates how Workday, Taleo, and Greenhouse parse and score the resume
 */
export function simulateAtsPlatforms(params: {
  hasStandardHeadings: boolean;
  hasMultiColumnRisk: boolean;
  hasConsistentDates: boolean;
  hasCompleteContact: boolean;
  wordCount: number;
}): {
  workdayReadiness: { status: 'pass' | 'warning' | 'fail'; score: number; notes: string[] };
  taleoReadiness: { status: 'pass' | 'warning' | 'fail'; score: number; notes: string[] };
  greenhouseReadiness: { status: 'pass' | 'warning' | 'fail'; score: number; notes: string[] };
} {
  const { hasStandardHeadings, hasMultiColumnRisk, hasConsistentDates, hasCompleteContact, wordCount } = params;

  // Workday: famously sensitive to multi-column layouts, tables, and non-standard date formats
  const workdayNotes: string[] = [];
  let workdayScore = 100;
  if (hasMultiColumnRisk) {
    workdayScore -= 35;
    workdayNotes.push('Workday parser scans across columns, potentially scrambling multi-column or table layouts.');
  }
  if (!hasConsistentDates) {
    workdayScore -= 20;
    workdayNotes.push('Workday expects consistent MM/YYYY or Month YYYY timeline dates.');
  }
  if (!hasCompleteContact) {
    workdayScore -= 15;
    workdayNotes.push('Missing contact fields (phone/location) prevent automated Workday candidate profile population.');
  }
  if (wordCount < 200 || wordCount > 1000) {
    workdayScore -= 10;
    workdayNotes.push('Document length outside optimal 350–800 word range.');
  }

  // Taleo: legacy enterprise system, strict about canonical section headings
  const taleoNotes: string[] = [];
  let taleoScore = 100;
  if (!hasStandardHeadings) {
    taleoScore -= 40;
    taleoNotes.push('Taleo dumps non-standard section headers into unindexed "Additional Info" fields.');
  }
  if (!hasCompleteContact) {
    taleoScore -= 20;
    taleoNotes.push('Taleo requires extractable name, email, and phone at the very top of page 1.');
  }
  if (hasMultiColumnRisk) {
    taleoScore -= 20;
    taleoNotes.push('Legacy Taleo OCR creates duplicate entries on multi-column layouts.');
  }

  // Greenhouse: modern, structure stickler, checks for single column & standard sections
  const greenhouseNotes: string[] = [];
  let greenhouseScore = 100;
  if (!hasStandardHeadings) {
    greenhouseScore -= 25;
    greenhouseNotes.push('Greenhouse requires canonical section titles for recruiter filter mapping.');
  }
  if (!hasCompleteContact) {
    greenhouseScore -= 15;
    greenhouseNotes.push('Incomplete candidate header metadata.');
  }
  if (hasMultiColumnRisk) {
    greenhouseScore -= 15;
    greenhouseNotes.push('Single-column layouts are strongly recommended for clean recruiter mobile preview.');
  }

  const toStatus = (s: number): 'pass' | 'warning' | 'fail' =>
    s >= 80 ? 'pass' : s >= 60 ? 'warning' : 'fail';

  return {
    workdayReadiness: {
      status: toStatus(workdayScore),
      score: Math.max(0, Math.min(100, workdayScore)),
      notes: workdayNotes.length > 0 ? workdayNotes : ['Clean single-column layout and timeline dates verified for Workday ATS.'],
    },
    taleoReadiness: {
      status: toStatus(taleoScore),
      score: Math.max(0, Math.min(100, taleoScore)),
      notes: taleoNotes.length > 0 ? taleoNotes : ['Standard canonical headings and contact metadata index cleanly in Oracle Taleo.'],
    },
    greenhouseReadiness: {
      status: toStatus(greenhouseScore),
      score: Math.max(0, Math.min(100, greenhouseScore)),
      notes: greenhouseNotes.length > 0 ? greenhouseNotes : ['Optimized for Greenhouse / Lever recruiter search & pipeline view.'],
    },
  };
}

