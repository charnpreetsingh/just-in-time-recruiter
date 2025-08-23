import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Building2, TrendingDown, Users, Calendar, Loader2, BarChart, AlertCircle, Clock } from "lucide-react";
import { TalentCard } from "@/components/TalentCard";
import { TalentWithMatch, useTalent } from "@/hooks/useTalent";
import { supabase } from "@/integrations/supabase/client";
import { getUserTenureAnalysis } from "@/utils/tenureAnalysis";

interface CompanyMetrics {
  name: string;
  industry: string;
  employeeCount: number;
  recentLayoffs: number;
  growthTrend: 'up' | 'down' | 'stable';
  lastUpdate: string;
  hiringSignals: string[];
}

const mockCompanies: CompanyMetrics[] = [
  {
    name: "Acme Corp",
    industry: "Technology",
    employeeCount: 15000,
    recentLayoffs: 1500,
    growthTrend: 'down',
    lastUpdate: "March 2024",
    hiringSignals: ["Engineering", "Product", "Design"]
  },
  {
    name: "Beta Corp", 
    industry: "Fintech",
    employeeCount: 8000,
    recentLayoffs: 800,
    growthTrend: 'down',
    lastUpdate: "February 2024",
    hiringSignals: ["Backend", "Frontend", "DevOps"]
  },
  {
    name: "Gamma Inc",
    industry: "E-commerce",
    employeeCount: 12000,
    recentLayoffs: 0,
    growthTrend: 'up',
    lastUpdate: "March 2024",
    hiringSignals: ["Full-Stack", "ML", "Data"]
  }
];

// Define company metrics since this isn't stored in Supabase
const companyMetrics = {
  "Beta Corp": {
    industry: "Fintech",
    employeeCount: 8000,
    recentLayoffs: 800,
    growthTrend: 'down' as const,
    lastUpdate: "February 2024",
    hiringSignals: ["Backend", "Frontend", "DevOps"],
    sentiment: {
      glassdoorRating: 3.2,
      ratingTrend: 'down',
      morale: 'low',
      issues: ["Benefits reduction", "Missed earnings", "Leadership changes"]
    }
  },
  "Gamma Inc": {
    industry: "E-commerce",
    employeeCount: 12000,
    recentLayoffs: 0,
    growthTrend: 'up' as const,
    lastUpdate: "March 2024",
    hiringSignals: ["Full-Stack", "ML", "Data"],
    sentiment: {
      glassdoorRating: 3.6,
      ratingTrend: 'stable',
      morale: 'moderate',
      issues: ["Recent leadership changes"]
    }
  },
  "Google": {
    industry: "Technology",
    employeeCount: 180000,
    recentLayoffs: 1000,
    growthTrend: 'down' as const,
    lastUpdate: "March 2024",
    hiringSignals: ["Engineering", "Product", "Cloud"],
    sentiment: {
      glassdoorRating: 4.1,
      ratingTrend: 'down',
      morale: 'declining',
      issues: ["Recent layoffs", "Project cancellations", "Management changes"]
    }
  },
  "TechNova": {
    industry: "Technology",
    employeeCount: 5000,
    recentLayoffs: 0,
    growthTrend: 'stable' as const,
    lastUpdate: "March 2024",
    hiringSignals: ["Frontend", "UX", "Mobile"],
    sentiment: {
      glassdoorRating: 3.8,
      ratingTrend: 'down',
      morale: 'declining',
      issues: ["Poor work-life balance", "Canceled bonuses", "Increased workload"]
    }
  },
  "CloudBurst Systems": {
    industry: "Cloud Services",
    employeeCount: 3000,
    recentLayoffs: 0,
    growthTrend: 'stable' as const,
    lastUpdate: "March 2024",
    hiringSignals: ["Cloud", "DevOps", "Infrastructure"],
    sentiment: {
      glassdoorRating: 3.9,
      ratingTrend: 'stable',
      morale: 'moderate',
      issues: ["Average compensation", "Long working hours"]
    }
  },
  "InnovateHub": {
    industry: "Software",
    employeeCount: 1200,
    recentLayoffs: 0,
    growthTrend: 'up' as const,
    lastUpdate: "March 2024",
    hiringSignals: ["Backend", "API", "Databases"],
    sentiment: {
      glassdoorRating: 4.1,
      ratingTrend: 'up',
      morale: 'good',
      issues: []
    }
  },
  "PixelPerfect": {
    industry: "Design",
    employeeCount: 800,
    recentLayoffs: 0,
    growthTrend: 'down' as const,
    lastUpdate: "March 2024",
    hiringSignals: ["UI/UX", "Design Systems", "Visual"],
    sentiment: {
      glassdoorRating: 3.5,
      ratingTrend: 'down',
      morale: 'low',
      issues: ["Staff turnover", "Unclear direction", "Poor communication"]
    }
  }
};

