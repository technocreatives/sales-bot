var Pipedrive = require('pipedrive');

module.exports.Client = function(apiToken, options) {
  var pipedrive = new Pipedrive.Client(apiToken);
  this.get = function(q, done) {

    pipedrive.SearchResults.field({
        term: q,
        exact_match: false,
        field_key: "title",
        field_type: "dealField",
        return_item_ids: true
      }, function(err, deals){

        if (err) {
          return done(err);
        }
        if (deals.length == 0) {
          return done(null, null);
        } else {
          var deal = deals[0];
          if(!deal.title.startsWith(q)) {
            return done(null, null);
          }
          pipedrive.Deals.get(deal.id, function(err, deal){
            if(err) {
              process.nextTick(function(){
                done(err);
              });
              return;
            }
            pipedrive.Stages.get(deal.stage_id, function(err, stage){
              if(err) {
                process.nextTick(function(){
                  done(err);
                });
                return;
              }
              deal.stage = stage;
              process.nextTick(function(){
                done(null, deal);
              });
              return;
            });
          });
        }
      });
  };
  return this;
}