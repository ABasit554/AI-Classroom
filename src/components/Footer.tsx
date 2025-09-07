import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-card">
          <div className="col col-brand">
            <div className="brand-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="brand-icon">
                <path d="M12 3L1.5 9l10.5 6 9-5.143V16a1 1 0 001 1h1v-8L12 3z" />
                <path d="M6 12.8V15c0 1.657 3 3 6 3s6-1.343 6-3v-2.2l-6 3.4-6-3.4z" />
              </svg>
            </div>

            <div className="brand-title">Class Connect</div>
            <p className="brand-copy">
              Class Connect is an online platform that helps teachers and
              students share resources, assign tasks, and communicate
              effectively, making learning organized, accessible, and
              collaborative from anywhere."
            </p>
          </div>

          <div className="col">
            <h4 className="col-title">Company</h4>
            <ul className="link-list">
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Conditions</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>

          <div className="col">
            <h4 className="col-title">Contact Us</h4>
            <ul className="contact-list">
              <li><span className="label">Phn:</span> <span className="value">—</span></li>
              <li><span className="label">Email:</span> <span className="value">—</span></li>
              <li><span className="label">FB Id:</span> <span className="value">—</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
