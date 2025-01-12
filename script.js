// In script.js
import { getXataClient } from "./xata";
const xata = getXataClient();

const record = await xata.db.tableName.read("rec_xyz");
console.log(record);

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