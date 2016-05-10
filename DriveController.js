var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
//var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
//    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_FILE_NAME = 'sales-bot-drive-token.json';

module.exports.Client = function(secretPath, tokenDir) {
  // Load client secrets from a local file.

  this.tokenDir = tokenDir;
  this.secretPath = secretPath;
  var self = this;

  this.authorize = function(done) {

    fs.readFile(secretPath, function processClientSecrets(err, content) {
      if (err) {
        done(err);
        return;
      }
      var credentials = JSON.parse(content);
      // Authorize a client with the loaded credentials
      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      var auth = new googleAuth();
      self.oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      var tokenFile = self.tokenDir + TOKEN_FILE_NAME;
      // Check if we have previously stored a token.
      fs.readFile(tokenFile, function(err, token) {
        if (err) {
          getNewToken(self.tokenDir, tokenFile, self.oauth2Client, function(err){
            if(err) {
              done(err);
              return;
            }
            done(null);
          });
        } else {
          self.oauth2Client.credentials = JSON.parse(token);
          done(null);
        }
      });
    });

  };

  this.get = function(q, done) {

    if(!self.oauth2Client) {
      done(new Error('Not authorized'));
      return;
    }

    var query = 'name contains "' + q + '" and mimeType = "application/vnd.google-apps.folder"';

    var service = google.drive('v3');
    service.files.list({
      auth: self.oauth2Client,
      pageSize: 10,
      fields: 'files(id, name, mimeType, webViewLink)',
      q: query
    }, function(err, response){
      if(err) {
        process.nextTick(function(){
          done(err);
        });
        return;
      }

      var files = response.files;
      if (files.length == 0) {
        process.nextTick(function(){
          done(null, null);
        });
        return;
      } else {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          if(file.name.startsWith(q)){
            process.nextTick(function(){
              done(null, file);
            });
            return;
          }
        }
      }
    });

  };

  return this;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(tokenDir, tokenFile, oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        callback(err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(tokenDir, tokenFile, token);
      callback(null);
    });
  });
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(tokenDir, tokenFile, token) {
  try {
    fs.mkdirSync(tokenDir);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(tokenFile, JSON.stringify(token));
  console.log('Token stored to ' + tokenFile);
}