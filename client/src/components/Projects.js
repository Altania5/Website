import React from "react";
import "./Projects.css";

const projects = [
  {
    title: "Java Coffee Shop",
    tech: "Java, SQL, Password Encryption",
    description:
      "This is an application that simulates a coffee shop. It includes an interactive Java GUI with advanced access to a database. The database accesses inventory, coffee logs, individual drinks, and customer accounts.",
    image: "/images/JavaCoffee.png",
    codeLink: "https://github.com/Altania5/JavaCoffeeShop",
    demoLink: "#"
  },
  {
    title: "Diamond Game",
    tech: "Java, User Input, Game Loop, Animation",
    description:
      "A 2D idle Java game that involves game loops.",
    image: "/images/videoMaker.png",
    codeLink: "#",
    demoLink: "#"
  },
  {
    title: "Video Maker",
    tech: "Python, External Libraries, Automatic Video Generation",
    description:
      "Have you ever been scrolling through social media and come across those addictive Reddit story videos? Here's a Python bot that can automatically make those videos.",
    image: "/images/videoMaker.png",
    codeLink: "#",
    demoLink: "#"
  },
  {
    title: "2D Adventure Game",
    tech: "Java, User Input, Game Loop, Animation",
    description:
      "One of my very first major Java projects. The best way to learn programming is to build a video game. This project involves user input, frame data, and animation, just like this one.",
    image: "/images/videoMaker.png",
    codeLink: "#",
    demoLink: "#",
    extraLink: {
      label: "Source for Project",
      url: "https://www.youtube.com/watch?v=om59cwR7psI&list=PL_QPQmz5C6WUF-pOQDsbsKbaBZqXj4qSq&ab_channel=RyiSnow"
    }
  }
];

const filters = [
  { label: "All", value: "all" },
  { label: "Java", value: "java" },
  { label: "Python", value: "python" }
];

const Projects = () => {
  const [activeFilter, setActiveFilter] = React.useState("all");

  const filteredProjects = projects.filter(project => {
    if (activeFilter === "all") return true;
    return project.tech.toLowerCase().includes(activeFilter);
  });

  return (
    <div className="projects-page">
      <header className="header">
        <div className="container">
          <h1>My Projects</h1>
        </div>
      </header>
      <div className="filter-buttons">
        {filters.map(filter => (
          <button
            key={filter.value}
            className={`filter-button ${
              activeFilter === filter.value ? "active" : ""
            }`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <section className="container projects-grid">
        {filteredProjects.map(project => (
          <div className="project-card" key={project.title}>
            <div className="project-image">
              <img src={project.image} alt={`${project.title} Preview`} />
            </div>
            <div className="project-info">
              <h3>{project.title}</h3>
              <p className="project-tech">{project.tech}</p>
              <p className="project-description">{project.description}</p>
              <div className="project-links">
                <a href={project.codeLink} target="_blank" rel="noopener noreferrer" className="button">
                  View Code
                </a>
                <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="button">
                  Live Demo
                </a>
                {project.extraLink && (
                  <a href={project.extraLink.url} target="_blank" rel="noopener noreferrer" className="button">
                    {project.extraLink.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
      <footer className="footer">
        <p>&copy; 2025 Alexander Konopelski</p>
      </footer>
    </div>
  );
};

export default Projects;
