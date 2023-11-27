process.env.NODE_ENV = "test";

// include the testing dependencies
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp); 
const expect = chai.expect; 
const should = chai.should(); 


const server = require("../app");

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
    
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    const user = new User({ username: "test", password: "test" });
    const token = user.generateJWT();

    it("it should return a 200 HTTP response code", done => {
      chai
        .request(server)
        .get("/protected")
        .set("Authorization", `JWT ${token}`) 
        .end((err, res) => {
          res.should.have.status(200); 
          done();n
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