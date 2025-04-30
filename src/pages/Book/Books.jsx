import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BookService from "../../services/BookService";
import "./Books.css";
import { AuthContext } from "../../auth/AuthContext"; // Assuming this gives user info

const AdminBooks = () => {
  const { user } = useContext(AuthContext); // Access user role
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [books, setBooks]             = useState([]);
  const [imageMap, setImageMap]       = useState({});
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const navigate                      = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await BookService.getAllBooks();
        setBooks(data);
        setError("");

        const entries = await Promise.all(
          data.map(async (book) => {
            const img = await BookService.getBookImage(book.id);
            return [book.id, img];
          })
        );
        setImageMap(Object.fromEntries(entries));
      } catch (err) {
        console.error("Error fetching books or images:", err);
        setError(err.response?.data?.message || "Failed to load books.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleEdit   = (id) => navigate(`/admin/books/edit/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await BookService.deleteBook(id);
      const updated = await BookService.getAllBooks();
      setBooks(updated);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete book");
    }
  };

  const filtered = books.filter(b =>
    [b.title, b.author, b.isbn, ...(b.tags || [])]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading-spinner">Loading books...</div>;

  return (
    <div className="admin-books-container">
      <div className="header-section">
        <h2>📚 Book Management</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Search by title, author, ISBN or tags..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {isAdmin && (
            <button className="add-button" onClick={() => navigate("/admin/books/add")}>
              ➕ Add Book
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="books-table-container">
        {filtered.length === 0 ? (
          <p className="empty-message">
            {searchTerm ? "No books match your search." : "No books found."}
          </p>
        ) : (
          <table className="books-table">
            <thead>
              <tr>
                <th>Cover</th><th>Title</th><th>Author</th>
                {isAdmin && (
                  <>
                    <th>ISBN</th><th>Category</th><th>Genre</th>
                    
                  </>
                )}
                <th>Quantity</th><th>Language</th>
                <th>Publisher</th><th>Year</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(book => (
                <tr key={book.id}>
                  <td className="cover-cell">
                    {imageMap[book.id] ? (
                      <img
                        src={imageMap[book.id]}
                        alt={`Cover of ${book.title}`}
                        className="book-cover"
                        onError={e => e.currentTarget.replaceWith(
                          <div className="no-cover">No Cover</div>
                        )}
                      />
                    ) : (
                      <div className="no-cover">No Cover</div>
                    )}
                  </td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  {isAdmin && (
                    <>
                      <td>{book.isbn}</td>
                      <td>{book.category}</td>
                      <td>{book.genre}</td>
                    </>
                  )}
                  <td>{book.quantity}</td>
                  <td>{book.language}</td>
                  <td>{book.publisher}</td>
                  <td>{book.publishedYear}</td>
                  {isAdmin && (
                    <td className="action-buttons-cell">
                      <button className="edit-button" onClick={() => handleEdit(book.id)}>✏️</button>
                      <button className="delete-button" onClick={() => handleDelete(book.id)}>🗑️</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBooks;
