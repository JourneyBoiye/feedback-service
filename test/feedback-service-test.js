const assert = require('assert')
const sinon = require('sinon')
const feedbackService = require('../actions/feedback-service.js')
const NLCV1 = require('watson-developer-cloud/natural-language-classifier/v1');
const Cloudant = require('@cloudant/cloudant');


describe('feedback-service', () => {
  it('One call for classify', done => {
    const classifier = new NLCV1({
      username: '123',
      password: 'abc',
    })

    error = feedbackService._test.classify(classifier, '', '')
    assert.deepStrictEqual(error, new Error('Feedback is empty'));
    done()
  });
})
