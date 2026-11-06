// Small localStorage wrapper. Progress stays in this browser; nothing is sent anywhere.
const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the app still works, progress just isn't saved.
  }
};

export const getScores = () => read('ai103.scores', {});
export const saveScore = (id, pct) => {
  const scores = getScores();
  scores[id] = Math.max(scores[id] || 0, pct);
  write('ai103.scores', scores);
};
export const getChecked = () => read('ai103.skills', {});
export const saveChecked = value => write('ai103.skills', value);
