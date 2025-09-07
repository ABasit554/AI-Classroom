import "./FeatureBlocks.css";

type Block = {
  title: string;
  points: string[];
  icon: string;                 // path from /public/icons
  variant: "blue" | "yellow";   // light plate color
};

const blocks: Block[] = [
  {
    title: "Learning Support",
    icon: "/icons/learn.png",
    variant: "blue",
    points: [
      "Assignment Explainer",
      "Lecture Summarizer",
      "Concept Re-Leveling",
    ],
  },
  {
    title: "Communication & Collaboration",
    icon: "/icons/Communication.png",
    variant: "yellow",
    points: [
      "Group Brainstorm Assistant",
      "Discussion Prompt Helper",
      "Peer Feedback AI",
    ],
  },
  {
    title: "Progress & Self-Improvement",
    icon: "/icons/Progress.png",
    variant: "blue",
    points: [
      "Learning Path Advisor",
      "Skill Tracker & Goals",
    ],
  },
  {
    title: "Trust & Transparency",
    icon: "/icons/Trust.png",
    variant: "yellow",
    points: ["AI Explanation Mode", "Credibility Checker"],
  },
  {
    title: "Academic Integrity",
    icon: "/icons/Academic.jpg",
    variant: "blue",
    points: ["Plagiarism Insight", "Source Recommender"],
  },
];

export default function FeatureBlocks() {
  return (
    <section className="blocks">
      <div className="blocks-grid">
        {blocks.map((b) => (
          <StackedCard key={b.title} {...b} />
        ))}
      </div>
    </section>
  );
}

function StackedCard({ title, points, icon, variant }: Block) {
  return (
    <article className={`block plate-${variant}`}>
      {/* back plate */}
      <div className="bg-plate">
        <div className="plate-icon-wrap">
          <img className="plate-icon" src={icon} alt={`${title} icon`} />
        </div>
      </div>

      {/* front navy card */}
      <div className="card">
        <h3 className="card-title">{title}</h3>
        <ul className="card-list">
          {points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
