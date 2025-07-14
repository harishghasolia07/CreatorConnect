import { ICreator } from './models/Creator';
import { IBrief } from './models/Brief';

interface MatchResult {
  creator: ICreator;
  score: number;
  explanation: string[];
}

export function calculateMatchScore(creator: ICreator, brief: IBrief): { score: number; explanation: string[] } {
  let score = 0;
  const explanation: string[] = [];

  // Location matching
  if (creator.location.city.toLowerCase() === brief.location.city.toLowerCase()) {
    score += 3;
    explanation.push(`Perfect location match in ${creator.location.city}`);
  } else if (creator.location.country.toLowerCase() === brief.location.country.toLowerCase()) {
    score += 1;
    explanation.push(`Same country (${creator.location.country})`);
  }

  // Budget matching
  const budgetFit = brief.budgetMax >= creator.budgetRange.min && brief.budgetMax <= creator.budgetRange.max * 1.2;
  if (budgetFit) {
    if (brief.budgetMax >= creator.budgetRange.min && brief.budgetMax <= creator.budgetRange.max) {
      score += 3;
      explanation.push('Budget perfectly within range');
    } else {
      score += 1;
      explanation.push('Budget slightly above range but acceptable');
    }
  }

  // Category matching
  if (creator.categories.includes(brief.category)) {
    score += 4;
    explanation.push(`Specializes in ${brief.category}`);
  }

  // Skills matching
  const matchingSkills = creator.skills.filter(skill => 
    brief.preferredStyles.some(style => 
      style.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(style.toLowerCase())
    )
  );
  const skillScore = Math.min(matchingSkills.length, 5);
  if (skillScore > 0) {
    score += skillScore;
    explanation.push(`${matchingSkills.length} matching skills: ${matchingSkills.slice(0, 3).join(', ')}`);
  }

  // Portfolio style matching
  const portfolioMatches = creator.portfolio.some(item =>
    item.tags.some(tag =>
      brief.preferredStyles.some(style =>
        style.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(style.toLowerCase())
      )
    )
  );
  if (portfolioMatches) {
    score += 2;
    explanation.push('Portfolio shows matching style preferences');
  }

  // Experience scoring
  if (creator.experienceYears >= 5) {
    score += 3;
    explanation.push(`${creator.experienceYears} years of experience`);
  } else if (creator.experienceYears >= 2) {
    score += 2;
    explanation.push(`${creator.experienceYears} years of solid experience`);
  } else if (creator.experienceYears >= 1) {
    score += 1;
    explanation.push(`${creator.experienceYears} year(s) of experience`);
  }

  // Rating bonus
  if (creator.rating >= 4.5) {
    score += 1;
    explanation.push(`Excellent rating (${creator.rating}/5)`);
  }

  return { score, explanation };
}

export function rankMatches(creators: ICreator[], brief: IBrief): MatchResult[] {
  const matches: MatchResult[] = creators.map(creator => {
    const { score, explanation } = calculateMatchScore(creator, brief);
    return {
      creator,
      score,
      explanation
    };
  });

  return matches
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}