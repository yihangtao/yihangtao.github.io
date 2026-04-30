document.addEventListener('DOMContentLoaded', function() {
    // Make all links open in a new tab
    makeAllLinksOpenInNewTab();

    // Set up MutationObserver to watch for dynamically added links
    setupLinkObserver();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when a link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
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

            const pubsToShow = publications
                .filter(pub => pub.showOnHomepage)
                .sort((a, b) => {
                    const orderA = a.featuredOrder ?? Number.MAX_SAFE_INTEGER;
                    const orderB = b.featuredOrder ?? Number.MAX_SAFE_INTEGER;
                    if (orderA !== orderB) {
                        return orderA - orderB;
                    }

                    const yearA = a.year ? parseInt(a.year, 10) : 0;
                    const yearB = b.year ? parseInt(b.year, 10) : 0;
                    return yearB - yearA;
                });

            renderFeaturedPublications(publicationsList, pubsToShow);
        })
        .catch(error => {
            console.error('Error loading publications data:', error);
            publicationsList.innerHTML = '<p>Failed to load publications. Please check the console for details.</p>';
        });
}

function renderFeaturedPublications(container, publications) {
    container.innerHTML = '';

    if (!publications.length) {
        container.innerHTML = '<p>No featured publications available.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'pub-list-ul';

    publications.forEach(pub => {
        ul.appendChild(createFeaturedPublicationItem(pub));
    });

    container.appendChild(ul);
}

function createFeaturedPublicationItem(pub) {
    const li = document.createElement('li');
    li.className = 'pub-list-item with-thumbnail-expanded';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'pub-content-wrapper';

    const line1 = document.createElement('div');
    line1.className = 'pub-line-1';

    const venueShort = getVenueShortName(pub.venue, pub.year);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'pub-title-text';
    titleSpan.textContent = pub.displayTitle || pub.title;
    line1.appendChild(titleSpan);

    contentWrapper.appendChild(line1);

    const line2 = document.createElement('div');
    line2.className = 'pub-line-2';
    line2.innerHTML = pub.authors;
    contentWrapper.appendChild(line2);

    const line3 = document.createElement('div');
    line3.className = 'pub-line-3';

    const highlightText = pub.highlight || '';
    let badgeText = '';
    if (highlightText.toLowerCase().includes('oral')) badgeText = 'Oral';
    else if (highlightText.toLowerCase().includes('spotlight')) badgeText = 'Spotlight';

    const fullVenueName = getVenueFullName(pub.venue, pub.year);
    const venueNameSpan = document.createElement('span');
    venueNameSpan.textContent = fullVenueName;
    line3.appendChild(venueNameSpan);

    if (shouldShowVenueTag(pub.venue, fullVenueName, venueShort)) {
        const venueTagSpan = document.createElement('span');
        venueTagSpan.textContent = venueShort;
        venueTagSpan.className = 'pub-venue-tag pub-venue-inline-tag';

        const lowerVenue = venueShort.toLowerCase();
        if (lowerVenue.includes('under review') || lowerVenue.includes('preprint') || lowerVenue.includes('arxiv')) {
            venueTagSpan.classList.add('tag-under-review');
        } else {
            venueTagSpan.classList.add('tag-conference');
        }
        line3.appendChild(venueTagSpan);
    }

    if (badgeText) {
        const badge = document.createElement('span');
        badge.className = 'pub-badge-highlight';
        badge.textContent = badgeText;
        line3.appendChild(badge);
    }

    contentWrapper.appendChild(line3);

    if (pub.tags) {
        const line4 = document.createElement('div');
        line4.className = 'pub-line-4';

        pub.tags.forEach(tag => {
            if (tag.link && tag.link !== '#') {
                const btn = document.createElement('a');
                btn.className = 'pub-link-btn';
                btn.href = tag.link;
                btn.target = '_blank';
                btn.rel = 'noopener noreferrer';
                btn.textContent = tag.text === 'Paper' ? 'PDF' : tag.text;
                line4.appendChild(btn);
            }
        });

        if (line4.children.length > 0) {
            contentWrapper.appendChild(line4);
        }
    }

    li.appendChild(contentWrapper);

    if (pub.thumbnail) {
        const thumbBox = document.createElement('div');
        thumbBox.className = 'pub-thumbnail-box';

        const thumbImg = document.createElement('img');
        const preferredThumbnail = getPreferredThumbnail(pub.thumbnail);
        thumbImg.src = preferredThumbnail.primary;
        thumbImg.alt = `${pub.title} thumbnail`;
        thumbImg.loading = 'lazy';
        thumbImg.onerror = function() {
            if (this.src !== preferredThumbnail.fallback) {
                this.onerror = null;
                this.src = preferredThumbnail.fallback;
            }
        };

        thumbBox.appendChild(thumbImg);
        li.appendChild(thumbBox);
    }

    return li;
}

function getPreferredThumbnail(thumbnailPath) {
    const lastSlash = thumbnailPath.lastIndexOf('/');
    if (lastSlash === -1) {
        return { primary: thumbnailPath, fallback: thumbnailPath };
    }

    const directory = thumbnailPath.substring(0, lastSlash);
    return {
        primary: `${directory}/demo.gif`,
        fallback: thumbnailPath
    };
}

function getVenueShortName(venueStr, year) {
    if (!venueStr) return 'Preprint';
    
    // Check for revision status
    let revisionSuffix = '';
    if (venueStr.toLowerCase().includes('major revision')) {
        revisionSuffix = ', Major';
    } else if (venueStr.toLowerCase().includes('minor revision')) {
        revisionSuffix = ', Minor';
    }

    // Remove year (4 digits at end or start)
    let s = venueStr.replace(/\d{4}/g, '').trim();
    let suffix = '';
    
    // Check if it is a conference that needs year suffix
    const conferences = ['NeurIPS', 'CVPR', 'ICCV', 'ECCV', 'ICRA', 'AAAI', 'GLOBECOM', 'INFOCOM', 'MOBICOM'];
    for (const conf of conferences) {
        if (s.includes(conf)) {
            // Get last two digits of year
            if (year) {
                const yearStr = year.toString();
                if (yearStr.length === 4) {
                    suffix = "'" + yearStr.substring(2);
                }
            }
            return conf + suffix + revisionSuffix;
        }
    }

    // Special cases
    if (s.toLowerCase().includes('arxiv')) return 'ArXiv' + revisionSuffix; // No year
    
    // Journals or specific conferences
    if (s.includes('TDSC')) return 'IEEE TDSC' + revisionSuffix;
    if (s.includes('TMC')) return 'IEEE TMC' + revisionSuffix;
    if (s.includes('JSAC')) return 'IEEE JSAC' + revisionSuffix;
    if (s.includes('TGCN')) return 'IEEE TGCN' + revisionSuffix;
    if (s.includes('LNET')) return 'IEEE LNET' + revisionSuffix;
    if (s.includes('TNSE')) return 'IEEE TNSE' + revisionSuffix;
    if (s.includes('IOTJ') || s.includes('IoTJ')) return 'IEEE IoTJ' + revisionSuffix;

    return s;
}

function getVenueFullName(venueStr, year) {
    if (!venueStr) return '';
    let s = venueStr.replace(/\d{4}/g, '').trim(); // Remove year

    // Journal Full Names Mapping (No Year)
    if (s.includes('TDSC')) return 'IEEE Transactions on Dependable and Secure Computing';
    if (s.includes('TMC')) return 'IEEE Transactions on Mobile Computing';
    if (s.includes('JSAC')) return 'IEEE Journal on Selected Areas in Communications';
    if (s.includes('TGCN')) return 'IEEE Transactions on Green Communications and Networking';
    if (s.includes('TNSE')) return 'IEEE Transactions on Network Science and Engineering';
    if (s.includes('IoTJ') || s.includes('IoTJ')) return 'IEEE Internet of Things Journal';
    if (s.includes('LNET') || s.includes('LNet')) return 'IEEE Networking Letters';
    
    // Conference Full Names Mapping (With Year Suffix)
    if (s.includes('NeurIPS')) return 'Annual Conference on Neural Information Processing Systems';
    if (s.includes('CVPR')) return 'IEEE/CVF Conference on Computer Vision and Pattern Recognition';
    if (s.includes('ICCV')) return 'IEEE/CVF International Conference on Computer Vision';
    if (s.includes('ECCV')) return 'European Conference on Computer Vision';
    if (s.includes('ICRA')) return 'IEEE International Conference on Robotics and Automation';
    if (s.includes('AAAI')) return 'AAAI Conference on Artificial Intelligence';
    if (s.includes('GLOBECOM')) return 'IEEE Global Communications Conference';
    if (s.includes('INFOCOM')) return 'IEEE International Conference on Computer Communications';
    if (s.includes('MOBICOM')) return 'Annual International Conference on Mobile Computing and Networking';
    
    if (s.toLowerCase().includes('arxiv')) return 'arXiv preprint';
    
    return s;
}

function shouldShowVenueTag(venueStr, fullVenueName, venueShort) {
    if (!venueShort) return false;

    const shortLower = venueShort.toLowerCase().trim();
    const fullLower = (fullVenueName || '').toLowerCase().trim();

    if (!fullLower || shortLower === fullLower) {
        return false;
    }

    if (venueStr && venueStr.toLowerCase().includes('under review')) {
        return false;
    }

    return true;
}

function getCCFRank(fullName, originalVenue) {
    const v = (fullName + ' ' + originalVenue).toLowerCase();
    
    // CCF-A
    if (v.includes('tdsc') || v.includes('dependable and secure') || 
        v.includes('tmc') || v.includes('mobile computing') || 
        v.includes('aaai') || v.includes('neurips') || 
        v.includes('cvpr') || v.includes('iccv') || 
        v.includes('infocom') || v.includes('jsac')) {
        return 'A';
    }
    
    // CCF-B
    if (v.includes('icra')) {
        return 'B';
    }
    
    // CCF-C
    if (v.includes('globecom')) {
        return 'C';
    }
    
    return null;
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
