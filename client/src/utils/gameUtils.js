import countryData from "../../countries.json";

export const getDailyCountry = () => {
  const today = new Date();
  // stable key like "2026-05-02" so every player sees the same country today
  const dateKey = today.toISOString().split('T')[0];

  // tiny hash so the date string maps to a deterministic country index
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = dateKey.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % countryData.length;
  return countryData[index];
};