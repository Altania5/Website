import React from "react";
import "./Projects.css";
import { projects } from "../data/projects";

const filters = [
  { label: "All", value: "all" },
  { label: "Java", value: "java" },
  { label: "Python", value: "python" },
  { label: "Automation", value: "automation" },
  { label: "Games", value: "game" }
];

const Projects = () => {
  const [activeFilter, setActiveFilter] = React.useState("all");

  const filteredProjects = projects.filter(project => {
    if (activeFilter === "all") return true;
    return project.tech.some(tag => tag.toLowerCase().includes(activeFilter));
  });

  return (
    <div className="projects">
      <header className="projects__hero">
        <div>
          <span className="label">Project Archive</span>
          <h1>Hands-on builds that move ideas into production.</h1>
          <p>
            From automation bots to full-stack dashboards, here’s a curation of shipped work, experiments, and
            long-running personal sandboxes.
          </p>
        </div>
      </header>

      <div className="filters">
        {filters.map(filter => (
          <button
            key={filter.value}
            className={`filter ${activeFilter === filter.value ? "active" : ""}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="project-grid">
        {filteredProjects.map(project => (
          <article className="project-card" key={project.title}>
            <div className="project-card__image">
              <img src={project.image} alt={`${project.title} preview`} />
              <div className="project-card__tag">{project.tech[0]}</div>
            </div>
            <div className="project-card__body">
              <div className="project-card__header">
                <h3>{project.title}</h3>
                <div className="project-card__links">
                  {project.codeLink && (
                    <a href={project.codeLink} target="_blank" rel="noopener noreferrer">
                      Code
                    </a>
                  )}
                  {project.demoLink && (
                    <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                      Demo
                    </a>
                  )}
                  {project.extraLink && (
                    <a href={project.extraLink.url} target="_blank" rel="noopener noreferrer">
                      {project.extraLink.label}
                    </a>
                  )}
                </div>
              </div>
              <p>{project.description}</p>
              <div className="project-card__tech">
                {project.tech.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Projects;
