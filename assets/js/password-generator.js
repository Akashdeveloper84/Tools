// Password Generator Tool JavaScript
class PasswordGenerator {
    constructor() {
        this.passwordHistory = [];
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.generatePassword();
    }

    initializeElements() {
        this.passwordLength = document.getElementById('passwordLength');
        this.lengthValue = document.getElementById('lengthValue');
        this.uppercase = document.getElementById('uppercase');
        this.lowercase = document.getElementById('lowercase');
        this.numbers = document.getElementById('numbers');
        this.symbols = document.getElementById('symbols');
        this.excludeSimilar = document.getElementById('excludeSimilar');
        this.excludeAmbiguous = document.getElementById('excludeAmbiguous');
        
        this.strengthBar = document.getElementById('strengthBar');
        this.strengthText = document.getElementById('strengthText');
        this.entropyValue = document.getElementById('entropyValue');
        
        this.generateBtn = document.getElementById('generateBtn');
        this.generateMultipleBtn = document.getElementById('generateMultipleBtn');
        this.generatedPassword = document.getElementById('generatedPassword');
        this.togglePassword = document.getElementById('togglePassword');
        this.copyPassword = document.getElementById('copyPassword');
        
        this.multiplePasswords = document.getElementById('multiplePasswords');
        this.passwordList = document.getElementById('passwordList');
        this.copyAllBtn = document.getElementById('copyAllBtn');
        
        this.passwordHistory = document.getElementById('passwordHistory');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    }

