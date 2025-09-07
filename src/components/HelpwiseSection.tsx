import "./HelpwiseSection.css";

export default function HelpwiseSection() {
  const features = ["Text Explainer", "Summarize", "Score checker"];

  return (
    <section className="helpwise">
      <div className="helpwise-inner">
        {/* Top heading */}
        <h2 className="hw-h2">We also provide Helpwise for students</h2>

        {/* Two-column content */}
        <div className="hw-grid">
          <div className="hw-left">
            <img
              className="hw-robot-lg"
              src="/media/robot.png"
              alt="Helpwise robot"
            />
          </div>

          <div className="hw-right">
            <h3 className="hw-title">
              Helpwise
              <span className="hw-underline" aria-hidden="true" />
            </h3>

            <p className="hw-desc">
              Helpwise helps students by explaining concepts, summarizing notes,
              generating ideas, improving writing, solving problems, and creating
              study plans — making learning easier, faster, and more effective
              anytime, anywhere.
            </p>
          </div>
        </div>

        <div className="hw-features">
          <div className="hw-feat-left">
            <h3 className="hw-feat-title">Features of Helpwise</h3>
            <ul className="hw-list">
              {features.map((item) => (
                <li className="hw-list-item" key={item}>
                  <span className="hw-dot" />
                  <span className="hw-item-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hw-feat-right">
            <img className="hw-student" src="/media/student.jpg" alt="" />
          </div>
        </div>

        <div className="hw-swoosh" aria-hidden="true" />
      </div>
    </section>
  );
}
