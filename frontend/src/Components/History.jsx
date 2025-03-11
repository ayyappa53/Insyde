import React, { useState, useEffect } from 'react';
import { Clock, Download, Eye, Trash2, XCircle } from 'lucide-react';
import CADViewer from './CADViewer';
import '../css/History.css';
import axios from 'axios';

const History = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingModel, setViewingModel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  useEffect(() => {
    fetchModels();
  }, []);
  
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/models', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setModels(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Failed to load models. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(model => {
    return model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.filetype.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  

  const handleDownload = async (id) => {
    try {
      
      const response = await axios.get(`/api/models/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const downloadUrl = `/api/models/file/${id}`;
      
      
      const fileResponse = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to download: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      
      const blob = await fileResponse.blob();
      
      
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = response.data.name; 
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      setModels(models.map(model => {
        if (model._id === id) {
          return { ...model, downloads: model.downloads + 1 };
        }
        return model;
      }));
      
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download model. Please try again.');
    }
  };
  

  const handleViewModel = async (id) => {
    try {
      const response = await axios.get(`/api/models/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      

      const fileResponse = await fetch(`/api/models/file/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch file for viewing');
      }
      
      const blob = await fileResponse.blob();
      const file = new File([blob], response.data.name, {
        type: response.data.filetype === 'stl' ? 'model/stl' : 'model/obj'
      });
      
      setViewingModel(file);
      
      setModels(models.map(model => {
        if (model._id === id) {
          return { ...model, views: model.views + 1 };
        }
        return model;
      }));
      
    } catch (err) {
      console.error('Error viewing model:', err);
      setError('Failed to load model for viewing. Please try again.');
    }
  };
  

  const closeViewer = () => {
    setViewingModel(null);
  };
  

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/models/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setModels(models.filter(model => model._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete model. Please try again.');
    }
  };
  

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Model History</h1>
        <p className="history-description">
          View and manage your previously uploaded models.
        </p>
      </div>

      {error && (
        <div className="history-error">
          <XCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="error-close-button"
            aria-label="Close error message"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      <div className="model-search">
        <input 
          type="text" 
          placeholder="Search models..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading models...</p>
        </div>
      ) : (
        <>
          <div className="models-table-wrapper">
            <table className="models-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Upload Date</th>
                  <th>Size (MB)</th>
                  <th className="hide-on-mobile">Downloads</th>
                  <th className="hide-on-mobile">Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.length > 0 ? (
                  filteredModels.map(model => (
                    <tr key={model._id}>
                      <td className="model-name">{model.name}</td>
                      <td>{model.filetype.toUpperCase()}</td>
                      <td>
                        <div className="date-cell">
                          <Clock size={14} className="hide-on-small" />
                          <span>{formatDate(model.createdAt)}</span>
                        </div>
                      </td>
                      <td>{model.filesize.toFixed(2)}</td>
                      <td className="hide-on-mobile">{model.downloads}</td>
                      <td className="hide-on-mobile">{model.views}</td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="action-button" 
                            title="View Model"
                            onClick={() => handleViewModel(model._id)}
                            aria-label="View Model"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="action-button" 
                            title="Download Model"
                            onClick={() => handleDownload(model._id)}
                            aria-label="Download Model"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            className="action-button delete" 
                            title="Delete Model"
                            onClick={() => confirmDelete(model._id)}
                            aria-label="Delete Model"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-models-cell">
                      <p>No models found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {}
      {viewingModel && (
  <div className="history-preview-modal">
    <div className="history-preview-content">
      <CADViewer 
        modelFile={viewingModel} 
        onClose={closeViewer} 
      />
    </div>
  </div>
)}

      {}
      {showDeleteModal && (
        <div className="delete-confirmation-modal">
          <div className="confirmation-content">
            <h3>Delete Model</h3>
            <p>Are you sure you want to delete this model? This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button 
                className="cancel-button"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-button"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;