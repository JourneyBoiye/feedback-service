const assert = require('assert');
const NLCV1 = require('watson-developer-cloud/natural-language-classifier/v1');
const Cloudant = require('@cloudant/cloudant');

/**
 * Main fn hit by cloud service.
 * @param {dict} params - default parameters passed by Cloud Function service.
 * @return {dict} Results from Cloudant db.
 */
function main(params) {
  assert(params, 'params cannot be null');

  assert(params.nlcUsername, 'params.nlcUsername cannot be null');
  assert(params.nlcPassword, 'params.nlcPassword cannot be null');
  assert(params.classifier_id, 'params.classifier_id cannot be null');

  assert(params.feedback, 'params.feedback cannot be null');

  assert(params.cloudantUsername, 'params.cloudantUsername cannot be null');
  assert(params.cloudantPassword, 'params.cloudantPassword cannot be null');
  assert(params.dbName, 'params.dbName cannot be null');


  const classifier = new NLCV1({
    username: params.nlcUsername,
    password: params.nlcPassword,
  });

  const cloudant = new Cloudant({
    account: params.cloudantUsername,
    password: params.cloudantPassword,
  });

  return new Promise((resolve, reject) => {
    classify(classifier, params.feedback, params.classifier_id)
    .then((feedbackClass) => {
    resolve(update(
        feedbackClass, cloudant, params.dbName, params.min_rpi,
        params.max_rpi, params.activities));
    })
  });
}


/**
 * Classify the feedback given by the end user.
 * @param {NLCV1} classifier An instance of the classifier API.
 * @param {string} feedback The feedback.
 * @param {string} id The ID of the classifier to use.
 * @return {Promise} The class of the feedback
 */
function classify(classifier, feedback, id) {
  if (feedback === '') {
    return new Error('Feedback is empty')
  }
  return new Promise((resolve, reject) => {
    classifier.classify({
      text: feedback,
      classifier_id: id,
    }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}


/**
 * Get updated results from the Cloudant instance.
 * @param {string} feedbackClass The class of the feedback.
 * @param {Cloudant} cloudant An instance of the Cloudant API.
 * @param {string} dbName The name of the database to use.
 * @param {string} minrpi The lowest RPI in the displayed results.
 * @param {string} maxrpi The maximum RPI in the displayed results.
 * @param {string} activities The search query of the user.
 * @return {Promise} The new results from the Cloudant DB.
 */
function update(feedbackClass, cloudant, dbName, minrpi, maxrpi, activities) {
  return new Promise((resolve, reject) => {
    const database = cloudant.db.use(dbName);
    if (feedbackClass.top_class === 'PRICEREDUCE') {
      database.find(
        {
          selector: {
            '$and': [
              {
                'signDiff': {
                '$lt': minrpi,
                },
              },
              {
                'query': activities,
              },
            ],
          },
        }, (er, results) => {
          if (er) {
            reject(er);
          }
          results.min_rpi = 300;
          results.max_rpi = 0;
          results.docs.forEach(result => {
            if (result.rpi < results.min_rpi) {
              results.min_rpi = result.rpi;
            }
            if (result.rpi > results.max_rpi) {
              results.max_rpi = result.rpi;
            }
          });
          resolve(results);
      });
    } else if (feedbackClass.top_class === 'PRICEINCREASE') {
      database.find(
        {
          selector: {
            '$and': [
              {'signDiff': {
                '$gt': maxrpi,
                },
              },
              {
                'query': activities,
              },
            ],
          },
        }, (er, results) => {
          if (er) {
            reject(er);
          }
          results.min_rpi = 300;
          results.max_rpi = 0;
          results.docs.forEach(result => {
            if (result.rpi < results.min_rpi) {
              results.min_rpi = result.rpi;
            }
            if (result.rpi > results.max_rpi) {
              results.max_rpi = result.rpi;
            }
          });
          resolve(results);
      });
    }
  });
}

exports._test = {
  classify: classify,
}
global.main = main;
