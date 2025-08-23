import { useState } from "react";
import { SignalCard } from "@/components/SignalCard";
import { TalentCard } from "@/components/TalentCard";
import { PersonalizedMessage } from "@/components/PersonalizedMessage";
import { CompanyTargeting } from "@/components/CompanyTargeting";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Target, Zap, Settings } from "lucide-react";

// Mock data for talent affected by layoffs
const mockTalent = [
  {
    name: "Sarah Lee",
    title: "Software Engineer",
    company: "Acme Corp",
    location: "San Francisco, CA",
    layoffDate: "March 2024",
    skills: ["React", "Node.js", "Python", "AWS"],
    matchScore: 92
  },
  {
    name: "Alex Nguyen", 
    title: "Senior Front-End Engineer",
    company: "Beta Corp",
    location: "San Francisco, CA",
    layoffDate: "February 2024",
    skills: ["Vue.js", "TypeScript", "GraphQL"],
    matchScore: 88
  },
  {
    name: "Jordan Kim",
    title: "Full-Stack Developer", 
    company: "Gamma Inc",
    location: "San Francisco, CA",
    layoffDate: "March 2024",
    skills: ["JavaScript", "Python", "Docker"],
    matchScore: 85
  }
];

const Index = () => {
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePersonalize = (talentName: string) => {
    setSelectedTalent(talentName);
  };

  const filteredTalent = mockTalent.filter(talent => 
    talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Timing-Aware Recruiting Copilot</h1>
                <p className="text-sm text-muted-foreground">Find top talent at the perfect moment</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                2,847 active signals
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Signals Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Signals
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <SignalCard
              type="timing"
              title="Perfect Timing"
              description="Funding, hiring surge"
              count={1247}
              trend="up"
            />
            <SignalCard
              type="layoff"
              title="Layoff-to-Liftoff"
              description="Recent layoffs"
              count={1600}
              trend="down"
            />
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="talent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="talent">Engineers Impacted by Layoffs</TabsTrigger>
            <TabsTrigger value="companies">Company Targeting</TabsTrigger>
          </TabsList>

          <TabsContent value="talent" className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search talent by name, title, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  Filter by Skills
                </Button>
                <Button variant="outline">
                  Location
                </Button>
              </div>
            </Card>

            {/* Talent List */}
            <div className="space-y-4">
              {filteredTalent.map((talent, index) => (
                <TalentCard
                  key={index}
                  {...talent}
                  onPersonalize={() => handlePersonalize(talent.name)}
                />
              ))}
            </div>

            {/* Personalized Message */}
            {selectedTalent && (
              <PersonalizedMessage
                talentName={selectedTalent}
                company={mockTalent.find(t => t.name === selectedTalent)?.company || ""}
                layoffContext={`Layoffs at ${mockTalent.find(t => t.name === selectedTalent)?.company} — March 2024`}
                onClose={() => setSelectedTalent(null)}
              />
            )}
          </TabsContent>

          <TabsContent value="companies">
            <CompanyTargeting />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
