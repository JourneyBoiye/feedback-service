const assert = require('assert');
const NLCV1 = require('watson-developer-cloud/natural-language-classifier/v1');
const Cloudant = require('@cloudant/cloudant')

function main(params) {
  return new Promise((resolve, reject) => {
    assert(params, 'params cannot be null');
    
    assert(params.nlcUsername, 'params.nlcUsername cannot be null');
    assert(params.nlcPassword, 'params.nlcPassword cannot be null');
    assert(params.classifier_id, 'params.classifier_id cannot be null');

    assert(params.feedback, 'params.feedback cannot be null');

    assert(params.cloudantUsername, 'params.cloudantUsername cannot be null')
    assert(params.cloudantPassword, 'params.cloudantPassword cannot be null')
    assert(params.dbName, 'params.dbName cannot be null')

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
  }).then(result => {
    return new Promise((resolve, reject) => {
      const cloudant = new Cloudant({
        account: params.cloudantUsername,
        password: params.cloudantPassword
      });
      const database = cloudant.db.use(params.dbName);
      if (result.top_class === "PRICEREDUCE") {
        database.find(
          {
            selector: {
              "$and": [
                {
                  "rpi": {
                  "$lt": params.min_rpi
                  }
                },
                {
                  "query": params.activities
                }
              ]
            }
          }, (er, result) => {
          if (er) {
            reject(er)
          }
          resolve(result)
        })
      } else if (result.top_class === "PRICEINCREASE") {
        database.find(
          {
            selector: {
              "$and": [
                { "rpi": {
                  "$gt":params.max_rpi
                  }
                },
                {
                  "query": params.activities
                }
              ]
            }
          }, (er, result) => {
          if (er) {
            reject(er)
          }
          resolve(result)
        })
      } else {
        //TODO NLC always returns a top_class, need to check for garbage inputs.
      }
    })
  })
}

global.main = main;
