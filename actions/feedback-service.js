const assert = require('assert');
const NLCV1 = require('watson-developer-cloud/natural-language-classifier/v1');

function main(params) {
  return new Promise((resolve, reject) => {
    assert(params, 'params cannot be null');
    
    assert(params.nlcUsername, 'params.nlcUsername cannot be null');
    assert(params.nlcPassword, 'params.nlcPassword cannot be null');
    assert(params.classifier_id, 'params.classifier_id cannot be null');

    assert(params.feedback, 'params.feedback cannot be null');

    const classifier = new NLCV1({
      username: params.nlcUsername,
      password: params.nlcPassword 
    });

    classifier.classify({
      text: params.feedback,
      classifier_id: params.classifier_id
    }, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

global.main = main;
