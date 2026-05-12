import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import Task from "./src/models/task.model.js";
import FocusSession from "./src/models/focussession.model.js";
import ActivitySummary from "./src/models/activitysummary.model.js";
import Journal from "./src/models/journal.model.js";
import Heatmap from "./src/models/heatmap.model.js";
import Analytics from "./src/models/analytics.model.js";
import UserStats from "./src/models/userstats.model.js";
import Mission from "./src/models/mission.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();

  try {
    const targetEmail = "test@test.com";
    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.log(`User ${targetEmail} not found! Please create it via the frontend first.`);
      process.exit();
    }
    console.log(`\n========================================`);
    console.log(`Seeding ALL Data for: ${user.email}`);
    console.log(`========================================\n`);

    const userId = user._id;

    // 1. CLEAR EXISTING DATA FOR THIS USER
    await Task.deleteMany({ user: userId });
    await FocusSession.deleteMany({ user: userId });
    await ActivitySummary.deleteMany({ user: userId });
    await Journal.deleteMany({ user: userId });
    await Heatmap.deleteMany({ user: userId });
    await Analytics.deleteMany({ user: userId });
    await Mission.deleteMany({ user: userId });
    await UserStats.deleteMany({ user: userId });

    console.log("🗑️  Cleared old data.");

    // 2. USER STATS
    const stats = await UserStats.create({
      user: userId,
      xp: 2450,
      level: 15,
      totalFocusMinutes: 4800, // 80 hours
      totalSessionsCompleted: 110,
      currentStreak: 12,
      longestStreak: 21,
      totalTasksCompleted: 45,
      badges: [
        { id: "FIRST_SESSION", name: "First Focus", description: "Completed your first session", icon: "🌱", earnedAt: new Date(Date.now() - 30*86400000) },
        { id: "FOCUS_100", name: "Deep Diver", description: "Focused for 2 hours straight", icon: "🐋", earnedAt: new Date(Date.now() - 20*86400000) },
        { id: "TASKS_10", name: "Task Master", description: "Completed 10 tasks", icon: "⚔️", earnedAt: new Date(Date.now() - 10*86400000) },
        { id: "STREAK_7", name: "Streak Legend", description: "10-day streak", icon: "🔥", earnedAt: new Date(Date.now() - 2*86400000) },
      ],
      xpLog: []
    });
    console.log("🏆 Seeded UserStats (Level 15).");

    // 3. TASKS
    await Task.create([
      { user: userId, title: "Finish Hackathon Pitch Deck", description: "Create slides detailing the problem, solution, 4-layer architecture, and gamification.", status: "in-progress", priority: "high", deadline: new Date(Date.now() + 86400000) },
      { user: userId, title: "Deploy Backend to Render", description: "Ensure MongoDB connection string is correctly configured in production.", status: "completed", priority: "high", deadline: new Date() },
      { user: userId, title: "Record Demo Video", description: "A crisp 3-minute video showing the extension blocking shorts and the dashboard updating.", status: "pending", priority: "medium", deadline: new Date(Date.now() + 2*86400000) },
      { user: userId, title: "Test Chrome Extension APIs", description: "Verify that message passing to the service worker works flawlessly.", status: "completed", priority: "medium", deadline: new Date(Date.now() - 86400000) },
      { user: userId, title: "Fix UI bugs on Dashboard", description: "Ensure the gamification xp bar doesn't overflow on mobile.", status: "pending", priority: "low" }
    ]);
    console.log("✅ Seeded Tasks.");

    // 4. MISSIONS
    await Mission.create({
      user: userId,
      date: new Date().toISOString().split('T')[0],
      missions: [
        { title: "The Architect's Flow", description: "Log 3 hours of deep focus time today.", xpReward: 150, difficulty: "hard", category: "focus", completed: false },
        { title: "Task Crusher", description: "Complete 3 priority tasks.", xpReward: 50, difficulty: "easy", category: "task", completed: true, completedAt: new Date() }
      ]
    });
    console.log("🎯 Seeded Daily Missions.");

    // 5. LOOP OVER LAST 14 DAYS TO GENERATE PAST DATA
    const todayDate = new Date();
    
    for (let i = 14; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;

      // Focus Sessions (1-3 per day)
      const numSessions = Math.floor(Math.random() * 3) + 1;
      let dailyFocusMins = 0;
      
      for(let s=0; s<numSessions; s++) {
        const dur = [25, 45, 60][Math.floor(Math.random() * 3)];
        dailyFocusMins += dur;
        
        await FocusSession.create({
          user: userId,
          duration: dur,
          timerType: ["pomodoro", "custom"][Math.floor(Math.random()*2)],
          mode: ["pomodoro", "deep-work"][Math.floor(Math.random()*2)],
          completed: true,
          startedAt: new Date(d.setHours(10 + s*2, 0, 0)),
          endedAt: new Date(d.setHours(10 + s*2, dur, 0)),
          distractions: Math.floor(Math.random() * 3),
          xpEarned: dur,
          mood: ["happy", "tired", "motivated", "calm"][Math.floor(Math.random()*4)],
          notes: s === 0 ? "Morning deep work" : "Afternoon session",
          createdAt: d
        });
      }

      // Heatmap
      await Heatmap.create({
        user: userId,
        date: dateStr,
        focusMinutes: dailyFocusMins,
        wasActive: true,
        level: dailyFocusMins > 120 ? 4 : dailyFocusMins > 60 ? 3 : 2
      });

      // Journal
      if (Math.random() > 0.3) {
        await Journal.create({
          user: userId,
          date: dateStr,
          mood: ["sleepy", "calm", "happy", "motivated", "energized"][Math.floor(Math.random()*5)],
          content: "Felt very productive today. The new dark UI looks incredible.",
          goals: ["Finish hackathon project", "Record demo"],
          gratitude: ["Coffee", "My team"],
          highlights: "Deployed the backend successfully.",
          createdAt: d
        });
      }

      // Activity Summary
      const githubTime = 3600 + Math.floor(Math.random() * 5000); // Productive
      const vscodeTime = 7200 + Math.floor(Math.random() * 7000); // Productive
      const instaTime = 1200 + Math.floor(Math.random() * 2000); // Distracting
      
      const prodTotal = githubTime + vscodeTime;
      const distTotal = instaTime;
      const totalTime = prodTotal + distTotal + 1500; // adding some neutral

      await ActivitySummary.create({
        user: userId,
        date: dateStr,
        totalScreenTime: totalTime,
        productiveTime: prodTotal,
        distractingTime: distTotal,
        neutralTime: 1500,
        websites: [
          { website: "github.com", duration: githubTime, visits: 15, category: "Productive" },
          { website: "vscode.dev", duration: vscodeTime, visits: 8, category: "Productive" },
          { website: "instagram.com", duration: instaTime, visits: 6, category: "Distracting" },
          { website: "google.com", duration: 1500, visits: 20, category: "Neutral" }
        ],
        createdAt: d
      });

      // Analytics Snapshot
      await Analytics.create({
        user: userId,
        date: dateStr,
        totalFocusMinutes: dailyFocusMins,
        completedSessions: numSessions,
        distractions: Math.floor(Math.random() * 5),
        tasksCompleted: Math.floor(Math.random() * 3),
        productivityRate: 0.8 + (Math.random() * 0.15),
        createdAt: d
      });
    }

    console.log("📅 Seeded Focus Sessions, Heatmaps, Journals, Activities, and Analytics (Past 14 Days).");

    console.log(`\n========================================`);
    console.log(`🎉 ALL DUMMY DATA SUCCESSFULLY SEEDED!`);
    console.log(`========================================\n`);

    process.exit();
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  }
};

runSeed();
