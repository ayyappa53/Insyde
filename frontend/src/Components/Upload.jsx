import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, CheckCircle, File } from 'lucide-react';
import CADViewer from './CADViewer';
import '../css/Upload.css';
import axios from 'axios';

const Upload = () => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const newFiles = Array.from(e.dataTransfer.files);
    addFiles(newFiles);
  };

  const handleFileInputChange = (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return ['.stl', '.obj'].includes(extension);
    });

    if (validFiles.length !== newFiles.length) {
      setError("Some files were skipped. Only .stl and .obj files are allowed.");
    } else if (validFiles.length === 0) {
      setError("No valid files selected. Only .stl and .obj files are allowed.");
      return;
    } else {
      setError(null);
    }

    uploadFiles(validFiles);
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const uploadFiles = async (filesToUpload) => {
    if (filesToUpload.length === 0) return;

    setUploading(true);
    setError(null);
    setFiles(filesToUpload);

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('model', file);
        
        await axios.post('/api/models', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      setUploadSuccess(true);
      
      setTimeout(() => {
        setUploadSuccess(true);
      }, 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload 3D Model</h1>
      <p className="upload-description">
        Upload your 3D models to view, manage, and interact with them in our CAD viewer platform.
      </p>

      {}
      <div 
        className={`upload-area ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <UploadCloud size={48} />
        </div>
        <h3>Drag and drop your 3D model files here</h3>
        <p>or</p>
        <label className="file-input-label">
          Browse Files
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            onChange={handleFileInputChange}
            accept=".stl,.obj"
            className="file-input"
          />
        </label>
        <p className="upload-note">Supported formats: .stl, .obj</p>
      </div>

      {}
      {error && (
        <div className="upload-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {}
      {uploadSuccess && (
        <div className="upload-success">
          <CheckCircle size={20} />
          <span>Models uploaded successfully!</span>
        </div>
      )}

      {}
      {files.length > 0 && (
        <div className="file-list">
          <h3>Uploading Files</h3>
          <div className="files">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-icon">
                  <File size={20} />
                </div>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="file-actions">
                  <button 
                    className="file-action-button preview-button"
                    onClick={() => handlePreview(file)}
                    disabled={uploading}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
          {uploading && (
            <div className="uploading-indicator">
              <div className="upload-spinner"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>
      )}

      {}
      {showPreview && previewFile && (
        <div className="preview-modal">
          <div className="preview-content">
            <CADViewer 
              modelFile={previewFile} 
              onClose={closePreview} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;