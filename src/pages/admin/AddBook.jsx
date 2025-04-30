import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookService from '../../services/BookService';
import './AddBook.css';

const AddBook = () => {
  const [bookData, setBookData] = useState({
    title: '', author: '', category: '', quantity: 1,
     language: '', genre: '',
    isbn: '', publisher: '', publishedYear: new Date().getFullYear()
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'publishedYear' ? Number(value) : value 
    }));
  };

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setError('');
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(bookData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          fd.append(key, value.toString());
        }
      });
      
      if (file) fd.append('image', file);

      await BookService.addBook(fd);
      
      setSuccess('📚 Book added successfully!');
      setTimeout(() => nav('/books'), 1500);
    } catch (err) {
      console.error('Add book error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         err.message || 
                         'Failed to add book';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-book-container">
      <h2 className="add-book-header">➕ Add New Book</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit} className="add-book-form">
        {['title','author','category','quantity','language','genre','isbn','publisher','publishedYear']
          .map(name => (
            <input
              key={name}
              type={name === 'quantity' || name === 'publishedYear' ? 'number' : 'text'}
              name={name}
              placeholder={name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}
              value={bookData[name]}
              onChange={handleChange}
              required={['title','author','category','quantity'].includes(name)}
              min={name === 'quantity' ? 1 : name === 'publishedYear' ? 1900 : undefined}
              max={name === 'publishedYear' ? new Date().getFullYear() : undefined}
            />
          ))
        }
        <div className="file-input-container">
          <label htmlFor="book-cover">Book Cover (optional, max 5MB)</label>
          <input 
            id="book-cover"
            type="file" 
            accept="image/*" 
            onChange={handleFile} 
          />
        </div>
        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Cover preview" className="preview-image" />
          </div>
        )}
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Book'}
        </button>
      </form>
    </div>
  );
};

export default AddBook;