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

const ROLE_TO_TITLES: Record<string, string[]> = {
  "engineer": ["Software Engineer", "Senior Software Engineer", "Tech Lead", "Engineering Manager", "Staff Engineer"],
  "developer": ["Software Developer", "Full Stack Developer", "Senior Developer", "Tech Lead", "Engineering Manager"],
  "manager": ["Engineering Manager", "Senior Engineering Manager", "Director of Engineering", "VP Engineering"],
  "lead": ["Tech Lead", "Engineering Manager", "Principal Engineer", "Staff Engineer", "Director of Engineering"],
  "architect": ["Software Architect", "Principal Architect", "CTO", "VP Engineering", "Staff Engineer"],
  "product": ["Product Manager", "Senior Product Manager", "Director of Product", "VP of Product", "Chief Product Officer"],
  "data": ["Data Scientist", "Senior Data Scientist", "ML Engineer", "Data Engineer", "Head of Data"],
  "devops": ["DevOps Engineer", "SRE", "Platform Engineer", "Cloud Engineer", "Infrastructure Engineer"],
  "designer": ["UX Designer", "Product Designer", "Senior Designer", "Design Lead", "Head of Design"],
  "analyst": ["Business Analyst", "Data Analyst", "Senior Analyst", "Product Analyst"],
  "cto": ["CTO", "VP Engineering", "Head of Engineering", "Chief Architect"],
  "director": ["Director of Engineering", "VP Engineering", "Head of Engineering", "Engineering Director"],
};

function extractName(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // Name is usually in the first few lines, all caps or title case, 2-4 words
  for (const line of lines.slice(0, 8)) {
    if (/^[A-Z][a-z]+ ([A-Z][a-z]+ ?){1,2}$/.test(line) && line.length < 50) return line;
    if (/^[A-Z ]{4,40}$/.test(line) && line.split(" ").length >= 2) return line.split(" ").map((w: string) => w[0] + w.slice(1).toLowerCase()).join(" ");
  }
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
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Title keywords that indicate a job role line
  const titleWords = [
    "engineer", "developer", "architect", "scientist", "analyst", "manager",
    "designer", "consultant", "lead", "specialist", "officer", "director",
    "president", "head", "vp", "vice president", "cto", "ceo", "coo",
    "associate", "principal", "staff", "senior", "junior", "intern",
    "devops", "sre", "fullstack", "full stack", "frontend", "backend",
    "product", "program", "project", "data", "cloud", "platform", "mobile",
  ];

  // Date pattern — lines near dates are likely in the experience section
  const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[\s,]+\d{4}\b|\b\d{4}\s*[-–]\s*(\d{4}|present|current)\b/i;

  // Find lines that look like job titles near date lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Check if this line or adjacent lines have a date
    const nearDate = [lines[i - 1], lines[i], lines[i + 1], lines[i + 2]]
      .filter(Boolean)
      .some((l) => datePattern.test(l));

    if (!nearDate) continue;

    // Check if this line contains a title word and is reasonably short
    const hasTitle = titleWords.some((w) => lower.includes(w));
    if (hasTitle && line.length > 3 && line.length < 80) {
      // Clean up separators like "Senior Engineer | Company" → "Senior Engineer"
      const cleaned = line.split(/\s*[|•·@]\s*/)[0].trim();
      if (cleaned.length > 3) return cleaned;
    }
  }

  // Fallback: scan first 40 lines for any title-like line
  for (const line of lines.slice(0, 40)) {
    const lower = line.toLowerCase();
    const hasTitle = titleWords.some((w) => lower.includes(w));
    if (hasTitle && line.length > 3 && line.length < 60) {
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
  for (const [keyword, titles] of Object.entries(ROLE_TO_TITLES)) {
    if (lower.includes(keyword)) return titles;
  }
  // Fallback — only use the role itself if we can't map it
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

    return NextResponse.json({
      text,
      fileName: file.name,
      skills,
      preferredRoles,
      extractedName,
      extractedRole,
      extractedYears,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}
