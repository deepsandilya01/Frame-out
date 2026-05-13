import { userService } from '../service/user.service';

const toStartOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const isMissedDeadlineTask = (task, now = new Date()) => {
  if (!task?.deadline || task.deadlinePenaltyAppliedAt) {
    return false;
  }

  const deadline = toStartOfDay(task.deadline);
  if (!deadline) return false;

  if (task.status === 'completed') {
    const completedAt = toStartOfDay(task.completedAt);
    return Boolean(completedAt && deadline < completedAt);
  }

  const today = toStartOfDay(now);
  return Boolean(today && deadline < today);
};

export const applyMissedDeadlinePenalties = async (tasks = []) => {
  const missedTasks = tasks.filter(isMissedDeadlineTask);
  if (missedTasks.length === 0) return [];

  const results = await Promise.allSettled(
    missedTasks.map(task => userService.missDeadline(task._id))
  );

  return results
    .filter(result => result.status === 'fulfilled' && result.value?.task)
    .map(result => result.value.task);
};
