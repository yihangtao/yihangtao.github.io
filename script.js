document.addEventListener('DOMContentLoaded', function() {
    // Make all links open in a new tab
    makeAllLinksOpenInNewTab();

    // Set up MutationObserver to watch for dynamically added links
    setupLinkObserver();
    
    // Load publications data from JSON file
    loadPublications();
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply smooth scrolling to hash links (internal page links)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Account for the sticky nav
                    const navHeight = document.querySelector('.top-nav').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active class
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        const navHeight = document.querySelector('.top-nav').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - navHeight - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkTarget = link.getAttribute('href').substring(1);
            // Handle both homepage and about pointing to the same section
            if (linkTarget === current || 
                (current === 'homepage' && linkTarget === 'about') ||
                (current === 'about' && linkTarget === 'homepage')) {
                link.classList.add('active');
            }
        });
    });

    // Load news data
    let newsJsonPath = 'data/news.json';
    if (window.location.pathname.includes('/pages/')) {
        newsJsonPath = '../data/news.json';
    }
    
    fetch(newsJsonPath)
        .then(response => response.json())
        .then(data => {
            // Check if we're on the homepage
            const latestNewsSection = document.getElementById('latest-news');
            if (latestNewsSection) {
                // On homepage - show limited news (first 8 items)
                renderNewsItems(data.slice(0, 8), 'news-container');
            }
            
            // Check if we're on the all-news page
            const allNewsSection = document.getElementById('all-news');
            if (allNewsSection) {
                // On all-news page - show all news items
                renderNewsItems(data, 'all-news-container');
            }
        })
        .catch(error => {
            console.error('Error loading news data:', error);
        });
    
    // Load honors data
    let honorsJsonPath = 'data/honors.json';
    if (window.location.pathname.includes('/pages/')) {
        honorsJsonPath = '../data/honors.json';
    }
    
    fetch(honorsJsonPath)
        .then(response => response.json())
        .then(data => {
            // Check if we're on the homepage
            const honorsSection = document.getElementById('honors');
            if (honorsSection) {
                // On homepage - show limited honors (first 8 items)
                renderHonorsItems(data.slice(0, 8), 'honors-container');
            }
            
            // Check if we're on the all-honors page
            const allHonorsSection = document.getElementById('all-honors');
            if (allHonorsSection) {
                // On all-honors page - show all honors items
                renderHonorsItems(data, 'all-honors-container');
            }
        })
        .catch(error => {
            console.error('Error loading honors data:', error);
        });
});

