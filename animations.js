// Intersection Observer for fade-in animations
const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

// Slide-in animation for sections
const slideInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('slide-in');
            slideInObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

// Apply animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add animation classes to elements
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('animate-on-scroll');
        fadeInObserver.observe(section);
    });

    // Animate research areas
    const researchAreas = document.querySelectorAll('.research-area');
    researchAreas.forEach((area, index) => {
        area.style.animationDelay = `${index * 0.2}s`;
        slideInObserver.observe(area);
    });

    // Animate timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
        slideInObserver.observe(item);
    });

    // Animate publications
    const publications = document.querySelectorAll('.publication');
    publications.forEach((pub, index) => {
        pub.style.animationDelay = `${index * 0.1}s`;
        slideInObserver.observe(pub);
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect for header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        header.style.backgroundPositionY = `${scrolled * 0.5}px`;
    });

    // Add hover effect to navigation
    const nav = document.querySelector('nav');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > lastScrollTop) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('div');
            
            ripple.className = 'ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    });
});

// Add cursor trail effect
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsla(${Math.random() * 60 + 200}, 70%, 50%, 0.8)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.1;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize cursor effect if canvas is present
const cursorCanvas = document.getElementById('cursor-canvas');
if (cursorCanvas) {
    const ctx = cursorCanvas.getContext('2d');
    const particles = [];

    function handleMouseMove(e) {
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(e.x, e.y));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            
            if (particles[i].size <= 0.1) {
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', handleMouseMove);
    animate();
} 