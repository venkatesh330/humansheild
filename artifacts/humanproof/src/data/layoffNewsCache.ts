// layoffNewsCache.ts
// recent layoff events (refreshed weekly)

export interface LayoffNewsEvent {
  companyName: string;
  date: string;
  headline: string;
  percentCut: number;
  source: string;
  url: string;
  affectedDepartments: string[];
}

export const layoffNewsCache: LayoffNewsEvent[] = [
  {
    companyName: 'Oracle',
    date: '2026-04-01',
    headline: 'Oracle begins laying off estimated 30,000 employees amid AI infrastructure spending concerns',
    percentCut: 21,
    source: 'Crunchbase News',
    url: 'https://news.crunchbase.com/',
    affectedDepartments: ['Sales', 'Marketing', 'HR', 'Finance'],
  },
  {
    companyName: 'Amazon',
    date: '2026-01-15',
    headline: 'Amazon lays off 16,000 employees to reduce management layers and reallocate to AI',
    percentCut: 1,
    source: 'TechCrunch',
    url: 'https://techcrunch.com/',
    affectedDepartments: ['Management', 'Sales', 'Operations'],
  },
  {
    companyName: 'Meta',
    date: '2026-01-10',
    headline: 'Meta cuts 1,500 employees from Reality Labs division',
    percentCut: 3,
    source: 'InformationWeek',
    url: 'https://www.informationweek.com/',
    affectedDepartments: ['VR/AR', 'Engineering', 'Research'],
  },
];
