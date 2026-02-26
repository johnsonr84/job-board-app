import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildSearchText(input: {
  title: string;
  description: string;
  location: string;
  companyName: string;
  tags: string[];
}) {
  return [
    input.title,
    stripHtml(input.description),
    input.location,
    input.companyName,
    input.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

// ---------------------------------------------------------------------------
// Realistic seed data pools
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  "James", "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia",
  "Mason", "Isabella", "Lucas", "Mia", "Alexander", "Charlotte", "Benjamin",
  "Amelia", "Daniel", "Harper", "Henry", "Evelyn", "Sebastian", "Luna",
  "Jack", "Camila", "Owen", "Aria", "Samuel", "Scarlett", "Ryan", "Penelope",
  "Leo", "Layla", "Nathan", "Chloe", "Adrian", "Victoria", "Mateo", "Madison",
  "Elijah", "Grace", "Caleb", "Nora", "Isaiah", "Riley", "Joshua", "Zoey",
  "Andrew", "Hannah", "David", "Lily",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts",
];

const COMPANIES = [
  { name: "Apex Technologies", slug: "apex-technologies", website: "https://apextech.io", description: "Building next-generation cloud infrastructure for enterprise teams.", location: "San Francisco, CA" },
  { name: "Verdant Health", slug: "verdant-health", website: "https://verdanthealth.com", description: "Digital health platform connecting patients with providers through AI-powered care coordination.", location: "Boston, MA" },
  { name: "NovaPay Financial", slug: "novapay-financial", website: "https://novapay.com", description: "Modern payment processing and fintech solutions for businesses of all sizes.", location: "New York, NY" },
  { name: "Lunar Robotics", slug: "lunar-robotics", website: "https://lunarrobotics.co", description: "Autonomous robotics systems for warehouse logistics and last-mile delivery.", location: "Austin, TX" },
  { name: "Stratosphere Media", slug: "stratosphere-media", website: "https://stratospheremedia.com", description: "Content creation platform and digital marketing agency for emerging brands.", location: "Los Angeles, CA" },
  { name: "Forge Data Systems", slug: "forge-data-systems", website: "https://forgedata.io", description: "Real-time data pipeline and analytics platform trusted by Fortune 500 companies.", location: "Seattle, WA" },
  { name: "Pinnacle Education", slug: "pinnacle-education", website: "https://pinnacle-ed.com", description: "EdTech company revolutionizing online learning with adaptive curriculum technology.", location: "Chicago, IL" },
  { name: "Ember Security", slug: "ember-security", website: "https://embersec.io", description: "Zero-trust cybersecurity solutions protecting modern cloud-native applications.", location: "Denver, CO" },
  { name: "Solaris Energy", slug: "solaris-energy", website: "https://solarisenergy.com", description: "Clean energy management software for residential and commercial solar installations.", location: "Phoenix, AZ" },
  { name: "Catalyst Ventures", slug: "catalyst-ventures", website: "https://catalystvc.co", description: "Early-stage venture fund and startup accelerator focused on deep tech and sustainability.", location: "San Francisco, CA" },
  { name: "BluePrint Labs", slug: "blueprint-labs", website: "https://blueprintlabs.dev", description: "Developer tools company building the next generation of CI/CD and DevOps platforms.", location: "Portland, OR" },
  { name: "Meridian Logistics", slug: "meridian-logistics", website: "https://meridianlogistics.com", description: "AI-driven supply chain optimization and freight management for global trade.", location: "Miami, FL" },
];

const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA",
  "Boston, MA", "Los Angeles, CA", "Chicago, IL", "Denver, CO",
  "Portland, OR", "Miami, FL", "Atlanta, GA", "Nashville, TN",
  "Phoenix, AZ", "Remote", "London, UK", "Toronto, Canada",
  "Berlin, Germany",
];

const SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Go", "Rust", "Java", "C++", "SQL", "PostgreSQL", "MongoDB",
  "GraphQL", "REST APIs", "AWS", "GCP", "Azure", "Docker", "Kubernetes",
  "Terraform", "CI/CD", "Git", "Agile", "Scrum", "TDD", "Machine Learning",
  "Data Science", "Figma", "UI/UX Design", "Product Management",
  "Technical Writing", "Linux", "Redis", "Kafka", "Elasticsearch",
  "Swift", "Kotlin", "Flutter", "React Native",
];

const HEADLINES = [
  "Senior Software Engineer", "Full Stack Developer", "Frontend Engineer",
  "Backend Developer", "DevOps Engineer", "Data Scientist",
  "Product Designer", "Engineering Manager", "Staff Engineer",
  "Machine Learning Engineer", "Cloud Architect", "Mobile Developer",
  "Solutions Architect", "Security Engineer", "QA Engineer",
  "Technical Lead", "Platform Engineer", "Site Reliability Engineer",
];

type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "temporary";
type WorkplaceType = "on_site" | "remote" | "hybrid";
type ApplicationStatus = "submitted" | "in_review" | "accepted" | "rejected" | "withdrawn";

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full_time", "full_time", "full_time", "full_time",
  "part_time", "contract", "contract", "internship", "temporary",
];

const WORKPLACE_TYPES: WorkplaceType[] = [
  "remote", "remote", "remote", "hybrid", "hybrid", "on_site",
];

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "submitted", "submitted", "submitted",
  "in_review", "in_review",
  "accepted", "rejected", "withdrawn",
];

