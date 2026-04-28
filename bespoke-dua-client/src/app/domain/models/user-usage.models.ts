export interface UserUsage {
  dailyRequests: number;
  monthlyRequests: number;
  lastRequestDate: string | null;
  plan: string | null;
}
