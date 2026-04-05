import { NextRequest, NextResponse } from "next/server";

const SKILL_KEYWORDS = [
  // Languages
  "JavaScript","TypeScript","Python","Java","C#","C++","Golang","Rust","Swift","Kotlin","PHP","Ruby","Scala",
  // Frontend
  "React","Next.js","Vue","Angular","Svelte","HTML","CSS","Tailwind","Redux","GraphQL","REST",
  // Backend
  "Node.js","Express","FastAPI","Django","Spring","Laravel","Rails","NestJS","Prisma",
  // Cloud & DevOps
  "AWS","Azure","GCP","Docker","Kubernetes","Terraform","CI/CD","Jenkins","GitHub Actions","Linux",
  // Databases
  "PostgreSQL","MySQL","MongoDB","Redis","DynamoDB","Elasticsearch","Cassandra","SQLite","Firebase","Supabase",
  // AI/ML
  "Machine Learning","Deep Learning","TensorFlow","PyTorch","OpenAI","LLM","NLP","Data Science","Pandas","NumPy",
  // Mobile
  "React Native","Flutter","iOS","Android","Expo",
  // Tools
  "Git","Jira","Figma","Postman","Webpack","Vite","Jest","Cypress",
  // Soft/Domain
  "Agile","Scrum","Product Management","Leadership","Architecture","Microservices","System Design","API Design",
];

