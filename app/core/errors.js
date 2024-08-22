class CharacterCountExceeded extends Error { // parent error
  constructor(post_id, content) {
      super();
      this.name = this.constructor.name // good practice

      if (this instanceof LongTitleError) // checking if title or body
          this.type = 'title'
      else if (this instanceof LongBodyError)
          this.type = 'body'
 
    this.message = `The character count of post (id: ${post_id}) ${this.type} is too long. (${content.length} characters)` // detailed error message
    this.statusCode = 500 // error code for responding to client
  }
}

// extending to child error classes
class LongTitleError extends CharacterCountExceeded { }
class LongBodyError extends CharacterCountExceeded { }

module.exports = {
    CharacterCountExceeded,
    LongTitleError,
    LongBodyError
}