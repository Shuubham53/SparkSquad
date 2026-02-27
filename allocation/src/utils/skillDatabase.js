// Predefined skill database used for resume parsing and matching
const SKILL_DATABASE = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'ruby', 'go', 'golang',
  'rust', 'swift', 'kotlin', 'php', 'perl', 'scala', 'r', 'matlab', 'dart', 'lua',
  'objective-c', 'shell', 'bash', 'powershell', 'solidity', 'haskell', 'elixir', 'clojure',

  // Web Frontend
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwindcss', 'tailwind',
  'bootstrap', 'react', 'reactjs', 'react.js', 'redux', 'next.js', 'nextjs',
  'vue', 'vuejs', 'vue.js', 'nuxt', 'nuxtjs', 'angular', 'angularjs', 'svelte',
  'jquery', 'webpack', 'vite', 'babel', 'eslint', 'prettier',

  // Web Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'nestjs', 'fastify',
  'django', 'flask', 'fastapi', 'spring', 'spring boot', 'springboot',
  'rails', 'ruby on rails', 'laravel', 'asp.net', '.net', 'dotnet',

  // Databases
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'mongoose',
  'redis', 'firebase', 'firestore', 'dynamodb', 'cassandra', 'couchdb',
  'mariadb', 'oracle', 'neo4j', 'graphql', 'prisma', 'sequelize',

  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku',
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins',
  'ci/cd', 'github actions', 'gitlab ci', 'circleci', 'nginx', 'apache',
  'linux', 'unix', 'devops', 'cloudflare', 'vercel', 'netlify',

  // Data Science & AI/ML
  'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml',
  'nlp', 'natural language processing', 'computer vision', 'opencv',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas',
  'numpy', 'scipy', 'matplotlib', 'seaborn', 'jupyter', 'data science',
  'data analysis', 'data analytics', 'data visualization', 'tableau', 'power bi',
  'big data', 'hadoop', 'spark', 'apache spark', 'etl', 'data engineering',
  'statistics', 'regression', 'classification', 'clustering', 'neural networks',

  // Mobile Development
  'android', 'ios', 'react native', 'flutter', 'swift', 'swiftui',
  'kotlin', 'xamarin', 'ionic', 'cordova', 'expo',

  // Tools & Version Control
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'jira', 'trello',
  'slack', 'confluence', 'figma', 'sketch', 'adobe xd', 'postman',
  'swagger', 'insomnia', 'vs code', 'vim',

  // Testing
  'jest', 'mocha', 'chai', 'cypress', 'selenium', 'puppeteer', 'playwright',
  'junit', 'pytest', 'testing', 'unit testing', 'integration testing',
  'test driven development', 'tdd', 'bdd',

  // Other
  'rest', 'rest api', 'restful', 'api', 'microservices', 'websocket', 'socket.io',
  'oauth', 'jwt', 'authentication', 'authorization', 'security',
  'agile', 'scrum', 'kanban', 'project management',
  'blockchain', 'web3', 'ethereum', 'smart contracts',
  'ux', 'ui', 'ux design', 'ui design', 'responsive design',
  'seo', 'accessibility', 'a11y', 'performance', 'optimization',
  'linux', 'windows', 'macos',
  'excel', 'word', 'powerpoint',
  'communication', 'teamwork', 'leadership', 'problem solving',
];

/**
 * Extract skills from text by matching against the skill database.
 * Returns unique lowercase skill names found.
 */
export function extractSkillsFromText(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = new Set();

  // Sort skills longest-first so multi-word skills match before single-word fragments
  const sortedSkills = [...SKILL_DATABASE].sort((a, b) => b.length - a.length);

  for (const skill of sortedSkills) {
    // Use word-boundary-ish matching — check the skill exists surrounded by non-alpha chars
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, 'i');
    if (regex.test(lowerText)) {
      found.add(skill);
    }
  }
  return [...found];
}

/**
 * Calculate match percentage between a student's skills and required skills.
 * Returns { matchPercentage, matchedSkills, missingSkills }
 */
export function calculateMatch(studentSkills = [], requiredSkills = []) {
  if (!requiredSkills.length) return { matchPercentage: 0, matchedSkills: [], missingSkills: [] };

  const studentSet = new Set(studentSkills.map((s) => s.toLowerCase()));
  const matchedSkills = requiredSkills.filter((s) => studentSet.has(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !studentSet.has(s.toLowerCase()));
  const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return { matchPercentage, matchedSkills, missingSkills };
}

export { SKILL_DATABASE };
