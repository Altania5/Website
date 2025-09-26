import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      <section className="about container">
        <div className="about-content">
          <img
            src="/images/profile-placeholder.jpg"
            alt="Profile"
            className="profile-picture"
          />
          <div className="about-text">
            <h2>About Me</h2>
            <p>
              A brief introductory paragraph about yourself (2-4 sentences max).
              Highlight something unique or memorable.
            </p>
            <p>
              More detailed information about you. Talk about your passions,
              experiences, and what drives you.
            </p>
          </div>
        </div>

        <div className="experience-section">
          <h2>Background</h2>
          <div className="experience">
            <h3>Dorney Park Area Supervisor</h3>
            <p>June 2020 - Present</p>
            <ul>
              <li>Managing one of four ride areas at Dorney Park</li>
              <li>Scheduling associates and managing timecards</li>
              <li>Training associates how to operate any rides in the park</li>
            </ul>
          </div>
          <div className="experience">
            <h3>Experience 2 Title</h3>
            <p>Dates of Employment</p>
            <ul>
              <li>Responsibility 1</li>
              <li>Responsibility 2</li>
            </ul>
          </div>
        </div>

        <div className="education-section">
          <h2>Education</h2>
          <div className="education-entry">
            <h3>West Chester University Of Pennsylvania</h3>
            <p>August 2022 - Present</p>
            <p>Bachelor of Science in Computer Science</p>
            <p>Attending Masters Program in Computer Science</p>
          </div>
        </div>

        <div className="skills-section">
          <h2>Skills</h2>
          <ul className="skills-list">
            <li>
              <span className="skill-name">Java Programming</span>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "90%" }}></div>
              </div>
            </li>
            <li>
              <span className="skill-name">Python Programming</span>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "75%" }}></div>
              </div>
            </li>
            <li>
              <span className="skill-name">SQL Database Management</span>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "100%" }}></div>
              </div>
            </li>
          </ul>
        </div>

        <div className="hobbies-section">
          <h2>Hobbies</h2>
          <p>Talk about your interests and passions!</p>
        </div>
      </section>
      <footer className="footer">
        <p>&copy; 2025 Alexander Konopelski</p>
      </footer>
    </div>
  );
};

export default About;