// Order matters — more specific entries must come before generic ones (e.g. "quality" before "engineer")
const ROLE_TO_TITLES: [string, string[]][] = [
  // QA / Quality Engineering
  ["quality engineer",    ["Quality Engineer", "Senior Quality Engineer", "Principal Quality Engineer", "Quality Engineering Lead", "QA Architect"]],
  ["quality engineering", ["Quality Engineer", "Senior Quality Engineer", "Principal Quality Engineer", "Quality Engineering Lead", "Head of Quality Engineering"]],
  ["quality architect",   ["QA Architect", "Principal Quality Engineer", "Head of Quality Engineering", "Director of Quality Assurance", "VP Quality Engineering"]],
  ["quality assurance",   ["QA Engineer", "Senior QA Engineer", "QA Lead", "QA Manager", "Director of Quality Assurance"]],
  ["quality manager",     ["QA Manager", "Quality Engineering Manager", "Director of Quality Assurance", "Head of Quality", "VP Quality"]],
  ["quality lead",        ["QA Lead", "Quality Engineering Lead", "Principal Quality Engineer", "Head of Quality", "Director of Quality Assurance"]],
  ["quality",             ["Quality Engineer", "Senior Quality Engineer", "QA Lead", "QA Manager", "Head of Quality Engineering"]],
  ["test automation",     ["Test Automation Engineer", "Senior Test Automation Engineer", "Automation Architect", "QA Automation Lead", "Principal Test Engineer"]],
  ["test lead",           ["Test Lead", "QA Lead", "Test Manager", "Principal Test Engineer", "Director of Testing"]],
  ["test manager",        ["Test Manager", "QA Manager", "Head of Testing", "Director of Quality Assurance", "VP Engineering Quality"]],
  ["sre",                 ["Site Reliability Engineer", "SRE", "Platform Engineer", "DevOps Engineer", "Infrastructure Engineer"]],
  ["devops",              ["DevOps Engineer", "SRE", "Platform Engineer", "Cloud Engineer", "Infrastructure Engineer"]],
  ["data scientist",      ["Data Scientist", "Senior Data Scientist", "ML Engineer", "Head of Data Science", "Principal Data Scientist"]],
  ["data engineer",       ["Data Engineer", "Senior Data Engineer", "Data Platform Engineer", "Head of Data Engineering", "Principal Data Engineer"]],
  ["ml engineer",         ["ML Engineer", "Machine Learning Engineer", "Senior ML Engineer", "AI Engineer", "Head of ML"]],
  ["software architect",  ["Software Architect", "Principal Architect", "Chief Architect", "VP Engineering", "CTO"]],
  ["principal engineer",  ["Principal Engineer", "Staff Engineer", "Distinguished Engineer", "Engineering Director", "VP Engineering"]],
  ["staff engineer",      ["Staff Engineer", "Principal Engineer", "Distinguished Engineer", "Engineering Director", "VP Engineering"]],
  ["engineering manager", ["Engineering Manager", "Senior Engineering Manager", "Director of Engineering", "VP Engineering", "Head of Engineering"]],
  ["product manager",     ["Product Manager", "Senior Product Manager", "Director of Product", "VP of Product", "Chief Product Officer"]],
  ["frontend",            ["Frontend Engineer", "Senior Frontend Engineer", "UI Engineer", "Frontend Tech Lead", "Head of Frontend"]],
  ["backend",             ["Backend Engineer", "Senior Backend Engineer", "API Engineer", "Backend Tech Lead", "Head of Backend"]],
  ["full stack",          ["Full Stack Engineer", "Senior Full Stack Engineer", "Full Stack Developer", "Tech Lead", "Engineering Manager"]],
  ["mobile",              ["Mobile Engineer", "iOS Engineer", "Android Engineer", "Senior Mobile Engineer", "Mobile Tech Lead"]],
  ["cloud",               ["Cloud Engineer", "Cloud Architect", "Platform Engineer", "Senior Cloud Engineer", "Head of Cloud"]],
  ["security",            ["Security Engineer", "Application Security Engineer", "Security Architect", "Head of Security", "CISO"]],
  ["data",                ["Data Scientist", "Senior Data Scientist", "ML Engineer", "Data Engineer", "Head of Data"]],
  ["architect",           ["Software Architect", "Principal Architect", "CTO", "VP Engineering", "Staff Engineer"]],
  ["director",            ["Director of Engineering", "VP Engineering", "Head of Engineering", "Engineering Director", "SVP Engineering"]],
  ["cto",                 ["CTO", "VP Engineering", "Head of Engineering", "Chief Architect", "Engineering Director"]],
  ["ceo",                 ["CEO", "Co-Founder", "President", "Managing Director", "General Manager"]],
  ["lead",                ["Tech Lead", "Engineering Manager", "Principal Engineer", "Staff Engineer", "Director of Engineering"]],
  ["manager",             ["Engineering Manager", "Senior Engineering Manager", "Director of Engineering", "VP Engineering", "Head of Engineering"]],
  ["developer",           ["Software Developer", "Full Stack Developer", "Senior Developer", "Tech Lead", "Engineering Manager"]],
  ["engineer",            ["Software Engineer", "Senior Software Engineer", "Tech Lead", "Engineering Manager", "Staff Engineer"]],
  ["designer",            ["UX Designer", "Product Designer", "Senior Designer", "Design Lead", "Head of Design"]],
  ["analyst",             ["Business Analyst", "Data Analyst", "Senior Analyst", "Product Analyst", "Principal Analyst"]],
  ["consultant",          ["Senior Consultant", "Principal Consultant", "Technical Consultant", "Solutions Architect", "Advisory Consultant"]],
];

function extractName(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // Name is usually in the first few lines, all caps or title case, 2-4 words
  for (const line of lines.slice(0, 8)) {
    if (/^[A-Z][a-z]+ ([A-Z][a-z]+ ?){1,2}$/.test(line) && line.length < 50) return line;
    if (/^[A-Z ]{4,40}$/.test(line) && line.split(" ").length >= 2) return line.split(" ").map((w: string) => w[0] + w.slice(1).toLowerCase()).join(" ");
  }
  // Merged text fallback — name is typically the first 2-3 words before an email/phone/link
  const mergedMatch = text.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+){1,2})\s+(?:[a-z0-9._%+-]+@|\+\d|https?:\/\/)/);
  if (mergedMatch) return mergedMatch[1];
  return null;
}

function extractYearsOfExperience(text: string): number | null {
  // Match patterns like "10 years", "10+ years", "10 years of experience"
  const patterns = [
    /(\d+)\+?\s+years?\s+of\s+(professional\s+)?experience/i,
    /experience\s+of\s+(\d+)\+?\s+years?/i,
    /(\d+)\+?\s+years?\s+experience/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }

  // Fallback: find earliest year in work history and calculate
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatches && yearMatches.length >= 2) {
    const years = yearMatches.map(Number);
    const earliest = Math.min(...years);
    const latest = Math.max(...years);
    const current = new Date().getFullYear();
    const calc = current - earliest;
    if (calc > 0 && calc < 50) return calc;
  }
  return null;
}

