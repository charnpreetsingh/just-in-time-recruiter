import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TalentCard } from "@/components/TalentCard";
import { Briefcase, ChevronDown, ChevronUp, Users, AlertCircle, Building, TrendingDown, BarChart, Clock } from "lucide-react";
import { TalentWithMatch } from "@/hooks/useTalent";
import { getUserTenureAnalysis } from "@/utils/tenureAnalysis";

interface RoleCardProps {
  id: string;
  title: string;
  department?: string;
  description?: string;
  requirements?: string[];
  location?: string;
  matchingTalent: TalentWithMatch[];
  onPersonalize?: (talentName: string) => void;
}

export const RoleCard = ({
  id,
  title,
  department,
  description,
  requirements = [],
  location,
  matchingTalent,
  onPersonalize
}: RoleCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [filterByLayoffs, setFilterByLayoffs] = useState<boolean | null>(null); // null = all, true = only layoffs, false = no layoffs
  const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');

  // Calculate tenure statistics for all matching talent
  const tenureStatistics = matchingTalent.map(talent => {
    const analysis = getUserTenureAnalysis(talent.name);
    return {
      name: talent.name,
      isApproachingAverage: analysis.isApproachingAverage,
      percentOfAverage: analysis.percentOfAverage,
      tenureCategory: analysis.tenureCategory
    };
  });
  
  // Count approaching tenure candidates
  const approachingTenureCount = tenureStatistics.filter(t => t.isApproachingAverage).length;
  
  // Filter and sort the talent
  const filteredAndSortedTalent = [...matchingTalent]
    .filter(t => {
      // Layoff filter
      return filterByLayoffs === null || (filterByLayoffs ? !!t.layoff_date : !t.layoff_date);
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        return (b.match_score || 0) - (a.match_score || 0);
      } else {
        // Sort by layoff date (most recent first)
        if (!a.layoff_date && !b.layoff_date) return 0;
        if (!a.layoff_date) return 1;
        if (!b.layoff_date) return -1;
        return new Date(b.layoff_date).getTime() - new Date(a.layoff_date).getTime();
      }
    });

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground">{title}</h3>
              {department && <p className="text-sm text-muted-foreground">{department}</p>}
              {location && <p className="text-xs text-muted-foreground">{location}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {matchingTalent.length} matches
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {requirements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {requirements.map((req, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
          </div>
        )}
        
        {expanded && matchingTalent.length > 0 && (
          <div className="mt-6 space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Matching Candidates ({matchingTalent.length})</h4>
              
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <span>Layoff Affected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-muted"></div>
                  <span>Active Employee</span>
                </div>
              </div>
            </div>
            
            {/* Filters and sort options */}
            <div className="flex justify-between items-center bg-muted/20 p-3 rounded-md">
              {/* Employment Status Filter */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Filter:</span>
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant={filterByLayoffs === null ? "secondary" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => setFilterByLayoffs(null)}
                  >
                    All Candidates
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterByLayoffs === true ? "secondary" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => setFilterByLayoffs(true)}
                  >
                    Layoff Affected
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterByLayoffs === false ? "secondary" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => setFilterByLayoffs(false)}
                  >
                    Active Employees
                  </Button>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort by:</span>
                <Button 
                  size="sm" 
                  variant={sortBy === 'match' ? "secondary" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setSortBy('match')}
                >
                  Match Score
                </Button>
                <Button 
                  size="sm" 
                  variant={sortBy === 'recent' ? "secondary" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setSortBy('recent')}
                >
                  Recent Impact
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredAndSortedTalent.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">
                  No candidates match the current filter criteria
                </div>
              ) : (
                filteredAndSortedTalent.map((talent) => (
                  <div key={talent.id} className={`rounded-md ${talent.layoff_date ? 'border-l-4 border-destructive' : ''}`}>
                    <TalentCard
                      name={talent.name}
                      title={talent.title}
                      company={talent.company}
                      location={talent.location || ""}
                      layoffDate={talent.layoff_date || ""}
                      skills={talent.skills}
                      matchScore={talent.match_score || 0}
                      matchReasons={talent.match_reasons || []}
                      onPersonalize={onPersonalize ? () => onPersonalize(talent.name) : undefined}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};