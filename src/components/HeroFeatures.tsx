import "./HeroFeatures.css";
import type { ReactNode } from "react";

export default function HeroFeatures() {
  return (
    <section className="hero">
      <div className="hero-inner">
        {/* Top heading + CTA */}
        <header className="hero-head">
          <h1>Welcome to our Class Connect</h1>
          <p>Let’s learn, share, and grow together</p>
          <button className="cta">Join Us</button>
        </header>

        <div className="hero-split">
          <div className="hero-left">
            <div className="feature-wheel">
              <div className="core">
                <div className="core-title">Features</div>
                <div className="core-sub">“What we provide”</div>
              </div>

              <FeatureNode
                className="pos-top"
                title="Learning support"
                icon={<img src="/icons/learn.png" alt="Learning support" />}
              />
              <FeatureNode
                className="pos-right"
                title="Communication & Collaboration"
                icon={<img src="/icons/Communication.png" alt="Communication & Collaboration" />}
              />
              <FeatureNode
                className="pos-bottom-right"
                title="Progress & Self-Improvement"
                icon={<img src="/icons/Progress.png" alt="Progress & Self-Improvement" />}
              />
              <FeatureNode
                className="pos-bottom-left"
                title="Trust & Transparency"
                icon={<img src="/icons/Trust.png" alt="Trust & Transparency" />}
              />
              <FeatureNode
                className="pos-left"
                title="Academic Integrity"
                icon={<img src="/icons/Academic.jpg" alt="Academic Integrity" />}
              />
            </div>
          </div>

          <aside className="hero-right">
            <h2 className="aside-title">Features We provide for our students</h2>
            <p className="aside-copy">
              “We provide students with clear, reliable learning support and transparent
              guidance to help them grow with confidence.”
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

type NodeProps = {
  className?: string;
  title: string;
  icon: ReactNode;
};

function FeatureNode({ className = "", title, icon }: NodeProps) {
  return (
    <div className={`node ${className}`}>
      <div className="node-icon">{icon}</div>
      <div className="node-main">{title}</div>
    </div>
  );
}
