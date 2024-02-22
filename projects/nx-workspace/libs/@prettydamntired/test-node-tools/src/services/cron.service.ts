import axios from 'axios';

export class CronService {
  static async getOrigins(): Promise<string[]> {
    try {
      const response = await axios.get(
        'https://api.cron-job.org/executor-nodes.json',
      );
      return response.data.ipAddresses;
    } catch (error) {
      console.error('Error fetching IP addresses:', error.message);
      return [];
    }
  }
}
