import countryData from "../../countries.json";

export const getDailyCountry = () => {
  const today = new Date();
  // create a stable string key for today: "2026-05-02"
  const dateKey = today.toISOString().split('T')[0];
  
  // simple hash function to turn the date string into a number
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = dateKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // use the hash to pick a country index
  const index = Math.abs(hash) % countryData.length;
  return countryData[index];
};

export const isDailyPlayed = () => {
  const lastDate = localStorage.getItem("last_daily_played");
  const today = new Date().toISOString().split('T')[0];
  return lastDate === today;
};