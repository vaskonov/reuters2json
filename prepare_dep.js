var fs = require('fs');
var _ = require('underscore')._;

var file = './full/full.json'

var dataset = JSON.parse(fs.readFileSync(file,'UTF-8'))
var files = []

var types = ['BODY','TITLE']

_.each(dataset, function(value, key, list){ 

	var id = value["$"]['NEWID']

	_.each(types, function(type, key1, list1){ 

		if (type in value['TEXT'])
		{
			var data = value['TEXT'][type]
			data = data.replace(/\<.*\>/g," ")
			data = data.replace(/\n/g," ")
			data = data.replace(/\s[uU]\.*[sS]\.*\s/g," USA ")
			data = data.replace(/\s{2,}/g, ' ')


			fs.writeFileSync('./full/full.json.dep/'+id+"."+type, data)

			files.push(__dirname+'/full/full.json.dep/'+id+"."+type)
		}
	}, this)
	

}, this)

fs.writeFileSync('./full/full.json.dep/list', files.join("\n"))


// java -cp stanford-corenlp-3.5.2.jar edu.stanford.nlp.pipeline.StanfordCoreNLP -props config.properties -filelist path  -outputFormat json