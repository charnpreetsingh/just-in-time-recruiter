// Types for career history and tenure analysis
export interface JobHistory {
  company: string;
  title: string;
  startDate: string; // ISO format date string
  endDate: string | null; // ISO format date string, null if current position
  durationMonths: number;
}

export interface TenureAnalysis {
  averageTenureMonths: number;
  currentTenureMonths: number | null; // null if not currently employed
  isApproachingAverage: boolean;
  percentOfAverage: number | null; // null if not currently employed
  tenureCategory: 'short' | 'average' | 'long' | null; // null if not currently employed
}

/**
 * Calculate average tenure across job history
 * @param history Array of job history items
 * @returns Average tenure in months
 */
export function calculateAverageTenure(history: JobHistory[]): number {
  if (history.length === 0) return 0;
  
  const completedJobs = history.filter(job => job.endDate !== null);
  
  if (completedJobs.length === 0) return 0;
  
  const totalMonths = completedJobs.reduce((sum, job) => sum + job.durationMonths, 0);
  return Math.round(totalMonths / completedJobs.length);
}

/**
 * Calculate current tenure in months
 * @param history Array of job history items
 * @returns Current tenure in months or null if not currently employed
 */
export function calculateCurrentTenure(history: JobHistory[]): number | null {
  const currentJob = history.find(job => job.endDate === null);
  return currentJob ? currentJob.durationMonths : null;
}

/**
 * Determine if a user is approaching their average tenure
 * @param averageTenureMonths Average tenure in months
 * @param currentTenureMonths Current tenure in months
 * @returns Boolean indicating if user is approaching average tenure (within 90%)
 */
export function isApproachingAverageTenure(
  averageTenureMonths: number, 
  currentTenureMonths: number | null
): boolean {
  if (currentTenureMonths === null || averageTenureMonths === 0) return false;
  
  const percentage = (currentTenureMonths / averageTenureMonths) * 100;
  return percentage >= 85 && percentage < 100;
}

/**
 * Calculate what percentage of average tenure the current tenure represents
 * @param averageTenureMonths Average tenure in months
 * @param currentTenureMonths Current tenure in months
 * @returns Percentage of average tenure
 */
export function calculatePercentageOfAverage(
  averageTenureMonths: number, 
  currentTenureMonths: number | null
): number | null {
  if (currentTenureMonths === null || averageTenureMonths === 0) return null;
  
  return Math.round((currentTenureMonths / averageTenureMonths) * 100);
}

/**
 * Categorize tenure length
 * @param averageTenureMonths Average tenure in months
 * @param currentTenureMonths Current tenure in months
 * @returns Tenure category
 */
export function categorizeTenure(
  averageTenureMonths: number, 
  currentTenureMonths: number | null
): 'short' | 'average' | 'long' | null {
  if (currentTenureMonths === null || averageTenureMonths === 0) return null;
  
  const percentage = (currentTenureMonths / averageTenureMonths) * 100;
  
  if (percentage < 75) return 'short';
  if (percentage > 125) return 'long';
  return 'average';
}

/**
 * Perform full tenure analysis
 * @param history Array of job history items
 * @returns Tenure analysis object
 */
export function analyzeTenure(history: JobHistory[]): TenureAnalysis {
  const averageTenureMonths = calculateAverageTenure(history);
  const currentTenureMonths = calculateCurrentTenure(history);
  const isApproaching = isApproachingAverageTenure(averageTenureMonths, currentTenureMonths);
  const percentOfAverage = calculatePercentageOfAverage(averageTenureMonths, currentTenureMonths);
  const tenureCategory = categorizeTenure(averageTenureMonths, currentTenureMonths);
  
  return {
    averageTenureMonths,
    currentTenureMonths,
    isApproachingAverage: isApproaching,
    percentOfAverage,
    tenureCategory
  };
}

/**
 * Format number of months into years and months
 * @param months Number of months
 * @returns Formatted string (e.g. "2y 3m")
 */
