var path = require('path');
module.exports = {
  entry: './actions/feedback-service.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  target: 'node'
};
