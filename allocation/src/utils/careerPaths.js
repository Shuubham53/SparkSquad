// Comprehensive skill-to-career mapping for Career Path Recommendation

// Skills mapped to career paths
const skillToCareerMap = {
  // Frontend
  javascript: ['Frontend Developer', 'Fullstack Developer', 'Web Developer'],
  react: ['Frontend Developer', 'Fullstack Developer', 'React Developer'],
  vue: ['Frontend Developer', 'Fullstack Developer', 'Vue Developer'],
  angular: ['Frontend Developer', 'Fullstack Developer', 'Angular Developer'],
  html: ['Frontend Developer', 'Web Developer', 'UI Developer'],
  css: ['Frontend Developer', 'Web Developer', 'UI Developer'],
  typescript: ['Frontend Developer', 'Fullstack Developer', 'Software Engineer'],
  tailwindcss: ['Frontend Developer', 'UI Developer'],
  sass: ['Frontend Developer', 'UI Developer'],
  nextjs: ['Frontend Developer', 'Fullstack Developer', 'React Developer'],
  
  // Backend
  nodejs: ['Backend Developer', 'Fullstack Developer', 'Software Engineer'],
  node: ['Backend Developer', 'Fullstack Developer', 'Software Engineer'],
  express: ['Backend Developer', 'Fullstack Developer', 'API Developer'],
  python: ['Backend Developer', 'Data Scientist', 'Machine Learning Engineer', 'Software Engineer'],
  java: ['Backend Developer', 'Software Engineer', 'Android Developer'],
  'c#': ['Backend Developer', 'Software Engineer', '.NET Developer'],
  csharp: ['Backend Developer', 'Software Engineer', '.NET Developer'],
  php: ['Backend Developer', 'Web Developer'],
  ruby: ['Backend Developer', 'Fullstack Developer'],
  go: ['Backend Developer', 'DevOps Engineer', 'Cloud Engineer'],
  golang: ['Backend Developer', 'DevOps Engineer', 'Cloud Engineer'],
  rust: ['Systems Developer', 'Backend Developer', 'Software Engineer'],
  
  // Databases
  mongodb: ['Backend Developer', 'Fullstack Developer', 'Database Administrator'],
  sql: ['Backend Developer', 'Data Analyst', 'Database Administrator'],
  mysql: ['Backend Developer', 'Database Administrator'],
  postgresql: ['Backend Developer', 'Data Engineer', 'Database Administrator'],
  redis: ['Backend Developer', 'DevOps Engineer'],
  firebase: ['Fullstack Developer', 'Mobile Developer'],
  
  // Data Science & ML
  'machine learning': ['Machine Learning Engineer', 'Data Scientist', 'AI Engineer'],
  ml: ['Machine Learning Engineer', 'Data Scientist', 'AI Engineer'],
  'deep learning': ['Machine Learning Engineer', 'AI Engineer', 'Research Scientist'],
  tensorflow: ['Machine Learning Engineer', 'Data Scientist', 'AI Engineer'],
  pytorch: ['Machine Learning Engineer', 'Data Scientist', 'AI Engineer'],
  pandas: ['Data Analyst', 'Data Scientist', 'Data Engineer'],
  numpy: ['Data Scientist', 'Machine Learning Engineer'],
  'data analysis': ['Data Analyst', 'Business Analyst', 'Data Scientist'],
  'data visualization': ['Data Analyst', 'BI Developer', 'Data Scientist'],
  tableau: ['Data Analyst', 'BI Developer'],
  powerbi: ['Data Analyst', 'BI Developer', 'Business Analyst'],
  excel: ['Data Analyst', 'Business Analyst', 'Financial Analyst'],
  r: ['Data Scientist', 'Data Analyst', 'Statistician'],
  statistics: ['Data Scientist', 'Data Analyst', 'Research Scientist'],
  
  // DevOps & Cloud
  docker: ['DevOps Engineer', 'Cloud Engineer', 'Backend Developer'],
  kubernetes: ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer'],
  aws: ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect'],
  azure: ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect'],
  gcp: ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect'],
  'google cloud': ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect'],
  jenkins: ['DevOps Engineer', 'Build Engineer'],
  'ci/cd': ['DevOps Engineer', 'Build Engineer'],
  terraform: ['DevOps Engineer', 'Cloud Engineer', 'Infrastructure Engineer'],
  linux: ['DevOps Engineer', 'System Administrator', 'Backend Developer'],
  git: ['Software Engineer', 'DevOps Engineer'],
  
  // Mobile
  'react native': ['Mobile Developer', 'Fullstack Developer', 'React Developer'],
  flutter: ['Mobile Developer', 'Cross-platform Developer'],
  swift: ['iOS Developer', 'Mobile Developer'],
  kotlin: ['Android Developer', 'Mobile Developer'],
  android: ['Android Developer', 'Mobile Developer'],
  ios: ['iOS Developer', 'Mobile Developer'],
  
  // Other
  graphql: ['Backend Developer', 'Fullstack Developer', 'API Developer'],
  'rest api': ['Backend Developer', 'API Developer'],
  api: ['Backend Developer', 'API Developer', 'Integration Engineer'],
  security: ['Security Engineer', 'DevOps Engineer', 'Backend Developer'],
  cybersecurity: ['Security Engineer', 'Security Analyst'],
  testing: ['QA Engineer', 'Test Automation Engineer', 'Software Engineer'],
  jest: ['Frontend Developer', 'QA Engineer', 'Test Automation Engineer'],
  selenium: ['QA Engineer', 'Test Automation Engineer'],
  agile: ['Scrum Master', 'Project Manager', 'Software Engineer'],
  scrum: ['Scrum Master', 'Project Manager', 'Agile Coach'],
  figma: ['UI/UX Designer', 'Frontend Developer', 'Product Designer'],
  'ui/ux': ['UI/UX Designer', 'Product Designer', 'Frontend Developer'],
  design: ['UI/UX Designer', 'Product Designer', 'Graphic Designer'],
  photoshop: ['Graphic Designer', 'UI/UX Designer'],
  illustrator: ['Graphic Designer', 'UI/UX Designer'],
  blockchain: ['Blockchain Developer', 'Smart Contract Developer'],
  solidity: ['Blockchain Developer', 'Smart Contract Developer'],
  'web3': ['Blockchain Developer', 'Web3 Developer'],
};

