process.env.NODE_ENV = "test"
const chai = require("chai")
const chaiHttp = require("chai-http")
chai.use(chaiHttp) 
const expect = chai.expect 
const should = chai.should() 

const server = require("../app")

describe("Login", () => {
  /**
   * test the POST /login route
   */
  const formData = { username: "bla", password: "wrong" } 
  describe("POST /auth/login with incorrect username/password", () => {
    it("it should return a 401 HTTP response code", done => {
      chai
        .request(server)
        .post("/auth/login")
        .type("form")
        .send(formData)
        .end((err, res) => {
          res.should.have.status(401) /
          done() 
        })
    })
  })

    /**
     * test the POST /login route
     */
    const validFormData = { username: "newuser", password: "newpassword" }
    describe("POST /auth/login with correct username/password", () => {
      it("it should return a 200 HTTP response code", done => {
        chai
          .request(server)
          .post("/auth/login")
          .type("form")
          .send(validFormData)
          .end((err, res) => {
            res.should.have.status(200) 
            done() 
          })
      })
    })



})