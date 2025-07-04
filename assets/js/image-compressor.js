// Image Compressor Tool JavaScript
class ImageCompressor {
    constructor() {
        this.images = [];
        this.compressedImages = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.imagesList = document.getElementById('imagesList');
        this.imagesContainer = document.getElementById('imagesContainer');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsList = document.getElementById('resultsList');
        this.compressBtn = document.getElementById('compressBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.compressMoreBtn = document.getElementById('compressMoreBtn');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.formatSelect = document.getElementById('formatSelect');
        this.maxWidth = document.getElementById('maxWidth');
        this.maxHeight = document.getElementById('maxHeight');
    }

    bindEvents() {
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadArea.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));

        // Quality slider
        this.qualitySlider.addEventListener('input', (e) => {
            this.qualityValue.textContent = e.target.value + '%';
        });

        // Buttons
        this.compressBtn.addEventListener('click', () => this.compressAllImages());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
        this.compressMoreBtn.addEventListener('click', () => this.compressMore());
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.uploadArea.contains(event.relatedTarget)) {
            this.uploadArea.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.uploadArea.classList.remove('drag-over');
        
        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            WebTools.showAlert('Please select valid image files.', 'warning');
            return;
        }

        // Check file size (10MB limit)
        const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            WebTools.showAlert(`Some files are too large (max 10MB): ${oversizedFiles.map(f => f.name).join(', ')}`, 'warning');
        }

        const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024);
        
        validFiles.forEach(file => {
            this.addImage(file);
        });

        if (validFiles.length > 0) {
            this.showImagesList();
        }
    }

    addImage(file) {
        const image = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type
        };

        this.images.push(image);
        this.renderImageItem(image);
    }

    renderImageItem(image) {
        const imageElement = document.createElement('div');
        imageElement.className = 'col-md-6 col-lg-4';
        imageElement.id = `image-${image.id}`;
        
        imageElement.innerHTML = `
            <div class="card image-item">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="image-preview me-3">
                            <img src="${URL.createObjectURL(image.file)}" alt="${image.name}" class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover;">
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-1">${image.name}</h6>
                            <small class="text-muted">${this.formatFileSize(image.size)}</small>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="imageCompressor.removeImage(${image.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="progress mb-2" style="height: 4px;">
                        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <small class="text-muted">Ready to compress</small>
                </div>
            </div>
        `;

        this.imagesContainer.appendChild(imageElement);
    }

    removeImage(id) {
        const index = this.images.findIndex(img => img.id === id);
        if (index > -1) {
            this.images.splice(index, 1);
            const element = document.getElementById(`image-${id}`);
            if (element) {
                element.remove();
            }
            
            if (this.images.length === 0) {
                this.hideImagesList();
            }
        }
    }

    showImagesList() {
        this.imagesList.classList.remove('d-none');
        this.resultsContainer.classList.add('d-none');
    }

    hideImagesList() {
        this.imagesList.classList.add('d-none');
    }

    async compressAllImages() {
        if (this.images.length === 0) {
            WebTools.showAlert('No images to compress.', 'warning');
            return;
        }

        const originalText = this.compressBtn.innerHTML;
        WebTools.showLoading(this.compressBtn);
        
        this.compressedImages = [];
        
        try {
            for (let i = 0; i < this.images.length; i++) {
                const image = this.images[i];
                await this.compressImage(image, i);
            }
            
            this.showResults();
            WebTools.showAlert(`Successfully compressed ${this.compressedImages.length} images!`, 'success');
        } catch (error) {
            console.error('Compression error:', error);
            WebTools.showAlert('An error occurred during compression.', 'danger');
        } finally {
            WebTools.hideLoading(this.compressBtn, originalText);
        }
    }

    async compressImage(image, index) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Calculate new dimensions
                    const maxWidth = parseInt(this.maxWidth.value) || 1920;
                    const maxHeight = parseInt(this.maxHeight.value) || 1080;
                    let { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);
                    
                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Get quality setting
                    const quality = parseInt(this.qualitySlider.value) / 100;
                    const format = this.formatSelect.value;
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedImage = {
                                id: image.id,
                                name: this.getCompressedFileName(image.name, format),
                                originalSize: image.size,
                                compressedSize: blob.size,
                                blob: blob,
                                format: format
                            };
                            
                            this.compressedImages.push(compressedImage);
                            this.updateProgress(index, 100);
                            resolve(compressedImage);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    }, `image/${format}`, quality);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(image.file);
        });
    }

    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        return { width, height };
    }

    getCompressedFileName(originalName, format) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}_compressed.${format}`;
    }

    updateProgress(index, percentage) {
        const imageElement = document.getElementById(`image-${this.images[index].id}`);
        if (imageElement) {
            const progressBar = imageElement.querySelector('.progress-bar');
            const statusText = imageElement.querySelector('small');
            
            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }
            
            if (statusText) {
                statusText.textContent = percentage === 100 ? 'Compressed' : `Compressing... ${percentage}%`;
            }
        }
    }

    showResults() {
        this.resultsContainer.classList.remove('d-none');
        this.resultsList.innerHTML = '';
        
        this.compressedImages.forEach(image => {
            this.renderResultItem(image);
        });
    }

    renderResultItem(image) {
        const resultElement = document.createElement('div');
        resultElement.className = 'col-md-6 col-lg-4';
        
        const compressionRatio = ((image.originalSize - image.compressedSize) / image.originalSize * 100).toFixed(1);
        const savings = image.originalSize - image.compressedSize;
        
        resultElement.innerHTML = `
            <div class="card result-item">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="result-icon me-3">
                            <i class="fas fa-check-circle text-success fa-2x"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-1">${image.name}</h6>
                            <small class="text-success">${compressionRatio}% smaller</small>
                        </div>
                    </div>
                    <div class="row text-center mb-3">
                        <div class="col-6">
                            <small class="text-muted">Original</small>
                            <div class="fw-bold">${this.formatFileSize(image.originalSize)}</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Compressed</small>
                            <div class="fw-bold text-success">${this.formatFileSize(image.compressedSize)}</div>
                        </div>
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="imageCompressor.downloadImage(${image.id})">
                            <i class="fas fa-download me-1"></i>Download
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.resultsList.appendChild(resultElement);
    }

    downloadImage(id) {
        const image = this.compressedImages.find(img => img.id === id);
        if (image) {
            const url = URL.createObjectURL(image.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = image.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            WebTools.showAlert('Image downloaded successfully!', 'success');
        }
    }

    downloadAll() {
        if (this.compressedImages.length === 0) {
            WebTools.showAlert('No compressed images to download.', 'warning');
            return;
        }

        // Create a zip file if multiple images
        if (this.compressedImages.length === 1) {
            this.downloadImage(this.compressedImages[0].id);
        } else {
            // For multiple files, we'll download them one by one
            this.compressedImages.forEach((image, index) => {
                setTimeout(() => {
                    this.downloadImage(image.id);
                }, index * 500);
            });
            
            WebTools.showAlert(`Downloading ${this.compressedImages.length} images...`, 'info');
        }
    }

    clearAll() {
        this.images = [];
        this.compressedImages = [];
        this.imagesContainer.innerHTML = '';
        this.resultsList.innerHTML = '';
        this.hideImagesList();
        this.resultsContainer.classList.add('d-none');
        this.fileInput.value = '';
        
        WebTools.showAlert('All images cleared.', 'info');
    }

    compressMore() {
        this.compressedImages = [];
        this.resultsContainer.classList.add('d-none');
        this.showImagesList();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the image compressor when the page loads
let imageCompressor;
document.addEventListener('DOMContentLoaded', function() {
    imageCompressor = new ImageCompressor();
});

// Add CSS for drag and drop
const style = document.createElement('style');
style.textContent = `
    .upload-area {
        border: 2px dashed var(--border-color);
        border-radius: 1rem;
        transition: var(--transition);
        background: var(--light-color);
    }
    
    .upload-area.drag-over {
        border-color: var(--primary-color);
        background: rgba(0, 123, 255, 0.1);
    }
    
    .image-item, .result-item {
        transition: var(--transition);
    }
    
    .image-item:hover, .result-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    
    .progress {
        background-color: var(--light-color);
    }
    
    .progress-bar {
        background: linear-gradient(135deg, var(--primary-color), #0056b3);
    }
`;
document.head.appendChild(style); 