// Function to load publications from JSON
function loadPublications() {
    let publicationsJsonPath = 'data/publications.json';
    if (window.location.pathname.includes('/pages/')) {
        publicationsJsonPath = '../data/publications.json';
    }

    const publicationsList = document.querySelector('.publications-list');
    if (!publicationsList) {
        console.warn('Publications list not found');
        return;
    }
    
    // Clear existing publications
    publicationsList.innerHTML = '';
    
    fetch(publicationsJsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(publications => {
            console.log('Loaded publications:', publications.length);
            
            // Filter publications to show on homepage based on showOnHomepage flag
            let pubsToShow = publications.filter(pub => pub.showOnHomepage === true);
            
            // Sort by year descending
            pubsToShow.sort((a, b) => {
                const yearA = parseInt(a.year) || 0;
                const yearB = parseInt(b.year) || 0;
                return yearB - yearA;
            });

            // Group by year
            const pubsByYear = {};
            pubsToShow.forEach(pub => {
                const year = pub.year || 'Unknown';
                if (!pubsByYear[year]) {
                    pubsByYear[year] = [];
                }
                pubsByYear[year].push(pub);
            });

            // Get sorted years
            const sortedYears = Object.keys(pubsByYear).sort((a, b) => b - a);

            // Render groups
            sortedYears.forEach(year => {
                const yearGroup = document.createElement('div');
                yearGroup.className = 'pub-year-group';

                // Year Header
                const yearHeader = document.createElement('h3');
                yearHeader.className = 'pub-year-header';
                yearHeader.textContent = `-${year}-`;
                yearGroup.appendChild(yearHeader);

                // List
                const ul = document.createElement('ul');
                ul.className = 'pub-list-ul';

                pubsByYear[year].forEach(pub => {
                    const li = document.createElement('li');
                    li.className = 'pub-list-item';

                    // --- Line 1: [Venue] Title ---
                    const line1 = document.createElement('div');
                    line1.className = 'pub-line-1';

                    // Venue Tag
                    const venueTagSpan = document.createElement('span');
                    const venueShort = getVenueShortName(pub.venue);
                    venueTagSpan.textContent = `[${venueShort}]`;
                    venueTagSpan.className = 'pub-venue-tag';
                    if (venueShort.toLowerCase().includes('arxiv')) {
                        venueTagSpan.classList.add('tag-arxiv');
                    } else {
                        venueTagSpan.classList.add('tag-conference');
                    }
                    line1.appendChild(venueTagSpan);

                    // Title Link
                    const titleLink = document.createElement('a');
                    titleLink.className = 'pub-title-link';
                    titleLink.textContent = pub.title;
                    
                    // Find a link (Paper > Code > Project)
                    let targetLink = '#';
                    if (pub.tags) {
                        const paperTag = pub.tags.find(t => t.text === 'Paper');
                        const codeTag = pub.tags.find(t => t.text === 'Code');
                        if (paperTag && paperTag.link) targetLink = paperTag.link;
                        else if (codeTag && codeTag.link) targetLink = codeTag.link;
                    }
                    titleLink.href = targetLink;
                    if (targetLink !== '#') titleLink.target = '_blank';
                    
                    line1.appendChild(titleLink);
                    li.appendChild(line1);

                    // --- Line 2: Authors ---
                    const line2 = document.createElement('div');
                    line2.className = 'pub-line-2';
                    line2.innerHTML = pub.authors; // keep innerHTML for <strong>/<u>
                    li.appendChild(line2);

                    // --- Line 3: Venue Details ---
                    const line3 = document.createElement('div');
                    line3.className = 'pub-line-3';
                    // Use the full venue string from JSON or highlight
                    // If highlight exists, append it? User said "one paper 3 lines".
                    // Let's combine venue and highlight/details.
                    let venueText = pub.venue || '';
                    if (pub.highlight) {
                        venueText += ` ${pub.highlight}`;
                    }
                    // Or if there's a more detailed venue name, use that.
                    // For now, use pub.venue.
                    line3.textContent = venueText;
                    li.appendChild(line3);

                    ul.appendChild(li);
                });

                yearGroup.appendChild(ul);
                publicationsList.appendChild(yearGroup);
            });
        })
        .catch(error => {
            console.error('Error loading publications data:', error);
            publicationsList.innerHTML = '<p>Failed to load publications. Please check the console for details.</p>';
        });
}

function getVenueShortName(venueStr) {
    if (!venueStr) return 'Unknown';
    // Remove year (4 digits at end or start)
    let s = venueStr.replace(/\d{4}/g, '').trim();
    // Special cases
    if (s.toLowerCase().includes('arxiv')) return 'ArXiv';
    if (s.includes('NeurIPS')) return 'NeurIPS';
    if (s.includes('CVPR')) return 'CVPR';
    if (s.includes('ICCV')) return 'ICCV';
    if (s.includes('ECCV')) return 'ECCV';
    if (s.includes('ICRA')) return 'ICRA';
    if (s.includes('AAAI')) return 'AAAI';
    if (s.includes('TDSC')) return 'IEEE TDSC';
    if (s.includes('TMC')) return 'IEEE TMC';
    if (s.includes('JSAC')) return 'IEEE JSAC';
    if (s.includes('GLOBECOM')) return 'GLOBECOM';
    
    // Default: take first word or split by common delimiters
    return s.split(/[\s,]+/)[0];
}

// Function to render news items
function renderNewsItems(newsData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('News container not found:', containerId);
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Add each news item to the container
    newsData.forEach(newsItem => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        
        // Create the date element
        const dateElement = document.createElement('span');
        dateElement.className = 'news-date';
        dateElement.textContent = newsItem.date;
        
        // Create the content element
        const contentElement = document.createElement('div');
        contentElement.className = 'news-content';
        
        // Create emoji and content text
        const textSpan = document.createElement('span');
        textSpan.innerHTML = '🎉 ' + newsItem.content;
        contentElement.appendChild(textSpan);
        
        // Add links if provided in the links array format
        if (newsItem.links && newsItem.links.length > 0) {
            newsItem.links.forEach(link => {
                const space = document.createTextNode(' ');
                contentElement.appendChild(space);
                
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.textContent = link.text;
                if (link.url && !link.url.startsWith('#')) {
                    linkElement.setAttribute('target', '_blank');
                }
                contentElement.appendChild(linkElement);
            });
        }
        
        // Check for old style link (backward compatibility)
        if (newsItem.link && newsItem.linkText) {
            const space = document.createTextNode(' ');
            contentElement.appendChild(space);
            
            const linkElement = document.createElement('a');
            linkElement.href = newsItem.link;
            linkElement.textContent = newsItem.linkText;
            if (newsItem.link && !newsItem.link.startsWith('#')) {
                linkElement.setAttribute('target', '_blank');
            }
            contentElement.appendChild(linkElement);
        }
        
        // Add date and content to the news item
        newsElement.appendChild(dateElement);
        newsElement.appendChild(contentElement);
        
        // Add the news item to the container
        container.appendChild(newsElement);
    });
}

