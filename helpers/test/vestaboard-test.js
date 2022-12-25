const expect = require('chai').expect;
const sinon = require('sinon');
const { 
  fillLine, 
  sendToVestaboard,
} = require("../vestaboard.js");

let sandbox;
beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(function () {
  sandbox.restore();
});

describe('vestaboard', function () {
  describe('fillLine', function () {
    it('fills line', function () {
      const filledLine = fillLine("/");

      expect(filledLine).to.eql("//////////////////////");
    });
  });

  describe('sendToVestaboard', function () {
    it('sends message to vestaboard', async function () {
      const axiosStub = {
        post: sandbox.spy(),
      }

      await sendToVestaboard(axiosStub, "my-key", "message");

      expect(axiosStub.post.calledWith("https://rw.vestaboard.com", "message", { headers: { 'X-Vestaboard-Read-Write-Key': 'my-key' }})).to.be.true;
    });
  });
});
