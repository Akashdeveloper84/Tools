// QR Code Generator Tool JavaScript
class QRGenerator {
    constructor() {
        this.currentQRCode = null;
        this.initializeElements();
        this.bindEvents();
        this.setupTypeHandlers();
    }

    initializeElements() {
        this.qrContent = document.getElementById('qrContent');
        this.generateBtn = document.getElementById('generateBtn');
        this.qrOutput = document.getElementById('qrOutput');
        this.qrActions = document.getElementById('qrActions');
        this.downloadPNGBtn = document.getElementById('downloadPNGBtn');
        this.downloadSVGBtn = document.getElementById('downloadSVGBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Type-specific fields
        this.emailFields = document.getElementById('emailFields');
        this.phoneFields = document.getElementById('phoneFields');
        this.wifiFields = document.getElementById('wifiFields');
        this.emailAddress = document.getElementById('emailAddress');
        this.emailSubject = document.getElementById('emailSubject');
        this.emailBody = document.getElementById('emailBody');
        this.phoneNumber = document.getElementById('phoneNumber');
        this.phoneMessage = document.getElementById('phoneMessage');
        this.wifiSSID = document.getElementById('wifiSSID');
        this.wifiPassword = document.getElementById('wifiPassword');
        this.wifiEncryption = document.getElementById('wifiEncryption');
        this.wifiHidden = document.getElementById('wifiHidden');
        
        // Styling options
        this.qrSize = document.getElementById('qrSize');
        this.qrErrorLevel = document.getElementById('qrErrorLevel');
        this.qrForeground = document.getElementById('qrForeground');
        this.qrBackground = document.getElementById('qrBackground');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.downloadPNGBtn.addEventListener('click', () => this.downloadPNG());
        this.downloadSVGBtn.addEventListener('click', () => this.downloadSVG());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Auto-generate on content change
        this.qrContent.addEventListener('input', () => this.debounce(() => this.generateQRCode(), 500));
    }

    setupTypeHandlers() {
        const radioButtons = document.querySelectorAll('input[name="qrType"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleTypeChange(e.target.value));
        });
    }

    handleTypeChange(type) {
        // Hide all type-specific fields
        this.emailFields.classList.add('d-none');
        this.phoneFields.classList.add('d-none');
        this.wifiFields.classList.add('d-none');
        
        // Show relevant fields and update placeholder
        switch (type) {
            case 'url':
                this.qrContent.placeholder = 'https://example.com';
                this.qrContent.value = 'https://example.com';
                break;
            case 'text':
                this.qrContent.placeholder = 'Enter any text here...';
                this.qrContent.value = 'Hello World!';
                break;
            case 'email':
                this.emailFields.classList.remove('d-none');
                this.qrContent.placeholder = 'Email QR code will be generated from the fields below';
                this.qrContent.value = '';
                break;
            case 'phone':
                this.phoneFields.classList.remove('d-none');
                this.qrContent.placeholder = 'Phone QR code will be generated from the fields below';
                this.qrContent.value = '';
                break;
            case 'wifi':
                this.wifiFields.classList.remove('d-none');
                this.qrContent.placeholder = 'WiFi QR code will be generated from the fields below';
                this.qrContent.value = '';
                break;
        }
        
        this.generateQRCode();
    }

    generateQRCode() {
        const type = document.querySelector('input[name="qrType"]:checked').value;
        let content = '';

        // Generate content based on type
        switch (type) {
            case 'url':
            case 'text':
                content = this.qrContent.value.trim();
                break;
            case 'email':
                content = this.generateEmailContent();
                break;
            case 'phone':
                content = this.generatePhoneContent();
                break;
            case 'wifi':
                content = this.generateWiFiContent();
                break;
        }

        if (!content) {
            this.showPlaceholder();
            return;
        }

        const options = {
            width: parseInt(this.qrSize.value),
            margin: 2,
            color: {
                dark: this.qrForeground.value,
                light: this.qrBackground.value
            },
            errorCorrectionLevel: this.qrErrorLevel.value
        };

        // Generate QR code
        QRCode.toCanvas(this.qrOutput, content, options, (error, canvas) => {
            if (error) {
                console.error('QR Code generation error:', error);
                WebTools.showAlert('Error generating QR code. Please check your input.', 'danger');
                return;
            }

            this.currentQRCode = canvas;
            this.qrOutput.innerHTML = '';
            this.qrOutput.appendChild(canvas);
            this.qrActions.classList.remove('d-none');
            
            WebTools.showAlert('QR code generated successfully!', 'success');
        });
    }

    generateEmailContent() {
        const email = this.emailAddress.value.trim();
        const subject = this.emailSubject.value.trim();
        const body = this.emailBody.value.trim();
        
        if (!email) return '';
        
        let content = `mailto:${email}`;
        const params = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        if (params.length > 0) {
            content += '?' + params.join('&');
        }
        
        return content;
    }

    generatePhoneContent() {
        const phone = this.phoneNumber.value.trim();
        const message = this.phoneMessage.value.trim();
        
        if (!phone) return '';
        
        let content = `tel:${phone}`;
        
        if (message) {
            content += `?body=${encodeURIComponent(message)}`;
        }
        
        return content;
    }

