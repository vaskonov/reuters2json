var fs = require('fs');
var _ = require('underscore')._;

var file = './full/full.json'

var dataset = JSON.parse(fs.readFileSync(file,'UTF-8'))
var files = []

var types = ['body','title']

_.each(dataset, function(value, key, list){ 

	var id = value["$"]['NEWID']

	_.each(types, function(type, key, list){ 
		if (type in value['TEXT'])
		{
			var data = value['TEXT'][type]
			var data = data.replace(/\<\w*\.*\w*\>/g," ")
			var data = data.replace(/\n/g," ")
			var data = data.replace(/\s[uU]\.*[sS]\.*\s/g," USA ")

			fs.writeFileSync('./full/full.json.dep/'+id+"."+"data", data)

			files.push(__dirname+'/full/full.json.dep/'+id+"."+data)
		}
	}, this)
	

}, this)

fs.writeFileSync('./full/full.json.dep/list', files.join("\n"))


// java -cp stanford-corenlp-3.5.2.jar edu.stanford.nlp.pipeline.StanfordCoreNLP -props config.properties -filelist path  -outputFormat json