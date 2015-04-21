var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore')._;
var async = require('async')

// var path = "./reuters21578"
var path = "./test"
var dataset = []

var files = fs.readdirSync(path)
var files = _.filter(files, function(file){ return  file.substring(file.length-3)=="sgm" });

var arrs = ['TOPICS','PLACES','PEOPLE','ORGS','EXCHANGES','COMPANIES']
var texs = ['TITLE', 'DATELINE', 'CONTENT','AUTHOR']

function countTopics(dataset, index)
{
	var topics = {}
	_.each(dataset, function(record, key, list){ 
		_.each(record['TOPICS'], function(topic, key, list){ 
			if (!(topic in topics))
				topics[topic] = 0
			topics[topic] = topics[topic] + 1
		}, this)
	}, this)

	delete topics[""]
	topics = _.pairs(topics)
	topics = _.sortBy(topics, function(num){ return num[1] }).reverse()
	topics = _.map(topics, function(value){ return value[0] });
	
	if (index != 0)
		topics.splice(index, topics.length - index)

	return topics
}

function ModApte_split(dataset)
{
	var data = {'train': [], 'test':[], 'unused':[]}
	_.each(dataset, function(record, key, list){ 
		if (record['$']['LEWISSPLIT']=="TRAIN" && record['$']['TOPICS']=="YES")
			data['train'].push(record)
		if (record['$']['LEWISSPLIT']=="TEST" && record['$']['TOPICS']=="YES")
			data['test'].push(record)
		if ((record['$']['LEWISSPLIT']=="NOT-USED" && record['$']['TOPICS']=="YES")||
			(record['$']['TOPICS']=="NO")||
			(record['$']['TOPICS']=="BYPASS"))
			data['unused'].push(record)
	}, this)
	return data
}


// _.each(files, function(file, key, list){ 
// _.each(['copy.sgm'], function(file, key, list){ 
// async.eachSeries(['copy.sgm'], function(file, callback1){ 
async.eachSeries(files, function(file, callback1){ 
	var data = fs.readFileSync(path + "/" + file,'UTF-8')
	reuters = data.split("</REUTERS>")	
	reuters.splice(-1,1)

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

	var data = ModApte_split(dataset)

	// console.log(data['train'].length)
	// console.log(data['test'].length)
	// console.log(data['unused'].length)

	// console.log(JSON.stringify(dataset, null, 4))	
	var logs = countTopics(dataset, 10)
	console.log(logs)
	process.exit(0)
})



