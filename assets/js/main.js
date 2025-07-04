// Main JavaScript for WebTools Pro
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initDarkMode();
    initSearch();
    initToolCards();
    initScrollEffects();
    initAdSense();
});

// Dark Mode Toggle
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);
    darkModeToggle.checked = currentTheme === 'dark';
    
    darkModeToggle.addEventListener('change', function() {
        const theme = this.checked ? 'dark' : 'light';
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Add animation class
        body.classList.add('theme-transition');
        setTimeout(() => {
            body.classList.remove('theme-transition');
        }, 300);
    });
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    const tools = [
        { name: 'Image Compressor', url: 'tools/image-compressor.html', category: 'Image Tools', icon: 'fas fa-compress' },
        { name: 'Image Resizer', url: 'tools/image-resizer.html', category: 'Image Tools', icon: 'fas fa-expand-arrows-alt' },
        { name: 'Background Remover', url: 'tools/background-remover.html', category: 'Image Tools', icon: 'fas fa-cut' },
        { name: 'HTML Formatter', url: 'tools/html-formatter.html', category: 'Code Tools', icon: 'fab fa-html5' },
        { name: 'CSS Minifier', url: 'tools/css-minifier.html', category: 'Code Tools', icon: 'fab fa-css3-alt' },
        { name: 'JSON Viewer', url: 'tools/json-viewer.html', category: 'Code Tools', icon: 'fas fa-brackets-curly' },
        { name: 'Calculator', url: 'tools/calculator.html', category: 'Math Tools', icon: 'fas fa-calculator' },
        { name: 'Percentage Calculator', url: 'tools/percentage-calculator.html', category: 'Math Tools', icon: 'fas fa-percentage' },
        { name: 'Equation Solver', url: 'tools/equation-solver.html', category: 'Math Tools', icon: 'fas fa-square-root-alt' },
        { name: 'Unit Converter', url: 'tools/unit-converter.html', category: 'Converters', icon: 'fas fa-ruler' },
        { name: 'Currency Converter', url: 'tools/currency-converter.html', category: 'Converters', icon: 'fas fa-dollar-sign' },
        { name: 'Text to Speech', url: 'tools/text-to-speech.html', category: 'Converters', icon: 'fas fa-volume-up' },
        { name: 'QR Code Generator', url: 'tools/qr-generator.html', category: 'Utilities', icon: 'fas fa-qrcode' },
        { name: 'Password Generator', url: 'tools/password-generator.html', category: 'Utilities', icon: 'fas fa-key' },
        { name: 'Word Counter', url: 'tools/word-counter.html', category: 'Utilities', icon: 'fas fa-calculator' }
    ];
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.innerHTML = '<p class="text-muted">Enter at least 2 characters to search...</p>';
            return;
        }
        
        const filteredTools = tools.filter(tool => 
            tool.name.toLowerCase().includes(query) || 
            tool.category.toLowerCase().includes(query)
        );
        
        if (filteredTools.length === 0) {
            searchResults.innerHTML = '<p class="text-muted">No tools found matching your search.</p>';
            return;
        }
        
        const resultsHTML = filteredTools.map(tool => `
            <div class="col-md-6">
                <div class="card search-result-card" onclick="window.location.href='${tool.url}'">
                    <div class="card-body d-flex align-items-center">
                        <div class="search-result-icon me-3">
                            <i class="${tool.icon}"></i>
                        </div>
                        <div>
                            <h6 class="card-title mb-1">${tool.name}</h6>
                            <small class="text-muted">${tool.category}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        searchResults.innerHTML = resultsHTML;
    }
    
    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Tool Cards Animation
function initToolCards() {
    const toolCards = document.querySelectorAll('.tool-card, .popular-tool-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    toolCards.forEach(card => {
        observer.observe(card);
    });
}

// Scroll Effects
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class for navbar styling
        if (scrollTop > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Google AdSense
function initAdSense() {
    // AdSense code is already included in HTML
    // This function can be used for additional ad management
    console.log('AdSense initialized');
}

// Utility Functions
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
        element.disabled = true;
    }
}

function hideLoading(element, originalText) {
    if (element) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the page
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(() => {
        showAlert('Failed to copy to clipboard', 'danger');
    });
}

function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// PWA Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Analytics (if needed)
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Export functions for use in tool pages
window.WebTools = {
    showLoading,
    hideLoading,
    showAlert,
    copyToClipboard,
    downloadFile,
    trackEvent
}; 