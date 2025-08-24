import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, ExternalLink, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Building, Award, TrendingDown, BarChart, Clock } from "lucide-react";
import { getUserTenureAnalysis, formatTenure } from "@/utils/tenureAnalysis";

interface TalentCardProps {
  name: string;
  title: string;
  company: string;
  location: string;
  layoffDate?: string;
  avatar?: string;
  skills?: string[];
  matchScore?: number;
  matchReasons?: string[];
  onPersonalize?: () => void;
  tenureData?: {
    averageTenureMonths: number;
    currentTenureMonths: number | null;
    isApproachingAverage: boolean;
    percentOfAverage: number | null;
    tenureCategory: 'short' | 'average' | 'long' | null;
  };
}

export const TalentCard = ({ 
  name, 
  title, 
  company, 
  location, 
  layoffDate, 
  avatar, 
  skills = [], 
  matchScore,
  matchReasons = [],
  onPersonalize 
}: TalentCardProps) => {
  const [showReasons, setShowReasons] = useState(false);
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3 min-w-0 w-full">
          <div>
            <h3 className="font-semibold text-lg text-card-foreground">{name}</h3>
            <p className="text-muted-foreground">{title}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-medium text-foreground">{company}</p>
              {matchReasons && matchReasons.some(reason => reason.includes('[SENTIMENT]')) && (
                <div className="flex items-center gap-0.5 bg-amber-100 text-amber-700 px-1 py-0.5 rounded-sm text-xs">
                  <TrendingDown className="h-3 w-3" />
                  <span className="font-medium">Sentiment issues</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
            {layoffDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Impacted {layoffDate}
              </div>
            )}
            
            {/* Tenure information */}
            {name && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTenure(getUserTenureAnalysis(name).currentTenureMonths)}
                {getUserTenureAnalysis(name).isApproachingAverage && (
                  <Badge variant="outline" className="ml-1 py-0 h-5 text-xs border-amber-500 text-amber-600">
                    Approaching avg tenure ({formatTenure(getUserTenureAnalysis(name).averageTenureMonths)})
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            {matchScore && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={matchScore >= 80 ? "default" : "secondary"}
                    className={matchScore >= 80 ? "bg-success text-success-foreground" : ""}
                  >
                    {matchScore}% match
                  </Badge>
                  {matchReasons && matchReasons.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReasons(!showReasons);
                      }}
                    >
                      {showReasons ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  )}
                </div>
                
                {showReasons && matchReasons && matchReasons.length > 0 && (
                  <div className="text-xs mt-2 p-3 bg-muted/30 rounded-md space-y-3">
                    <div className="font-medium pb-1 border-b">Match Details</div>
                    
                    {matchReasons.some(r => r.toLowerCase().includes("skill") || r.toLowerCase().includes("experience")) && (
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-1.5 text-success">
                          <Award className="h-3.5 w-3.5" />
                          <span>Matching Skills</span>
                        </div>
                        {matchReasons
                          .filter(r => 
                            (r.toLowerCase().includes("skill") || r.toLowerCase().includes("experience")) && 
                            !r.includes("[SENTIMENT]")
                          )
                          .map((reason, idx) => (
                            <div key={`skill-${idx}`} className="flex items-start gap-1.5 ml-5">
                              <CheckCircle className="h-3 w-3 text-success mt-0.5" />
                              <span>{reason}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    
                    {matchReasons.some(r => r.toLowerCase().includes("company") || r.toLowerCase().includes("worked")) && 
                     !matchReasons.some(r => r.includes("[SENTIMENT]")) && (
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-1.5 text-primary">
                          <Building className="h-3.5 w-3.5" />
                          <span>Company Experience</span>
                        </div>
                        {matchReasons
                          .filter(r => 
                            (r.toLowerCase().includes("company") || r.toLowerCase().includes("worked")) && 
                            !r.includes("[SENTIMENT]")
                          )
                          .map((reason, idx) => (
                            <div key={`company-${idx}`} className="flex items-start gap-1.5 ml-5">
                              <CheckCircle className="h-3 w-3 text-primary mt-0.5" />
                              <span>{reason}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    
                    {/* Sentiment Analysis Section */}
                    {matchReasons.some(r => r.includes("[SENTIMENT]")) && (
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-1.5 text-amber-500">
                          <BarChart className="h-3.5 w-3.5" />
                          <span>Company Sentiment Analysis</span>
                        </div>
                        {matchReasons
                          .filter(r => r.includes("[SENTIMENT]"))
                          .map((reason, idx) => (
                            <div key={`sentiment-${idx}`} className="flex items-start gap-1.5 ml-5">
                              <TrendingDown className="h-3 w-3 text-amber-500 mt-0.5" />
                              <span>{reason.replace("[SENTIMENT] ", "")}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    
                    {/* Other Qualifications Section */}
                    {matchReasons.some(r => 
                      !r.toLowerCase().includes("skill") && 
                      !r.toLowerCase().includes("experience") && 
                      !r.toLowerCase().includes("company") && 
                      !r.toLowerCase().includes("worked") &&
                      !r.includes("[SENTIMENT]")
                    ) && (
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Other Qualifications</span>
                        </div>
                        {matchReasons
                          .filter(r => 
                            !r.toLowerCase().includes("skill") && 
                            !r.toLowerCase().includes("experience") && 
                            !r.toLowerCase().includes("company") && 
                            !r.toLowerCase().includes("worked") &&
                            !r.includes("[SENTIMENT]")
                          )
                          .map((reason, idx) => (
                            <div key={`other-${idx}`} className="flex items-start gap-1.5 ml-5">
                              <CheckCircle className="h-3 w-3 mt-0.5" />
                              <span>{reason}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    
                    {/* Tenure Analysis Section */}
                    {name && (
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-1.5 text-blue-600">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Tenure Analysis</span>
                        </div>
                        {(() => {
                          const tenureData = getUserTenureAnalysis(name);
                          return (
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-xs ml-5">
                                <span>Average Tenure:</span>
                                <span className="font-medium">{formatTenure(tenureData.averageTenureMonths)}</span>
                              </div>
                              <div className="flex justify-between text-xs ml-5">
                                <span>Current Tenure:</span>
                                <span className="font-medium">{formatTenure(tenureData.currentTenureMonths)}</span>
                              </div>
                              {tenureData.percentOfAverage !== null && (
                                <div className="flex justify-between text-xs ml-5">
                                  <span>Percent of Average:</span>
                                  <span className={`font-medium ${tenureData.isApproachingAverage ? 'text-amber-600' : ''}`}>
                                    {tenureData.percentOfAverage}%
                                  </span>
                                </div>
                              )}
                              {tenureData.tenureCategory && (
                                <div className="flex justify-between text-xs ml-5">
                                  <span>Category:</span>
                                  <span className={`font-medium ${tenureData.tenureCategory === 'short' ? 'text-blue-600' : 
                                    tenureData.tenureCategory === 'average' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {tenureData.tenureCategory.charAt(0).toUpperCase() + tenureData.tenureCategory.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()} 
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Profile
              </Button>
              {onPersonalize && (
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={onPersonalize}
                >
                  Personalize
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};