export function formatTenure(months: number | null): string {
  if (months === null) return 'N/A';
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) return `${remainingMonths}m`;
  if (remainingMonths === 0) return `${years}y`;
  return `${years}y ${remainingMonths}m`;
}

/**
 * Mock job history data for demo purposes
 * Will be replaced with actual data from user profiles
 */
export const mockJobHistories: Record<string, JobHistory[]> = {
  // Alex Nguyen (Senior Front-End Engineer at Beta Corp)
  "Alex Nguyen": [
    {
      company: "Beta Corp",
      title: "Senior Front-End Engineer",
      startDate: "2022-01-01",
      endDate: "2024-02-15", // Laid off
      durationMonths: 25
    },
    {
      company: "TechSolutions Inc",
      title: "Front-End Engineer",
      startDate: "2019-03-01",
      endDate: "2021-12-31",
      durationMonths: 34
    },
    {
      company: "WebDev Co",
      title: "Junior Developer",
      startDate: "2017-06-01",
      endDate: "2019-02-28",
      durationMonths: 21
    }
  ],
  
  // Jordan Kim (Full-Stack Developer at Gamma Inc)
  "Jordan Kim": [
    {
      company: "Gamma Inc",
      title: "Full-Stack Developer",
      startDate: "2022-04-01",
      endDate: null, // Current position
      durationMonths: 28 // As of August 2024
    },
    {
      company: "DataSystems",
      title: "Backend Developer",
      startDate: "2019-09-01",
      endDate: "2022-03-31",
      durationMonths: 31
    },
    {
      company: "StartupXYZ",
      title: "Junior Developer",
      startDate: "2018-01-01",
      endDate: "2019-08-31",
      durationMonths: 20
    }
  ],
  
  // Logan McNeil (Senior Software Development Engineer at Google)
  "Logan McNeil": [
    {
      company: "Google",
      title: "Senior Software Development Engineer",
      startDate: "2021-06-01",
      endDate: "2024-03-15", // Laid off
      durationMonths: 33
    },
    {
      company: "Microsoft",
      title: "Software Engineer II",
      startDate: "2018-01-01",
      endDate: "2021-05-31",
      durationMonths: 41
    },
    {
      company: "Amazon",
      title: "Software Engineer I",
      startDate: "2015-07-01",
      endDate: "2017-12-31",
      durationMonths: 30
    }
  ],

  // Sarah Johnson (Senior Front-End Engineer at TechNova)
  "Sarah Johnson": [
    {
      company: "TechNova",
      title: "Senior Front-End Engineer",
      startDate: "2021-11-01",
      endDate: null, // Current position
      durationMonths: 33 // As of August 2024
    },
    {
      company: "DesignLab",
      title: "UI Engineer",
      startDate: "2018-04-01",
      endDate: "2021-10-31",
      durationMonths: 43
    },
    {
      company: "CreativeStudio",
      title: "Frontend Developer",
      startDate: "2016-01-01",
      endDate: "2018-03-31",
      durationMonths: 27
    }
  ],
  
  // Default mock history for other users
  "default": [
    {
      company: "Current Company",
      title: "Current Position",
      startDate: "2022-01-01",
      endDate: null,
      durationMonths: 31 // As of August 2024
    },
    {
      company: "Previous Company",
      title: "Previous Position",
      startDate: "2019-01-01",
      endDate: "2021-12-31",
      durationMonths: 36
    },
    {
      company: "Earlier Company",
      title: "Earlier Position",
      startDate: "2016-05-01",
      endDate: "2018-12-31",
      durationMonths: 32
    }
  ]
};

/**
 * Get job history for a specific user
 * @param name User name
 * @returns Job history array
 */
export function getJobHistory(name: string): JobHistory[] {
  return mockJobHistories[name] || mockJobHistories["default"];
}

/**
 * Get tenure analysis for a specific user
 * @param name User name
 * @returns Tenure analysis object
 */
export function getUserTenureAnalysis(name: string): TenureAnalysis {
  const history = getJobHistory(name);
  return analyzeTenure(history);
}