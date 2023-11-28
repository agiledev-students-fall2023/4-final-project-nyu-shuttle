process.env.NODE_ENV = "test"

const chai = require("chai")
const chaiHttp = require("chai-http")
chai.use(chaiHttp) 
const expect = chai.expect 
const should = chai.should() 

const server = require("../app")

// a group of tests related to the /logout route
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