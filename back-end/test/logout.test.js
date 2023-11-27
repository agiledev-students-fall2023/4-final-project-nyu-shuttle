process.env.NODE_ENV = "test"

// include the testing dependencies
const chai = require("chai")
const chaiHttp = require("chai-http")
chai.use(chaiHttp)
const expect = chai.expect
const should = chai.should() 

// import the server
const server = require("../app")

describe("Logout", () => {
  /**
   * test the GET /logout route
   */
  describe("GET /auth/logout", () => {
    it("it should return a 200 HTTP response code", done => {
      chai
        .request(server)
        .get("/auth/logout")
        .end((err, res) => {
          res.should.have.status(200) 
          done() 
        })
    })

    it("it should return an object with specific properties", done => {
      chai
        .request(server)
        .get("/auth/logout")
        .end((err, res) => {
          res.body.should.be.a("object") 
          res.body.should.have.property("success", true)
          res.body.should.have.keys("success", "message") 
          done() 
        })
    })
  })
})