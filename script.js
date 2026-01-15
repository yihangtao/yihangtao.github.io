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
            const pubsToShow = publications.filter(pub => pub.showOnHomepage === true);
            
            pubsToShow.forEach((pub, index) => {
                const pubElement = document.createElement('div');
                pubElement.className = 'publication';
                
                // Create publication content container
                const contentElement = document.createElement('div');
                contentElement.className = 'pub-content';
                
                // 1. Add Title (H3, Bold, Primary)
                const titleElement = document.createElement('h3');
                titleElement.className = 'pub-title';
                titleElement.textContent = pub.title;
                contentElement.appendChild(titleElement);
                
                // 2. Add Authors (Regular, Neutral)
                const authorsElement = document.createElement('p');
                authorsElement.className = 'pub-authors';
                authorsElement.innerHTML = pub.authors;
                contentElement.appendChild(authorsElement);
                
                // 3. Add Venue (Distinct style)
                if (pub.venue) {
                    const venueNameElement = document.createElement('div');
                    venueNameElement.className = 'pub-venue';
                    venueNameElement.textContent = pub.venue;
                    contentElement.appendChild(venueNameElement);
                }
                
                // Add highlight if exists
                if (pub.highlight) {
                    const highlightElement = document.createElement('p');
                    highlightElement.className = 'pub-highlight';
                    highlightElement.textContent = pub.highlight;
                    contentElement.appendChild(highlightElement);
                }
                
                // Add tags
                if (pub.tags && pub.tags.length > 0) {
                    const tagsContainer = document.createElement('div');
                    tagsContainer.className = 'pub-tags';
                    
                    pub.tags.forEach(tag => {
                        if (tag.link) {
                            const tagLink = document.createElement('a');
                            tagLink.href = tag.link;
                            tagLink.className = `tag ${tag.class || ''}`;
                            tagLink.textContent = tag.text;
                            if (!tag.link.startsWith('#')) {
                                tagLink.setAttribute('target', '_blank');
                            }
                            tagsContainer.appendChild(tagLink);
                        } else {
                            const tagSpan = document.createElement('span');
                            tagSpan.className = `tag ${tag.class || ''}`;
                            tagSpan.textContent = tag.text;
                            tagsContainer.appendChild(tagSpan);
                        }
                    });
                    
                    contentElement.appendChild(tagsContainer);
                }
                
                // Add GitHub stats if exists
                if (pub.githubStats) {
                    const statsDiv = document.createElement('div');
                    statsDiv.className = 'pub-github-stats';
                    
                    if (pub.githubStats.stars !== undefined) {
                        const starStat = document.createElement('div');
                        starStat.className = 'github-stat';
                        starStat.innerHTML = `<i class="fab fa-github github-icon"></i><i class="fas fa-star star-icon"></i><span class="count">${pub.githubStats.stars}</span>`;
                        statsDiv.appendChild(starStat);
                    }
                    
                    if (pub.githubStats.forks !== undefined) {
                        const forkStat = document.createElement('div');
                        forkStat.className = 'github-stat';
                        forkStat.innerHTML = `<i class="fas fa-code-branch fork-icon"></i><span class="count">${pub.githubStats.forks}</span>`;
                        statsDiv.appendChild(forkStat);
                    }
                    
                    contentElement.appendChild(statsDiv);
                }
                
                // Add to publications list
                pubElement.appendChild(contentElement);
                publicationsList.appendChild(pubElement);
            });
        })
        .catch(error => {
            console.error('Error loading publications data:', error);
            publicationsList.innerHTML = '<p>Failed to load publications. Please check the console for details.</p>';
        });
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