const JOB_TEMPLATES: Array<{
  title: string;
  descriptionTemplate: string;
  tags: string[];
  salaryRange: [number, number];
}> = [
  {
    title: "Senior Frontend Engineer",
    descriptionTemplate: `<p>We're looking for a <strong>Senior Frontend Engineer</strong> to join our team at {company}. You'll work on building performant, accessible user interfaces using React and TypeScript. You'll collaborate closely with designers and backend engineers to deliver delightful user experiences.</p><h3>Responsibilities</h3><ul><li>Architect and build complex UI components and features</li><li>Optimize application performance and bundle size</li><li>Mentor junior developers and conduct code reviews</li><li>Contribute to our design system and frontend tooling</li></ul><h3>Requirements</h3><ul><li>5+ years of experience with modern JavaScript/TypeScript</li><li>Deep knowledge of React, state management, and testing</li><li>Experience with CSS-in-JS, Tailwind, or similar styling approaches</li><li>Strong understanding of web performance and accessibility</li></ul>`,
    tags: ["react", "typescript", "frontend", "css", "performance"],
    salaryRange: [140000, 200000],
  },
  {
    title: "Backend Engineer",
    descriptionTemplate: `<p>Join {company} as a <strong>Backend Engineer</strong> and help us scale our platform to millions of users. You'll design and implement APIs, microservices, and data pipelines that power our core product.</p><h3>Responsibilities</h3><ul><li>Design and implement RESTful and GraphQL APIs</li><li>Build scalable microservices architecture</li><li>Optimize database queries and data models</li><li>Implement monitoring, alerting, and observability</li></ul><h3>Requirements</h3><ul><li>3+ years of backend development experience</li><li>Proficiency in Node.js, Python, or Go</li><li>Experience with PostgreSQL, Redis, and message queues</li><li>Understanding of distributed systems concepts</li></ul>`,
    tags: ["node.js", "python", "postgresql", "apis", "microservices"],
    salaryRange: [120000, 180000],
  },
  {
    title: "Full Stack Developer",
    descriptionTemplate: `<p>{company} is hiring a <strong>Full Stack Developer</strong> who thrives across the entire stack. From pixel-perfect UIs to robust backend services, you'll own features end-to-end.</p><h3>Responsibilities</h3><ul><li>Build and ship full-stack features from concept to production</li><li>Work with React/Next.js on the frontend and Node.js on the backend</li><li>Design database schemas and write efficient queries</li><li>Participate in architecture discussions and technical planning</li></ul><h3>Requirements</h3><ul><li>3+ years of full-stack development experience</li><li>Strong skills in React, TypeScript, and Node.js</li><li>Experience with SQL and NoSQL databases</li><li>Familiarity with cloud platforms (AWS, GCP, or Azure)</li></ul>`,
    tags: ["react", "next.js", "node.js", "typescript", "full-stack"],
    salaryRange: [110000, 170000],
  },
  {
    title: "DevOps Engineer",
    descriptionTemplate: `<p>We need a <strong>DevOps Engineer</strong> at {company} to build and maintain our cloud infrastructure. You'll work on automating deployments, improving reliability, and scaling our systems.</p><h3>Responsibilities</h3><ul><li>Manage and optimize our AWS/GCP infrastructure</li><li>Build and maintain CI/CD pipelines</li><li>Implement infrastructure-as-code with Terraform</li><li>Monitor system health and respond to incidents</li></ul><h3>Requirements</h3><ul><li>4+ years of DevOps or SRE experience</li><li>Deep experience with AWS or GCP</li><li>Proficiency with Docker, Kubernetes, and Terraform</li><li>Strong scripting skills (Bash, Python)</li><li>Experience with monitoring tools (Datadog, Prometheus, Grafana)</li></ul>`,
    tags: ["aws", "docker", "kubernetes", "terraform", "ci/cd"],
    salaryRange: [130000, 190000],
  },
  {
    title: "Product Designer",
    descriptionTemplate: `<p>{company} is looking for a <strong>Product Designer</strong> to shape the future of our user experience. You'll work closely with product and engineering to design intuitive, beautiful interfaces.</p><h3>Responsibilities</h3><ul><li>Lead end-to-end design for new features and products</li><li>Conduct user research, usability testing, and competitive analysis</li><li>Create wireframes, prototypes, and high-fidelity designs in Figma</li><li>Build and maintain our design system</li></ul><h3>Requirements</h3><ul><li>3+ years of product design experience</li><li>Expert-level Figma skills</li><li>Portfolio demonstrating strong visual and interaction design</li><li>Experience with design systems and component libraries</li><li>Understanding of frontend development (HTML, CSS, React)</li></ul>`,
    tags: ["figma", "ui/ux", "design", "prototyping", "user-research"],
    salaryRange: [100000, 160000],
  },
  {
    title: "Data Scientist",
    descriptionTemplate: `<p>{company} is seeking a <strong>Data Scientist</strong> to extract insights from our data and build machine learning models that drive product decisions.</p><h3>Responsibilities</h3><ul><li>Analyze large datasets to uncover trends and opportunities</li><li>Build and deploy machine learning models</li><li>Design and analyze A/B experiments</li><li>Create dashboards and data visualizations</li></ul><h3>Requirements</h3><ul><li>3+ years of data science experience</li><li>Strong skills in Python, SQL, and statistical analysis</li><li>Experience with ML frameworks (scikit-learn, TensorFlow, PyTorch)</li><li>Knowledge of experiment design and causal inference</li><li>Excellent communication and data storytelling skills</li></ul>`,
    tags: ["python", "machine-learning", "sql", "statistics", "data-analysis"],
    salaryRange: [130000, 195000],
  },
  {
    title: "Engineering Manager",
    descriptionTemplate: `<p>{company} needs an <strong>Engineering Manager</strong> to lead a team of talented engineers. You'll drive technical strategy while growing your team's careers.</p><h3>Responsibilities</h3><ul><li>Lead and grow a team of 6-10 engineers</li><li>Drive technical roadmap and architecture decisions</li><li>Partner with product and design on feature prioritization</li><li>Establish engineering best practices and processes</li></ul><h3>Requirements</h3><ul><li>2+ years of engineering management experience</li><li>5+ years of software development experience</li><li>Strong technical background in modern web technologies</li><li>Excellent communication and leadership skills</li><li>Experience with Agile methodologies</li></ul>`,
    tags: ["leadership", "management", "agile", "strategy", "mentoring"],
    salaryRange: [170000, 240000],
  },
  {
    title: "Machine Learning Engineer",
    descriptionTemplate: `<p>Join {company} as a <strong>Machine Learning Engineer</strong> and build production ML systems that power intelligent features used by thousands of customers.</p><h3>Responsibilities</h3><ul><li>Design, train, and deploy ML models at scale</li><li>Build data pipelines and feature engineering systems</li><li>Optimize model performance and latency</li><li>Collaborate with product teams to identify ML opportunities</li></ul><h3>Requirements</h3><ul><li>3+ years of ML engineering experience</li><li>Deep knowledge of Python, PyTorch/TensorFlow</li><li>Experience with ML infrastructure (MLflow, Kubeflow, SageMaker)</li><li>Strong software engineering fundamentals</li><li>MS or PhD in CS, ML, or related field preferred</li></ul>`,
    tags: ["machine-learning", "python", "pytorch", "tensorflow", "mlops"],
    salaryRange: [150000, 220000],
  },
  {
    title: "Mobile Developer (React Native)",
    descriptionTemplate: `<p>{company} is hiring a <strong>Mobile Developer</strong> to build cross-platform mobile experiences. You'll ship features to both iOS and Android using React Native.</p><h3>Responsibilities</h3><ul><li>Build and maintain our React Native mobile application</li><li>Implement native modules when needed for performance</li><li>Optimize app startup time, animations, and battery usage</li><li>Work with the design team to ensure pixel-perfect implementation</li></ul><h3>Requirements</h3><ul><li>3+ years of mobile development experience</li><li>Strong React Native expertise</li><li>Experience with iOS or Android native development</li><li>Knowledge of app store submission and CI/CD for mobile</li><li>Familiarity with TypeScript</li></ul>`,
    tags: ["react-native", "mobile", "typescript", "ios", "android"],
    salaryRange: [120000, 175000],
  },
  {
    title: "Security Engineer",
    descriptionTemplate: `<p>{company} is looking for a <strong>Security Engineer</strong> to protect our infrastructure and customer data. You'll implement security best practices across our stack.</p><h3>Responsibilities</h3><ul><li>Conduct security assessments and penetration testing</li><li>Design and implement security controls and monitoring</li><li>Respond to security incidents and conduct post-mortems</li><li>Build security automation and tooling</li></ul><h3>Requirements</h3><ul><li>4+ years of security engineering experience</li><li>Knowledge of OWASP Top 10, zero-trust architecture</li><li>Experience with cloud security (AWS/GCP)</li><li>Proficiency in scripting (Python, Bash)</li><li>Security certifications (CISSP, CEH) a plus</li></ul>`,
    tags: ["security", "penetration-testing", "cloud-security", "compliance", "incident-response"],
    salaryRange: [140000, 210000],
  },
  {
    title: "Technical Writer",
    descriptionTemplate: `<p>{company} needs a <strong>Technical Writer</strong> to create clear, comprehensive documentation for our developer platform and APIs.</p><h3>Responsibilities</h3><ul><li>Write and maintain API documentation, guides, and tutorials</li><li>Create onboarding materials for developers</li><li>Collaborate with engineers to document new features</li><li>Improve documentation tooling and workflows</li></ul><h3>Requirements</h3><ul><li>2+ years of technical writing experience</li><li>Ability to write clear, concise technical content</li><li>Familiarity with APIs, SDKs, and developer tools</li><li>Experience with docs-as-code workflows (Markdown, Git)</li><li>Basic coding skills in at least one programming language</li></ul>`,
    tags: ["documentation", "technical-writing", "apis", "developer-experience"],
    salaryRange: [80000, 130000],
  },
  {
    title: "QA Automation Engineer",
    descriptionTemplate: `<p>Join {company} as a <strong>QA Automation Engineer</strong> and build the testing infrastructure that ensures our product quality at scale.</p><h3>Responsibilities</h3><ul><li>Design and implement automated test suites (unit, integration, E2E)</li><li>Build and maintain CI/CD test pipelines</li><li>Develop testing frameworks and tooling</li><li>Collaborate with developers on testability improvements</li></ul><h3>Requirements</h3><ul><li>3+ years of QA automation experience</li><li>Proficiency with testing frameworks (Playwright, Cypress, Jest)</li><li>Strong programming skills in TypeScript or Python</li><li>Experience with CI/CD systems</li><li>Understanding of software development lifecycle</li></ul>`,
    tags: ["testing", "automation", "playwright", "ci/cd", "quality-assurance"],
    salaryRange: [100000, 155000],
  },
  {
    title: "Cloud Architect",
    descriptionTemplate: `<p>{company} is seeking a <strong>Cloud Architect</strong> to design and evolve our multi-region cloud infrastructure that serves millions of requests daily.</p><h3>Responsibilities</h3><ul><li>Design scalable, cost-effective cloud architecture</li><li>Lead cloud migration and modernization initiatives</li><li>Establish cloud governance and security standards</li><li>Evaluate and adopt new cloud services and technologies</li></ul><h3>Requirements</h3><ul><li>6+ years of cloud infrastructure experience</li><li>Deep expertise with AWS or GCP (multi-cloud a plus)</li><li>Experience with microservices, serverless, and container orchestration</li><li>Strong understanding of networking, security, and compliance</li><li>AWS Solutions Architect Professional or equivalent certification</li></ul>`,
    tags: ["aws", "gcp", "architecture", "microservices", "serverless"],
    salaryRange: [160000, 240000],
  },
  {
    title: "Platform Engineer",
    descriptionTemplate: `<p>{company} needs a <strong>Platform Engineer</strong> to build the internal developer platform that accelerates our engineering team.</p><h3>Responsibilities</h3><ul><li>Build and maintain our internal developer platform</li><li>Create self-service tools for provisioning and deployment</li><li>Design and implement service mesh and API gateway</li><li>Drive adoption of platform standards across teams</li></ul><h3>Requirements</h3><ul><li>4+ years of platform or infrastructure engineering</li><li>Experience with Kubernetes, Helm, and service mesh</li><li>Strong Go or Python programming skills</li><li>Understanding of developer experience best practices</li><li>Experience with IDP tools (Backstage, Port, etc.)</li></ul>`,
    tags: ["kubernetes", "platform", "go", "developer-experience", "infrastructure"],
    salaryRange: [140000, 200000],
  },
  {
    title: "Staff Software Engineer",
    descriptionTemplate: `<p>{company} is hiring a <strong>Staff Software Engineer</strong> to drive technical excellence across our engineering organization. You'll tackle our hardest problems and set the technical direction.</p><h3>Responsibilities</h3><ul><li>Lead design and implementation of complex systems</li><li>Set technical vision and drive architectural decisions</li><li>Mentor senior engineers and raise the team's technical bar</li><li>Partner with leadership on technical strategy</li></ul><h3>Requirements</h3><ul><li>8+ years of software development experience</li><li>Track record of leading large-scale technical initiatives</li><li>Deep expertise in distributed systems</li><li>Strong communication and cross-team collaboration skills</li><li>Experience influencing technical direction at an organizational level</li></ul>`,
    tags: ["distributed-systems", "architecture", "leadership", "typescript", "system-design"],
    salaryRange: [190000, 280000],
  },
  {
    title: "Junior Developer",
    descriptionTemplate: `<p>Start your career at {company}! We're looking for a <strong>Junior Developer</strong> eager to learn and grow with a supportive, experienced team.</p><h3>Responsibilities</h3><ul><li>Build features and fix bugs across our web application</li><li>Write tests and participate in code reviews</li><li>Learn from senior engineers through pair programming</li><li>Contribute to technical documentation</li></ul><h3>Requirements</h3><ul><li>0-2 years of professional experience (internships count)</li><li>Familiarity with JavaScript/TypeScript and React</li><li>CS degree or equivalent bootcamp/self-taught background</li><li>Strong desire to learn and grow</li><li>Good communication and teamwork skills</li></ul>`,
    tags: ["javascript", "react", "entry-level", "learning", "web-development"],
    salaryRange: [60000, 90000],
  },
  {
    title: "Site Reliability Engineer",
    descriptionTemplate: `<p>{company} is looking for an <strong>SRE</strong> to keep our systems running at 99.99% uptime. You'll build the automation and observability that make our infrastructure resilient.</p><h3>Responsibilities</h3><ul><li>Design and implement SLOs, SLIs, and error budgets</li><li>Build automation for incident response and remediation</li><li>Optimize system performance and resource utilization</li><li>Conduct blameless post-mortems and drive improvements</li></ul><h3>Requirements</h3><ul><li>4+ years of SRE or operations experience</li><li>Strong Linux systems administration skills</li><li>Experience with monitoring (Prometheus, Grafana, PagerDuty)</li><li>Proficiency in Python, Go, or Bash</li><li>Understanding of distributed systems and networking</li></ul>`,
    tags: ["sre", "linux", "monitoring", "automation", "reliability"],
    salaryRange: [140000, 210000],
  },
  {
    title: "Product Manager",
    descriptionTemplate: `<p>{company} is hiring a <strong>Product Manager</strong> to define and execute the product strategy for our core platform. You'll work at the intersection of business, design, and technology.</p><h3>Responsibilities</h3><ul><li>Define product vision, strategy, and roadmap</li><li>Conduct user research and analyze product metrics</li><li>Write PRDs and prioritize the feature backlog</li><li>Collaborate with engineering and design to ship products</li></ul><h3>Requirements</h3><ul><li>3+ years of product management experience</li><li>Strong analytical and data-driven mindset</li><li>Excellent written and verbal communication skills</li><li>Technical background or ability to work closely with engineers</li><li>Experience with B2B SaaS products preferred</li></ul>`,
    tags: ["product-management", "strategy", "analytics", "user-research", "roadmap"],
    salaryRange: [120000, 180000],
  },
  {
    title: "Marketing Coordinator",
    descriptionTemplate: `<p>{company} is seeking a <strong>Marketing Coordinator</strong> to support our growing marketing team. You'll help execute campaigns and manage our digital presence.</p><h3>Responsibilities</h3><ul><li>Coordinate multi-channel marketing campaigns</li><li>Manage social media accounts and content calendar</li><li>Track campaign performance and create reports</li><li>Support event planning and sponsorship logistics</li></ul><h3>Requirements</h3><ul><li>1-3 years of marketing experience</li><li>Strong writing and communication skills</li><li>Familiarity with marketing tools (HubSpot, Mailchimp, Google Analytics)</li><li>Creative mindset with attention to detail</li><li>Bachelor's degree in marketing, communications, or related field</li></ul>`,
    tags: ["marketing", "social-media", "content", "analytics", "campaigns"],
    salaryRange: [55000, 80000],
  },
  {
    title: "Customer Success Manager",
    descriptionTemplate: `<p>Join {company} as a <strong>Customer Success Manager</strong> and help our clients get maximum value from our platform. You'll be the trusted advisor for a portfolio of accounts.</p><h3>Responsibilities</h3><ul><li>Manage a portfolio of 30-50 enterprise accounts</li><li>Drive product adoption, renewals, and expansion</li><li>Conduct quarterly business reviews with customers</li><li>Identify churn risks and develop mitigation plans</li></ul><h3>Requirements</h3><ul><li>3+ years of customer success or account management</li><li>Experience with SaaS products and enterprise sales cycles</li><li>Strong relationship-building and communication skills</li><li>Data-driven approach to customer health scoring</li><li>Experience with CSM tools (Gainsight, Totango, etc.)</li></ul>`,
    tags: ["customer-success", "account-management", "saas", "retention", "enterprise"],
    salaryRange: [80000, 130000],
  },
];