// Function to render honors items
function renderHonorsItems(honorsData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Honors container not found:', containerId);
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Add each honor item to the container
    honorsData.forEach(honorItem => {
        const honorElement = document.createElement('div');
        honorElement.className = 'honor-item';
        
        // Create the year element
        const yearElement = document.createElement('div');
        yearElement.className = 'honor-year';
        
        const yearHighlight = document.createElement('span');
        yearHighlight.className = 'year-highlight';
        yearHighlight.textContent = honorItem.date;
        yearElement.appendChild(yearHighlight);
        
        // Create the content element
        const contentElement = document.createElement('div');
        contentElement.className = 'honor-content';
        
        // Create the title element
        const titleElement = document.createElement('h3');
        titleElement.textContent = honorItem.title;
        contentElement.appendChild(titleElement);
        
        // Create the description element
        const descElement = document.createElement('p');
        descElement.innerHTML = honorItem.description;
        contentElement.appendChild(descElement);
        
        // Add year and content to the honor item
        honorElement.appendChild(yearElement);
        honorElement.appendChild(contentElement);
        
        // Add the honor item to the container
        container.appendChild(honorElement);
    });
}

// Function to make all links open in a new tab
function makeAllLinksOpenInNewTab() {
    // Get all links in the document
    const links = document.querySelectorAll('a');
    
    // Loop through each link
    links.forEach(link => {
        const href = link.getAttribute('href');
        // Skip navigation links (links that start with #) and links without href
        if (href && !href.startsWith('#')) {
            // Set target to _blank to open in a new tab
            link.setAttribute('target', '_blank');
        }
    });
}

// Function to set up a MutationObserver to watch for new links
function setupLinkObserver() {
    // Select the target node (in this case, the entire document body)
    const targetNode = document.body;
    
    // Options for the observer (which mutations to observe)
    const config = { 
        childList: true, // observe direct children
        subtree: true, // and lower descendants too
        characterData: false, // don't care about text changes
        attributes: false // don't care about attribute changes
    };
    
    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        // Check if any new nodes were added
        let newLinksAdded = false;
        
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are links or contain links
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.tagName === 'A') {
                            newLinksAdded = true;
                            break;
                        } else if (node.querySelectorAll) {
                            const links = node.querySelectorAll('a');
                            if (links.length > 0) {
                                newLinksAdded = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            if (newLinksAdded) break;
        }
        
        // If new links were added, update them to open in new tabs
        if (newLinksAdded) {
            makeAllLinksOpenInNewTab();
        }
    };
    
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
} 