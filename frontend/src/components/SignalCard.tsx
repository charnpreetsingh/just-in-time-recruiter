import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Rocket, Heart } from "lucide-react";

interface SignalCardProps {
  type: 'timing' | 'layoff';
  title: string;
  description: string;
  count?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const SignalCard = ({ type, title, description, count, trend }: SignalCardProps) => {
  const getIcon = () => {
    if (type === 'timing') return <Rocket className="h-5 w-5" />;
    if (type === 'layoff') return <Heart className="h-5 w-5" />;
    return <TrendingUp className="h-5 w-5" />;
  };

  const getIconBg = () => {
    if (type === 'timing') return 'bg-success text-success-foreground';
    if (type === 'layoff') return 'bg-layoff text-layoff-foreground';
    return 'bg-primary text-primary-foreground';
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${getIconBg()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-card-foreground">{title}</h3>
            {count && (
              <Badge variant="secondary" className="text-sm">
                {count.toLocaleString()} signals
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{description}</p>
          {trend && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-success font-medium">
                {trend === 'up' ? '+15%' : trend === 'down' ? '-8%' : '0%'} this week
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};