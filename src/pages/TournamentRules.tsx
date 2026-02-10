import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Trophy, Users, Star, Scale, BarChart3, MessageSquare, Ban, Settings, Gamepad2 } from "lucide-react";

const sections = [
  {
    icon: <Users className="w-5 h-5 text-primary" />,
    title: "1. Eligibility",
    items: [
      "Tournaments are open to eligible players as specified per event.",
      "Some tournaments may require a Season Pass to participate.",
      "No purchase is required to play Cyber City Arcade.",
      "Players must follow all platform rules and community guidelines.",
    ],
  },
  {
    icon: <Gamepad2 className="w-5 h-5 text-primary" />,
    title: "2. Tournament Format",
    intro: "Tournaments are skill-based competitions. Formats may include:",
    items: [
      "Single elimination",
      "Double elimination",
      "Round robin",
      "Time-based or score-based challenges",
    ],
    footer: "Tournament structure will be clearly displayed before entry.",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    title: "3. Scoring & Results",
    intro: "Scores are determined by in-game performance only. No element of chance or randomness is used to determine winners. Scoring criteria may include:",
    items: ["Points earned", "Accuracy", "Completion time", "Match wins"],
    footer: "Final rankings are based on verified results.",
  },
  {
    icon: <Trophy className="w-5 h-5 text-primary" />,
    title: "4. Prizes & Recognition",
    intro: "Cyber City Arcade tournaments award non-monetary, skill-based rewards, which may include:",
    items: [
      "Digital trophies or badges",
      "Leaderboard recognition",
      "Profile titles or visual effects",
      "Free or bonus Season Pass access",
      "Cosmetic items",
      "Promotional merchandise (where applicable)",
    ],
    footer: "❗ No cash, cryptocurrency, or financial rewards are awarded.",
  },
  {
    icon: <Shield className="w-5 h-5 text-primary" />,
    title: "5. Fair Play & Conduct",
    intro: "Players must:",
    items: [
      "Play fairly and honestly",
      "Avoid exploits, cheating, or automation",
      "Respect other players and moderators",
      "Follow all posted rules and instructions",
    ],
    footer: "Violations may result in: score removal, disqualification, or temporary/permanent suspension.",
  },
  {
    icon: <Star className="w-5 h-5 text-primary" />,
    title: "6. Leaderboards",
    items: [
      "Leaderboards reflect player performance during a tournament or season.",
      "Rankings are based on verified game results.",
      "Cyber City Arcade reserves the right to review and adjust rankings to ensure fairness.",
    ],
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-primary" />,
    title: "7. Disputes & Reviews",
    items: [
      "Players may submit disputes within a reasonable time after a match.",
      "All decisions made by Cyber City Arcade moderators are final.",
      "Evidence such as gameplay data or replays may be reviewed.",
    ],
  },
  {
    icon: <Ban className="w-5 h-5 text-primary" />,
    title: "8. No Gambling or Wagering",
    items: [
      "Tournaments do not involve betting, wagering, or entry fees.",
      "No random prize draws or raffles are used.",
      "Outcomes are determined solely by player skill.",
    ],
  },
  {
    icon: <Settings className="w-5 h-5 text-primary" />,
    title: "9. Modifications & Cancellations",
    items: [
      "Cyber City Arcade may modify or cancel tournaments if necessary.",
      "Any changes will be communicated to players in advance where possible.",
    ],
  },
  {
    icon: <Scale className="w-5 h-5 text-primary" />,
    title: "10. Entertainment Purpose",
    items: [
      "All tournaments are conducted for entertainment purposes only and are not intended to provide monetary rewards or financial gain.",
    ],
  },
];

const TournamentRules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-2">Tournament Rules & Guidelines</h1>
        <p className="text-muted-foreground mb-10">
          Please review the following rules before participating in any Cyber City Arcade tournament.
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              {section.intro && (
                <p className="text-sm text-muted-foreground mb-3">{section.intro}</p>
              )}
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {section.footer && (
                <p className="text-sm text-muted-foreground mt-3 font-medium">
                  {section.footer}
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentRules;
