// Calculate and update age dynamically
function updateAge() {
    const birthDate = new Date(2003, 1, 10); // February 10, 2003
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const ageElement = document.getElementById('age');
    if (ageElement) {
        ageElement.textContent = age;
    }
}

// Back to top button functionality
const mybutton = document.getElementById("myBtn");

window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Dark Mode Toggle
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// Language Toggle with Scroll Position Memory
function initLanguageSwitch() {
    const languageToggle = document.getElementById('languageToggle');
    const languageFlag = document.getElementById('languageFlag');
    const currentLang = document.documentElement.lang || 'ja';

    if (languageToggle && languageFlag) {
        languageToggle.addEventListener('click', function() {
            // Save current scroll position before redirecting
            const scrollPosition = window.scrollY;
            localStorage.setItem('scrollPosition', scrollPosition);

            if (currentLang === 'ja') {
                window.location.href = 'index-en.html';
            } else {
                window.location.href = 'index.html';
            }
        });
    }
}

// Get current language from HTML lang attribute
function getCurrentLanguage() {
    return document.documentElement.lang || 'ja';
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode and language
    initDarkMode();
    initLanguageSwitch();

    // Update age on page load
    updateAge();

    // Restore scroll position if it was saved
    const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition !== null) {
        // Use setTimeout to ensure DOM is fully rendered before scrolling
        setTimeout(function() {
            window.scrollTo(0, parseInt(savedScrollPosition));
            localStorage.removeItem('scrollPosition');
        }, 100);
    }

    const navLinks = document.querySelectorAll('.nav-link, .scroll-indicator a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.padding = '0.5rem 0';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.padding = '1rem 0';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards
    const cards = document.querySelectorAll('.info-card, .article-card, .skill-tag');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // Fetch articles from Qiita and Zenn
    fetchArticles();
});

async function fetchArticles() {
    try {
        const container = document.getElementById('articles-container');
        container.innerHTML = '';

        // Fetch Qiita articles (with cache)
        const qiitaArticles = await fetchArticlesWithCache('qiita', fetchQiitaArticles);

        // Fetch Zenn articles (with cache)
        const zennArticles = await fetchArticlesWithCache('zenn', fetchZennArticles);

        // Combine and sort articles by date (newest first)
        const allArticles = [
            ...qiitaArticles.map(article => ({
                ...article,
                source: 'Qiita'
            })),
            ...zennArticles.map(article => ({
                ...article,
                source: 'Zenn'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

        // Display articles
        const currentLang = getCurrentLanguage();
        const locale = currentLang === 'ja' ? 'ja-JP' : 'en-US';
        const readButtonText = currentLang === 'ja' ? '読む' : 'Read';

        allArticles.forEach(article => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';

            const date = new Date(article.date);
            const formattedDate = date.toLocaleDateString(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            // Show likes only for Qiita articles
            const likesHTML = article.source === 'Qiita'
                ? `<div class="article-likes"><i class="fas fa-heart"></i> ${article.likes || 0}</div>`
                : '';

            col.innerHTML = `
                <div class="article-card">
                    <div class="article-header">
                        <div class="article-source">${article.source}</div>
                        ${likesHTML}
                    </div>
                    <div class="article-date">${formattedDate}</div>
                    <h4 class="article-title">${article.title}</h4>
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${article.url}" class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener">
                        <i class="fas fa-link me-1"></i>${readButtonText}
                    </a>
                </div>
            `;

            container.appendChild(col);
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        const container = document.getElementById('articles-container');
        const currentLang = getCurrentLanguage();
        const errorMessage = currentLang === 'ja' ? '記事の読み込みに失敗しました' : 'Failed to load articles';
        container.innerHTML = `<p class="text-center text-muted">${errorMessage}</p>`;
    }
}

// Cache articles for 24 hours
async function fetchArticlesWithCache(cacheKey, fetchFunction) {
    const now = Date.now();
    const cacheData = localStorage.getItem(`${cacheKey}_cache`);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Check if cache exists and is still valid
    if (cacheData && cacheTimestamp) {
        const lastCacheTime = parseInt(cacheTimestamp);
        if (now - lastCacheTime < CACHE_DURATION) {
            console.log(`Using cached ${cacheKey} articles`);
            return JSON.parse(cacheData);
        }
    }

    // Cache expired or doesn't exist, fetch new data
    console.log(`Fetching fresh ${cacheKey} articles`);
    const articles = await fetchFunction();

    // Save to cache
    if (articles.length > 0) {
        localStorage.setItem(`${cacheKey}_cache`, JSON.stringify(articles));
        localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
    }

    return articles;
}

// Qiita APIから記事を取得
async function fetchQiitaArticles() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`https://qiita.com/api/v2/users/ta282ji/items?per_page=10&t=${timestamp}`);

        if (!response.ok) {
            console.warn(`Qiita API returned ${response.status}: ${response.statusText}`);
            return [];
        }

        const articles = await response.json();

        if (!Array.isArray(articles)) {
            console.warn('Qiita API response is not an array');
            return [];
        }

        return articles.map(article => ({
            title: article.title,
            url: article.url,
            date: article.created_at,
            tags: article.tags.map(tag => tag.name),
            likes: article.likes_count || 0
        }));
    } catch (error) {
        console.error('Error fetching Qiita articles:', error);
        return [];
    }
}

// ZennのRSSフィードから記事を取得
async function fetchZennArticles() {
    try {
        const RSS_URL = 'https://zenn.dev/ta282ji/feed';
        const timestamp = new Date().getTime();
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&t=${timestamp}`;

        const response = await fetch(API_URL);

        if (!response.ok) {
            console.warn(`RSS2JSON API returned ${response.status}: ${response.statusText}`);
            return [];
        }

        const data = await response.json();

        if (data.status !== 'ok') {
            console.warn(`RSS2JSON status: ${data.status}`);
            return [];
        }

        if (!Array.isArray(data.items)) {
            console.warn('RSS2JSON items is not an array');
            return [];
        }

        return data.items.map(item => ({
            title: item.title,
            url: item.link,
            date: item.pubDate,
            tags: item.categories || []
        }));
    } catch (error) {
        console.error('Error fetching Zenn articles:', error);
        return [];
    }
}