// Career path details with descriptions and icons
const careerPathDetails = {
  'Frontend Developer': {
    description: 'Build user interfaces and web applications using HTML, CSS, and JavaScript frameworks.',
    icon: '🎨',
    color: 'indigo',
    salaryRange: '$60k - $130k',
    demand: 'High',
  },
  'Backend Developer': {
    description: 'Develop server-side logic, APIs, and database integrations for web applications.',
    icon: '⚙️',
    color: 'violet',
    salaryRange: '$70k - $140k',
    demand: 'High',
  },
  'Fullstack Developer': {
    description: 'Work on both frontend and backend, handling the complete development stack.',
    icon: '🔗',
    color: 'emerald',
    salaryRange: '$75k - $150k',
    demand: 'High',
  },
  'Data Scientist': {
    description: 'Analyze complex data sets to help guide business decisions using statistics and ML.',
    icon: '📊',
    color: 'blue',
    salaryRange: '$80k - $160k',
    demand: 'High',
  },
  'Machine Learning Engineer': {
    description: 'Design and implement ML models and AI systems for various applications.',
    icon: '🤖',
    color: 'purple',
    salaryRange: '$90k - $180k',
    demand: 'Very High',
  },
  'DevOps Engineer': {
    description: 'Bridge development and operations with CI/CD pipelines and infrastructure automation.',
    icon: '🚀',
    color: 'amber',
    salaryRange: '$80k - $160k',
    demand: 'High',
  },
  'Cloud Engineer': {
    description: 'Design and manage cloud infrastructure on AWS, Azure, or GCP.',
    icon: '☁️',
    color: 'sky',
    salaryRange: '$85k - $165k',
    demand: 'Very High',
  },
  'Mobile Developer': {
    description: 'Create native or cross-platform mobile applications for iOS and Android.',
    icon: '📱',
    color: 'rose',
    salaryRange: '$70k - $145k',
    demand: 'High',
  },
  'Data Analyst': {
    description: 'Interpret data and turn it into actionable business insights.',
    icon: '📈',
    color: 'teal',
    salaryRange: '$55k - $100k',
    demand: 'Medium',
  },
  'Software Engineer': {
    description: 'Design, develop, and maintain software systems and applications.',
    icon: '💻',
    color: 'slate',
    salaryRange: '$70k - $150k',
    demand: 'High',
  },
  'UI/UX Designer': {
    description: 'Design intuitive and visually appealing user interfaces and experiences.',
    icon: '✨',
    color: 'pink',
    salaryRange: '$60k - $120k',
    demand: 'Medium',
  },
  'Security Engineer': {
    description: 'Protect systems and data from cyber threats and vulnerabilities.',
    icon: '🔒',
    color: 'red',
    salaryRange: '$85k - $170k',
    demand: 'Very High',
  },
  'QA Engineer': {
    description: 'Ensure software quality through testing and test automation.',
    icon: '✅',
    color: 'green',
    salaryRange: '$55k - $110k',
    demand: 'Medium',
  },
  'Blockchain Developer': {
    description: 'Build decentralized applications and smart contracts.',
    icon: '⛓️',
    color: 'orange',
    salaryRange: '$90k - $180k',
    demand: 'Growing',
  },
  'iOS Developer': {
    description: 'Develop native iOS applications using Swift and Apple frameworks.',
    icon: '🍎',
    color: 'gray',
    salaryRange: '$80k - $155k',
    demand: 'Medium',
  },
  'Android Developer': {
    description: 'Build native Android applications using Kotlin or Java.',
    icon: '🤖',
    color: 'lime',
    salaryRange: '$75k - $145k',
    demand: 'Medium',
  },
  'AI Engineer': {
    description: 'Develop and deploy artificial intelligence systems and solutions.',
    icon: '🧠',
    color: 'fuchsia',
    salaryRange: '$100k - $200k',
    demand: 'Very High',
  },
  'Data Engineer': {
    description: 'Build and maintain data pipelines and infrastructure.',
    icon: '🔧',
    color: 'cyan',
    salaryRange: '$85k - $160k',
    demand: 'High',
  },
  'Web Developer': {
    description: 'Create and maintain websites and web applications.',
    icon: '🌐',
    color: 'blue',
    salaryRange: '$50k - $100k',
    demand: 'High',
  },
  'React Developer': {
    description: 'Specialize in building React-based web and mobile applications.',
    icon: '⚛️',
    color: 'cyan',
    salaryRange: '$70k - $140k',
    demand: 'High',
  },
};

