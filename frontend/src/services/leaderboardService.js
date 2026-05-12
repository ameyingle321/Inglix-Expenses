import { fetchWithAuth } from './apiClient';

export const leaderboardService = {
  /**
   * Get the leaderboard statistics for the user's contacts
   */
  getLeaderboard: () => fetchWithAuth('/leaderboard')
};
