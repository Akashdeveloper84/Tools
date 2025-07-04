// Advanced Calculator JavaScript
class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.history = [];
        this.currentBase = 10;
        this.angleMode = 'deg'; // deg or rad
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.displayCurrent = document.getElementById('displayCurrent');
        this.displayHistory = document.getElementById('displayHistory');
        this.historyList = document.getElementById('historyList');
    }

    bindEvents() {
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(event) {
        const key = event.key;
        
        if (key >= '0' && key <= '9' || key === '.') {
            this.append(key);
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            this.operate(key);
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        }
    }

    append(value) {
        if (this.shouldResetScreen) {
            this.currentInput = '';
            this.shouldResetScreen = false;
        }

        // Handle different bases for programmer mode
        if (this.currentBase === 16) {
            if (/^[0-9A-Fa-f]$/.test(value)) {
                this.currentInput = this.currentInput === '0' ? value.toUpperCase() : this.currentInput + value.toUpperCase();
            }
        } else if (this.currentBase === 8) {
            if (/^[0-7]$/.test(value)) {
                this.currentInput = this.currentInput === '0' ? value : this.currentInput + value;
            }
        } else if (this.currentBase === 2) {
            if (/^[01]$/.test(value)) {
                this.currentInput = this.currentInput === '0' ? value : this.currentInput + value;
            }
        } else {
            // Decimal mode
            if (value === '.' && this.currentInput.includes('.')) return;
            this.currentInput = this.currentInput === '0' ? value : this.currentInput + value;
        }

        this.updateDisplay();
    }

    operate(operator) {
        if (this.operation !== null && !this.shouldResetScreen) {
            this.calculate();
        }

        this.previousInput = this.currentInput;
        this.operation = operator;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    calculate() {
        if (this.operation === null || this.shouldResetScreen) return;

        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    WebTools.showAlert('Cannot divide by zero!', 'danger');
                    return;
                }
                result = prev / current;
                break;
            case '%':
                result = prev % current;
                break;
            default:
                return;
        }

        const calculation = `${this.previousInput} ${this.operation} ${this.currentInput} = ${result}`;
        this.addToHistory(calculation);

        this.currentInput = result.toString();
        this.operation = null;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    scientific(functionName) {
        const value = parseFloat(this.currentInput);
        let result;

        switch (functionName) {
            case 'sin':
                result = Math.sin(this.toRadians(value));
                break;
            case 'cos':
                result = Math.cos(this.toRadians(value));
                break;
            case 'tan':
                result = Math.tan(this.toRadians(value));
                break;
            case 'asin':
                result = this.toDegrees(Math.asin(value));
                break;
            case 'acos':
                result = this.toDegrees(Math.acos(value));
                break;
            case 'atan':
                result = this.toDegrees(Math.atan(value));
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'pow':
                this.previousInput = this.currentInput;
                this.operation = '^';
                this.shouldResetScreen = true;
                this.updateDisplay();
                return;
            case 'factorial':
                result = this.factorial(value);
                break;
            case 'abs':
                result = Math.abs(value);
                break;
            case 'floor':
                result = Math.floor(value);
                break;
            case 'ceil':
                result = Math.ceil(value);
                break;
            case 'exp':
                result = Math.exp(value);
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case 'rand':
                result = Math.random();
                break;
            case 'deg':
                this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
                WebTools.showAlert(`Angle mode: ${this.angleMode.toUpperCase()}`, 'info');
                return;
            default:
                return;
        }

        const calculation = `${functionName}(${this.currentInput}) = ${result}`;
        this.addToHistory(calculation);

        this.currentInput = result.toString();
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    bitwise(operation) {
        const value = parseInt(this.currentInput, this.currentBase);
        let result;

        switch (operation) {
            case 'and':
                if (this.operation === '&') {
                    result = this.previousInput & value;
                    this.calculateBitwise(result);
                } else {
                    this.previousInput = this.currentInput;
                    this.operation = '&';
                    this.shouldResetScreen = true;
                }
                break;
            case 'or':
                if (this.operation === '|') {
                    result = this.previousInput | value;
                    this.calculateBitwise(result);
                } else {
                    this.previousInput = this.currentInput;
                    this.operation = '|';
                    this.shouldResetScreen = true;
                }
                break;
            case 'xor':
                if (this.operation === '^') {
                    result = this.previousInput ^ value;
                    this.calculateBitwise(result);
                } else {
                    this.previousInput = this.currentInput;
                    this.operation = '^';
                    this.shouldResetScreen = true;
                }
                break;
            case 'not':
                result = ~value;
                this.currentInput = result.toString();
                this.shouldResetScreen = true;
                break;
            case 'lsh':
                if (this.operation === '<<') {
                    result = this.previousInput << value;
                    this.calculateBitwise(result);
                } else {
                    this.previousInput = this.currentInput;
                    this.operation = '<<';
                    this.shouldResetScreen = true;
                }
                break;
            case 'rsh':
                if (this.operation === '>>') {
                    result = this.previousInput >> value;
                    this.calculateBitwise(result);
                } else {
                    this.previousInput = this.currentInput;
                    this.operation = '>>';
                    this.shouldResetScreen = true;
                }
                break;
            case 'mod':
                if (this.operation === '%') {
                    result = this.previousInput % value;
                    this.calculateBitwise(result);
                } else {
                    this.previousInput = this.currentInput;
                    this.operation = '%';
                    this.shouldResetScreen = true;
                }
                break;
        }

        this.updateDisplay();
    }

    calculateBitwise(result) {
        const calculation = `${this.previousInput} ${this.operation} ${this.currentInput} = ${result}`;
        this.addToHistory(calculation);
        this.currentInput = result.toString();
        this.operation = null;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    setBase(base) {
        this.currentBase = base;
        
        // Convert current input to new base
        const decimalValue = parseInt(this.currentInput, 10);
        if (!isNaN(decimalValue)) {
            this.currentInput = decimalValue.toString(base).toUpperCase();
            this.updateDisplay();
        }

        // Update button states
        document.querySelectorAll('#programmer .btn-calc').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    clearEntry() {
        this.currentInput = '0';
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    backspace() {
        if (this.currentInput.length === 1) {
            this.currentInput = '0';
        } else {
            this.currentInput = this.currentInput.slice(0, -1);
        }
        this.updateDisplay();
    }

    negate() {
        this.currentInput = (parseFloat(this.currentInput) * -1).toString();
        this.updateDisplay();
    }

    updateDisplay() {
        this.displayCurrent.textContent = this.currentInput;
        
        if (this.operation !== null) {
            this.displayHistory.textContent = `${this.previousInput} ${this.operation}`;
        } else {
            this.displayHistory.textContent = '';
        }
    }

    addToHistory(calculation) {
        this.history.unshift({
            id: Date.now(),
            calculation: calculation,
            timestamp: new Date().toLocaleTimeString()
        });

        // Keep only last 20 calculations
        if (this.history.length > 20) {
            this.history.pop();
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="text-muted text-center">No calculations yet</p>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item p-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="fw-bold">${item.calculation}</div>
                        <small class="text-muted">${item.timestamp}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="calculator.useHistoryItem(${item.id})">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    useHistoryItem(id) {
        const item = this.history.find(h => h.id === id);
        if (item) {
            const result = item.calculation.split(' = ')[1];
            this.currentInput = result;
            this.shouldResetScreen = true;
            this.updateDisplay();
        }
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        WebTools.showAlert('History cleared!', 'info');
    }

    // Utility functions
    toRadians(degrees) {
        return this.angleMode === 'deg' ? degrees * Math.PI / 180 : degrees;
    }

    toDegrees(radians) {
        return this.angleMode === 'deg' ? radians * 180 / Math.PI : radians;
    }

    factorial(n) {
        if (n < 0 || n !== Math.floor(n)) {
            throw new Error('Factorial is only defined for non-negative integers');
        }
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}

// Initialize the calculator when the page loads
let calculator;
document.addEventListener('DOMContentLoaded', function() {
    calculator = new Calculator();
});

// Add CSS for the calculator
const style = document.createElement('style');
style.textContent = `
    .calculator-display {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    
    .display-history {
        font-size: 0.9rem;
        color: var(--secondary-color);
        min-height: 1.2rem;
        margin-bottom: 0.5rem;
    }
    
    .display-current {
        font-size: 2rem;
        font-weight: bold;
        text-align: right;
        color: var(--text-color);
        min-height: 2.5rem;
        word-wrap: break-word;
    }
    
    .btn-calc {
        height: 50px;
        font-size: 1.1rem;
        font-weight: 500;
        border-radius: 0.5rem;
        transition: var(--transition);
    }
    
    .btn-calc:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    
    .btn-calc.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .history-list {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .history-item {
        transition: var(--transition);
        cursor: pointer;
    }
    
    .history-item:hover {
        background: var(--light-color);
    }
    
    .history-item:last-child {
        border-bottom: none !important;
    }
    
    @media (max-width: 768px) {
        .btn-calc {
            height: 45px;
            font-size: 1rem;
        }
        
        .display-current {
            font-size: 1.5rem;
        }
    }
`;
document.head.appendChild(style); 