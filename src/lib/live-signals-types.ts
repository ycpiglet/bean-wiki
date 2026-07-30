export type LiveRankItem = {
  slug: string;
  title: string;
  views: number;
};

export type LiveTrendItem = LiveRankItem & {
  ratio: number;
};

export type LiveSignals = {
  available: boolean;
  generatedAt: string;
  refreshSeconds: number;
  today: {
    views: number;
    visitors: number;
  };
  retained: {
    days: number;
    views: number;
    dailyVisitors: number;
  };
  articleCount: number;
  trend: {
    day: string;
    views: number;
    visitors: number;
  }[];
  popular: {
    day: LiveRankItem[];
    week: LiveRankItem[];
    month: LiveRankItem[];
  };
  trending: LiveTrendItem[];
};