const COVER_LETTERS = [
  "I'm excited to apply for this position. With my background in software development and passion for building great products, I believe I'd be a strong addition to your team. I'm particularly drawn to your company's mission and the technical challenges this role presents.",
  "Having followed your company's growth over the past year, I'm thrilled to submit my application. My experience aligns well with the requirements outlined, and I'm eager to contribute to your team's success. I bring a strong work ethic and a collaborative mindset.",
  "I'm writing to express my interest in this role. Throughout my career, I've consistently delivered high-quality work under tight deadlines. I'm passionate about continuous learning and would love the opportunity to grow with your organization.",
  "This position caught my attention because it perfectly matches my skill set and career goals. I have extensive experience in the technologies mentioned and a proven track record of shipping impactful features. I'd welcome the chance to discuss how I can contribute.",
  "I'm a dedicated professional seeking to bring my expertise to your team. My hands-on experience with the technologies listed, combined with my collaborative approach, makes me confident I can make an immediate impact. I look forward to the opportunity to discuss this further.",
  undefined,
  undefined,
  undefined,
];

const BIOS = [
  "Passionate software engineer with a love for clean code and elegant solutions. When I'm not coding, you'll find me hiking or experimenting with new recipes.",
  "Full-stack developer with a knack for turning complex problems into simple, intuitive interfaces. Coffee enthusiast and open-source contributor.",
  "Results-driven engineer who believes great software is built through collaboration, rigorous testing, and empathy for users.",
  "Creative technologist bridging the gap between design and engineering. I thrive in fast-paced environments where I can wear multiple hats.",
  "Systems thinker and infrastructure nerd. I automate everything I can and build platforms that let teams move fast without breaking things.",
  "Data-driven professional who loves uncovering insights hidden in numbers. I combine statistical rigor with clear communication to drive decisions.",
  "Product-minded engineer who cares deeply about user experience. I've shipped features used by millions and mentored dozens of junior developers.",
  "Security-focused developer who believes in building secure-by-default systems. I enjoy CTFs, penetration testing, and teaching teams about security best practices.",
];

