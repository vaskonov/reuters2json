var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore')._;
var async = require('async')

var path = "./reuters21578"
var dataset = []

var files = fs.readdirSync(path)

var files = _.filter(files, function(file){ return  file.substring(file.length-3)=="sgm" });

var arrs = ['TOPICS','PLACES','PEOPLE','ORGS','EXCHANGES','COMPANIES']
var texs = ['TITLE', 'DATELINE', 'CONTENT','AUTHOR']

// _.each(files, function(file, key, list){ 
// _.each(['copy.sgm'], function(file, key, list){ 
// async.eachSeries(['copy.sgm'], function(file, callback1){ 
async.eachSeries(files, function(file, callback1){ 
	var data = fs.readFileSync(path + "/" + file,'UTF-8')
	reuters = data.split("</REUTERS>")	
	reuters.splice(-1,1)
	
	console.log(file)

	async.eachSeries(reuters, function(reuter, callback2){ 

		var parser = new xml2js.Parser();
		
	// _.each(reuters, function(reuter, key, list){ 
		reuter =reuter + "</REUTERS>"

		setTimeout(function() { 

			parser.parseString(reuter, function (err, result) {
	    	
	        	if ('DATE' in result['REUTERS'])
	        		result['REUTERS']['DATE'] = result['REUTERS']['DATE'][0]
	        	
	        	if ('UNKNOWN' in result['REUTERS'])
	        		result['REUTERS']['UNKNOWN'] = result['REUTERS']['UNKNOWN'][0]

	        	_.each(arrs, function(arr, key, list){ 
	        		if (_.isObject(result['REUTERS'][arr][0]))
	        			if ('D' in result['REUTERS'][arr][0])
	        				result['REUTERS'][arr] = result['REUTERS'][arr][0]['D']
	        	}, this)
				
				result['REUTERS']['TEXT'] = result['REUTERS']['TEXT'][0]

				_.each(texs, function(tex, key, list){ 
					if (tex in result['REUTERS']['TEXT'])
						result['REUTERS']['TEXT'][tex] = result['REUTERS']['TEXT'][tex][0]		
				}, this)
				
				result = result['REUTERS']
	        	dataset.push(result)
	        	callback2()
	    	});
    	}, 1)
	}, function(err){callback1()})
}, function(err){
	console.log(JSON.stringify(dataset, null, 4))	
})