interface CompanyWatchProps {
  initialSearchTerm?: string;
  initialShowSentimentIssues?: boolean;
  initialShowApproachingTenure?: boolean;
}

export const CompanyWatch = ({
  initialSearchTerm = "",
  initialShowSentimentIssues = false,
  initialShowApproachingTenure = false
}: CompanyWatchProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [showSentimentIssues, setShowSentimentIssues] = useState<boolean>(initialShowSentimentIssues);
  const [showApproachingTenure, setShowApproachingTenure] = useState<boolean>(initialShowApproachingTenure);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [companyTalent, setCompanyTalent] = useState<{[key: string]: TalentWithMatch[]}>({});
  const [loading, setLoading] = useState<boolean>(false);
  
  // Use the existing talent data hook
  const { data: talent = [], isLoading: talentLoading } = useTalent();
  
  // Update state when props change - moved before any conditional rendering
  useEffect(() => {
    // Always set the state without conditions to avoid varying hook calls
    setSearchTerm(initialSearchTerm);
    setShowSentimentIssues(initialShowSentimentIssues);
    setShowApproachingTenure(initialShowApproachingTenure);
  }, [initialSearchTerm, initialShowSentimentIssues, initialShowApproachingTenure]);
  
  // Generate company list from talent data
  const companies = Array.from(new Set(talent.map(t => t.company)))
    .map(companyName => ({
      name: companyName,
      industry: companyMetrics[companyName]?.industry || "Technology",
      employeeCount: companyMetrics[companyName]?.employeeCount || 1000,
      recentLayoffs: companyMetrics[companyName]?.recentLayoffs || 0,
      growthTrend: companyMetrics[companyName]?.growthTrend || "stable",
      lastUpdate: companyMetrics[companyName]?.lastUpdate || "March 2024",
      hiringSignals: companyMetrics[companyName]?.hiringSignals || ["Engineering"],
      sentiment: companyMetrics[companyName]?.sentiment || {
        glassdoorRating: 3.8,
        ratingTrend: 'stable',
        morale: 'moderate',
        issues: []
      }
    }));

  // Calculate approaching tenure counts for each company
  const companyApproachingTenure = {};
  talent.forEach(t => {
    if (!companyApproachingTenure[t.company]) {
      companyApproachingTenure[t.company] = 0;
    }
    if (getUserTenureAnalysis(t.name).isApproachingAverage) {
      companyApproachingTenure[t.company]++;
    }
  });

  // Filter companies based on search term, industry, sentiment, and approaching tenure
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || 
      (company.industry && company.industry.toLowerCase() === selectedIndustry.toLowerCase());
    const matchesSentiment = !showSentimentIssues || 
      (company.sentiment && (company.sentiment.morale === 'low' || company.sentiment.morale === 'declining'));
    const matchesApproachingTenure = !showApproachingTenure || 
      (companyApproachingTenure[company.name] && companyApproachingTenure[company.name] > 0);
    return matchesSearch && matchesIndustry && matchesSentiment && matchesApproachingTenure;
  });
  
  // Group talent by company
  useEffect(() => {
    if (!talentLoading && talent.length > 0) {
      const talentByCompany: {[key: string]: TalentWithMatch[]} = {};
      
      talent.forEach(t => {
        if (!talentByCompany[t.company]) {
          talentByCompany[t.company] = [];
        }
        talentByCompany[t.company].push(t);
      });
      
      setCompanyTalent(talentByCompany);
    }
  }, [talent, talentLoading]);

  const handleViewEmployees = (companyName: string) => {
    setActiveCompany(companyName === activeCompany ? null : companyName);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Company Watch</h2>
        <Badge variant="secondary" className="text-sm">
          {filteredCompanies.length} companies tracked
        </Badge>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="fintech">Fintech</SelectItem>
            <SelectItem value="e-commerce">E-commerce</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant={showSentimentIssues ? "default" : "outline"}
          className={showSentimentIssues ? "border-amber-500 bg-amber-100 hover:bg-amber-200 text-amber-700" : "border-amber-500 text-amber-500 hover:bg-amber-50"}
          onClick={() => setShowSentimentIssues(!showSentimentIssues)}
        >
          <BarChart className="h-4 w-4 mr-2" />
          {showSentimentIssues ? "✓ Sentiment Issues" : "Filter Sentiment Issues"}
        </Button>
        <Button 
          variant={showApproachingTenure ? "default" : "outline"}
          className={showApproachingTenure ? "border-blue-500 bg-blue-100 hover:bg-blue-200 text-blue-700" : "border-blue-500 text-blue-500 hover:bg-blue-50"}
          onClick={() => setShowApproachingTenure(!showApproachingTenure)}
        >
          <Clock className="h-4 w-4 mr-2" />
          {showApproachingTenure ? "✓ Approaching Tenure" : "Show Approaching Tenure"}
        </Button>
      </div>

      <div className="space-y-4">
        {filteredCompanies.map((company, index) => (
          <div key={index} className="space-y-3">
            <Card className="p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary-muted rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {company.employeeCount.toLocaleString()} employees
                      </div>
                      {company.recentLayoffs > 0 && (
                        <div className="flex items-center gap-1 text-layoff">
                          <TrendingDown className="h-4 w-4" />
                          {company.recentLayoffs.toLocaleString()} layoffs
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Updated {company.lastUpdate}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {company.hiringSignals.map((signal, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <div className="flex flex-col gap-1 items-end">
                    <Badge 
                      variant={company.growthTrend === 'down' ? "destructive" : "default"}
                      className={company.growthTrend === 'up' ? "bg-success text-success-foreground" : ""}
                    >
                      {company.growthTrend === 'up' ? 'Growing' : 
                      company.growthTrend === 'down' ? 'Downsizing' : 'Stable'}
                    </Badge>
                    
                    {/* Sentiment badge */}
                    {company.sentiment && (company.sentiment.morale === 'low' || company.sentiment.morale === 'declining') && (
                      <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-500">
                        <BarChart className="h-3 w-3" />
                        {company.sentiment.glassdoorRating}/5 
                        <TrendingDown className="h-3 w-3 ml-0.5" />
                      </Badge>
                    )}
                    {companyApproachingTenure[company.name] > 0 && (
                      <Badge 
                        variant="outline" 
                        className="flex items-center gap-1 border-blue-500 text-blue-500 mt-1">
                        <Clock className="h-3 w-3" />
                        {companyApproachingTenure[company.name]} approaching tenure
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <Button 
                      variant={activeCompany === company.name ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleViewEmployees(company.name)}
                    >
                      {activeCompany === company.name ? "Hide Employees" : "View Employees"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Sentiment details section */}
            {activeCompany === company.name && company.sentiment && (company.sentiment.morale === 'low' || company.sentiment.morale === 'declining') && (
              <div className="pl-10 space-y-2 border-l-2 border-amber-300/50 ml-6 mt-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-medium text-amber-700">Company Sentiment Analysis</h4>
                </div>
                <div className="bg-amber-50 p-2 rounded-md text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-medium">Glassdoor Rating:</span>
                    <span className="flex items-center">
                      {company.sentiment.glassdoorRating}/5
                      {company.sentiment.ratingTrend === 'down' && (
                        <TrendingDown className="h-3 w-3 ml-1 text-amber-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Employee Morale:</span>
                    <span className={`font-medium ${
                      company.sentiment.morale === 'low' ? 'text-red-500' : 
                      company.sentiment.morale === 'declining' ? 'text-amber-600' : 
                      company.sentiment.morale === 'moderate' ? 'text-amber-400' : 
                      'text-green-600'
                    }`}>
                      {company.sentiment.morale.charAt(0).toUpperCase() + company.sentiment.morale.slice(1)}
                    </span>
                  </div>
                  {company.sentiment.issues && company.sentiment.issues.length > 0 && (
                    <div className="pt-1 border-t border-amber-200 mt-1">
                      <span className="font-medium">Reported issues:</span>
                      <ul className="list-disc pl-5 mt-1 space-y-0.5">
                        {company.sentiment.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Employee list for the active company */}
            {activeCompany === company.name && (
              <div className="pl-10 space-y-3 border-l-2 border-primary/30 ml-6">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading employees...</span>
                  </div>
                ) : companyTalent[company.name] && companyTalent[company.name].length > 0 ? (
                  <>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Employees at {company.name} ({companyTalent[company.name].length})
                    </h4>
                    {companyTalent[company.name].map((employee) => (
                      <TalentCard
                        key={employee.id}
                        name={employee.name}
                        title={employee.title}
                        company={employee.company}
                        location={employee.location || ""}
                        layoffDate={employee.layoff_date || ""}
                        skills={employee.skills}
                        matchScore={employee.match_score || 0}
                        matchReasons={employee.match_reasons || []}
                      />
                    ))}
                  </>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No employee data available for this company.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};