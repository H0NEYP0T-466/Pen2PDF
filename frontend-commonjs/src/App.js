// Main App component using CommonJS
const React = require('react');
const { useState } = React;

// API endpoint configuration
const API_BASE_URL = 'http://localhost:8000';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDownloaded, setIsDownloaded] = useState(false);

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data:mime;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setError('');
        setSuccess('');
        setIsDownloaded(false);
    };

    // Handle drag and drop
    const handleDragOver = (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            setSelectedFile(files[0]);
            setError('');
            setSuccess('');
            setIsDownloaded(false);
        }
    };

    // Process file and get PDF
    const processFile = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select an image file (PNG, JPEG, etc.)');
            return;
        }

        setIsProcessing(true);
        setError('');
        setSuccess('');

        try {
            // Convert file to base64
            const base64Content = await fileToBase64(selectedFile);

            // Send to backend
            const response = await fetch(`${API_BASE_URL}/api/gemini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: base64Content,
                    mimeType: selectedFile.type
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process image');
            }

            // Get PDF blob from response
            const pdfBlob = await response.blob();
            
            // Create download link and trigger download
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `extracted-text-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccess('PDF generated and downloaded successfully!');
            setIsDownloaded(true);

        } catch (err) {
            console.error('Error processing file:', err);
            setError(`Error: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Reset form
    const handleNewUpload = () => {
        setSelectedFile(null);
        setError('');
        setSuccess('');
        setIsDownloaded(false);
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return React.createElement('div', { className: 'container' },
        // Header
        React.createElement('div', { className: 'header' },
            React.createElement('h1', null, 'Pen2PDF'),
            React.createElement('p', null, 'Convert handwriting and images to PDF documents using AI')
        ),

        // Upload Section
        !isDownloaded && React.createElement('div', { className: 'upload-section' },
            React.createElement('div', { 
                className: 'upload-area',
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
                onClick: () => document.getElementById('file-input').click()
            },
                React.createElement('div', { className: 'upload-icon' }, '📷'),
                React.createElement('div', { className: 'upload-text' }, 
                    selectedFile ? 'Click to change file or drag & drop a new one' : 'Click to upload an image or drag & drop here'
                ),
                React.createElement('input', {
                    type: 'file',
                    id: 'file-input',
                    className: 'file-input',
                    accept: 'image/*',
                    onChange: handleFileSelect
                }),
                React.createElement('button', { 
                    className: 'upload-button',
                    type: 'button'
                }, 'Choose Image')
            ),

            // File info
            selectedFile && React.createElement('div', { className: 'file-info' },
                React.createElement('div', { className: 'file-name' }, `📄 ${selectedFile.name}`),
                React.createElement('div', { className: 'file-size' }, `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`)
            ),

            // Process button
            selectedFile && !isProcessing && React.createElement('div', { style: { marginTop: '20px' } },
                React.createElement('button', {
                    className: 'upload-button',
                    onClick: processFile,
                    style: { fontSize: '1.1rem', padding: '15px 40px' }
                }, 'Extract Text & Generate PDF')
            )
        ),

        // Processing state
        isProcessing && React.createElement('div', { className: 'processing' },
            React.createElement('div', { className: 'processing-spinner' }),
            React.createElement('div', { className: 'processing-text' }, 'Processing image and generating PDF...')
        ),

        // Error message
        error && React.createElement('div', { className: 'error' }, error),

        // Success message and download info
        success && React.createElement('div', { className: 'success' }, success),

        // Download completed section
        isDownloaded && React.createElement('div', { className: 'download-info' },
            React.createElement('div', { className: 'download-icon' }, '✅'),
            React.createElement('div', { className: 'download-text' }, 'Your PDF has been generated and downloaded!'),
            React.createElement('button', {
                className: 'new-upload-button',
                onClick: handleNewUpload
            }, 'Upload Another Image')
        )
    );
}

module.exports = App;