const fs = require("fs");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function countMatches(content, pattern) {
  return (content.match(pattern) || []).length;
}

function includesAny(content, patterns) {
  return patterns.some((pattern) => pattern.test(content));
}

function scoreEmail(content) {
  const subject = content.match(/^Subject:\s*(.+)$/m)?.[1]?.trim() || "";
  const body = content.replace(/^Subject:.*$/m, "").trim();
  const charCount = content.replace(/\s+/g, "").length;
  const paragraphCount = content.split(/\n\s*\n/).filter(Boolean).length;
  const sentenceCount = countMatches(content, /[。！？!?]/g);
  const greetingCount = countMatches(content, /Hi\s+\{\{name\}\}|你好|您好/g);
  const permissionCount = countMatches(content, /同意|允许|授权|许可/g);
  const creatorTerms = countMatches(
    content,
    /二创|切片|频道|内容|风格|选题|视频/g
  );
  const respectTerms = countMatches(
    content,
    /高质量|认真|尊重|长期|稳定|深入|更懂/g
  );
  const actionTerms = countMatches(
    content,
    /回复|回信|告诉我|我可以先做|我可以先发|开始/g
  );
  const spammyTerms = countMatches(
    content,
    /马上|立刻|爆火|涨粉|变现|保证|一定|必须/g
  );
  const duplicateTerms = countMatches(content, /切片切片|更深入的更懂/g);
  const vagueTerms = countMatches(
    content,
    /相当不错|干起来|一个切片|更具体的思路|高质量/g
  );
  const specificPlanTerms = countMatches(
    content,
    /先做 1 条|先做一条|样片|样稿|选题|节奏|标题|封面|发布/g
  );
  const exclamations = countMatches(content, /[!！]/g);

  const hasGreeting = /Hi\s+\{\{name\}\}|你好\s*\{\{name\}\}|您好/.test(content);
  const hasClearIntent = includesAny(content, [/想做/, /想申请/, /想做一个/]);
  const hasSpecificAsk = includesAny(content, [/如果.*同意/, /如果可以/, /如果您愿意/]);
  const hasCreatorContext = creatorTerms >= 2;
  const hasQualitySignal = respectTerms >= 1;
  const hasNextStep = actionTerms >= 1;
  const hasSignoff = /谢谢|感谢|打扰了|祝好/.test(content);
  const subjectLength = subject.length;

  let score = 0;

  // Structure
  score += subject ? 8 : 0;
  score += hasGreeting ? 6 : 0;
  score += hasSignoff ? 4 : 0;
  score += paragraphCount >= 3 && paragraphCount <= 5 ? 6 : 3;
  score += sentenceCount >= 3 && sentenceCount <= 6 ? 6 : 3;

  // Subject quality
  score += subjectLength >= 10 && subjectLength <= 24 ? 10 : 5;
  score += /二创|频道|合作/.test(subject) ? 6 : 0;
  score -= /想做一个高质量的/.test(subject) && subjectLength > 18 ? 5 : 0;

  // Relevance
  score += hasClearIntent ? 8 : 0;
  score += hasSpecificAsk ? 8 : 0;
  score += hasCreatorContext ? 10 : 3;
  score += hasQualitySignal ? 6 : 2;
  score += hasNextStep ? 6 : 1;
  score += permissionCount >= 1 && permissionCount <= 2 ? 4 : 0;
  score += specificPlanTerms >= 2 ? 12 : specificPlanTerms === 1 ? 6 : 0;

  // Readability
  score += charCount >= 80 && charCount <= 180 ? 10 : 4;
  score += greetingCount === 1 ? 3 : 1;

  // Penalties
  score -= spammyTerms * 6;
  score -= duplicateTerms * 8;
  score -= vagueTerms * 5;
  score -= exclamations > 0 ? exclamations * 2 : 0;
  score -= permissionCount > 2 ? permissionCount - 2 : 0;

  return clamp(score, 0, 100);
}

const filepath = process.argv[2];
const content = fs.readFileSync(filepath, "utf8");
const score = scoreEmail(content);

console.log(`EMAIL_SCORE:${score}`);