function extractCurrentRole(text: string): string | null {
  const titleWords = [
    "engineer", "developer", "architect", "scientist", "analyst", "manager",
    "designer", "consultant", "lead", "specialist", "officer", "director",
    "president", "head", "vp", "vice president", "cto", "ceo", "coo",
    "associate", "principal", "staff", "senior", "junior", "intern",
    "devops", "sre", "fullstack", "full stack", "frontend", "backend",
    "product", "program", "project", "data", "cloud", "platform", "mobile",
  ];

  const hasTitle = (s: string) => titleWords.some((w) => s.toLowerCase().includes(w));

  // Strategy 1: line-based (works when PDF preserves newlines)
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[\s,]+\d{4}\b|\b\d{4}\s*[-–]\s*(\d{4}|present|current)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nearDate = [lines[i - 1], lines[i], lines[i + 1], lines[i + 2]]
      .filter(Boolean)
      .some((l) => datePattern.test(l));
    if (!nearDate) continue;
    if (hasTitle(line) && line.length > 3 && line.length < 100) {
      const cleaned = line.split(/\s*[|•·@]\s*/)[0].trim();
      if (cleaned.length > 3) return cleaned;
    }
  }

  // Strategy 2: merged text — "Company | Location | Role | Date" pattern
  // Used when unpdf collapses all newlines into one blob
  const expStart = text.search(/WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY/i);
  const workText = expStart >= 0 ? text.slice(expStart) : text;

  // Match: X | Y | Role | Month YYYY or YYYY
  const pipePattern = /[A-Za-z][^|]{2,60}\s*\|\s*[^|]{2,60}\s*\|\s*([A-Za-z][^|]{4,70}?)\s*\|\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{4}|\d{4})/i;
  const pipeMatch = workText.match(pipePattern);
  if (pipeMatch) {
    const role = pipeMatch[1].trim();
    if (hasTitle(role) && role.length > 3 && role.length < 80) return role;
  }

  // Strategy 3: scan first 60 lines for short title lines (last resort)
  for (const line of lines.slice(0, 60)) {
    if (hasTitle(line) && line.length > 3 && line.length < 60) {
      const cleaned = line.split(/\s*[|•·@]\s*/)[0].trim();
      if (cleaned.length > 3) return cleaned;
    }
  }

  return null;
}

function extractSkills(text: string): string[] {
  const found = new Set<string>();
  for (const skill of SKILL_KEYWORDS) {
    // Escape special regex chars (for C#, C++, Node.js etc.)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\//g, "\\/");
    // Use word boundaries — \b works for alphanumeric edges
    const pattern = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, "i");
    if (pattern.test(text)) found.add(skill);
  }
  return Array.from(found);
}

function generateJobTitles(currentRole: string): string[] {
  if (!currentRole?.trim()) return [];
  const lower = currentRole.toLowerCase();
  for (const [keyword, titles] of ROLE_TO_TITLES) {
    if (lower.includes(keyword)) return titles;
  }
  return [currentRole];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File;
    const currentRole = formData.get("currentRole") as string ?? "";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = new Uint8Array(await file.arrayBuffer());
    const { extractText } = await import("unpdf");
    const { text } = await extractText(buffer, { mergePages: true });

    const skills = extractSkills(text);
    const extractedName = extractName(text);
    const extractedRole = extractCurrentRole(text);
    const extractedYears = extractYearsOfExperience(text);
    const roleToUse = extractedRole ?? currentRole;
    const preferredRoles = generateJobTitles(roleToUse);

    // Debug: first 60 non-empty lines so we can see the PDF structure
    const debugLines = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 60);

    return NextResponse.json({
      text,
      fileName: file.name,
      skills,
      preferredRoles,
      extractedName,
      extractedRole,
      extractedYears,
      debugLines,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}
