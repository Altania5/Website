import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <header className="hero">
        <div className="container">
          <h1>Alexander Konopelski</h1>
          <p>Software Engineer and Web Developer</p>
        </div>
      </header>
      <section className="container about">
        <h2>About Me</h2>
        <p>Write a brief and engaging summary about yourself, your skills, your career goals, and what you bring to a team. Highlight your passion for your field. (Around 2-4 sentences)</p>
      </section>
      <section className="container projects">
        <h2>Projects</h2>
        <div className="project">
          <div className="project-content">
            <img src="/images/JavaCoffee.png" alt="Java Coffee Shop Preview" className="project-image" />
            <div className="project-text">
              <h3>Coffee Shop Application</h3>
              <p>Simple app that simulates a coffee shop. Includes SQL features such as retrieving, editing, and deleting data from a database. The application also includes visual statistics.</p>
              <a href="#" target="_blank" rel="noopener noreferrer">View Project</a>
            </div>
          </div>
        </div>
        <div className="project">
          <div className="project-content">
            <img src="/images/videoMaker.png" alt="Video Maker Preview" className="project-image" />
            <div className="project-text">
              <h3>Diamond Game</h3>
              <p>A 2D idle Java game that involves game loops.</p>
              <a href="#" target="_blank" rel="noopener noreferrer">View Project</a>
            </div>
          </div>
        </div>
      </section>
      <section className="container skills" id="skills">
        <h2>Skills</h2>
        <ul>
          <li>Java - Advanced Level</li>
          <li>Python - Secondary Language</li>
          <li>3D modeling - Fusion 360</li>
          <li>Database Management - SQL</li>
        </ul>
      </section>
      <section className="container contact" id="contact">
        <h2>Contact</h2>
        <p>Email: 22konopelskialexande@gmail.com</p>
        <p>LinkedIn: <a href="your-linkedin-url" target="_blank" rel="noopener noreferrer">Your LinkedIn Profile</a></p>
        <p>GitHub: <a href="https://github.com/Altania5" target="_blank" rel="noopener noreferrer">GitHub Profile</a></p>
      </section>
      <footer className="footer">
        <p>&copy; 2025 Alexander Konopelski</p>
      </footer>
    </div>
  );
};

export default Home;
