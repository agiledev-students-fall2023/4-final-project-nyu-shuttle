import { useState } from "react";
import { Link } from "react-router-dom";
import {
  localStorageLoad,
} from "../../utils/localStorageSaveLoad.js";
import "../../css/settingsPage.css";
import axios from "axios";

const FeedbackSupportPage = () => {
  const [response, setResponse] = useState({});
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const userId = localStorageLoad("deviceId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId == null || category === "" || feedback === "") {
      setResponse({});
      setErrorMessage("Please fill out all fields");
      return;
    }
    try {
      const requestData = {
        user: userId,
        timestamp: Date.now(),
        category: category,
        feedback: feedback,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/feedback/newfeedback`,
        requestData
      );
      console.log(`Server response: ${JSON.stringify(response.data, null, 0)}`);   
      setErrorMessage("");
      setResponse(response.data);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
    } finally {
      setCategory("");
      setFeedback("");

    }
  };

  return (
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
      </Link>
      <div>
        <h1 className="settings-header">Feedback / Support</h1>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {response.message && <div className="success-message"> Thank you for the feedback!</div>}
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
            <option value="User Experience Feedback">
              User Experience Feedback
            </option>
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