const SUMMARIES = [
  "Experienced software engineer with a track record of delivering scalable web applications. Strong background in modern JavaScript frameworks and cloud infrastructure.",
  "Detail-oriented developer focused on building performant, accessible user interfaces. Passionate about design systems and component architecture.",
  "Backend specialist with deep expertise in distributed systems, API design, and database optimization. Comfortable leading technical initiatives across cross-functional teams.",
  "Versatile full-stack developer who thrives at the intersection of product and engineering. Known for shipping quickly without sacrificing code quality.",
  "Infrastructure engineer with a passion for automation, observability, and developer experience. Experienced in building platforms that scale.",
  "Data-focused engineer combining strong analytical skills with production engineering experience. Expert in ML pipelines and real-time data processing.",
  undefined,
  undefined,
];

const SEED_EXPERIENCE_TITLES = [
  "Software Engineer", "Senior Software Engineer", "Frontend Developer",
  "Backend Developer", "Full Stack Developer", "DevOps Engineer",
  "Data Analyst", "Product Designer", "QA Engineer", "Engineering Intern",
  "Technical Lead", "Staff Engineer", "Platform Engineer",
];

const SEED_COMPANIES_NAMES = [
  "Google", "Meta", "Amazon", "Microsoft", "Apple", "Stripe", "Shopify",
  "Airbnb", "Netflix", "Uber", "Lyft", "Figma", "Notion", "Vercel",
  "Datadog", "Twilio", "Cloudflare", "Spotify", "Twitter", "LinkedIn",
  "Salesforce", "Square", "Dropbox", "Atlassian", "Coinbase",
];

const SCHOOLS = [
  "Stanford University", "MIT", "UC Berkeley", "Carnegie Mellon University",
  "Georgia Tech", "University of Michigan", "UCLA", "University of Washington",
  "Cornell University", "University of Illinois Urbana-Champaign",
  "University of Texas at Austin", "Purdue University", "Columbia University",
  "University of Southern California", "NYU", "Cal Poly SLO",
];

const DEGREES = [
  "Bachelor of Science", "Master of Science", "Bachelor of Arts",
  "Master of Engineering", "Associate of Science",
];

const FIELDS_OF_STUDY = [
  "Computer Science", "Software Engineering", "Information Technology",
  "Data Science", "Electrical Engineering", "Mathematics",
  "Computer Engineering", "Information Systems",
];

const CERT_NAMES = [
  { name: "AWS Certified Solutions Architect – Associate", org: "Amazon Web Services" },
  { name: "AWS Certified Developer – Associate", org: "Amazon Web Services" },
  { name: "Google Cloud Professional Cloud Architect", org: "Google Cloud" },
  { name: "Certified Kubernetes Administrator", org: "Cloud Native Computing Foundation" },
  { name: "Meta Front-End Developer Professional Certificate", org: "Meta (Coursera)" },
  { name: "Google UX Design Professional Certificate", org: "Google (Coursera)" },
  { name: "HashiCorp Certified: Terraform Associate", org: "HashiCorp" },
  { name: "Certified Scrum Master (CSM)", org: "Scrum Alliance" },
  { name: "PMP Project Management Professional", org: "PMI" },
  { name: "CompTIA Security+", org: "CompTIA" },
];

// ---------------------------------------------------------------------------
// Seed mutation
// ---------------------------------------------------------------------------

