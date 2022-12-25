const { mapToVestaboard } = require('./char-to-vestaboard-map.js');

class Message {
  constructor(unconvertedMessage) {
    if (unconvertedMessage.length > 22) {
      this.originalMessage = unconvertedMessage
        .toUpperCase()
        .substring(0, 21)
        + '-';
        this.size = 22;
    } else {
      this.originalMessage = unconvertedMessage.toUpperCase();
      this.size = unconvertedMessage.length;
    }

    const message = this.#convertMessage();
    this.message = message.concat(this.#buildPad(' '));
  }

  /**
   * Converts message to vestaboard encoding.
   */
  #convertMessage() {
    const line = [];
    
    for (let char of this.originalMessage) {
      line.push(mapToVestaboard.get(char));
    }

    return line;
  }

  #buildPad(char) {
    const pad = [];

    for (let i = 0; i < 22 - this.size; i++) {
      pad.push(mapToVestaboard.get(char));
    }

    return pad;
  }

  rightJustify() {
    const convertedMessage = this.#convertMessage(this.unconvertedMessage);
    this.message = this.#buildPad(' ').concat(convertedMessage);

    return this;
  }

  leftJustify() {
    const convertedMessage = this.#convertMessage(this.unconvertedMessage);
    this.message = convertedMessage.concat(this.#buildPad(' '));

    return this;
  }

  center() {
    const convertedMessage = this.#convertMessage(this.unconvertedMessage);
    const pad = this.#buildPad(' ');
    const halfSize = Math.ceil(pad.length / 2);
    const firstHalfPad = pad.slice(0, halfSize);
    const secondHalfPad = pad.slice(halfSize);
    this.message = firstHalfPad.concat(convertedMessage, secondHalfPad);

    return this;
  }

  /**
   * Adds color to the first and last spaces of message.
   */
  dipEnds(color) {
    this.message[0] = mapToVestaboard.get(color);
    this.message[21] = mapToVestaboard.get(color);

    return this;
  }

  /**
   * Wraps message with color.
   */
  wrapColor(color) {
    const convertedMessage = this.#convertMessage(this.unconvertedMessage);

    if (convertedMessage.length === 22) {
      this.message = convertedMessage;
    } else {
      const pad = this.#buildPad(color);
      const halfSize = Math.ceil(pad.length / 2);
      const firstHalfPad = pad.slice(0, halfSize);
      const secondHalfPad = pad.slice(halfSize);
      this.message = firstHalfPad.concat(convertedMessage, secondHalfPad);
    }

    return this;
  }

  toString() {
    return `[${this.message.toString()}]`;
  }
}

module.exports = {
  Message: Message,
}
