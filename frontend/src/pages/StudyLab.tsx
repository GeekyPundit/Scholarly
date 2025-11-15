import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MinecraftHeading } from "@/components/MinecraftHeading";
import { BookMarked, Brain, PencilRuler } from "lucide-react";

const studyTracks = [
  {
    title: "Exam Sprint",
    description: "Targeted plan for the next two weeks of prep",
    progress: 45,
    focus: ["Timed quizzes", "AI flashcards", "Revision map"],
    icon: PencilRuler,
  },
  {
    title: "Concept Builder",
    description: "Deep-dive sessions to master tough topics",
    progress: 30,
    focus: ["Explainer videos", "Guided notes", "Practice labs"],
    icon: Brain,
  },
  {
    title: "Scholarship Ready",
    description: "Organize essays, recommendations, and documents",
    progress: 60,
    focus: ["Document checklist", "Essay workspace", "Review queue"],
    icon: BookMarked,
  },
];

const quickTools = [
  {
    title: "Focus Timer",
    description: "Stay on track with 25/5 pomodoro blocks",
    action: "Start Session",
  },
  {
    title: "Resource Uploader",
    description: "Drop PDFs for instant summaries and question sets",
    action: "Upload Notes",
  },
  {
    title: "Brain Dump",
    description: "Capture messy ideas and turn them into tasks",
    action: "Open Canvas",
  },
];

const StudyLab = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <MinecraftHeading className="text-2xl md:text-3xl">Study Lab</MinecraftHeading>
        <p className="text-muted-foreground">
          Build structured study sessions that blend AI assistance with your personal workflow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {studyTracks.map((track) => (
          <Card key={track.title} className="pixel-border h-full flex flex-col">
            <CardHeader className="flex flex-col gap-3">
              <track.icon className="h-10 w-10 text-primary" />
              <CardTitle>{track.title}</CardTitle>
              <CardDescription>{track.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-1">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{track.progress}%</span>
                </div>
                <Progress value={track.progress} />
              </div>
              <div className="flex flex-wrap gap-2">
                {track.focus.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
              <Button className="mt-auto" variant="outline">
                Continue Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Quick tools</h3>
            <p className="text-sm text-muted-foreground">Jump into a focused action without leaving the lab.</p>
          </div>
          <Button size="sm" variant="secondary">
            Customize Layout
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quickTools.map((tool) => (
            <Card key={tool.title} className="pixel-border">
              <CardHeader>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  {tool.action}
                  <span aria-hidden>→</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyLab;