export const seed = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    userCount: v.optional(v.number()),
    jobsPerCompany: v.optional(v.number()),
  },
  returns: v.object({
    users: v.number(),
    profiles: v.number(),
    experiences: v.number(),
    education: v.number(),
    certifications: v.number(),
    companies: v.number(),
    companyMembers: v.number(),
    jobListings: v.number(),
    applications: v.number(),
    favorites: v.number(),
    notifications: v.number(),
  }),
  handler: async (ctx, args) => {
    const userCount = args.userCount ?? 40;
    const jobsPerCompany = args.jobsPerCompany ?? 6;

    const counts = {
      users: 0,
      profiles: 0,
      experiences: 0,
      education: 0,
      certifications: 0,
      companies: 0,
      companyMembers: 0,
      jobListings: 0,
      applications: 0,
      favorites: 0,
      notifications: 0,
    };

    // ------ Real user (slot 0) ------

    const userIds: Id<"users">[] = [];
    const usedNames = new Set<string>();
    let realUserId: Id<"users"> | null = null;

    if (args.clerkUserId) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId!))
        .unique();

      if (existing) {
        realUserId = existing._id;
        userIds.push(existing._id);
      } else {
        const now = Date.now();
        realUserId = await ctx.db.insert("users", {
          clerkUserId: args.clerkUserId,
          email: "you@example.com",
          firstName: "Saajan",
          lastName: "Sangha",
          createdAt: now,
          updatedAt: now,
        });
        userIds.push(realUserId);
        counts.users++;
      }

      const existingProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", realUserId!))
        .unique();

      if (!existingProfile) {
        await ctx.db.insert("profiles", {
          userId: realUserId,
          headline: "Full Stack Developer",
          summary: "Versatile full-stack developer with 5 years of experience building production web applications. Specialized in React, Next.js, and TypeScript with a strong foundation in backend systems and cloud infrastructure.",
          bio: "Passionate builder shipping modern web applications with React, Next.js, and TypeScript. Always exploring new tech and pushing the boundaries of what's possible on the web.",
          location: "San Francisco, CA",
          phone: "+1 (415) 555-0192",
          website: "https://saajan.dev",
          linkedinUrl: "https://linkedin.com/in/saajansangha",
          githubUrl: "https://github.com/saajansangha",
          yearsExperience: 5,
          skills: ["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "Convex", "PostgreSQL", "Python", "AWS", "Docker"],
          openToWork: true,
          updatedAt: Date.now(),
        });
        counts.profiles++;
      }

      const now = Date.now();

      const existingExperiences = await ctx.db
        .query("experiences")
        .withIndex("by_userId", (q) => q.eq("userId", realUserId!))
        .collect();

      if (existingExperiences.length === 0) {
        const realExperiences = [
          { title: "Senior Frontend Engineer", company: "Apex Technologies", location: "San Francisco, CA", startDate: "2023-03", isCurrent: true, description: "<p>Leading frontend architecture for the core product platform. Built a design system from scratch serving 12 engineering teams. Reduced bundle size by 40% through code splitting and lazy loading strategies.</p><ul><li>Architected React component library with 60+ components</li><li>Mentored 4 junior engineers through code reviews and pair programming</li><li>Implemented real-time collaboration features using WebSockets</li></ul>" },
          { title: "Full Stack Developer", company: "NovaPay Financial", location: "New York, NY", startDate: "2021-06", endDate: "2023-02", isCurrent: false, description: "<p>Built and maintained payment processing APIs handling $2M+ daily transaction volume. Worked across the stack with React, Node.js, and PostgreSQL.</p><ul><li>Designed and implemented RESTful APIs for merchant onboarding</li><li>Reduced API response times by 60% through query optimization</li><li>Led migration from monolith to microservices architecture</li></ul>" },
          { title: "Junior Developer", company: "BluePrint Labs", location: "Portland, OR", startDate: "2020-01", endDate: "2021-05", isCurrent: false, description: "<p>Started career building developer tools and internal dashboards. Gained deep experience in React, TypeScript, and CI/CD pipelines.</p><ul><li>Built internal analytics dashboard used by 50+ team members</li><li>Contributed to open-source CLI tooling</li><li>Wrote comprehensive test suites achieving 90%+ coverage</li></ul>" },
        ];

        for (let i = 0; i < realExperiences.length; i++) {
          const exp = realExperiences[i];
          await ctx.db.insert("experiences", {
            userId: realUserId,
            title: exp.title,
            company: exp.company,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            isCurrent: exp.isCurrent,
            description: exp.description,
            order: i,
            createdAt: now,
            updatedAt: now,
          });
          counts.experiences++;
        }
      }

      const existingEducation = await ctx.db
        .query("education")
        .withIndex("by_userId", (q) => q.eq("userId", realUserId!))
        .collect();

      if (existingEducation.length === 0) {
        const realEducation = [
          { school: "University of California, Berkeley", degree: "Bachelor of Science", fieldOfStudy: "Computer Science", startDate: "2016-08", endDate: "2020-05", description: "Focused on distributed systems and machine learning. Dean's List 2018-2020." },
          { school: "Hack Reactor", degree: "Certificate", fieldOfStudy: "Advanced Software Engineering", startDate: "2019-06", endDate: "2019-09", description: "Intensive software engineering immersive program." },
        ];

        for (let i = 0; i < realEducation.length; i++) {
          const edu = realEducation[i];
          await ctx.db.insert("education", {
            userId: realUserId,
            school: edu.school,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate,
            endDate: edu.endDate,
            description: edu.description,
            order: i,
            createdAt: now,
            updatedAt: now,
          });
          counts.education++;
        }
      }

      const existingCerts = await ctx.db
        .query("certifications")
        .withIndex("by_userId", (q) => q.eq("userId", realUserId!))
        .collect();

      if (existingCerts.length === 0) {
        const realCerts = [
          { name: "AWS Certified Solutions Architect – Associate", issuingOrg: "Amazon Web Services", issueDate: "2023-04", expirationDate: "2026-04", credentialUrl: "https://aws.amazon.com/verification" },
          { name: "Meta Front-End Developer Professional Certificate", issuingOrg: "Meta (Coursera)", issueDate: "2022-11", credentialUrl: "https://coursera.org/verify" },
        ];

        for (const cert of realCerts) {
          await ctx.db.insert("certifications", {
            userId: realUserId,
            name: cert.name,
            issuingOrg: cert.issuingOrg,
            issueDate: cert.issueDate,
            expirationDate: cert.expirationDate,
            credentialUrl: cert.credentialUrl,
            createdAt: now,
            updatedAt: now,
          });
          counts.certifications++;
        }
      }
    }

    // ------ Seed users ------

    for (let i = 0; i < userCount; i++) {
      let first: string;
      let last: string;
      let key: string;

      do {
        first = randomItem(FIRST_NAMES);
        last = randomItem(LAST_NAMES);
        key = `${first}-${last}`;
      } while (usedNames.has(key));
      usedNames.add(key);

      const now = daysAgo(randomBetween(1, 120));
      const userId = await ctx.db.insert("users", {
        clerkUserId: `seed_user_${i}_${first.toLowerCase()}${last.toLowerCase()}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        firstName: first,
        lastName: last,
        imageUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${first}${last}`,
        createdAt: now,
        updatedAt: now,
      });
      userIds.push(userId);
      counts.users++;
    }

    // ------ Profiles, Experiences, Education, Certifications (seed users) ------

    for (const userId of userIds) {
      if (userId === realUserId) continue;

      const userDoc = await ctx.db.get(userId);
      const first = userDoc?.firstName?.toLowerCase() ?? "user";
      const last = userDoc?.lastName?.toLowerCase() ?? "name";
      const skills = randomItems(SKILLS, randomBetween(3, 8));

      await ctx.db.insert("profiles", {
        userId,
        headline: randomItem(HEADLINES),
        summary: randomItem(SUMMARIES),
        bio: randomItem(BIOS),
        location: randomItem(LOCATIONS),
        phone: Math.random() < 0.6 ? `+1 (${randomBetween(200, 999)}) ${randomBetween(100, 999)}-${randomBetween(1000, 9999)}` : undefined,
        website: Math.random() < 0.4 ? `https://${first}${last}.dev` : undefined,
        linkedinUrl: Math.random() < 0.7 ? `https://linkedin.com/in/${first}-${last}` : undefined,
        githubUrl: Math.random() < 0.5 ? `https://github.com/${first}${last}` : undefined,
        yearsExperience: randomBetween(0, 15),
        skills,
        openToWork: Math.random() < 0.6,
        updatedAt: Date.now(),
      });
      counts.profiles++;

      const expCount = randomBetween(1, 4);
      let year = 2025;
      for (let e = 0; e < expCount; e++) {
        const duration = randomBetween(1, 4);
        const endYear = year;
        const startYear = endYear - duration;
        const isCurrent = e === 0;
        await ctx.db.insert("experiences", {
          userId,
          title: randomItem(SEED_EXPERIENCE_TITLES),
          company: randomItem(SEED_COMPANIES_NAMES),
          location: randomItem(LOCATIONS),
          startDate: `${startYear}-${String(randomBetween(1, 12)).padStart(2, "0")}`,
          endDate: isCurrent ? undefined : `${endYear}-${String(randomBetween(1, 12)).padStart(2, "0")}`,
          isCurrent,
          description: `<p>Contributed to core product development and cross-functional initiatives.</p>`,
          order: e,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        counts.experiences++;
        year = startYear - 1;
      }

      if (Math.random() < 0.85) {
        const eduCount = randomBetween(1, 2);
        for (let e = 0; e < eduCount; e++) {
          await ctx.db.insert("education", {
            userId,
            school: randomItem(SCHOOLS),
            degree: randomItem(DEGREES),
            fieldOfStudy: randomItem(FIELDS_OF_STUDY),
            startDate: `${randomBetween(2010, 2018)}-09`,
            endDate: `${randomBetween(2014, 2022)}-05`,
            order: e,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          counts.education++;
        }
      }

      if (Math.random() < 0.4) {
        const certCount = randomBetween(1, 2);
        const certs = randomItems(CERT_NAMES, certCount);
        for (const cert of certs) {
          await ctx.db.insert("certifications", {
            userId,
            name: cert.name,
            issuingOrg: cert.org,
            issueDate: `${randomBetween(2020, 2025)}-${String(randomBetween(1, 12)).padStart(2, "0")}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          counts.certifications++;
        }
      }
    }

    // ------ Companies & Members ------

    const companyIds: Id<"companies">[] = [];
    const companyAdminMap = new Map<Id<"companies">, Id<"users">>();
    const companyRecruiterMap = new Map<Id<"companies">, Id<"users">[]>();

    for (let i = 0; i < COMPANIES.length; i++) {
      const companyData = COMPANIES[i];
      const adminUser = userIds[i % userIds.length];
      const now = daysAgo(randomBetween(30, 180));
      const clerkOrgId = `seed_org_${i}_${companyData.slug}`;

      const companyId = await ctx.db.insert("companies", {
        clerkOrgId,
        name: companyData.name,
        slug: companyData.slug,
        website: companyData.website,
        description: companyData.description,
        location: companyData.location,
        createdByUserId: adminUser,
        createdAt: now,
        updatedAt: now,
      });
      companyIds.push(companyId);
      companyAdminMap.set(companyId, adminUser);
      counts.companies++;

      const adminUserDoc = await ctx.db.get(adminUser);
      await ctx.db.insert("companyMembers", {
        companyId,
        userId: adminUser,
        clerkOrgId,
        clerkUserId: adminUserDoc!.clerkUserId,
        role: "admin",
        status: "active",
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      counts.companyMembers++;

      const recruiterCount = randomBetween(1, 3);
      const recruiterIds: Id<"users">[] = [];
      for (let r = 0; r < recruiterCount; r++) {
        const recruiterId = userIds[(i * 3 + r + COMPANIES.length) % userIds.length];
        if (recruiterId === adminUser) continue;

        const recruiterDoc = await ctx.db.get(recruiterId);
        await ctx.db.insert("companyMembers", {
          companyId,
          userId: recruiterId,
          clerkOrgId,
          clerkUserId: recruiterDoc!.clerkUserId,
          role: "recruiter",
          status: "active",
          joinedAt: daysAgo(randomBetween(10, 90)),
          createdAt: now,
          updatedAt: now,
        });
        recruiterIds.push(recruiterId);
        counts.companyMembers++;
      }
      companyRecruiterMap.set(companyId, recruiterIds);
    }

    // ------ Job Listings ------

    const jobIds: Array<{ jobId: Id<"jobListings">; companyId: Id<"companies"> }> = [];

    for (const companyId of companyIds) {
      const company = await ctx.db.get(companyId);
      if (!company) continue;

      const admin = companyAdminMap.get(companyId)!;
      const recruiters = companyRecruiterMap.get(companyId) ?? [];
      const posters = [admin, ...recruiters];
      const numJobs = jobsPerCompany + randomBetween(-2, 3);

      for (let j = 0; j < Math.max(1, numJobs); j++) {
        const template = randomItem(JOB_TEMPLATES);
        const employmentType = randomItem(EMPLOYMENT_TYPES);
        const workplaceType = randomItem(WORKPLACE_TYPES);
        const location = workplaceType === "remote" ? "Remote" : randomItem(LOCATIONS);
        const description = template.descriptionTemplate.replace(/{company}/g, company.name);
        const tags = template.tags;
        const isActive = Math.random() < 0.85;
        const createdAt = daysAgo(randomBetween(1, 90));
        const salaryMin = Math.round((template.salaryRange[0] + randomBetween(-2, 4) * 5000) / 5000) * 5000;
        const salaryMax = Math.round((template.salaryRange[1] + randomBetween(-2, 4) * 5000) / 5000) * 5000;

        const jobId = await ctx.db.insert("jobListings", {
          companyId,
          companyName: company.name,
          title: template.title,
          description,
          location,
          employmentType,
          workplaceType,
          salaryMin,
          salaryMax,
          salaryCurrency: "USD",
          tags,
          searchText: buildSearchText({
            title: template.title,
            description,
            location,
            companyName: company.name,
            tags,
          }),
          isActive,
          featured: Math.random() < 0.15,
          autoCloseOnAccept: Math.random() < 0.3,
          applicationCount: 0,
          postedByUserId: randomItem(posters),
          createdAt,
          updatedAt: createdAt,
          closedAt: isActive ? undefined : daysAgo(randomBetween(0, 30)),
        });

        jobIds.push({ jobId, companyId });
        counts.jobListings++;
      }
    }

    // ------ Applications ------

    const applicantUserIds = userIds.filter(
      (uid) => !Array.from(companyAdminMap.values()).includes(uid),
    );

    const applicationMap = new Map<string, Id<"applications">>();

    for (const { jobId, companyId } of jobIds) {
      const numApplicants = randomBetween(2, 12);
      const applicants = randomItems(applicantUserIds, Math.min(numApplicants, applicantUserIds.length));
      let appCount = 0;

      for (const applicantUserId of applicants) {
        const uniqueKey = `${jobId}_${applicantUserId}`;
        if (applicationMap.has(uniqueKey)) continue;

        const status = randomItem(APPLICATION_STATUSES);
        const createdAt = daysAgo(randomBetween(0, 60));
        const isDecided = status === "accepted" || status === "rejected";

        const admin = companyAdminMap.get(companyId)!;
        const recruiters = companyRecruiterMap.get(companyId) ?? [];
        const deciders = [admin, ...recruiters];

        const applicationId = await ctx.db.insert("applications", {
          jobId,
          companyId,
          applicantUserId,
          status,
          coverLetter: randomItem(COVER_LETTERS),
          decidedByUserId: isDecided ? randomItem(deciders) : undefined,
          decidedAt: isDecided ? daysAgo(randomBetween(0, 30)) : undefined,
          createdAt,
          updatedAt: createdAt,
        });

        applicationMap.set(uniqueKey, applicationId);
        appCount++;
        counts.applications++;
      }

      await ctx.db.patch(jobId, { applicationCount: appCount });
    }

    // ------ Real user: guaranteed applications ------

    if (realUserId) {
      const realUserStatuses: ApplicationStatus[] = [
        "submitted", "submitted", "submitted",
        "in_review", "in_review",
        "accepted",
        "rejected",
        "withdrawn",
      ];
      const realUserJobs = randomItems(jobIds, Math.min(realUserStatuses.length, jobIds.length));

      for (let i = 0; i < realUserJobs.length; i++) {
        const { jobId, companyId } = realUserJobs[i];
        const uniqueKey = `${jobId}_${realUserId}`;
        if (applicationMap.has(uniqueKey)) continue;

        const status = realUserStatuses[i];
        const createdAt = daysAgo(randomBetween(1, 45));
        const isDecided = status === "accepted" || status === "rejected";

        const admin = companyAdminMap.get(companyId)!;
        const recruiters = companyRecruiterMap.get(companyId) ?? [];
        const deciders = [admin, ...recruiters];

        const applicationId = await ctx.db.insert("applications", {
          jobId,
          companyId,
          applicantUserId: realUserId,
          status,
          coverLetter: status === "withdrawn" ? undefined : randomItem(COVER_LETTERS.filter(Boolean) as string[]),
          decidedByUserId: isDecided ? randomItem(deciders) : undefined,
          decidedAt: isDecided ? daysAgo(randomBetween(0, 20)) : undefined,
          createdAt,
          updatedAt: isDecided ? daysAgo(randomBetween(0, 10)) : createdAt,
        });

        applicationMap.set(uniqueKey, applicationId);

        const job = await ctx.db.get(jobId);
        await ctx.db.patch(jobId, {
          applicationCount: (job?.applicationCount ?? 0) + 1,
        });

        counts.applications++;
      }
    }

    // ------ Favorites ------

    const favoritePairs = new Set<string>();
    const numFavorites = Math.floor(userIds.length * 2.5);

    for (let i = 0; i < numFavorites; i++) {
      const userId = randomItem(applicantUserIds);
      const { jobId } = randomItem(jobIds);
      const key = `${userId}_${jobId}`;
      if (favoritePairs.has(key)) continue;
      favoritePairs.add(key);

      await ctx.db.insert("favorites", {
        userId,
        jobId,
        createdAt: daysAgo(randomBetween(0, 60)),
      });
      counts.favorites++;
    }

    // ------ Real user: guaranteed favorites ------

    if (realUserId) {
      const realFavJobs = randomItems(jobIds, Math.min(8, jobIds.length));
      for (const { jobId } of realFavJobs) {
        const key = `${realUserId}_${jobId}`;
        if (favoritePairs.has(key)) continue;
        favoritePairs.add(key);

        await ctx.db.insert("favorites", {
          userId: realUserId,
          jobId,
          createdAt: daysAgo(randomBetween(0, 30)),
        });
        counts.favorites++;
      }
    }

    // ------ Notifications ------

    for (const [_key, applicationId] of applicationMap) {
      if (Math.random() > 0.5) continue;

      const application = await ctx.db.get(applicationId);
      if (!application) continue;

      const job = await ctx.db.get(application.jobId);
      const jobTitle = job?.title ?? "a position";

      if (application.status === "accepted" || application.status === "rejected" || application.status === "in_review") {
        await ctx.db.insert("notifications", {
          userId: application.applicantUserId,
          type: "application_status",
          title: `Application ${application.status.replace("_", " ")}`,
          message: `Your application for ${jobTitle} is now ${application.status.replace("_", " ")}.`,
          metadata: {
            applicationId: application._id,
            jobId: application.jobId,
            status: application.status,
          },
          isRead: Math.random() < 0.4,
          readAt: Math.random() < 0.4 ? daysAgo(randomBetween(0, 10)) : undefined,
          createdAt: daysAgo(randomBetween(0, 30)),
        });
        counts.notifications++;
      }

      const admin = companyAdminMap.get(application.companyId);
      if (admin && Math.random() < 0.6) {
        await ctx.db.insert("notifications", {
          userId: admin,
          type: "application_received",
          title: "New application received",
          message: `A new application was submitted for ${jobTitle}.`,
          metadata: {
            applicationId: application._id,
            jobId: application.jobId,
          },
          isRead: Math.random() < 0.5,
          readAt: Math.random() < 0.5 ? daysAgo(randomBetween(0, 10)) : undefined,
          createdAt: daysAgo(randomBetween(0, 30)),
        });
        counts.notifications++;
      }
    }

    // ------ Real user: guaranteed notifications ------

    if (realUserId) {
      await ctx.db.insert("notifications", {
        userId: realUserId,
        type: "system",
        title: "Welcome to the platform!",
        message: "Get started by completing your profile and browsing available jobs.",
        isRead: true,
        readAt: daysAgo(25),
        createdAt: daysAgo(30),
      });
      await ctx.db.insert("notifications", {
        userId: realUserId,
        type: "system",
        title: "Profile tip",
        message: "Add your skills and experience to get better job recommendations.",
        isRead: false,
        createdAt: daysAgo(5),
      });
      await ctx.db.insert("notifications", {
        userId: realUserId,
        type: "system",
        title: "New feature: Saved searches",
        message: "You can now save your search filters and get notified when new matching jobs are posted.",
        isRead: false,
        createdAt: daysAgo(1),
      });
      counts.notifications += 3;
    }

    // ------ System notifications (other users) ------

    const systemMessages = [
      { title: "Welcome to the platform!", message: "Get started by completing your profile and browsing available jobs." },
      { title: "Profile tip", message: "Add your skills and experience to get better job recommendations." },
      { title: "New feature: Saved searches", message: "You can now save your search filters and get notified when new matching jobs are posted." },
    ];

    for (const userId of randomItems(userIds, Math.min(15, userIds.length))) {
      if (userId === realUserId) continue;
      const msg = randomItem(systemMessages);
      await ctx.db.insert("notifications", {
        userId,
        type: "system",
        title: msg.title,
        message: msg.message,
        isRead: Math.random() < 0.3,
        readAt: Math.random() < 0.3 ? daysAgo(randomBetween(0, 5)) : undefined,
        createdAt: daysAgo(randomBetween(0, 60)),
      });
      counts.notifications++;
    }

    return counts;
  },
});

export const seedOrgApplications = internalMutation({
  args: {
    clerkOrgId: v.string(),
    jobCount: v.optional(v.number()),
    applicationCount: v.optional(v.number()),
  },
  returns: v.object({
    users: v.number(),
    profiles: v.number(),
    jobListings: v.number(),
    applications: v.number(),
    notifications: v.number(),
  }),
  handler: async (ctx, args) => {
    const count = args.applicationCount ?? 50;
    const jobsToCreate = args.jobCount ?? 8;

    const counts = { users: 0, profiles: 0, jobListings: 0, applications: 0, notifications: 0 };

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();

    if (!company) {
      throw new Error(`No company found for clerkOrgId "${args.clerkOrgId}"`);
    }

    const members = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
      .collect();

    const deciderUserIds = members
      .filter((m) => m.role === "admin" || m.role === "recruiter")
      .map((m) => m.userId);

    const posterIds = deciderUserIds.length > 0
      ? deciderUserIds
      : members.map((m) => m.userId);

    // ------ Create job listings for the org ------

    const existingJobs = await ctx.db
      .query("jobListings")
      .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
      .collect();

    const jobs = [...existingJobs];
    const newJobCount = Math.max(0, jobsToCreate - existingJobs.length);

    for (let j = 0; j < newJobCount; j++) {
      const template = JOB_TEMPLATES[j % JOB_TEMPLATES.length];
      const employmentType = randomItem(EMPLOYMENT_TYPES);
      const workplaceType = randomItem(WORKPLACE_TYPES);
      const location = workplaceType === "remote" ? "Remote" : (company.location ?? randomItem(LOCATIONS));
      const description = template.descriptionTemplate.replace(/{company}/g, company.name);
      const tags = template.tags;
      const createdAt = daysAgo(randomBetween(1, 90));
      const salaryMin = Math.round((template.salaryRange[0] + randomBetween(-2, 4) * 5000) / 5000) * 5000;
      const salaryMax = Math.round((template.salaryRange[1] + randomBetween(-2, 4) * 5000) / 5000) * 5000;

      const jobId = await ctx.db.insert("jobListings", {
        companyId: company._id,
        companyName: company.name,
        title: template.title,
        description,
        location,
        employmentType,
        workplaceType,
        salaryMin,
        salaryMax,
        salaryCurrency: "USD",
        tags,
        searchText: buildSearchText({
          title: template.title,
          description,
          location,
          companyName: company.name,
          tags,
        }),
        isActive: true,
        featured: Math.random() < 0.15,
        autoCloseOnAccept: Math.random() < 0.3,
        applicationCount: 0,
        postedByUserId: randomItem(posterIds.length > 0 ? posterIds : deciderUserIds),
        createdAt,
        updatedAt: createdAt,
      });

      const newJob = await ctx.db.get(jobId);
      if (newJob) jobs.push(newJob);
      counts.jobListings++;
    }

    if (jobs.length === 0) {
      throw new Error(`No job listings could be created for company "${company.name}" — no members to assign as poster.`);
    }

    // ------ Create applicant users ------

    const applicantIds: Id<"users">[] = [];
    const usedNames = new Set<string>();
    const numApplicants = Math.min(count, FIRST_NAMES.length * LAST_NAMES.length);

    for (let i = 0; i < numApplicants; i++) {
      let first: string;
      let last: string;
      let key: string;

      do {
        first = randomItem(FIRST_NAMES);
        last = randomItem(LAST_NAMES);
        key = `${first}-${last}`;
      } while (usedNames.has(key));
      usedNames.add(key);

      const seedClerkId = `seed_orgapp_${company._id}_${i}_${first.toLowerCase()}${last.toLowerCase()}`;

      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", seedClerkId))
        .unique();

      let userId: Id<"users">;
      if (existing) {
        userId = existing._id;
      } else {
        const now = daysAgo(randomBetween(5, 180));
        userId = await ctx.db.insert("users", {
          clerkUserId: seedClerkId,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
          firstName: first,
          lastName: last,
          imageUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${first}${last}`,
          createdAt: now,
          updatedAt: now,
        });
        counts.users++;

        const skills = randomItems(SKILLS, randomBetween(3, 8));
        await ctx.db.insert("profiles", {
          userId,
          headline: randomItem(HEADLINES),
          summary: randomItem(SUMMARIES),
          bio: randomItem(BIOS),
          location: randomItem(LOCATIONS),
          phone: Math.random() < 0.6
            ? `+1 (${randomBetween(200, 999)}) ${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`
            : undefined,
          website: Math.random() < 0.4 ? `https://${first.toLowerCase()}${last.toLowerCase()}.dev` : undefined,
          linkedinUrl: Math.random() < 0.7 ? `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}` : undefined,
          githubUrl: Math.random() < 0.5 ? `https://github.com/${first.toLowerCase()}${last.toLowerCase()}` : undefined,
          yearsExperience: randomBetween(0, 15),
          skills,
          openToWork: Math.random() < 0.6,
          updatedAt: Date.now(),
        });
        counts.profiles++;

        const expCount = randomBetween(1, 3);
        let year = 2025;
        for (let e = 0; e < expCount; e++) {
          const duration = randomBetween(1, 4);
          const endYear = year;
          const startYear = endYear - duration;
          const isCurrent = e === 0;
          await ctx.db.insert("experiences", {
            userId,
            title: randomItem(SEED_EXPERIENCE_TITLES),
            company: randomItem(SEED_COMPANIES_NAMES),
            location: randomItem(LOCATIONS),
            startDate: `${startYear}-${String(randomBetween(1, 12)).padStart(2, "0")}`,
            endDate: isCurrent ? undefined : `${endYear}-${String(randomBetween(1, 12)).padStart(2, "0")}`,
            isCurrent,
            description: `<p>Contributed to core product development and cross-functional initiatives.</p>`,
            order: e,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          year = startYear - 1;
        }

        if (Math.random() < 0.85) {
          await ctx.db.insert("education", {
            userId,
            school: randomItem(SCHOOLS),
            degree: randomItem(DEGREES),
            fieldOfStudy: randomItem(FIELDS_OF_STUDY),
            startDate: `${randomBetween(2010, 2018)}-09`,
            endDate: `${randomBetween(2014, 2022)}-05`,
            order: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      applicantIds.push(userId);
    }

    const applicationSet = new Set<string>();
    const jobAppCounts = new Map<string, number>();

    for (let i = 0; i < count; i++) {
      const applicantUserId = applicantIds[i % applicantIds.length];
      let targetJob = randomItem(jobs);
      let uniqueKey = `${targetJob._id}_${applicantUserId}`;

      if (applicationSet.has(uniqueKey)) {
        const altJob = jobs.find((j) => !applicationSet.has(`${j._id}_${applicantUserId}`));
        if (!altJob) continue;
        targetJob = altJob;
        uniqueKey = `${altJob._id}_${applicantUserId}`;
      }

      applicationSet.add(uniqueKey);

      const status = randomItem(APPLICATION_STATUSES);
      const createdAt = daysAgo(randomBetween(0, 60));
      const isDecided = status === "accepted" || status === "rejected";
      const deciderId = deciderUserIds.length > 0 ? randomItem(deciderUserIds) : undefined;

      const appId = await ctx.db.insert("applications", {
        jobId: targetJob._id,
        companyId: company._id,
        applicantUserId,
        status,
        coverLetter: randomItem(COVER_LETTERS),
        decidedByUserId: isDecided ? deciderId : undefined,
        decidedAt: isDecided ? daysAgo(randomBetween(0, 30)) : undefined,
        createdAt,
        updatedAt: isDecided ? daysAgo(randomBetween(0, 10)) : createdAt,
      });

      jobAppCounts.set(targetJob._id, (jobAppCounts.get(targetJob._id) ?? 0) + 1);
      counts.applications++;

      if (isDecided || status === "in_review") {
        await ctx.db.insert("notifications", {
          userId: applicantUserId,
          type: "application_status",
          title: `Application ${status.replace("_", " ")}`,
          message: `Your application for ${targetJob.title} is now ${status.replace("_", " ")}.`,
          metadata: { applicationId: appId, jobId: targetJob._id, status },
          isRead: Math.random() < 0.4,
          readAt: Math.random() < 0.4 ? daysAgo(randomBetween(0, 10)) : undefined,
          createdAt: daysAgo(randomBetween(0, 30)),
        });
        counts.notifications++;
      }
    }

    for (const [jobId, newApps] of jobAppCounts) {
      const currentJob = await ctx.db.get(jobId as Id<"jobListings">);
      if (currentJob) {
        await ctx.db.patch(currentJob._id, {
          applicationCount: currentJob.applicationCount + newApps,
        });
      }
    }

    return counts;
  },
});

export const clearSeedData = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const realUserIds = new Set<string>();
    const realCompanyIds = new Set<string>();

    const allUsers = await ctx.db.query("users").collect();
    for (const user of allUsers) {
      if (!user.clerkUserId.startsWith("seed_user_")) {
        realUserIds.add(user._id);
      }
    }

    const allCompanies = await ctx.db.query("companies").collect();
    for (const company of allCompanies) {
      if (!company.clerkOrgId.startsWith("seed_org_")) {
        realCompanyIds.add(company._id);
      }
    }

    const tablesWithOwnership = [
      "notifications", "favorites", "certifications", "education", "experiences", "profiles",
    ] as const;
    for (const table of tablesWithOwnership) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) {
        if (!realUserIds.has((row as Record<string, unknown>).userId as string)) {
          await ctx.db.delete(row._id);
        }
      }
    }

    const applications = await ctx.db.query("applications").collect();
    for (const app of applications) {
      if (!realUserIds.has(app.applicantUserId)) {
        await ctx.db.delete(app._id);
      }
    }

    const jobs = await ctx.db.query("jobListings").collect();
    for (const job of jobs) {
      if (!realCompanyIds.has(job.companyId)) {
        await ctx.db.delete(job._id);
      }
    }

    const members = await ctx.db.query("companyMembers").collect();
    for (const member of members) {
      if (!realCompanyIds.has(member.companyId) || !realUserIds.has(member.userId)) {
        await ctx.db.delete(member._id);
      }
    }

    const seedCompanies = allCompanies.filter((c) => c.clerkOrgId.startsWith("seed_org_"));
    for (const company of seedCompanies) {
      await ctx.db.delete(company._id);
    }

    const seedUsers = allUsers.filter((u) => u.clerkUserId.startsWith("seed_user_"));
    for (const user of seedUsers) {
      await ctx.db.delete(user._id);
    }

    return null;
  },
});

export const fixIncompatibleResumes = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const resumes = await ctx.db.query("resumes").collect();
    let deleted = 0;
    for (const resume of resumes) {
      const r = resume as Record<string, unknown>;
      if (!r.storageId || r.fileSize === undefined) {
        await ctx.db.delete(resume._id);
        deleted++;
      }
    }
    return deleted;
  },
});

export const recalculateApplicationCounts = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const allJobs = await ctx.db.query("jobListings").collect();
    let fixed = 0;

    for (const job of allJobs) {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_jobId_createdAt", (q) => q.eq("jobId", job._id))
        .collect();

      const realCount = apps.filter((a) => a.status !== "withdrawn").length;
      if (job.applicationCount !== realCount) {
        await ctx.db.patch(job._id, { applicationCount: realCount });
        fixed++;
      }
    }

    return fixed;
  },
});

export const resyncClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.optional(v.string()),
    orgName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("recruiter"), v.literal("member"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.sync.upsertUserFromWebhook, {
      clerkUserId: args.clerkUserId,
    });

    if (args.clerkOrgId) {
      await ctx.runMutation(internal.sync.upsertOrganizationFromWebhook, {
        clerkOrgId: args.clerkOrgId,
        name: args.orgName ?? "My Organization",
      });

      await ctx.runMutation(internal.sync.upsertOrganizationMembershipFromWebhook, {
        clerkOrgId: args.clerkOrgId,
        clerkUserId: args.clerkUserId,
        role: args.role ?? "admin",
        status: "active",
      });
    }

    return null;
  },
});
