var async = require('async');
var fs    = require('fs');
var _     = require('underscore');
var hdc   = require('hdc');
var sha1  = require('sha1');
var util  = require('util');

module.exports = function (node, auth) {
  
  this.list = function(req, res){
    new MemberResponse(node, auth).process(res);
  };
  
  this.voters = function(req, res){
    new VoterResponse(node, auth).process(res);
  };

  return this;
}

function MemberResponse (node, auth){

  this.node = node;
  this.auth = auth;
  this.methode = node.hdc.amendments.view.members;

  this.getNew = function (am) {
    return am.getNewMembers();
  }

  this.getLeaving = function (am) {
    return am.getLeavingMembers();
  }

  this.updateStatus = function (status, am) {
    var hdcAM = new hdc.Amendment();
    hdcAM.membersChanges = am.membersChanges;
    hdcAM.votersChanges = am.votersChanges;
    var joining = this.getNew(hdcAM);
    var leaving = this.getLeaving(hdcAM);
    joining.forEach(function(m){
      console.log('JOIN', m);
      status[m] = status[m] || { key: { name: '', fingerprint: m, comment: '' }, status: '' };
      status[m].status = 'JOIN';
    });
    leaving.forEach(function(m){
      console.log('LEAVE', m);
      status[m] = status[m] || { key: { name: '', fingerprint: m, comment: '' }, status: '' };
      status[m].status = 'LEAVE';
    });
  }

  this.process = function (res) {
    var method = this.methode;
    var status = {};
    var am;
    var that = this;
    async.waterfall([
      function (next){
        that.node.hdc.amendments.current(next);
      },
      function (current, next){
        am = current;
        next();
      },
      function (next){
        that.updateStatus(status, am);
        next();
      },
      function (next){
        method.call(method, am.number, sha1(am.raw).toUpperCase(), { extract: true }, function (err, members) {
          next(err, members.leaves || {});
        });
      },
      function (members, next){
        var indexes = [];
        _(members).each(function (item, index) {
          status[item.value] = status[item.value] || { key: { name: '', fingerprint: item.value, comment: '' }, status: '' };
        });
        async.forEach(_(status).keys(), function(fingerprint, callback){
          that.node.pks.lookup('0x' + fingerprint, function (err, json) {
            if(json.keys.length > 0){
              status[fingerprint].key= json.keys[0].key;
            }
            callback(err);
          });
        }, next);
      },
    ], function (err) {
      res.render('community/list', {
        status: _(status).values(),
        auth: auth
      });
    });
  }

}

function VoterResponse (node, auth){  
  MemberResponse.call(this, node, auth);

  this.methode = node.hdc.amendments.view.voters;

  this.getNew = function (am) {
    return am.getNewVoters();
  }

  this.getLeaving = function (am) {
    return am.getLeavingVoters();
  }
}
