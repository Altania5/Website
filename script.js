/*import { getXataClient } from './src/xata.js'; // Corrected relative path

const xata = getXataClient();

// Fetch and display projects
const projectsSection = document.getElementById('projects'); // Assuming you have a section with id="projects"

async function fetchAndDisplayProjects() {
    try {
        const records = await xata.db.Projects.getAll(); // Fetch all projects from Xata

        records.forEach(project => {
            // Create project elements (adjust as needed based on your HTML structure)
            const projectDiv = document.createElement('div');
            projectDiv.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.technologies}</p>
                <p>${project.description}</p>
                <a href="${project.githubUrl}" target="_blank">View Code</a>
                <a href="${project.liveDemoUrl}" target="_blank">Live Demo</a>
            `;
            projectsSection.appendChild(projectDiv);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        // Handle the error (e.g., display an error message)
    }
}

fetchAndDisplayProjects(); // Call the function to fetch and display projects
*/

const filterButtons = document.querySelectorAll('.filter-button'); // Assume you add filter buttons in HTML
const projectCards = document.querySelectorAll('.project-card');

// Filtering Logic (Assuming you add filter buttons to your HTML)
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.dataset.filter.toLowerCase(); // Get filter value (e.g., "java", "python")

        projectCards.forEach(card => {
            const tech = card.querySelector('.project-tech').textContent.toLowerCase();
            if (filter === 'all' || tech.includes(filter)) {
                card.style.display = 'flex'; // Or 'block' depending on your layout
            } else {
                card.style.display = 'none';
            }
        });
    });
});

$(document).ready(function() {
    // Smooth Scrolling
    $('.smooth-scroll').on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            const hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function() {
                window.location.hash = hash;
            });
        }
    });

    // Read More Button
    $('#read-more-btn').on('click', function() {
        $('#more-about').slideToggle();
        $(this).text(function(i, text) {
            return text === "Read More" ? "Read Less" : "Read More";
        });
    });

    // Animate Experience Section
    $(window).on('scroll', function() {
        $('.experience').each(function() {
            const pos = $(this).offset().top;
            const winTop = $(window).scrollTop();
            if (pos < winTop + $(window).height() - 100) {
                $(this).addClass('show');
            }
        });
    });

    // Animate Skill Bars
    $('.skill-level').each(function() {
        const level = $(this).data('level');
        $(this).animate({
            width: level + '%'
        }, 1000);
    });
});