import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface PersonalizedMessageProps {
  talentName: string;
  company: string;
  layoffContext?: string;
  onClose: () => void;
}

export const PersonalizedMessage = ({ 
  talentName, 
  company, 
  layoffContext, 
  onClose 
}: PersonalizedMessageProps) => {
  const [message, setMessage] = useState(
    `Hi ${talentName}, I saw ${company} was impacted by layoffs — I know that's tough. We're hiring for a role that matches your background in React and Node.js. If you're open, I'd love to connect.`
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
  };

  return (
    <Card className="p-6 space-y-4 border-primary/20 bg-card-elevated">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Personalized Outreach</h3>
          <Badge variant="secondary" className="text-xs">AI Generated</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <strong>Context:</strong> {layoffContext || `${company} layoffs - March 2024`}
        </div>
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px] text-sm"
          placeholder="Personalized message will appear here..."
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Message
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            Send via LinkedIn
          </Button>
        </div>
      </div>
    </Card>
  );
};