import { Mistral } from "@mistralai/mistralai";
import { config } from "../config/config.js";

const client = new Mistral({ apiKey: config.MISTRAL_API_KEY || "" });

// Use mistral-medium-latest — great for structured JSON output
const MODEL = "mistral-medium-latest";

/**
 * Core helper — sends a prompt to Mistral and returns parsed JSON.
 * Instructs the model with a system message to always respond in raw JSON.
 * Strips any accidental markdown fences as a safety net.
 */
async function askJSON(userPrompt) {
  const response = await client.chat.complete({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a productivity AI assistant. Always respond with valid raw JSON only — no markdown, no code fences, no explanation. Output only the JSON object.",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    maxTokens: 1024,
  });

  let raw = response.choices[0].message.content.trim();

  // Strip ```json ... ``` or ``` ... ``` just in case
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Last resort: extract first {...} block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Mistral returned non-JSON response: " + raw.slice(0, 200));
  }
}

// ---------------------------------------------------------------------------
// 1. Productivity Analysis
// ---------------------------------------------------------------------------
export async function analyzeProductivity(stats) {
  const {
    totalFocusMinutes,
    totalSessions,
    completedSessions,
    tasksCompleted,
    tasksCreated,
    distractionsCount,
    currentStreak,
    productivityScore,
    period = "this week",
  } = stats;

  const focusHours  = (totalFocusMinutes / 60).toFixed(1);
  const sessionRate = totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(0) : 0;
  const taskRate    = tasksCreated  > 0 ? ((tasksCompleted    / tasksCreated)   * 100).toFixed(0) : 0;

  const prompt = `
You are a personal productivity coach inside a focus app called "Frame-Out".
Analyze the following user stats for ${period} and provide structured, motivating feedback.

USER STATS:
- Total Focus Time: ${focusHours} hours (${totalFocusMinutes} minutes)
- Total Sessions Started: ${totalSessions}
- Sessions Completed: ${completedSessions} (${sessionRate}% completion rate)
- Tasks Created: ${tasksCreated}
- Tasks Completed: ${tasksCompleted} (${taskRate}% task rate)
- Distractions Logged: ${distractionsCount}
- Current Streak: ${currentStreak} days
- Productivity Score: ${productivityScore}/100

Respond in this EXACT JSON format:
{
  "headline": "one punchy sentence summarizing performance (max 12 words)",
  "score_interpretation": "2-3 sentences explaining what the productivity score means for this user",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_to_improve": ["area 1", "area 2"],
  "distraction_insight": "one actionable sentence about their distraction pattern",
  "streak_message": "motivating message about their current streak",
  "tomorrow_goal": "one specific, achievable goal for tomorrow"
}`.trim();

  return await askJSON(prompt);
}

// ---------------------------------------------------------------------------
// 2. Focus Suggestions
// ---------------------------------------------------------------------------
export async function getFocusSuggestions(data) {
  const {
    avgSessionLength,
    peakHour,
    avgDistractions,
    preferredMode,
    recentMoods = [],
    tasksBacklog = 0,
  } = data;

  const moodSummary = recentMoods.length > 0 ? recentMoods.join(", ") : "not tracked";

  const prompt = `
You are a focus coach for "Frame-Out", a productivity app with Pomodoro and custom timer modes.
Based on the user's focus patterns below, provide personalized, science-backed suggestions.

USER PATTERNS:
- Average session length: ${avgSessionLength} minutes
- Peak focus hour: ${peakHour}:00
- Average distractions per session: ${avgDistractions}
- Preferred timer mode: ${preferredMode}
- Recent moods: ${moodSummary}
- Tasks in backlog: ${tasksBacklog}

Respond in this EXACT JSON format:
{
  "optimal_session_length": <number in minutes>,
  "optimal_break_length": <number in minutes>,
  "best_time_to_focus": "e.g. 9AM to 11AM",
  "recommended_mode": "pomodoro or custom",
  "tips": [
    "actionable tip 1",
    "actionable tip 2",
    "actionable tip 3",
    "actionable tip 4"
  ],
  "distraction_strategy": "specific strategy to reduce their distractions",
  "mood_note": "brief note based on their recent moods",
  "priority_suggestion": "how to tackle their task backlog today"
}`.trim();

  return await askJSON(prompt);
}

// ---------------------------------------------------------------------------
// 3. Weekly Report
// ---------------------------------------------------------------------------
export async function generateWeeklyReport(weekData) {
  const {
    days = [],
    userLevel,
    currentStreak,
    longestStreak,
    totalXP,
    newBadges = [],
  } = weekData;

  const dayLines = days
    .map((d) => `  ${d.date}: ${d.focusMinutes}min focus, ${d.sessionsCompleted} sessions, ${d.tasksCompleted} tasks, ${d.distractions} distractions`)
    .join("\n");

  const totalFocus    = days.reduce((a, d) => a + d.focusMinutes, 0);
  const totalSessions = days.reduce((a, d) => a + d.sessionsCompleted, 0);
  const totalTasks    = days.reduce((a, d) => a + d.tasksCompleted, 0);
  const bestDay       = days.reduce((a, d) => (d.focusMinutes > a.focusMinutes ? d : a), days[0] || {});
  const badgeStr      = newBadges.length > 0 ? newBadges.join(", ") : "none";

  const prompt = `
You are a personal productivity analyst for "Frame-Out" app.
Write a concise, motivating weekly report for a user based on 7 days of data.

WEEKLY SUMMARY:
- Total Focus Time: ${(totalFocus / 60).toFixed(1)} hours
- Total Sessions Completed: ${totalSessions}
- Total Tasks Completed: ${totalTasks}
- Current Level: ${userLevel}
- XP Earned This Week: ${totalXP}
- Current Streak: ${currentStreak} days
- Longest Ever Streak: ${longestStreak} days
- New Badges Earned: ${badgeStr}
- Best Day: ${bestDay?.date || "N/A"} (${bestDay?.focusMinutes || 0} min)

DAILY BREAKDOWN:
${dayLines}

Respond in this EXACT JSON format:
{
  "title": "catchy weekly report title (max 8 words)",
  "summary": "2-3 sentence narrative overview of the week",
  "trend": "improving or declining or steady",
  "trend_explanation": "one sentence explaining the trend",
  "best_day": "${bestDay?.date || "N/A"}",
  "worst_day": "<date of lowest focus>",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "challenges": ["challenge 1", "challenge 2"],
  "next_week_plan": {
    "focus_goal_hours": <number>,
    "session_goal": <number>,
    "task_goal": <number>,
    "key_habit": "one habit to build next week"
  },
  "motivational_close": "inspiring closing sentence (max 20 words)"
}`.trim();

  return await askJSON(prompt);
}
