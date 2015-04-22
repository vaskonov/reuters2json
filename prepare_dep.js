var fs = require('fs');
var _ = require('underscore')._;

var file = './full/full.json'

var dataset = JSON.parse(fs.readFileSync(file,'UTF-8'))
var files = []


_.each(dataset, function(value, key, list){ 

	var id = value["$"]['NEWID']
	var body = value['TEXT']['BODY']
	var title = value['TEXT']['TITLE']

	fs.writeFileSync('./full/full.json.dep/'+id+".title", title)
	fs.writeFileSync('./full/full.json.dep/'+id+".body", body)

	files.push(__dirname+'/full/full.json.dep/'+id+".body")
	files.push(__dirname+'/full/full.json.dep/'+id+".title")

}, this)

fs.writeFileSync('./full/full.json.dep/list', files.join("\n"))


// java -cp stanford-corenlp-3.5.2.jar edu.stanford.nlp.pipeline.StanfordCoreNLP -props config.properties -filelist path  -outputFormat json