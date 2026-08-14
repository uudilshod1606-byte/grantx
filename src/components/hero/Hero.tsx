import { HeroScene } from "./HeroScene";
import { Link } from "@tanstack/react-router";
import "./Hero.css";

export function Hero() {
  return (
    <div className="ih-root">
      <div className="ih-wrap">
        <div className="ih-topbar">
          <div className="ih-brand">
            <div className="ih-brand-mark">I</div>
            <span className="ih-brand-name">
              INT<i>I</i>L
            </span>
          </div>
          <ul className="ih-nav-links">
            <li><a href="#natijalar">Natijalar</a></li>
            <li><a href="#platforma">Platforma</a></li>
            <li><a href="#yonalish">Yo'nalish</a></li>
            <li><a href="#">Reja</a></li>
          </ul>
          <Link className="ih-cta-btn" to="/onboarding">
            Boshlash
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="ih-hero">
          <div className="ih-hero-grid">
            {/* LEFT */}
            <div className="ih-hero-left">
              <div className="ih-eyebrow">
                <span className="ih-eyebrow-dot" />
                DTM va Milliy sertifikat tayyorgarligi
              </div>

              <h1 className="ih-h1">
                Bir xabar. Butun
                <br />
                <em>kelajagingizni</em>
                <br />
                o'zgartirishi mumkin.
              </h1>

              <p className="ih-lede">
                INTIL — DTM va Milliy sertifikatga tayyorlanish uchun yaratilgan zamonaviy
                platforma. Eng so'ngi testlar bilan bilim darajangizni oshiring,
                natijalaringizni kuzating va maqsadingiz sari ishonch bilan harakat qiling.
              </p>

              <div className="ih-cta-row">
                <Link className="ih-primary-btn" to="/onboarding">
                  Bepul boshlash
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <a className="ih-secondary-link" href="#">
                  Testlarni ko'rish
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>

            {/* RIGHT: real 3D scene */}
            <div className="ih-visual">
              <HeroScene />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
