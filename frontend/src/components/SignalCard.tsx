import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Rocket, Heart, Info, PieChart, BarChart3, Calendar, ChevronRight, Clock, ArrowRight, LineChart, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";


interface SignalCardProps {
  type: 'timing' | 'layoff';
  title: string;
  description: string;
  count?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const SignalCard = ({ type, title, description, count, trend }: SignalCardProps) => {
  const [open, setOpen] = useState(false);
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

  // Modal content based on card type
  const renderModalContent = () => {
    if (type === 'timing') {
      return (
        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Breakdown of To the Moon Signals
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success">
                    42%
                  </Badge>
                  <span className="font-medium">Company Growth Indicators</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="text-sm text-muted-foreground pl-10">
                <div className="flex items-center justify-between">
                  <span>Recent funding announcements</span>
                  <span className="font-medium text-success">26%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hiring surge detected</span>
                  <span className="font-medium text-success">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Positive earning reports</span>
                  <span className="font-medium text-success">4%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    38%
                  </Badge>
                  <span className="font-medium">Market Signals</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="text-sm text-muted-foreground pl-10">
                <div className="flex items-center justify-between">
                  <span>Industry growth trends</span>
                  <span className="font-medium text-blue-600">17%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Competitors expanding</span>
                  <span className="font-medium text-blue-600">11%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Strategic partnerships formed</span>
                  <span className="font-medium text-blue-600">10%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                    20%
                  </Badge>
                  <span className="font-medium">Team Signals</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="text-sm text-muted-foreground pl-10">
                <div className="flex items-center justify-between">
                  <span>Leadership changes</span>
                  <span className="font-medium text-purple-600">8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Department restructuring</span>
                  <span className="font-medium text-purple-600">7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Increased recruiter activity</span>
                  <span className="font-medium text-purple-600">5%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Updated 2 hours ago</span>
            </div>
            <Button size="sm" variant="outline" className="gap-1">
              <LineChart className="h-4 w-4" />
              View Trends
            </Button>
          </div>
        </div>
      );
    } else if (type === 'layoff') {
      return (
        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-layoff" />
              Breakdown of Layoff Signals
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-layoff/10 text-layoff border-layoff">
                    45%
                  </Badge>
                  <span className="font-medium">Recent Major Layoffs</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="text-sm text-muted-foreground pl-10">
                <div className="flex items-center justify-between">
                  <span>Tech industry</span>
                  <span className="font-medium text-layoff">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Finance industry</span>
                  <span className="font-medium text-layoff">13%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Retail industry</span>
                  <span className="font-medium text-layoff">10%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    32%
                  </Badge>
                  <span className="font-medium">Approaching Tenure</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="text-sm text-muted-foreground pl-10">
                <div className="flex items-center justify-between">
                  <span>Approaching average tenure</span>
                  <span className="font-medium text-amber-600">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Industry-specific tenure patterns</span>
                  <span className="font-medium text-amber-600">14%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    23%
                  </Badge>
                  <span className="font-medium">Company Sentiment</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="text-sm text-muted-foreground pl-10">
                <div className="flex items-center justify-between">
                  <span>Low morale indicators</span>
                  <span className="font-medium text-blue-600">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Declining glassdoor ratings</span>
                  <span className="font-medium text-blue-600">11%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Updated 1 hour ago</span>
            </div>
            <Button size="sm" variant="outline" className="gap-1">
              <Building2 className="h-4 w-4" />
              View Companies
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary cursor-pointer">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`p-2 rounded-lg ${getIconBg()}`}>
              {getIcon()}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
                  {trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-layoff" />
                  )}
                  <span className={trend === 'up' ? "text-success font-medium" : "text-layoff font-medium"}>
                    {trend === 'up' ? '+15%' : trend === 'down' ? '-8%' : '0%'} this week
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${getIconBg()}`}>
              {getIcon()}
            </div>
            <span>{title} Breakdown</span>
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of the {title.toLowerCase()} signals across the platform.
          </DialogDescription>
        </DialogHeader>
        
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
};