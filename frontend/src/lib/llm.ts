import type { LLMRequest, LLMResponse, LLMSuggestion, GoalType } from '../types';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Check if LLM is configured
 */
export function isLLMConfigured(): boolean {
  return Boolean(ANTHROPIC_API_KEY);
}

/**
 * Generate goal suggestions using Claude Haiku
 */
export async function generateGoalSuggestions(
  request: LLMRequest
): Promise<LLMResponse> {
  if (!isLLMConfigured()) {
    // Return mock suggestions if API key is not configured
    return getMockSuggestions(request);
  }

  try {
    const systemPrompt = buildSystemPrompt(request.context?.goalType || 'yearly');
    const userPrompt = buildUserPrompt(request);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestions = parseLLMResponse(data.content[0].text);

    return {
      suggestions,
      model: 'claude-3-haiku-20240307',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error generating suggestions:', error);
    // Return mock suggestions as fallback
    return getMockSuggestions(request);
  }
}

/**
 * Build system prompt based on goal type
 */
function buildSystemPrompt(goalType: GoalType | string): string {
  return `You are an expert goal-setting coach. Your role is to help users break down their ${goalType} goals into actionable, achievable milestones.

Provide practical, realistic suggestions that:
1. Break large goals into smaller, manageable steps
2. Consider typical timelines and resources needed
3. Identify potential challenges and how to overcome them
4. Offer specific, actionable examples
5. Encourage progress without being overwhelming

Format your response as a JSON object with the following structure:
{
  "breakdown": ["step 1", "step 2", ...],
  "examples": ["example 1", "example 2", ...],
  "tips": ["tip 1", "tip 2", ...],
  "estimatedTimeline": "description of timeline",
  "feasibilityScore": number between 0-100,
  "potentialChallenges": ["challenge 1", "challenge 2", ...]
}`;
}

/**
 * Build user prompt from request
 */
function buildUserPrompt(request: LLMRequest): string {
  const { context } = request;
  let prompt = request.prompt;

  if (context) {
    prompt += `\n\nGoal Details:`;
    prompt += `\n- Title: ${context.goalTitle}`;
    prompt += `\n- Type: ${context.goalType}`;

    if (context.parentGoal) {
      prompt += `\n- Parent Goal: ${context.parentGoal.title}`;
    }

    if (context.timeline) {
      const start = new Date(context.timeline.startDate).toLocaleDateString();
      const end = new Date(context.timeline.endDate).toLocaleDateString();
      prompt += `\n- Timeline: ${start} to ${end}`;
    }
  }

  return prompt;
}

/**
 * Parse LLM response text into structured suggestion
 */
function parseLLMResponse(responseText: string): LLMSuggestion {
  try {
    // Try to parse as JSON first
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: parse as plain text
    return {
      breakdown: extractListFromText(responseText, 'breakdown'),
      examples: extractListFromText(responseText, 'examples'),
      tips: extractListFromText(responseText, 'tips'),
      estimatedTimeline: extractTextValue(responseText, 'timeline'),
      feasibilityScore: 75,
      potentialChallenges: extractListFromText(responseText, 'challenges'),
    };
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    return {
      breakdown: ['Unable to parse suggestions. Please try again.'],
      examples: [],
      tips: [],
    };
  }
}

/**
 * Extract list items from text
 */
function extractListFromText(text: string, section: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes(section)) {
      inSection = true;
      continue;
    }

    if (inSection && (line.startsWith('-') || line.match(/^\d+\./))) {
      items.push(line.replace(/^[-\d.]+\s*/, '').trim());
    } else if (inSection && line.trim() === '') {
      break;
    }
  }

  return items.length > 0 ? items : [];
}

/**
 * Extract text value from response
 */
