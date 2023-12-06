process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should();
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
  
      it("should create a new feedback entry", (done) => {
        chai
          .request(server)
          .post("/feedback/newfeedback")
          .send(formData)
          .end((err, res) => {
            if (err) {
              console.error("Error in POST /feedback/newfeedback:", err);
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("success").to.equal(true);
            expect(res.body).to.have.property("message").to.equal("Feedback saved successfully.");
            expect(res.body).to.have.property("feedback");
            createdFeedbackId = res.body.feedback._id;
  
            done();
          });
      });
  
      // Cleanup after the test
      after((done) => {
        chai
          .request(server)
          .delete(`/feedback/${createdFeedbackId}`)
          .end((deleteErr, deleteRes) => {
            if (deleteErr) {
              console.error("Error in DELETE /feedback/:id", deleteErr);
              return done(deleteErr);
            }
            expect(deleteRes).to.have.status(200);
            expect(deleteRes.body).to.have.property("success").to.equal(true);
            expect(deleteRes.body).to.have.property("message").to.equal("Feedback deleted successfully.");
            expect(deleteRes.body).to.have.property("feedback");
            done();
          });
      });
    });
  });

  describe("GET /feedback", () => {
    it("should get all feedback entries", (done) => {
      chai
        .request(server)
        .get("/feedback/allfeedback")
        .end((err, res) => {
          if (err) {
            console.error("Error in GET /feedback:", err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("success").to.equal(true);
          expect(res.body).to.have.property("message").to.equal("Feedback retrieved successfully.");
          expect(res.body).to.have.property("entries");
          done();
        });
    });
  });
