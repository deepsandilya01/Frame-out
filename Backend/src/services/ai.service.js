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

  // FIX: AI sometimes returns unescaped newlines or tabs inside string literals.
  // Replacing all raw newlines/tabs with spaces prevents "Bad control character" JSON errors.
  raw = raw.replace(/[\n\r\t]+/g, ' ');

  try {
    return JSON.parse(raw);
  } catch (err) {
    // Last resort: extract first {...} block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        throw new Error("Mistral returned unparsable JSON response: " + err.message);
      }
    }
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

// ---------------------------------------------------------------------------
// 4. Adaptive Timer Suggestion
// ---------------------------------------------------------------------------
export async function getAdaptiveTimer(data) {
  const { avgSessionLength, completionRate, avgDistractions, preferredMode, currentStreak, totalSessions } = data;

  const prompt = `
You are a focus science expert for "Frame-Out" productivity app.
Analyze the user's focus session data and recommend the optimal timer duration for their NEXT session.

USER DATA:
- Average session length (last 14 days): ${avgSessionLength} minutes
- Session completion rate: ${completionRate}%
- Average distractions per session: ${avgDistractions}
- Preferred mode: ${preferredMode}
- Current streak: ${currentStreak} days
- Total sessions completed: ${totalSessions}

Consider flow state science: sessions too long cause burnout, too short prevent deep work.
Recommend a duration that maximizes flow state based on their actual performance.

Respond in this EXACT JSON format:
{
  "suggested_minutes": <number between 15 and 90>,
  "suggested_break": <number between 3 and 20>,
  "confidence": "high|medium|low",
  "reasoning": "2-3 sentences explaining why this duration is optimal for them",
  "mode": "pomodoro or custom",
  "tip": "one specific tip to improve their next session"
}`.trim();

  return await askJSON(prompt);
}

// ---------------------------------------------------------------------------
// 5. Burnout Detection
// ---------------------------------------------------------------------------
export async function detectBurnout(data) {
  const { avgDistractions7d, sessionsLast7d, completionRate7d, streak, avgSessionLength, moodTrend } = data;

  const prompt = `
You are a burnout detection AI for "Frame-Out" productivity app.
Analyze user metrics to detect burnout, overwork, or declining focus.

METRICS (last 7 days):
- Sessions completed: ${sessionsLast7d}
- Average distractions per session: ${avgDistractions7d}
- Session completion rate: ${completionRate7d}%
- Current streak: ${streak} days
- Average session length: ${avgSessionLength} minutes
- Recent mood trend: ${moodTrend || "not tracked"}

Burnout signals: high distractions + low completion rate + declining session length + negative moods.
Overwork signals: very high session count + low completion + high distractions despite effort.

Respond in this EXACT JSON format:
{
  "risk_level": "none|low|medium|high",
  "risk_score": <number 0-100>,
  "status": "one of: thriving|stable|at_risk|burnout_detected",
  "headline": "short diagnosis headline (max 10 words)",
  "signals": ["signal 1", "signal 2"],
  "recommendations": ["action 1", "action 2", "action 3"],
  "recovery_plan": "one concrete recovery suggestion for today",
  "encouragement": "one motivating sentence"
}`.trim();

  return await askJSON(prompt);
}

// ---------------------------------------------------------------------------
// 6. Daily Mission Generator
// ---------------------------------------------------------------------------
export async function generateDailyMissions(data) {
  const { streak, level, tasksBacklog, totalSessions7d, completionRate, avgDistractions } = data;

  const prompt = `
You are a productivity game master for "Frame-Out", a focus and productivity app.
Generate exactly 3 personalized daily missions for the user based on their stats.
Missions should be achievable today, gradually challenging, and directly tied to the app's features.

USER STATS:
- Current streak: ${streak} days
- Level: ${level}
- Tasks in backlog: ${tasksBacklog}
- Sessions last 7 days: ${totalSessions7d}
- Completion rate: ${completionRate}%
- Avg distractions per session: ${avgDistractions}

MISSION RULES:
- One EASY mission (simple, quick win)
- One MEDIUM mission (requires focus or consistency)
- One HARD mission (stretch goal)
- XP rewards: easy=10-20, medium=25-40, hard=50-75
- Categories: "focus", "tasks", "wellness", "streak", "reflection"

Respond with this EXACT JSON array:
[
  { "title": "short title (max 8 words)", "description": "what to do, 1-2 sentences", "xpReward": 15, "difficulty": "easy", "category": "focus" },
  { "title": "...", "description": "...", "xpReward": 30, "difficulty": "medium", "category": "tasks" },
  { "title": "...", "description": "...", "xpReward": 60, "difficulty": "hard", "category": "wellness" }
]`.trim();

  try {
    const result = await client.chat.complete({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a productivity AI. Always respond with valid raw JSON only — no markdown, no code fences. Output only the JSON array." },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      maxTokens: 700,
    });

    let raw = result.choices[0].message.content.trim();
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : (parsed.missions || []);
    return arr.slice(0, 3).map((m) => ({
      title:       m.title       || "Complete a task",
      description: m.description || "",
      xpReward:    Number(m.xpReward) || 15,
      difficulty:  m.difficulty  || "easy",
      category:    m.category    || "focus",
      completed:   false,
    }));
  } catch {
    return [
      { title: "Complete a focus session",     description: "Finish one Pomodoro without distractions.",               xpReward: 15, difficulty: "easy",   category: "focus",      completed: false },
      { title: "Complete 3 tasks",             description: "Mark 3 tasks as done in your task list today.",            xpReward: 30, difficulty: "medium", category: "tasks",      completed: false },
      { title: "Deep Work for 45 minutes",     description: "Use Deep Work mode for a 45-min uninterrupted session.",   xpReward: 60, difficulty: "hard",   category: "focus",      completed: false },
    ];
  }
}
