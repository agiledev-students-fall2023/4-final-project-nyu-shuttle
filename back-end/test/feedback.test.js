process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const assert = chai.assert;
const server = require("../app");

describe("Feedback Routes", () => {
  const formData = {
    user: 12345,
    timestamp: new Date(),
    category: "test_category",
    feedback: "Test feedback content",
  };

  describe("POST /feedback/newfeedback", () => {
    let createdFeedbackId;

    it("should create a new feedback entry", async () => {
      try {
        const response = await chai
          .request(server)
          .post("/feedback/newfeedback")
          .send(formData);

        assert.strictEqual(response.status, 200);
        assert.isTrue(response.body.success);
        assert.strictEqual(response.body.message, "Feedback saved successfully.");
        assert.property(response.body, "feedback");

        // Store the created feedback ID for cleanup
        createdFeedbackId = response.body.feedback._id;
      } catch (error) {
        console.error("Error in POST /feedback/newfeedback:", error);
        throw error;
      }
    }).timeout(5000);;

    // Cleanup after the test
    after(async () => {
      // Check if createdFeedbackId is defined
      if (createdFeedbackId) {
        try {
          const response = await chai
            .request(server)
            .delete(`/feedback/${createdFeedbackId}`);

          assert.strictEqual(response.status, 200);
          assert.isTrue(response.body.success);
          assert.strictEqual(response.body.message, "Feedback deleted successfully.");
          assert.property(response.body, "feedback");
        } catch (error) {
          console.error("Error in DELETE /feedback/:id", error);
          throw error;
        }
      }
      // If createdFeedbackId is not defined, nothing to clean up
    })
  }).timeout(5000);

  describe("GET /feedback", () => {
    it("should get all feedback entries", async() => {
      chai
        .request(server)
        .get("/feedback/allfeedback")
        .end((err, res) => {
          if (err) {
            console.error("Error in GET /feedback:", err);
            done(err);
            return;
          }
          assert.strictEqual(res.status, 200);
          assert.isTrue(res.body.success);
          assert.strictEqual(res.body.message, "Feedback retrieved successfully.");
          assert.property(res.body, "entries");
        });
    });
  });

});
