import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Building2, TrendingDown, Users, Calendar } from "lucide-react";
import { useState } from "react";

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

export const CompanyWatch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || company.industry.toLowerCase() === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

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
      </div>

      <div className="space-y-4">
        {filteredCompanies.map((company, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-all duration-200">
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
                <Badge 
                  variant={company.growthTrend === 'down' ? "destructive" : "default"}
                  className={company.growthTrend === 'up' ? "bg-success text-success-foreground" : ""}
                >
                  {company.growthTrend === 'up' ? 'Growing' : 
                   company.growthTrend === 'down' ? 'Downsizing' : 'Stable'}
                </Badge>
                <div>
                  <Button variant="outline" size="sm">
                    View Employees
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};