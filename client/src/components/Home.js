import React from "react";
import { NavLink } from "react-router-dom";
import useRevealOnScroll from "../hooks/useRevealOnScroll";
import "./Home.css";

const Home = () => {
  useRevealOnScroll();

  return (
    <div className="home">
      <section className="hero" data-reveal>
        <div className="hero__content">
          <div className="hero__badge">Full-stack MERN & Applied AI Engineer</div>
          <h1>
            Building polished experiences
            <br />at the intersection of software and design.
          </h1>
          <p>
            I architect and ship performant products—with an eye for detail, a habit of clean code, and a
            relentless focus on user experience.
          </p>
          <div className="hero__actions">
            <NavLink to="/projects" className="action primary">
              Explore Projects
            </NavLink>
            <a href="/#contact" className="action ghost">
              Connect with Me
            </a>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__diamond">◆</div>
          <div className="hero__card">
            <span>Currently refining</span>
            <strong>Altanian Web Production</strong>
            <p>Creating tools operational teams.</p>
          </div>
        </div>
      </section>

      <section className="summary" id="about" data-reveal>
        <div className="summary__card">
          <h2>Quick Snapshot</h2>
          <p>
            I’m Alexander, a software engineer and MERN developer with a passion for crafting delightful digital products and
            automation tooling. From on-prem pipelines to polished web apps, I guide projects from concept to
            launch—iterating fast, staying curious, and shipping with confidence.
          </p>
          <div className="summary__grid">
            <div className="summary__item">
              <span className="label">Focus</span>
              <strong>Full-stack Web, Data Automation</strong>
            </div>
            <div className="summary__item">
              <span className="label">Primary Stack</span>
              <strong>Java · Python · TypeScript · React · Node · Mongo</strong>
            </div>
            <div className="summary__item">
              <span className="label">Currently Reading</span>
              <strong>Designing Data-Intensive Applications</strong>
            </div>
          </div>
        </div>
        <div className="summary__card">
          <h3>Recent Highlights</h3>
          <ul className="summary__list">
            <li>Scaled a real-time analytics dashboard for a mobile autotive company.</li>
            <li>Automated video content generation pipeline with Python + FFmpeg.</li>
            <li>Led migration from static hosting to a full MERN architecture.</li>
          </ul>
        </div>
      </section>

      <section className="skills" id="skills" data-reveal>
        <div className="section-header">
          <h2>Technical Range</h2>
          <p>Tooling I reach for to design, build, and ship resilient products.</p>
        </div>
        <div className="skills__grid">
          <div className="skill-card">
            <h4>Languages</h4>
            <ul>
              <li>Java · TypeScript · Python</li>
              <li>SQL · C# (Unity)</li>
            </ul>
          </div>
          <div className="skill-card">
            <h4>Frameworks</h4>
            <ul>
              <li>React · Express · Next.js</li>
              <li>Spring Boot · Flask</li>
            </ul>
          </div>
          <div className="skill-card">
            <h4>Tooling</h4>
            <ul>
              <li>Docker · GitHub Actions · Terraform · Heroku</li>
              <li>MongoDB · PostgreSQL</li>
            </ul>
          </div>
          <div className="skill-card">
            <h4>Also Into</h4>
            <ul>
              <li>ML · 3D Modeling · Fusion 360</li>
              <li>Procedural Content Gen</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="resume" id="resume" data-reveal>
        <div className="section-header">
          <h2>Résumé</h2>
          <p>A snapshot of professional experience, leadership, and key wins.</p>
        </div>
        <div className="resume__content">
          <div className="resume__card">
            <h3>Downloadable PDF</h3>
            <p>The latest version of my résumé with selected achievements and impact metrics.</p>
            <a className="action primary" href="/resume.pdf" download>
              Download Résumé
            </a>
          </div>
          <div className="resume__highlights">
            <div className="highlight">
              <span className="label">Leadership</span>
              <p>Area Supervisor at Dorney Park, leading cross-functional teams and onboarding talent.</p>
            </div>
            <div className="highlight">
              <span className="label">Education</span>
              <p>
                B.S. Computer Science + pursuing M.S. at West Chester University of Pennsylvania.
              </p>
            </div>
            <div className="highlight">
              <span className="label">Focus Areas</span>
              <p>Automation, Observability, Developer Experience, Applied AI.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" data-reveal>
        <div className="section-header">
          <h2>Testimonials</h2>
          <p>Feedback and reflections from collaborators and stakeholders.</p>
        </div>
        <div className="testimonials__grid">
          <article className="testimonial">
            <p>
              “Alex tackled a high-visibility dashboard under a tight deadline. He paired solid engineering with thoughtful
              UX, resulting in adoption across teams within weeks.”
            </p>
            <span className="testimonial__author">Product Lead · Mobile Automotive Analytics</span>
          </article>
          <article className="testimonial">
            <p>
              “From revising data models to polishing final UI details, Alex operates like a product-minded engineer—always
              aligning technical choices with business goals.”
            </p>
            <span className="testimonial__author">CTO · Altanian Industries</span>
          </article>
          <article className="testimonial">
            <p>
              “Alex’s automation workflows cut our content production time in half. He worked shoulder-to-shoulder with the
              team to iterate fast and deliver a stable pipeline.”
            </p>
            <span className="testimonial__author">Creative Director · Independent Studio</span>
          </article>
        </div>
      </section>

      <section className="timeline" data-reveal>
        <div className="section-header">
          <h2>Journey Highlights</h2>
          <p>Anchors that shaped my approach to building software with impact.</p>
        </div>
        <div className="timeline__grid">
          <div className="timeline__item">
            <span className="label">2025</span>
            <h4>Altanian Web Production</h4>
            <p>Leading MERN platform initiatives focused on operational tooling and observability.</p>
          </div>
          <div className="timeline__item">
            <span className="label">2023</span>
            <h4>Automation & AI Labs</h4>
            <p>Developed Python video pipeline generating narrative content at scale.</p>
          </div>
          <div className="timeline__item">
            <span className="label">2022</span>
            <h4>Academic Foundations</h4>
            <p>West Chester University · BS Computer Science · Entered MS program specializing in applied AI.</p>
          </div>
        </div>
      </section>

      <section className="cta" data-reveal>
        <div className="cta__content">
          <h2>Let’s collaborate on something remarkable.</h2>
          <p>
            Whether you need a full-stack build, a rapid automation prototype, or product-level polish, I’d love to partner
            up.
          </p>
        </div>
        <div className="cta__actions">
          <NavLink to="/projects" className="action primary">
            View the archive
          </NavLink>
          <a href="mailto:22konopelskialexande@gmail.com" className="action ghost">
            Start a conversation
          </a>
        </div>
      </section>

      <section className="contact" id="contact" data-reveal>
        <div className="section-header">
          <h2>Let’s Build Something</h2>
          <p>Open to full-time roles, contract collaborations, or ambitious side projects.</p>
        </div>
        <div className="contact__cards">
          <div className="contact-card">
            <span className="label">Email</span>
            <a href="mailto:22konopelskialexande@gmail.com">22konopelskialexande@gmail.com</a>
          </div>
          <div className="contact-card">
            <span className="label">LinkedIn</span>
            <a href="www.linkedin.com/in/alexander-konopelski-52611a31a" target="_blank" rel="noopener noreferrer">
              linkedin.com/in/your-handle
            </a>
          </div>
          <div className="contact-card">
            <span className="label">GitHub</span>
            <a href="https://github.com/Altania5" target="_blank" rel="noopener noreferrer">
              github.com/Altania5
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