function extractTextValue(text: string, key: string): string | undefined {
  const regex = new RegExp(`${key}[:\\s]+(.+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Get mock suggestions when API is not configured
 */
function getMockSuggestions(request: LLMRequest): LLMResponse {
  const goalType = request.context?.goalType || 'yearly';
  const title = request.context?.goalTitle || 'your goal';

  const suggestions: Record<GoalType | string, LLMSuggestion> = {
    yearly: {
      breakdown: [
        'Break down into 12 monthly milestones',
        'Set quarterly review points',
        'Identify key performance indicators',
        'Create accountability system',
      ],
      examples: [
        'Month 1-3: Foundation building phase',
        'Month 4-6: Growth and expansion phase',
        'Month 7-9: Optimization phase',
        'Month 10-12: Completion and review phase',
      ],
      tips: [
        'Review progress monthly',
        'Adjust timeline as needed',
        'Celebrate small wins',
        'Stay flexible but committed',
      ],
      estimatedTimeline: '12 months with quarterly milestones',
      feasibilityScore: 75,
      potentialChallenges: [
        'Maintaining motivation over long period',
        'Life changes affecting timeline',
        'Resource availability',
      ],
    },
    monthly: {
      breakdown: [
        'Divide into 4 weekly goals',
        'Set specific daily actions',
        'Plan for obstacles',
        'Schedule regular check-ins',
      ],
      examples: [
        'Week 1: Planning and preparation',
        'Week 2-3: Active execution',
        'Week 4: Review and refinement',
      ],
      tips: [
        'Check progress weekly',
        'Be specific about daily tasks',
        'Build in buffer time',
        'Track metrics consistently',
      ],
      estimatedTimeline: '4 weeks with weekly milestones',
      feasibilityScore: 80,
      potentialChallenges: [
        'Unexpected commitments',
        'Energy fluctuations',
        'Need for course correction',
      ],
    },
    weekly: {
      breakdown: [
        'Set 5-7 daily objectives',
        'Prioritize top 3 must-dos',
        'Schedule specific time blocks',
        'Plan for weekend review',
      ],
      examples: [
        'Monday: Start strong with main task',
        'Tuesday-Thursday: Maintain momentum',
        'Friday: Wrap up and review',
        'Weekend: Prepare for next week',
      ],
      tips: [
        'Start each day with clarity',
        'Focus on progress, not perfection',
        'Adjust daily as needed',
        'Reflect on what worked',
      ],
      estimatedTimeline: '7 days with daily check-ins',
      feasibilityScore: 85,
      potentialChallenges: [
        'Daily interruptions',
        'Procrastination',
        'Underestimating time needed',
      ],
    },
    daily: {
      breakdown: [
        'Identify the single most important task',
        'Break into 2-4 hour time blocks',
        'Schedule breaks',
        'Plan for completion review',
      ],
      examples: [
        'Morning: High-priority focused work',
        'Midday: Collaborative or lighter tasks',
        'Afternoon: Review and planning',
      ],
      tips: [
        'Start with the hardest task',
        'Eliminate distractions',
        'Take regular breaks',
        'Celebrate completion',
      ],
      estimatedTimeline: 'Same day with hourly progress',
      feasibilityScore: 90,
      potentialChallenges: [
        'Time management',
        'Unexpected interruptions',
        'Energy management',
      ],
    },
  };

  return {
    suggestions: suggestions[goalType] || suggestions.yearly,
    model: 'mock',
    timestamp: new Date(),
  };
}

/**
 * Generate breakdown prompt for goal creation
 */
export function buildBreakdownPrompt(
  goalTitle: string,
  goalType: GoalType,
  parentGoal?: { title: string; type: GoalType }
): string {
  let prompt = `Help me break down this ${goalType} goal: "${goalTitle}"`;

  if (parentGoal) {
    prompt += `\n\nThis is a sub-goal of my ${parentGoal.type} goal: "${parentGoal.title}"`;
  }

  prompt += '\n\nProvide specific, actionable suggestions for achieving this goal.';

  return prompt;
}
