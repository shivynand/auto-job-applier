import type { Job, Profile } from "./types";

function pickBullets(cv: string, n = 4): string[] {
  return cv
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"))
    .slice(0, n)
    .map((l) => l.replace(/^[•\-*]\s*/, ""));
}

export function mockGenerateMaterials(
  job: Job,
  profile: Profile
): { tailoredCv: string; coverLetter: string } {
  const bullets = pickBullets(profile.cv, 5);
  const highlight =
    bullets[0] ||
    "Built multi-agent GenAI workflows and computer-vision models with measurable impact.";

  const tailoredCv = `${profile.name}
${profile.email} | Hong Kong | Tailored for ${job.company} — ${job.role}

SUMMARY
Final-year HKUST Computer Engineering + AI student targeting ${job.role} at ${job.company}.
Strong fit: ${job.matchReason}. English-first collaborator with GenAI, CV, and full-stack shipping experience.

SELECTED EXPERIENCE (tailored)
• FWD — Gen AI Engineer Intern: multi-agent coding workflow (6x ticket resolution, -45% tokens); agentic eval / guardrails (~$150K risk savings).
• StarryCraze — Full Stack Intern: GCP/Flask/React AI news pipeline (50 articles/day); Celeb-Geoguessr with MongoDB + LLM summarization.
• Eleuto — CMO: HKSTP Techathon grand prize ($100k); grew team 3 to 10.
• Century Lab — SWE Intern: Tailwind production UI, TypeScript APIs, Drizzle DB for 2000+ users.

PROJECTS
• Snow Pole Detection (edge CV, 93% accuracy) — relevant to robotics / outdoor perception roles.
• Football AI Coach & Basketball dribble detector — Mediapipe / YOLOv8 pose & action pipelines.

SKILLS
Python, C++, TypeScript/JS · React, Next.js, Flask · PyTorch/YOLO/OpenCV · GCP, MongoDB, Git

WHY THIS ROLE
${highlight}
Aligned with ${job.company}'s focus in ${job.location}. Source: ${job.source}.
`;

  const coverLetter = `Dear ${job.company} Hiring Team,

I am a final-year Computer Engineering + AI student at HKUST applying for the ${job.role} role. I am excited by ${job.company}'s work and believe my GenAI, computer-vision, and full-stack experience is a strong match (${job.matchReason}).

At FWD I accelerated developer ticket resolution 6x with a multi-agent coding workflow and helped standardize AI safety evaluations. At StarryCraze I shipped serverless AI data pipelines and LLM-powered product features. Independently I trained an edge snow-pole detector (93% accuracy) and built sports-AI vision tools with YOLO and Mediapipe.

I am Hong Kong-based, English-fluent, and looking for new-grad / internship roles where I can deepen applied ML while shipping reliable systems. I would welcome the chance to discuss how I can contribute to ${job.company}.

Thank you for your time and consideration.

Best regards,
${profile.name}
${profile.email}
`;

  return { tailoredCv, coverLetter };
}

export async function generateMaterials(
  job: Job,
  profile: Profile
): Promise<{ tailoredCv: string; coverLetter: string; provider: "openai" | "mock" }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ...mockGenerateMaterials(job, profile), provider: "mock" };
  }

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });
    const prompt = [
      "You are helping a HKUST CPEG+AI final-year student prepare application materials.",
      "Write a tailored CV (plain text, concise) and a cover letter for this job.",
      "Return JSON with keys tailoredCv and coverLetter only.",
      "",
      "CANDIDATE PROFILE / CV:",
      profile.cv.slice(0, 6000),
      "",
      "AGENTS CONTEXT:",
      profile.agentsMd.slice(0, 3000),
      "",
      "JOB:",
      `Company: ${job.company}`,
      `Role: ${job.role}`,
      `Location: ${job.location}`,
      `Source: ${job.source}`,
      `Description: ${job.description}`,
      `Match reason: ${job.matchReason}`,
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as {
      tailoredCv?: string;
      coverLetter?: string;
    };
    if (!parsed.tailoredCv || !parsed.coverLetter) {
      return { ...mockGenerateMaterials(job, profile), provider: "mock" };
    }
    return {
      tailoredCv: parsed.tailoredCv,
      coverLetter: parsed.coverLetter,
      provider: "openai",
    };
  } catch {
    return { ...mockGenerateMaterials(job, profile), provider: "mock" };
  }
}