    bindEvents() {
        this.passwordLength.addEventListener('input', () => {
            this.lengthValue.textContent = this.passwordLength.value;
            this.generatePassword();
        });

        [this.uppercase, this.lowercase, this.numbers, this.symbols, this.excludeSimilar, this.excludeAmbiguous].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.generatePassword());
        });

        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.generateMultipleBtn.addEventListener('click', () => this.generateMultiplePasswords());
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        this.copyPassword.addEventListener('click', () => this.copyPasswordToClipboard());
        this.copyAllBtn.addEventListener('click', () => this.copyAllPasswords());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    }

    generatePassword() {
        const length = parseInt(this.passwordLength.value);
        const options = this.getCharacterOptions();
        
        if (options.length === 0) {
            WebTools.showAlert('Please select at least one character type.', 'warning');
            return;
        }

        let password = '';
        const availableChars = this.getAvailableCharacters(options);
        
        // Ensure at least one character from each selected type
        if (this.uppercase.checked) {
            password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        }
        if (this.lowercase.checked) {
            password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz');
        }
        if (this.numbers.checked) {
            password += this.getRandomChar('0123456789');
        }
        if (this.symbols.checked) {
            password += this.getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?');
        }

        // Fill the rest with random characters
        while (password.length < length) {
            password += this.getRandomChar(availableChars);
        }

        // Shuffle the password
        password = this.shuffleString(password);
        
        this.generatedPassword.value = password;
        this.updateStrengthIndicator(password);
        this.addToHistory(password);
        this.hideMultiplePasswords();
    }

    generateMultiplePasswords() {
        const count = 10;
        const passwords = [];
        
        for (let i = 0; i < count; i++) {
            const length = parseInt(this.passwordLength.value);
            const options = this.getCharacterOptions();
            const availableChars = this.getAvailableCharacters(options);
            
            let password = '';
            if (this.uppercase.checked) password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
            if (this.lowercase.checked) password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz');
            if (this.numbers.checked) password += this.getRandomChar('0123456789');
            if (this.symbols.checked) password += this.getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?');
            
            while (password.length < length) {
                password += this.getRandomChar(availableChars);
            }
            
            passwords.push(this.shuffleString(password));
        }
        
        this.displayMultiplePasswords(passwords);
    }

    generateStrong() {
        this.passwordLength.value = 16;
        this.lengthValue.textContent = '16';
        this.uppercase.checked = true;
        this.lowercase.checked = true;
        this.numbers.checked = true;
        this.symbols.checked = true;
        this.excludeSimilar.checked = false;
        this.excludeAmbiguous.checked = false;
        this.generatePassword();
    }

    generateMemorable() {
        const words = [
            'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'harbor',
            'island', 'jungle', 'knight', 'lemon', 'mountain', 'ocean', 'planet', 'queen',
            'river', 'sunset', 'tiger', 'umbrella', 'village', 'window', 'xylophone', 'yellow'
        ];
        
        const word1 = words[Math.floor(Math.random() * words.length)];
        const word2 = words[Math.floor(Math.random() * words.length)];
        const number = Math.floor(Math.random() * 1000);
        const symbol = '!@#$%^&*'[Math.floor(Math.random() * 8)];
        
        const password = `${word1}${word2}${number}${symbol}`;
        
        this.generatedPassword.value = password;
        this.updateStrengthIndicator(password);
        this.addToHistory(password);
        this.hideMultiplePasswords();
    }

    generatePIN() {
        const length = Math.floor(Math.random() * 5) + 4; // 4-8 digits
        let pin = '';
        for (let i = 0; i < length; i++) {
            pin += Math.floor(Math.random() * 10);
        }
        
        this.generatedPassword.value = pin;
        this.updateStrengthIndicator(pin);
        this.addToHistory(pin);
        this.hideMultiplePasswords();
    }

    generatePassphrase() {
        const words = [
            'correct', 'horse', 'battery', 'staple', 'purple', 'monkey', 'dishwasher',
            'elephant', 'butterfly', 'rainbow', 'sunshine', 'mountain', 'ocean', 'forest',
            'dragon', 'phoenix', 'wizard', 'knight', 'castle', 'treasure', 'adventure'
        ];
        
        const wordCount = 4;
        const passphrase = [];
        
        for (let i = 0; i < wordCount; i++) {
            passphrase.push(words[Math.floor(Math.random() * words.length)]);
        }
        
        const separators = ['-', '_', '.', '!', '#', '$'];
        const separator = separators[Math.floor(Math.random() * separators.length)];
        
        const password = passphrase.join(separator);
        
        this.generatedPassword.value = password;
        this.updateStrengthIndicator(password);
        this.addToHistory(password);
        this.hideMultiplePasswords();
    }

    getCharacterOptions() {
        const options = [];
        if (this.uppercase.checked) options.push('uppercase');
        if (this.lowercase.checked) options.push('lowercase');
        if (this.numbers.checked) options.push('numbers');
        if (this.symbols.checked) options.push('symbols');
        return options;
    }

    getAvailableCharacters(options) {
        let chars = '';
        
        if (options.includes('uppercase')) {
            chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if (options.includes('lowercase')) {
            chars += 'abcdefghijklmnopqrstuvwxyz';
        }
        if (options.includes('numbers')) {
            chars += '0123456789';
        }
        if (options.includes('symbols')) {
            chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }
        
        if (this.excludeSimilar.checked) {
            chars = chars.replace(/[il1Lo0O]/g, '');
        }
        
        if (this.excludeAmbiguous.checked) {
            chars = chars.replace(/[{}[\]()/\\'"`~,;:.<>]/g, '');
        }
        
        return chars;
    }

    getRandomChar(charSet) {
        return charSet[Math.floor(Math.random() * charSet.length)];
    }

    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    updateStrengthIndicator(password) {
        const strength = this.calculatePasswordStrength(password);
        const entropy = this.calculateEntropy(password);
        
        // Update progress bar
        this.strengthBar.style.width = `${strength.score}%`;
        this.strengthBar.className = `progress-bar ${strength.class}`;
        
        // Update text
        this.strengthText.textContent = strength.label;
        this.strengthText.className = strength.class;
        
        // Update entropy
        this.entropyValue.textContent = `${entropy.toFixed(1)} bits`;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        // Length bonus
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;
        else if (password.length >= 6) score += 10;
        
        // Character variety bonus
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 15;
        
        // Complexity bonus
        const uniqueChars = new Set(password).size;
        score += Math.min(uniqueChars * 2, 20);
        
        // Penalties
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Letters only
        if (/^[0-9]+$/.test(password)) score -= 15; // Numbers only
        
        // Determine strength level
        let label, className;
        if (score >= 80) {
            label = 'Very Strong';
            className = 'text-success';
        } else if (score >= 60) {
            label = 'Strong';
            className = 'text-success';
        } else if (score >= 40) {
            label = 'Good';
            className = 'text-warning';
        } else if (score >= 20) {
            label = 'Weak';
            className = 'text-danger';
        } else {
            label = 'Very Weak';
            className = 'text-danger';
        }
        
        return { score, label, class: className };
    }

    calculateEntropy(password) {
        const charSet = new Set(password);
        const poolSize = this.getCharacterPoolSize(charSet);
        return Math.log2(Math.pow(poolSize, password.length));
    }

    getCharacterPoolSize(charSet) {
        let poolSize = 0;
        for (const char of charSet) {
            if (/[a-z]/.test(char)) poolSize = Math.max(poolSize, 26);
            if (/[A-Z]/.test(char)) poolSize = Math.max(poolSize, 26);
            if (/[0-9]/.test(char)) poolSize = Math.max(poolSize, 10);
            if (/[^A-Za-z0-9]/.test(char)) poolSize = Math.max(poolSize, 32);
        }
        return poolSize;
    }

    togglePasswordVisibility() {
        const type = this.generatedPassword.type === 'password' ? 'text' : 'password';
        this.generatedPassword.type = type;
        this.togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }

    copyPasswordToClipboard() {
        const password = this.generatedPassword.value;
        if (password) {
            WebTools.copyToClipboard(password);
        } else {
            WebTools.showAlert('No password to copy.', 'warning');
        }
    }

    displayMultiplePasswords(passwords) {
        this.passwordList.innerHTML = '';
        
        passwords.forEach((password, index) => {
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <div class="password-item">
                    <span class="password-text">${'•'.repeat(password.length)}</span>
                    <small class="text-muted ms-2">${password.length} chars</small>
                </div>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm" onclick="passwordGenerator.revealPassword(${index}, this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success btn-sm" onclick="passwordGenerator.copySinglePassword('${password}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            this.passwordList.appendChild(item);
        });
        
        this.multiplePasswords.classList.remove('d-none');
    }

    revealPassword(index, button) {
        const passwordItem = button.closest('.list-group-item');
        const passwordText = passwordItem.querySelector('.password-text');
        const passwords = Array.from(this.passwordList.children).map(item => {
            const text = item.querySelector('.password-text').textContent;
            return text.includes('•') ? null : text;
        }).filter(Boolean);
        
        if (passwordText.textContent.includes('•')) {
            passwordText.textContent = passwords[index];
            button.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordText.textContent = '•'.repeat(passwords[index].length);
            button.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    copySinglePassword(password) {
        WebTools.copyToClipboard(password);
    }

    copyAllPasswords() {
        const passwords = Array.from(this.passwordList.children).map(item => {
            const text = item.querySelector('.password-text').textContent;
            return text.includes('•') ? null : text;
        }).filter(Boolean);
        
        if (passwords.length > 0) {
            WebTools.copyToClipboard(passwords.join('\n'));
        }
    }

    hideMultiplePasswords() {
        this.multiplePasswords.classList.add('d-none');
    }

    addToHistory(password) {
        const historyItem = {
            id: Date.now(),
            password: password,
            timestamp: new Date().toLocaleTimeString(),
            strength: this.calculatePasswordStrength(password).label
        };
        
        this.passwordHistory.unshift(historyItem);
        
        // Keep only last 20 passwords
        if (this.passwordHistory.length > 20) {
            this.passwordHistory.pop();
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.passwordHistory.length === 0) {
            this.passwordHistory.innerHTML = '<p class="text-muted text-center">No passwords generated yet</p>';
            return;
        }
        
        this.passwordHistory.innerHTML = this.passwordHistory.map(item => `
            <div class="history-item p-2 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        <div class="password-history-text">${'•'.repeat(item.password.length)}</div>
                        <small class="text-muted">${item.timestamp} - ${item.strength}</small>
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm" onclick="passwordGenerator.copyFromHistory('${item.password}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    copyFromHistory(password) {
        WebTools.copyToClipboard(password);
    }

    clearHistory() {
        this.passwordHistory = [];
        this.saveHistory();
        this.updateHistoryDisplay();
        WebTools.showAlert('Password history cleared!', 'info');
    }

    saveHistory() {
        localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('passwordHistory');
        if (saved) {
            this.passwordHistory = JSON.parse(saved);
            this.updateHistoryDisplay();
        }
    }
}

// Initialize the password generator when the page loads
let passwordGenerator;
document.addEventListener('DOMContentLoaded', function() {
    passwordGenerator = new PasswordGenerator();
});

// Add CSS for the password generator
const style = document.createElement('style');
style.textContent = `
    .password-display .form-control {
        font-family: 'Courier New', monospace;
        font-size: 1.1rem;
        letter-spacing: 2px;
    }
    
    .strength-meter .progress-bar {
        transition: all 0.3s ease;
    }
    
    .password-type-card {
        transition: var(--transition);
        cursor: pointer;
    }
    
    .password-type-card:hover {
        background: var(--light-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow);
    }
    
    .password-history {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .history-item {
        transition: var(--transition);
    }
    
    .history-item:hover {
        background: var(--light-color);
    }
    
    .password-history-text {
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        letter-spacing: 1px;
    }
    
    .password-item .password-text {
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        letter-spacing: 1px;
    }
    
    .list-group-item {
        background: var(--card-bg);
        border-color: var(--border-color);
    }
    
    .list-group-item:hover {
        background: var(--light-color);
    }
`;
document.head.appendChild(style); 