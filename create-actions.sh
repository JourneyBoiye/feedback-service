source .env

# Build
npm run build

# Create Actions
echo "Creating Cloud Function Actions..."
export PACKAGE="feedback"
bx wsk package create feedback 
bx wsk action create $PACKAGE/feedback-service dist/bundle.js --web true --kind nodejs:8

echo "Setting default parameters..."
bx wsk action update $PACKAGE/feedback-service \
  --param nlcUsername $NLC_USERNAME \
  --param nlcPassword $NLC_PASSWORD \
  --param classifier_id $CLASSIFIER_ID \
  --param cloudantUsername $CLOUDANT_USERNAME \
  --param cloudantPassword $CLOUDANT_PASSWORD \
  --param dbName $DB_NAME

echo "Retrieving Action URL..."
API_URL=`bx wsk action get $PACKAGE/feedback-service --url | sed -n '2p'`;
API_URL+=".json"

# Write API Url to .env file
head -n 10 .env | cat >> .env_tmp; mv .env_tmp .env
echo "REACT_APP_API_URL=$API_URL" >> .env
