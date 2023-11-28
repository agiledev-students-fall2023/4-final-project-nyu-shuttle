process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = chai.expect; 
const should = chai.should(); 
const server = require("../app");

// a group of tests related to the /protected route
describe("Protected", () => {
  /**
   * test the GET /protected route
   */
  describe("GET /protected when not logged in", () => {
    it("it should return a 401 HTTP response code", done => {
      chai
        .request(server)
        .get("/protected")
        .end((err, res) => {
          res.should.have.status(401); 
          done(); 
        });
    });
  });  
   
   /**
   * test the GET /protected route when logged in
   */
   describe("GET /protected when logged in", () => {
    // test a protected route when logged in... passport auth should allow it

    // let's first create a valid JWT token to use in the requests where we want to be logged in
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    const user = new User({ username: "test", password: "test" });
    const token = user.generateJWT();

    it("it should return a 200 HTTP response code", done => {
      chai
        .request(server)
        .get("/protected")
        .set("Authorization", `JWT ${token}`) // set JWT authentication headers to simulate a logged-in user, using the token we created at top
        .end((err, res) => {
          res.should.have.status(200); // use should to make BDD-style assertions
          done(); // resolve the Promise that these tests create so mocha can move on
        });
    });

    it("it should return an object with specific properties", done => {
      chai
        .request(server)
        .get("/protected")
        .set("Authorization", `JWT ${token}`) 
        .end((err, res) => {
          res.body.should.be.a("object"); 
          res.body.should.have.keys("success", "user", "message");
          expect(res.body).to.have.deep.property("user.id", 1); 
          expect(res.body).to.have.deep.property("user.username"); 
          done(); 
        });
    });
  });



});
