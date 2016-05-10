var path  = require('path');
var express = require('express');
var app = express();
var async = require('async');
var nconf = require('nconf');


var config = new nconf.Provider({
  env: true,
  argv: true,
  store: {
    type: 'file',
    file: path.join(__dirname, 'config.json')
  }
});

var pipedrive = require('./PipedriveController').Client(config.get('pipedrive:token'));

// TODO: make token dir and client secret dir arguments or config params
var driveTokenDir = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var drive = require('./DriveController').Client(config.get('drive:client_secret_path'), driveTokenDir);
drive.authorize(function(err){
  if(err) {
    console.err('Failed to authorize with Google Drive');
    return;
  }
  console.log('Google Drive is now authorized');
});

// TODO: move the client token outside into arguments or config params.
var ten = require('./TenController').Client(config.get('ten:token'));

app.set('json spaces', 2);

app.get('/', function (req, res) {

  var q = req.query.q;

  var found = q.match(/^[0-9][0-9]-[0-9][0-9][0-9]$/);
  if(!found) {
    res.status(400).send({error: 'Only accepting queries with the format "##-###". Ex: 16-022'});
    return;
  }

  async.parallel({

    pipedrive: function(cb) {
      pipedrive.get(q, function(err, project){
        if(err) {
          cb(err);
          return;
        }
        if(!project) {
          cb(null);
          return;
        }

        var p = {
          id: project.id.toString(),
          name: project.title,
          webViewLink: 'https://technocreatives.pipedrive.com/deal/view/' + project.id,
          status: (project.deleted? 'deleted' : project.status),
          client: project.person_name + ', ' + project.org_name,
          stage: project.stage.name,
          owner: project.owner_name
        };

        cb(err, p);
      });
    },

    drive: function(cb) {
      drive.get(q, function(err, project){
        if(err) {
          cb(err);
          return;
        }
        if(!project) {
          cb(null);
          return;
        }

        var p = {
          id: project.id,
          name: project.name,
          webViewLink: project.webViewLink
        };

        cb(err, p);
      });
    },

    ten: function(cb) {
      ten.get(q, function(err, project){
        if(err) {
          cb(err);
          return;
        }
        if(!project) {
          cb(null);
          return;
        }

        var p = {
          id: project.id.toString(),
          name: project.name,
          webViewLink: 'https://app.10000ft.com/viewproject?id=' + project.id,
          status: (project.archived ? 'archived' : project.project_state),
          client: project.client,
          description: project.description,
          starts_at: project.starts_at,
          ends_at: project.ends_at
        };

        cb(err, p);
      });
    }


  },
  function(err, results){
    if(err) {
      res.status(500).send({ error: err });
      return;
    }
    res.json(results);
  });

});

app.listen(config.get('rest:port'), function () {
  console.log('Sales bot listening on port ' + config.get('rest:port'));
});