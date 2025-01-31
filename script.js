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

fetch('/.netlify/functions/increment-counter')
  .then(response => response.json())
  .then(data => {
    console.log('Current count:', data.count);
    // Update the counter display on your page
    const counterElement = document.getElementById('user-counter');
    if (counterElement) {
      counterElement.textContent = data.count;
    }
  })
  .catch(error => console.error('Error fetching counter:', error));

  $(document).ready(function() {
    $("#loginForm").submit(function(event) {
        event.preventDefault();

        // Get the username and password values here
        const username = $("#username").val();
        const password = $("#password").val();

        $.ajax({
            url: "login.php", // Update with your server-side script
            method: "POST",
            data: { username: username, password: password }, // Pass data correctly
            success: function(response) {
                if (response.success) {
                    alert("Login successful!");
                    // ... your code for successful login ...
                } else {
                    alert("Invalid username or password.");
                }
            },
            error: function(error) {
                console.error("Login error:", error);
                alert("Login failed. Please try again later.");
            }
        });
    });
});