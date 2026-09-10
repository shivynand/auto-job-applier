import type { Job } from "./types";
import { detectLanguageFlag, scoreJob } from "./matching";

const RAW = [
  {
    id: "job-001",
    company: "FWD Insurance",
    role: "GenAI Engineer Intern (New Grad Track)",
    source: "LinkedIn" as const,
    url: "https://www.linkedin.com/jobs/view/fwd-genai-intern-hk-001",
    location: "Hong Kong · Hybrid",
    description:
      "Join FWD's GenAI platform team to build multi-agent workflows, evaluation harnesses, and safety guardrails for insurance products. Python, LangChain/LlamaIndex, and prompt evaluation experience preferred. English working language. Open to final-year students and new grads.",
    tags: ["genai", "internship", "agents", "python", "insurance"],
    notes: "",
  },
  {
    id: "job-002",
    company: "SenseTime",
    role: "Machine Learning Research Intern",
    source: "LinkedIn" as const,
    url: "https://www.linkedin.com/jobs/view/sensetime-ml-intern-hk-002",
    location: "Hong Kong Science Park",
    description:
      "Work on computer vision and multimodal models for smart city and robotics. PyTorch, CUDA basics, and publications/coursework in deep learning are a plus. Mandarin preferred for some team meetings but English OK for engineering.",
    tags: ["ml", "computer vision", "internship", "pytorch"],
    notes: "",
  },
  {
    id: "job-003",
    company: "HKUST CSE",
    role: "Research Assistant – Agentic AI Lab",
    source: "HKUST" as const,
    url: "https://career.ust.hk/jobs/hkust-agentic-ai-ra-003",
    location: "HKUST Clear Water Bay",
    description:
      "Part-time / full-time RA supporting LLM agent benchmarks, tool-use evaluation, and demo systems. Strong Python, Hugging Face, and interest in evaluation science. English-primary lab. Ideal for CPEG/COMP students.",
    tags: ["llm", "agents", "research", "new grad"],
    notes: "",
  },
  {
    id: "job-004",
    company: "Goldman Sachs",
    role: "Technology Analyst – New Analyst Program",
    source: "LinkedIn" as const,
    url: "https://www.linkedin.com/jobs/view/gs-tech-analyst-hk-004",
    location: "Hong Kong · Central",
    description:
      "Full-time new analyst role building internal platforms. Java/Python, distributed systems fundamentals. Strong academics. Business Mandarin preferred; English is primary for engineering teams.",
    tags: ["new grad", "fintech", "software"],
    notes: "",
  },
  {
    id: "job-005",
    company: "HSBC",
    role: "AI/ML Graduate Programme",
    source: "LinkedIn" as const,
    url: "https://www.linkedin.com/jobs/view/hsbc-aiml-grad-hk-005",
    location: "Hong Kong · Kowloon Bay",
    description:
      "Graduate programme rotating through ML ops, NLP for customer service, and risk models. Fluent written and spoken Chinese mandatory. Python, SQL, and cloud experience required.",
    tags: ["graduate", "ml", "banking", "chinese required"],
    notes: "",
  },
  {
    id: "job-006",
    company: "HKUST Career Center Partner – SoftBank Robotics",
    role: "Computer Vision Intern",
    source: "HKUST" as const,
    url: "https://career.ust.hk/jobs/softbank-cv-intern-006",
    location: "Hong Kong · Science Park",
    description:
      "Internship building perception pipelines for service robots. YOLO, OpenCV, edge deployment. English-friendly international team. Preference for students with CV project experience.",
    tags: ["computer vision", "internship", "robotics", "yolo"],
    notes: "",
  },
  {
    id: "job-007",
    company: "Microsoft",
    role: "Software Engineer – AI Platform (Hong Kong)",
    source: "LinkedIn" as const,
    url: "https://www.linkedin.com/jobs/view/msft-ai-platform-hk-007",
    location: "Hong Kong · Cyberport",
    description:
      "Build services powering Copilot integrations for enterprise customers in Asia. TypeScript/Python, Azure, LLM APIs. New-grad applications welcome. English is the working language.",
    tags: ["ai", "fullstack", "new grad", "azure"],
    notes: "",
  },
  {
    id: "job-008",
    company: "Tencent",
    role: "Backend Engineer Intern – AI Infra",
    source: "LinkedIn" as const,
    url: "https://www.linkedin.com/jobs/view/tencent-ai-infra-intern-008",
    location: "Hong Kong · Quarry Bay",
    description:
      "Support training cluster tooling and inference serving. C++/Python, Kubernetes exposure helpful. Must be fluent in Mandarin Chinese for daily standups. Internship for final-year students.",
    tags: ["internship", "ai infra", "backend", "chinese required"],
    notes: "",
  },
  {
    id: "job-009",
    company: "HKUST ECE / AI Thrust",
    role: "Student Research Intern – Edge ML",
    source: "HKUST" as const,
    url: "https://career.ust.hk/jobs/hkust-edge-ml-009",
    location: "HKUST · Clear Water Bay",
    description:
      "Optimize on-device ML models (quantization, pruning) for IoT. Related to snow/road sensing and outdoor robotics datasets. English lab culture. Great fit for students with edge CV experience.",
    tags: ["edge ml", "internship", "computer vision", "research"],
    notes: "",
  },
  {
    id: "job-010",
    company: "Jane Street",
    role: "Software Engineer – New Grad",
    source: "LinkedIn" as const,
    url: "https://www.linkedin.com/jobs/view/janestreet-swe-newgrad-010",
    location: "Hong Kong · IFC",
    description:
      "New-grad software engineering role. Functional programming interest, strong problem solving, OCaml/Python/C++. Trading tech exposure a plus. English-only environment; no Chinese requirement.",
    tags: ["new grad", "software", "trading", "english"],
    notes: "",
  },
];

export function buildSeedJobs(): Job[] {
  const now = new Date().toISOString();
  return RAW.map((r) => {
    const languageFlag = detectLanguageFlag(`${r.role} ${r.description} ${r.tags.join(" ")}`);
    const { score, reason } = scoreJob({
      role: r.role,
      location: r.location,
      description: r.description,
      tags: r.tags,
      languageFlag,
    });
    return {
      ...r,
      status: "new" as const,
      dateFound: now,
      dateMaterials: null,
      matchReason: reason,
      matchScore: score,
      languageFlag,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
