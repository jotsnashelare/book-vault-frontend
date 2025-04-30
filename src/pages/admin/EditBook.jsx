// src/pages/admin/EditBook.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookService from '../../services/BookService';
import './AddBook.css'; // Reusing AddBook styles

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    category: '',  // updated key
    quantity: 1,
    language: '',
    genre: '',
    isbn: '',
    publisher: '',
    publishedYear: new Date().getFullYear(),
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const book = await BookService.getBookById(id);
        setBookData({
          title: book.title,
          author: book.author,
          category: book.category,
          quantity: book.quantity,
          language: book.language || '',
          genre: book.genre || '',
          isbn: book.isbn || '',
          publisher: book.publisher || '',
          publishedYear: book.publishedYear || new Date().getFullYear(),
        });
        const imgUrl = await BookService.getBookImage(id);
        setPreviewUrl(imgUrl);
      } catch (err) {
        console.error('Failed to load book data or image:', err);
        setError('Failed to load book data');
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'publishedYear' ? Number(value) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    setSelectedFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      Object.entries(bookData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await BookService.updateBook(id, formData);
      setSuccess('📚 Book updated successfully!');
      setTimeout(() => nav('/admin/books'), 1500);
    } catch (err) {
      console.error('Update book error:', err);
      setError(err.response?.data || err.message || 'Failed to update book');
    }
  };

  return (
    <div className="add-book-container">
      <h2>Edit Book</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit} className="add-book-form">
        {Object.entries(bookData).map(([name, val]) => (
          <input
            key={name}
            type={name === 'quantity' || name === 'publishedYear' ? 'number' : 'text'}
            name={name}
            placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
            value={val}
            onChange={handleChange}
            required={['title','author','category','quantity'].includes(name)}
            min={name === 'quantity' ? 1 : name === 'publishedYear' ? 1900 : undefined}
            max={name === 'publishedYear' ? new Date().getFullYear() : undefined}
          />
        ))}
        <div className="file-input-container">
          <label htmlFor="book-cover">Book Cover (optional, max 5MB)</label>
          <input
            id="book-cover"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        {previewUrl && (
          <div className="preview-container">
            <img src={previewUrl} alt="Cover preview" className="preview-image" />
          </div>
        )}
        <button type="submit" className="submit-button">
          Update Book
        </button>
      </form>
    </div>
  );
};

export default EditBook;