    generateWiFiContent() {
        const ssid = this.wifiSSID.value.trim();
        const password = this.wifiPassword.value.trim();
        const encryption = this.wifiEncryption.value;
        const hidden = this.wifiHidden.checked;
        
        if (!ssid) return '';
        
        let content = `WIFI:`;
        content += `S:${this.escapeWiFiField(ssid)};`;
        content += `T:${encryption};`;
        
        if (password) {
            content += `P:${this.escapeWiFiField(password)};`;
        }
        
        if (hidden) {
            content += `H:true;`;
        }
        
        content += `;`;
        
        return content;
    }

    escapeWiFiField(field) {
        return field.replace(/[\\;:,]/g, '\\$&');
    }

    downloadPNG() {
        if (!this.currentQRCode) {
            WebTools.showAlert('No QR code to download.', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = this.currentQRCode.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        WebTools.showAlert('QR code downloaded as PNG!', 'success');
    }

    downloadSVG() {
        if (!this.currentQRCode) {
            WebTools.showAlert('No QR code to download.', 'warning');
            return;
        }

        const type = document.querySelector('input[name="qrType"]:checked').value;
        let content = '';

        switch (type) {
            case 'url':
            case 'text':
                content = this.qrContent.value.trim();
                break;
            case 'email':
                content = this.generateEmailContent();
                break;
            case 'phone':
                content = this.generatePhoneContent();
                break;
            case 'wifi':
                content = this.generateWiFiContent();
                break;
        }

        const options = {
            width: parseInt(this.qrSize.value),
            margin: 2,
            color: {
                dark: this.qrForeground.value,
                light: this.qrBackground.value
            },
            errorCorrectionLevel: this.qrErrorLevel.value
        };

        QRCode.toString(content, options, (error, svg) => {
            if (error) {
                console.error('SVG generation error:', error);
                WebTools.showAlert('Error generating SVG.', 'danger');
                return;
            }

            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'qr-code.svg';
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            WebTools.showAlert('QR code downloaded as SVG!', 'success');
        });
    }

    copyToClipboard() {
        if (!this.currentQRCode) {
            WebTools.showAlert('No QR code to copy.', 'warning');
            return;
        }

        this.currentQRCode.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                WebTools.showAlert('QR code copied to clipboard!', 'success');
            }).catch(() => {
                WebTools.showAlert('Failed to copy QR code to clipboard.', 'danger');
            });
        });
    }

    reset() {
        this.qrContent.value = 'https://example.com';
        this.emailAddress.value = '';
        this.emailSubject.value = '';
        this.emailBody.value = '';
        this.phoneNumber.value = '';
        this.phoneMessage.value = '';
        this.wifiSSID.value = '';
        this.wifiPassword.value = '';
        this.wifiEncryption.value = 'WPA';
        this.wifiHidden.checked = false;
        
        this.qrSize.value = '256';
        this.qrErrorLevel.value = 'M';
        this.qrForeground.value = '#000000';
        this.qrBackground.value = '#FFFFFF';
        
        // Reset to URL type
        document.getElementById('urlType').checked = true;
        this.handleTypeChange('url');
        
        this.showPlaceholder();
        WebTools.showAlert('Form reset successfully!', 'info');
    }

    showPlaceholder() {
        this.qrOutput.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-qrcode fa-4x text-muted mb-3"></i>
                <p class="text-muted">Your QR code will appear here</p>
            </div>
        `;
        this.qrActions.classList.add('d-none');
    }

    loadExample(type) {
        switch (type) {
            case 'url':
                document.getElementById('urlType').checked = true;
                this.handleTypeChange('url');
                this.qrContent.value = 'https://webtoolspro.com';
                break;
            case 'contact':
                document.getElementById('textType').checked = true;
                this.handleTypeChange('text');
                this.qrContent.value = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:WebTools Pro
TEL:+1234567890
EMAIL:john@example.com
END:VCARD`;
                break;
            case 'wifi':
                document.getElementById('wifiType').checked = true;
                this.handleTypeChange('wifi');
                this.wifiSSID.value = 'MyWiFiNetwork';
                this.wifiPassword.value = 'password123';
                this.wifiEncryption.value = 'WPA';
                break;
        }
        
        this.generateQRCode();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the QR generator when the page loads
let qrGenerator;
document.addEventListener('DOMContentLoaded', function() {
    qrGenerator = new QRGenerator();
});

// Add CSS for the QR generator
const style = document.createElement('style');
style.textContent = `
    .qr-placeholder {
        padding: 2rem;
        border: 2px dashed var(--border-color);
        border-radius: 0.5rem;
        background: var(--light-color);
    }
    
    .example-item {
        transition: var(--transition);
        cursor: pointer;
    }
    
    .example-item:hover {
        background: var(--light-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow);
    }
    
    .form-control-color {
        width: 100%;
        height: 38px;
    }
    
    #qrOutput canvas {
        max-width: 100%;
        height: auto;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
    }
    
    .btn-check:checked + .btn-outline-primary {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
    }
    
    .btn-check:checked + .btn-outline-primary:hover {
        background-color: #0056b3;
        border-color: #0056b3;
    }
`;
document.head.appendChild(style); 