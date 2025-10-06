import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      <section className="about container">
        <div className="about-content">
          <img
            src="/images/profile-placeholder.jpg"
            alt="Alexander Konopelski"
            className="profile-picture"
          />
          <div className="about-text">
            <h2>Alexander Konopelski</h2>
            <div className="contact-info">
              <p>📧 22konopelskialexande@gmail.com</p>
              <p>📱 610-704-9619</p>
              <p>🔗 <a href="https://github.com/Altania5" target="_blank" rel="noopener noreferrer">GitHub Profile</a></p>
            </div>
            <p className="summary">
              Analytical Computer Science student with a solid foundation in software development and web programming. 
              Proficient in Java, Python, JavaScript, and SQL, with hands-on experience in developing and maintaining 
              web applications using React and Node.js. Skilled in team management, problem-solving, and adapting to new technologies.
            </p>
          </div>
        </div>

        <div className="experience-section">
          <h2>Professional Experience</h2>
          
          <div className="experience">
            <h3>Hard Work Mobile - Full Stack MERN Developer</h3>
            <p className="experience-dates">October 2023 - Present</p>
            <p className="experience-link">
              <a href="https://hardworkmobile-0bf9805ba163.herokuapp.com/" target="_blank" rel="noopener noreferrer">
                View Project
              </a>
            </p>
            <ul>
              <li>Developed a website to allow customers to contact, schedule services and communicate with a mobile mechanic, incorporating a custom domain hosted with Heroku, enhancing user engagement by 86%</li>
              <li>Utilized GitHub, Node.js, React, JavaScript and VSCode for development, backed up with a MongoDB database, and designed with simplicity and efficiency, reducing development time by 20%</li>
              <li>Implemented login features, including an admin login for client statistics and user management, improving user satisfaction rates by 74%</li>
            </ul>
          </div>

          <div className="experience">
            <h3>Dorney Park - Area Supervisor</h3>
            <p className="experience-dates">June 2020 - Present</p>
            <ul>
              <li>Led one of four ride areas, overseeing three ride groups, improving operational efficiency by 73% through technical leadership and coordination</li>
              <li>Managed timecards and schedules, reducing labor costs by 25% by ensuring accurate payroll and optimal staffing levels</li>
              <li>Administered budgets and ensured safety compliance, achieving a 61% reduction in incidents</li>
            </ul>
          </div>

          <div className="experience">
            <h3>West Chester University of Pennsylvania - Head Resident Assistant</h3>
            <p className="experience-dates">January 2023 - Present</p>
            <ul>
              <li>Built and maintained a community for 94 residents, increasing satisfaction by 56% through effective communication</li>
              <li>Reduced conflicts by 85% by conducting detailed reports and resolving issues</li>
              <li>Enhanced engagement by 91% through community events and activities</li>
            </ul>
          </div>

          <div className="experience">
            <h3>Starbucks - Supervisor and Coffee Master Certificate</h3>
            <p className="experience-dates">September 2023 - Present</p>
            <ul>
              <li>Managed inventory and executed cash management, reducing discrepancies by 30%</li>
              <li>Conducted safety inspections and trained new staff, improving safety compliance by 20%</li>
              <li>Supported team members, increasing team efficiency by 25%</li>
            </ul>
          </div>
        </div>

        <div className="education-section">
          <h2>Education</h2>
          <div className="education-entry">
            <h3>West Chester University of Pennsylvania</h3>
            <p className="education-degree">Master of Science • Computer Science</p>
            <p className="education-degree">Bachelor of Science • Computer Science</p>
          </div>
        </div>

        <div className="certifications-section">
          <h2>Licenses & Certifications</h2>
          <div className="certification">
            <h3>Computer Security Certificate</h3>
            <p>WCUPA • Issued May 2025</p>
          </div>
          <div className="certification">
            <h3>ServeSafe</h3>
            <p>Issued Jul 2025 - Expires Jul 2026</p>
          </div>
        </div>

        <div className="skills-section">
          <h2>Technical Skills</h2>
          <div className="skills-grid">
            <div className="skill-category">
              <h3>Programming Languages</h3>
              <div className="skill-tags">
                <span className="skill-tag">Java</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">C</span>
                <span className="skill-tag">SQL</span>
              </div>
            </div>
            
            <div className="skill-category">
              <h3>Web Development</h3>
              <div className="skill-tags">
                <span className="skill-tag">HTML</span>
                <span className="skill-tag">CSS</span>
                <span className="skill-tag">React</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">MongoDB</span>
              </div>
            </div>
            
            <div className="skill-category">
              <h3>Specializations</h3>
              <div className="skill-tags">
                <span className="skill-tag">Full-Stack Development</span>
                <span className="skill-tag">Machine Learning</span>
                <span className="skill-tag">Game Development</span>
                <span className="skill-tag">TensorFlow</span>
                <span className="skill-tag">Web UI Design</span>
              </div>
            </div>
            
            <div className="skill-category">
              <h3>Technical Areas</h3>
              <div className="skill-tags">
                <span className="skill-tag">Computer Hardware</span>
                <span className="skill-tag">Web Programming</span>
                <span className="skill-tag">Database Management</span>
                <span className="skill-tag">System Administration</span>
              </div>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h2>Key Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement">
              <h3>86%</h3>
              <p>User Engagement Increase</p>
            </div>
            <div className="achievement">
              <h3>73%</h3>
              <p>Operational Efficiency Improvement</p>
            </div>
            <div className="achievement">
              <h3>91%</h3>
              <p>Community Engagement Enhancement</p>
            </div>
            <div className="achievement">
              <h3>85%</h3>
              <p>Conflict Reduction</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>&copy; 2025 Alexander Konopelski</p>
      </footer>
    </div>
  );
};

export default About;