/**
 * Get recommended career paths based on user skills
 * @param {string[]} skills - Array of skill strings
 * @returns {Array} - Array of career path recommendations with scores
 */
export function getCareerRecommendations(skills) {
  if (!skills || skills.length === 0) {
    return [];
  }

  const careerScores = {};
  const careerMatchedSkills = {};
  
  // Normalize skills to lowercase
  const normalizedSkills = skills.map(s => s.toLowerCase().trim());

  // Count career occurrences based on skills
  for (const skill of normalizedSkills) {
    const careers = skillToCareerMap[skill];
    if (careers) {
      for (const career of careers) {
        careerScores[career] = (careerScores[career] || 0) + 1;
        if (!careerMatchedSkills[career]) {
          careerMatchedSkills[career] = [];
        }
        if (!careerMatchedSkills[career].includes(skill)) {
          careerMatchedSkills[career].push(skill);
        }
      }
    }
  }

  // Convert to array and calculate match percentage
  const recommendations = Object.entries(careerScores)
    .map(([career, score]) => {
      const details = careerPathDetails[career] || {
        description: `A career path in ${career}.`,
        icon: '💼',
        color: 'slate',
        salaryRange: 'Varies',
        demand: 'Medium',
      };
      
      // Calculate match percentage based on matched skills vs typical requirements
      const matchedSkills = careerMatchedSkills[career] || [];
      const matchPercentage = Math.min(100, Math.round((matchedSkills.length / 4) * 100));
      
      return {
        title: career,
        score,
        matchPercentage,
        matchedSkills,
        ...details,
      };
    })
    .sort((a, b) => b.score - a.score || b.matchPercentage - a.matchPercentage)
    .slice(0, 8); // Return top 8 recommendations

  return recommendations;
}

/**
 * Get skills gap for a specific career path
 * @param {string} careerPath - Career path name
 * @param {string[]} userSkills - User's current skills
 * @returns {string[]} - Array of missing skills
 */
export function getSkillsGap(careerPath, userSkills) {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const requiredSkills = [];
  
  // Find all skills that map to this career
  for (const [skill, careers] of Object.entries(skillToCareerMap)) {
    if (careers.includes(careerPath)) {
      requiredSkills.push(skill);
    }
  }
  
  // Return skills user doesn't have
  return requiredSkills.filter(skill => !normalizedUserSkills.includes(skill));
}

export { skillToCareerMap, careerPathDetails };
export default { getCareerRecommendations, getSkillsGap, skillToCareerMap, careerPathDetails };
