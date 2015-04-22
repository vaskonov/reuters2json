var fs = require('fs');
var _ = require('underscore')._;

var file = './full/full.json'

var dataset = JSON.parse(fs.readFileSync(file,'UTF-8'))



_.each(dataset, function(value, key, list){ 

	var id = value["$"]['NEWID']
	var body = value['TEXT']['BODY']
	var title = value['TEXT']['TITLE']

	fs.writeFileSync('./full/full.json.dep/'+id+".title", title)
	fs.writeFileSync('./full/full.json.dep/'+id+".body", body)

}, this)
