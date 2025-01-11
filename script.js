// In script.js

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