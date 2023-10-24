import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/settingsPage.css';

const FeedbackSupportPage = () => {
  const [category, setCategory] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // later link with backend
  };

  return (
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
      </Link>
      <div>
        <h1 className="settings-header">Feedback / Support</h1>
      </div>
      <div>
        <div className="feedback-item">
          <label htmlFor="category" className="feedback-label">
            Select Category...
          </label>
          <select
            id="category"
            className="feedback-dropdown"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Bug Report">Bug Report</option>
            <option value="User Experience Feedback">User Experience Feedback</option>
            <option value="Bus Schedule Error">Bus Schedule Error</option>
          </select>
        </div>

        <div className="feedback-item">
          <textarea
            className="feedback-textarea"
            placeholder="Write your concern here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
        </div>

        <button onClick={handleSubmit} className="feedback-submit">
          Submit
        </button>
      </div>
    </div>
  );
};

export default FeedbackSupportPage;
