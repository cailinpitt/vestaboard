const expect = require('chai').expect;

const Message = require('../message.js').Message;

describe('message', function () {
  describe('constructor', function () {
    it('instantiates the class', function () {
      const message = new Message("hello");

      expect(message.size).to.eql(5);
      expect(message.originalMessage).to.eql("HELLO");
      expect(message.message).to.eql([8, 5, 12, 12, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('instantiates the class - word is longer than 22 characters', function () {
      const message = new Message("hellohellohellohellohello");

      expect(message.size).to.eql(22);
      expect(message.originalMessage).to.eql("HELLOHELLOHELLOHELLOH-");
      expect(message.message).to.eql([8, 5, 12, 12, 15, 8, 5, 12, 12, 15, 8, 5, 12, 12, 15, 8, 5, 12, 12, 15, 8, 44]);
    });
  });

  describe('rightJustify', function () {
    it('right justifies message', function () {
      const message = new Message("hello")
        .rightJustify();

      expect(message.message).to.eql([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 12, 12, 15]);
    });
  });

  describe('leftJustify', function () {
    it('left justifies message', function () {
      const message = new Message("hello")
        .rightJustify()
        .leftJustify();

      expect(message.message).to.eql([8, 5, 12, 12, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
  });

  describe('center', function () {
    it('centers message with even size', function () {
      const message = new Message("hell")
        .center();

      expect(message.message).to.eql([0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('centers message with odd size', function () {
      const message = new Message("hello")
        .center();

      expect(message.message).to.eql([0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 12, 12, 15, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
  });

  describe('dipEnds', function () {
    it('dips the ends', function () {
      const message = new Message("hello")
        .center()
        .dipEnds("ParisBlue");

      expect(message.message).to.eql([67, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 12, 12, 15, 0, 0, 0, 0, 0, 0, 0, 67]);
    });

    it('dips the ends of a message that is at the max size', function () {
      const message = new Message("//////////////////////")
        .center()
        .dipEnds("ParisBlue");

      expect(message.message).to.eql([67, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 67]);
    });
  });

  describe('wrapColor', function () {
    it('wraps the line', function () {
      const message = new Message("hello")
        .center()
        .wrapColor("ParisBlue");

      expect(message.message).to.eql([67, 67, 67, 67, 67, 67, 67, 67, 67, 8, 5, 12, 12, 15, 67, 67, 67, 67, 67, 67, 67, 67]);
    });
  });

  describe('toString', function () {
    it('returns the message in string format', function () {
      const message = new Message("hello");

      expect(message.toString()).to.eql("[8,5,12,12,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]")
    });
  });
});
