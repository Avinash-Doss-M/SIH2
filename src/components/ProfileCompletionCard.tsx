import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

interface ProfileStep {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}

interface ProfileCompletionCardProps {
  profileSteps: ProfileStep[];
  completionPercentage: number;
  onStepClick: (stepId: string) => void;
}

const ProfileCompletionCard = ({ 
  profileSteps, 
  completionPercentage,
  onStepClick 
}: ProfileCompletionCardProps) => {
  const completedSteps = profileSteps.filter(step => step.completed).length;
  const totalSteps = profileSteps.length;

  return (
    <Card className="border-border bg-gradient-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center">
              Complete Your Profile
              <Badge variant="secondary" className="ml-2">
                {completedSteps}/{totalSteps}
              </Badge>
            </CardTitle>
            <CardDescription>
              A complete profile increases your visibility by 5x
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round(completionPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={completionPercentage} className="w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {profileSteps.map((step) => (
              <Button
                key={step.id}
                variant={step.completed ? "secondary" : "outline"}
                size="sm"
                className={`justify-start h-auto p-3 ${
                  step.completed 
                    ? "bg-success/10 border-success/20 hover:bg-success/20" 
                    : "border-dashed hover:border-primary"
                }`}
                onClick={() => onStepClick(step.id)}
              >
                <div className="flex items-center space-x-2">
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${
                    step.completed ? "text-success-foreground" : "text-foreground"
                  }`}>
                    {step.title}
                  </span>
                  {step.required && !step.completed && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {completionPercentage < 100 && (
            <Button 
              className="w-full mt-4"
              onClick={() => onStepClick('continue')}
            >
              Continue Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;