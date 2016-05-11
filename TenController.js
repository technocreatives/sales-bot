var request = require('request');

module.exports.Client = function(token) {

  this.token = token;

  this.req = request.defaults({
    baseUrl: 'http://api.10000ft.com/api/v1/',
    strictSSL: false,
    json: true,
    headers: {
      'auth': token,
    }
  });

  var self = this;

  this.get = function(q, done) {

    var options = {
      uri: 'projects',
      method: 'GET',
      qs: {project_code: q, with_archived: true}
    };

    self.req(options, function(error, response, data) {
      var err = error || 
        data.error ||
        response.statusCode !== 200 && data.body + ' (' + response.statusCode + ')'
      ;

      if(err) {
        process.nextTick(function(){
          done(err);
        });
        return;
      }
      if(!data.data || data.data.length === 0) {
        process.nextTick(function(){
          done(null, null);
        });
        return;
      }
      process.nextTick(function(){
        done(null, data.data[0]);
      });
    });

  };

  return this;
};