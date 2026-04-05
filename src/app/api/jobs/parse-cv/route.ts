import { NextRequest, NextResponse } from "next/server";

const SKILL_KEYWORDS = [
  // Languages
  "JavaScript","TypeScript","Python","Java","C#","C++","Go","Rust","Swift","Kotlin","PHP","Ruby","Scala","R",
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

  const rolePatterns = [
    /^(senior|lead|principal|staff|junior|associate|head of|vp|director|chief|cto|ceo|coo|manager)?\s*(software|full.?stack|frontend|backend|data|ml|ai|devops|product|cloud|mobile|platform|qa|site reliability|security)?\s*(engineer|developer|architect|scientist|analyst|manager|designer|consultant|lead|specialist|officer)\b/i,
  ];

  for (const line of lines.slice(0, 30)) {
    for (const pattern of rolePatterns) {
      const match = line.match(pattern);
      if (match && match[0].length > 4) return match[0].trim();
    }
  }
  return null;
}

function extractSkills(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill.toLowerCase())) found.add(skill);
  }
  return Array.from(found);
}

function generateJobTitles(currentRole: string): string[] {
  const lower = currentRole.toLowerCase();
  for (const [keyword, titles] of Object.entries(ROLE_TO_TITLES)) {
    if (lower.includes(keyword)) return titles;
  }
  // Fallback — use the current role + common progressions
  return [currentRole, `Senior ${currentRole}`, `Lead ${currentRole}`, `Head of ${currentRole.replace(/^senior\s+/i, "")}`];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File;
    const currentRole = formData.get("currentRole") as string ?? "";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    const text = parsed.text;

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
