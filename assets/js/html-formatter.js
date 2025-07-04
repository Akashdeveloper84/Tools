// HTML Formatter Tool JavaScript
class HTMLFormatter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadSample();
    }

    initializeElements() {
        this.htmlInput = document.getElementById('htmlInput');
        this.htmlOutput = document.getElementById('htmlOutput');
        this.outputContainer = document.getElementById('outputContainer');
        this.formatBtn = document.getElementById('formatBtn');
        this.minifyBtn = document.getElementById('minifyBtn');
        this.validateBtn = document.getElementById('validateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.loadSampleBtn = document.getElementById('loadSampleBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.indentSize = document.getElementById('indentSize');
        this.indentType = document.getElementById('indentType');
        this.maxLineLength = document.getElementById('maxLineLength');
        this.themeSelect = document.getElementById('themeSelect');
        
        // Statistics elements
        this.originalLines = document.getElementById('originalLines');
        this.formattedLines = document.getElementById('formattedLines');
        this.originalSize = document.getElementById('originalSize');
        this.formattedSize = document.getElementById('formattedSize');
    }

    bindEvents() {
        this.formatBtn.addEventListener('click', () => this.formatHTML());
        this.minifyBtn.addEventListener('click', () => this.minifyHTML());
        this.validateBtn.addEventListener('click', () => this.validateHTML());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn.addEventListener('click', () => this.downloadHTML());
        this.loadSampleBtn.addEventListener('click', () => this.loadSample());
        this.clearBtn.addEventListener('click', () => this.clearInput());
        this.themeSelect.addEventListener('change', () => this.changeTheme());
        
        // Auto-format on input change
        this.htmlInput.addEventListener('input', () => this.updateStatistics());
    }

    loadSample() {
        const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="hero">
            <h1>Welcome to Our Website</h1>
            <p>This is a sample HTML document to demonstrate the formatter.</p>
            <button onclick="alert('Hello!')">Click Me</button>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Sample Website. All rights reserved.</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>`;
        
        this.htmlInput.value = sampleHTML;
        this.updateStatistics();
    }

    clearInput() {
        this.htmlInput.value = '';
        this.outputContainer.classList.add('d-none');
        this.updateStatistics();
    }

    updateStatistics() {
        const input = this.htmlInput.value;
        const lines = input.split('\n').length;
        const size = new Blob([input]).size;
        
        this.originalLines.textContent = lines;
        this.originalSize.textContent = this.formatFileSize(size);
    }

    formatHTML() {
        const input = this.htmlInput.value.trim();
        
        if (!input) {
            WebTools.showAlert('Please enter some HTML code to format.', 'warning');
            return;
        }

        try {
            const formatted = this.beautifyHTML(input);
            this.displayOutput(formatted);
            WebTools.showAlert('HTML formatted successfully!', 'success');
        } catch (error) {
            console.error('Formatting error:', error);
            WebTools.showAlert('Error formatting HTML. Please check your code.', 'danger');
        }
    }

    minifyHTML() {
        const input = this.htmlInput.value.trim();
        
        if (!input) {
            WebTools.showAlert('Please enter some HTML code to minify.', 'warning');
            return;
        }

        try {
            const minified = this.minifyHTMLCode(input);
            this.displayOutput(minified);
            WebTools.showAlert('HTML minified successfully!', 'success');
        } catch (error) {
            console.error('Minification error:', error);
            WebTools.showAlert('Error minifying HTML. Please check your code.', 'danger');
        }
    }

    validateHTML() {
        const input = this.htmlInput.value.trim();
        
        if (!input) {
            WebTools.showAlert('Please enter some HTML code to validate.', 'warning');
            return;
        }

        try {
            const validation = this.validateHTMLCode(input);
            this.showValidationResults(validation);
        } catch (error) {
            console.error('Validation error:', error);
            WebTools.showAlert('Error validating HTML.', 'danger');
        }
    }

    beautifyHTML(html) {
        // Remove existing whitespace and comments
        html = html.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
        html = html.replace(/>\s+</g, '><'); // Remove whitespace between tags
        html = html.replace(/\s+/g, ' '); // Normalize whitespace
        html = html.trim();

        const indentSize = parseInt(this.indentSize.value);
        const indentChar = this.indentType.value === 'tabs' ? '\t' : ' '.repeat(indentSize);
        const maxLineLength = parseInt(this.maxLineLength.value);

        let formatted = '';
        let indentLevel = 0;
        let inTag = false;
        let inAttribute = false;
        let currentLine = '';
        let i = 0;

        while (i < html.length) {
            const char = html[i];
            const nextChar = html[i + 1];

            if (char === '<') {
                if (nextChar === '/') {
                    // Closing tag
                    if (indentLevel > 0) indentLevel--;
                    if (currentLine.trim()) {
                        formatted += currentLine + '\n';
                        currentLine = '';
                    }
                    currentLine = indentChar.repeat(indentLevel);
                } else if (nextChar === '!' || nextChar === '?') {
                    // Special tags (DOCTYPE, XML declaration)
                    if (currentLine.trim()) {
                        formatted += currentLine + '\n';
                        currentLine = '';
                    }
                    currentLine = indentChar.repeat(indentLevel);
                } else {
                    // Opening tag
                    if (currentLine.trim()) {
                        formatted += currentLine + '\n';
                        currentLine = '';
                    }
                    currentLine = indentChar.repeat(indentLevel);
                    if (!['img', 'br', 'hr', 'input', 'meta', 'link'].includes(this.getTagName(html, i))) {
                        indentLevel++;
                    }
                }
                inTag = true;
            } else if (char === '>') {
                inTag = false;
                inAttribute = false;
            } else if (char === '"' && inTag) {
                inAttribute = !inAttribute;
            }

            currentLine += char;

            // Check if we need to break the line
            if (currentLine.length > maxLineLength && !inAttribute && inTag) {
                const lastSpace = currentLine.lastIndexOf(' ');
                if (lastSpace > maxLineLength * 0.7) {
                    formatted += currentLine.substring(0, lastSpace) + '\n';
                    currentLine = indentChar.repeat(indentLevel + 1) + currentLine.substring(lastSpace + 1);
                }
            }

            i++;
        }

        if (currentLine.trim()) {
            formatted += currentLine;
        }

        return formatted;
    }

    getTagName(html, index) {
        const tagStart = html.indexOf('<', index) + 1;
        const tagEnd = html.indexOf(' ', tagStart);
        const tagEnd2 = html.indexOf('>', tagStart);
        const end = tagEnd > 0 && tagEnd < tagEnd2 ? tagEnd : tagEnd2;
        return html.substring(tagStart, end).toLowerCase();
    }

    minifyHTMLCode(html) {
        return html
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/>\s+</g, '><') // Remove whitespace between tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/>\s+$/gm, '>') // Remove trailing whitespace
            .replace(/^\s+</gm, '<') // Remove leading whitespace
            .trim();
    }

    validateHTMLCode(html) {
        const errors = [];
        const warnings = [];

        // Basic validation checks
        const openTags = [];
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        
        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
        let match;

        while ((match = tagRegex.exec(html)) !== null) {
            const tagName = match[1].toLowerCase();
            const isClosing = match[0].startsWith('</');
            const isSelfClosing = selfClosingTags.includes(tagName);

            if (isClosing) {
                if (openTags.length === 0) {
                    errors.push(`Unexpected closing tag: </${tagName}>`);
                } else {
                    const lastOpenTag = openTags.pop();
                    if (lastOpenTag !== tagName) {
                        errors.push(`Mismatched tags: <${lastOpenTag}> and </${tagName}>`);
                    }
                }
            } else if (!isSelfClosing) {
                openTags.push(tagName);
            }
        }

        if (openTags.length > 0) {
            errors.push(`Unclosed tags: ${openTags.join(', ')}`);
        }

        // Check for common issues
        if (!html.includes('<!DOCTYPE')) {
            warnings.push('Missing DOCTYPE declaration');
        }

        if (!html.includes('<html')) {
            warnings.push('Missing <html> tag');
        }

        if (!html.includes('<head')) {
            warnings.push('Missing <head> tag');
        }

        if (!html.includes('<body')) {
            warnings.push('Missing <body> tag');
        }

        if (!html.includes('<title')) {
            warnings.push('Missing <title> tag');
        }

        return { errors, warnings };
    }

    showValidationResults(validation) {
        const { errors, warnings } = validation;
        
        let message = '';
        if (errors.length === 0 && warnings.length === 0) {
            message = '✅ HTML is valid!';
        } else {
            if (errors.length > 0) {
                message += `❌ ${errors.length} error(s):\n${errors.join('\n')}\n\n`;
            }
            if (warnings.length > 0) {
                message += `⚠️ ${warnings.length} warning(s):\n${warnings.join('\n')}`;
            }
        }

        WebTools.showAlert(message, errors.length > 0 ? 'danger' : 'warning');
    }

    displayOutput(formattedHTML) {
        this.htmlOutput.querySelector('code').textContent = formattedHTML;
        Prism.highlightElement(this.htmlOutput.querySelector('code'));
        
        this.outputContainer.classList.remove('d-none');
        
        // Update statistics
        const lines = formattedHTML.split('\n').length;
        const size = new Blob([formattedHTML]).size;
        
        this.formattedLines.textContent = lines;
        this.formattedSize.textContent = this.formatFileSize(size);
    }

    copyToClipboard() {
        const code = this.htmlOutput.querySelector('code').textContent;
        WebTools.copyToClipboard(code);
    }

    downloadHTML() {
        const code = this.htmlOutput.querySelector('code').textContent;
        const filename = 'formatted.html';
        WebTools.downloadFile(code, filename, 'text/html');
    }

    changeTheme() {
        const theme = this.themeSelect.value;
        const link = document.querySelector('link[href*="prism"]');
        
        if (link) {
            if (theme === 'dark') {
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
            } else {
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
            }
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the HTML formatter when the page loads
let htmlFormatter;
document.addEventListener('DOMContentLoaded', function() {
    htmlFormatter = new HTMLFormatter();
});

// Add CSS for the formatter
const style = document.createElement('style');
style.textContent = `
    .code-textarea {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        resize: vertical;
        min-height: 300px;
    }
    
    .code-container {
        position: relative;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        overflow: hidden;
    }
    
    .code-container pre {
        margin: 0;
        padding: 1rem;
        background: var(--card-bg);
        max-height: 500px;
        overflow-y: auto;
    }
    
    .code-container code {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
    }
    
    .search-result-card {
        cursor: pointer;
        transition: var(--transition);
    }
    
    .search-result-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    
    .search-result-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, var(--primary-color), #0056b3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
`;
document.head.appendChild(style); 