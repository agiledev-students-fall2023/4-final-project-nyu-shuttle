process.env.NODE_ENV = "test"
const chai = require("chai")
const chaiHttp = require("chai-http")
chai.use(chaiHttp) 
const expect = chai.expect 
const should = chai.should() 

const app = require("../app")

// a group of tests related to the /auth/signup route
describe("User Registration", () => {
    /**
     * Test the POST /auth/signup route
     */
    const validFormData = { username: "new_user", password: "new_password" };
    const invalidFormData = { username: "", password: "password" };
  
    describe("POST /auth/signup with valid data", () => {
      it("should return a 200 HTTP response code", (done) => {
        chai
          .request(app)
          .post("/auth/signup")
          .type("form")
          .send(validFormData)
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          });
      });
  
    });
  
    describe("POST /auth/signup with invalid data", () => {
      it("should return a 401 HTTP response code", (done) => {
        chai
          .request(app)
          .post("/auth/signup")
          .type("form")
          .send(invalidFormData)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });
  
    });
  });