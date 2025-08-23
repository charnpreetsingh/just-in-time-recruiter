import { useState, useEffect } from "react";
import { SignalCard } from "@/components/SignalCard";
import { TalentCard } from "@/components/TalentCard";
import { RoleCard } from "@/components/RoleCard";
import { PersonalizedMessage } from "@/components/PersonalizedMessage";
import { CompanyWatch } from "@/components/CompanyWatch";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Target, Zap, Settings, Loader2, Briefcase } from "lucide-react";
import { useTalent, useRoles } from "@/hooks/useTalent";

const Index = () => {
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showOnlyWithLayoffMatches, setShowOnlyWithLayoffMatches] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("roles");
  const [filterBySkill, setFilterBySkill] = useState<string | null>(null);
  const [showSentimentIssues, setShowSentimentIssues] = useState<boolean>(false);
  const [showApproachingTenure, setShowApproachingTenure] = useState<boolean>(false);

  const { data: talent = [], isLoading: talentLoading, error: talentError } = useTalent();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  const handlePersonalize = (talentName: string) => {
    setSelectedTalent(talentName);
  };

  // Get unique departments for filter
  const uniqueDepartments = Array.from(new Set(roles.map(r => r.department || "Uncategorized")));
  
  // Filter roles based on search and department filters
  const filteredRoles = roles.filter(role => {
    // Filter by search term
    const matchesSearch = searchTerm === "" ||
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (role.department && role.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by department
    const departmentValue = role.department || "Uncategorized";
    const matchesDepartment = selectedDepartment === "all" || departmentValue === selectedDepartment;
    
    // Filter by layoff matches if option is selected
    let hasLayoffMatches = true;
    if (showOnlyWithLayoffMatches) {
      const matchingTalent = talent.filter(t => t.role_id === role.id);
      hasLayoffMatches = matchingTalent.some(t => t.layoff_date);
    }
    
    // Filter by skill if set by chatbot
    let hasSkillMatch = true;
    if (filterBySkill) {
      const matchingTalent = talent.filter(t => t.role_id === role.id);
      hasSkillMatch = matchingTalent.some(t => 
        t.skills && 
        t.skills.some(skill => 
          skill.toLowerCase().includes(filterBySkill.toLowerCase())
        )
      );
    }
    
    return matchesSearch && matchesDepartment && hasLayoffMatches && hasSkillMatch;
  });

  // Reset skill filter when search term changes - ensure this hook is always called
  useEffect(() => {
    // No conditional hook execution to ensure consistent hook calls
    if (searchTerm === "") {
      setFilterBySkill(null);
    }
  }, [searchTerm]);
  
  // Render loading or error states without early returns to avoid hook inconsistencies
  let content;
  if (talentLoading) {
    content = (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading talent data...</span>
        </div>
      </div>
    );
  } else if (talentError) {
    content = (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading talent data</p>
          <p className="text-sm text-muted-foreground">{talentError.message}</p>
        </div>
      </div>
    );
  }

  // Handle filter actions from the chatbot
  const handleChatFilterAction = (action: { type: string; value: any }) => {
    console.log("Chat filter action:", action);
    
    // Handle different types of filter actions
    switch (action.type) {
      case 'company':
        // Set search term to company name
        setSearchTerm(action.value);
        break;
        
      case 'skill':
        // Filter by skill
        setFilterBySkill(action.value);
        break;
        
      case 'layoff':
        // Show only roles with layoff matches
        setShowOnlyWithLayoffMatches(action.value);
        break;
      
      case 'approaching_tenure':
        // Set flag and switch to companies tab
        setShowApproachingTenure(action.value);
        setCurrentTab('companies');
        break;
        
      case 'sentiment_issues':
        // Set flag and switch to companies tab
        setShowSentimentIssues(action.value);
        setCurrentTab('companies');
        break;
        
      case 'tab':
        // Switch between tabs
        setCurrentTab(action.value);
        break;
        
      default:
        console.log("Unknown filter action type:", action.type);
    }
  };
  
  // If we have loading or error content, return that instead of the main UI
  if (content) {
    return content;
  }
  
  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg flex items-center justify-center">
                <img src="/favicon-logo.png" alt="JumpShip Logo" className="h-14 w-14 md:h-16 md:w-16 lg:h-20 lg:w-20" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">JumpShip</h1>
                <p className="text-sm text-muted-foreground">Finding top talent at the perfect moment</p>
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
              title="To the Moon"
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
        <Tabs defaultValue="roles" value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles">Open Roles</TabsTrigger>
            <TabsTrigger value="companies">Company Watch</TabsTrigger>
          </TabsList>


          <TabsContent value="roles" className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles by title, department, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant={showOnlyWithLayoffMatches ? "default" : "outline"}
                  onClick={() => setShowOnlyWithLayoffMatches(!showOnlyWithLayoffMatches)}
                  className="whitespace-nowrap"
                >
                  {showOnlyWithLayoffMatches ? "✓ With Layoff Matches" : "Show Only With Layoff Matches"}
                </Button>
              </div>
            </Card>
            
            {/* Role List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Open Roles ({filteredRoles.length})
              </h2>
              
              {rolesLoading ? (
                <Card className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading roles...</span>
                  </div>
                </Card>
              ) : filteredRoles.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No roles found matching your criteria.</p>
                </Card>
              ) : (
                filteredRoles.map((role) => {
                  // Find all talent that match this role
                  const matchingTalent = talent.filter(t => t.role_id === role.id);
                  
                  return (
                    <RoleCard
                      key={role.id}
                      id={role.id}
                      title={role.title}
                      department={role.department || undefined}
                      description={role.description || undefined}
                      requirements={role.requirements || []}
                      location={role.location || undefined}
                      matchingTalent={matchingTalent}
                      onPersonalize={handlePersonalize}
                    />
                  );
                })
              )}
            </div>
            
            {selectedTalent && (
              <PersonalizedMessage
                talentName={selectedTalent}
                company={talent.find(t => t.name === selectedTalent)?.company || ""}
                layoffContext={`Layoffs at ${talent.find(t => t.name === selectedTalent)?.company} — ${talent.find(t => t.name === selectedTalent)?.layoff_date}`}
                onClose={() => setSelectedTalent(null)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="companies">
            <CompanyWatch 
              initialSearchTerm={searchTerm}
              initialShowSentimentIssues={showSentimentIssues}
              initialShowApproachingTenure={showApproachingTenure}
            />
          </TabsContent>
        </Tabs>
      </div>
      {/* AI Chatbot Interface */}
      <ChatInterface onFilterAction={handleChatFilterAction} />
    </div>
  );
};

export default Index;
