var fs = require('fs');
var _ = require('underscore')._;

var dir = './full/full.json.parse/'

var files = fs.readdirSync(dir)

var dataset = JSON.parse(fs.readFileSync('./R8/R8.train.json','UTF-8'))

var conversion = {
	'CharacterOffsetBegin':'characterOffsetBegin',
	'CharacterOffsetEnd':'characterOffsetEnd',
	'PartOfSpeech':'pos',
	'Text':'word',
	'Lemma':'lemma',
	'NamedEntityTag':'ner',
	'NormalizedNamedEntityTag':'nner'
}

function parseLine(line)
{
	var output = {}
	line = line.replace(/[\[\]]/g,'')
	line = line.split(" ")
	_.each(line, function(param, key, list){ 
		var pair = param.split("=")
		if (!(pair[0] in conversion))
			{
			console.log(pair[0])
			process.exit(0)
			}
		output[conversion[pair[0]]] = pair[1]
	}, this)
	return output
}


function replaceToken(json, id, type)
{
	var file = id + "." + type + ".out"
	if (files.indexOf(file) == -1)
	{
		console.log("file " + file + " is not found in directory")
		process.exit(0)
	}

	var out = fs.readFileSync(dir + file,'UTF-8')

	lines = out.split("\n")

	var sentences = []
	var num = 0
	_.each(lines, function(value, key, list){ 
		if (!_.isNull(value.match(/^Sentence \#/)))
			sentences.push([])

		if (!_.isNull(value.match(/\[Text\=/)))
			sentences[sentences.length - 1].push(parseLine(value))
	}, this)

	_.each(json['sentences'], function(sen, key, list){ 
		json['sentences'][key]['tokens'] = sentences[key]
	}, this)
	return json
}


function parse_filter(parse)
{
	_.each(parse['sentences'], function(value, key, list){ 
		delete parse['sentences'][key]['basic-dependencies']
		delete parse['sentences'][key]['collapsed-dependencies']
	}, this)

	return parse
}

var types = ['BODY', 'TITLE']


_.each(dataset, function(value, key, list){ 

	var id = value['$']['NEWID']

	_.each(types, function(type, key, list){ 
		var file = id+"."+type+".json"
		

		if (files.indexOf(file) != -1)
		{
			var json = parse_filter(JSON.parse(fs.readFileSync(dir + file,'UTF-8')))
			json = replaceToken(json, id, type)

			dataset[key][type + "_CORENLP" ] = json	
		}

	}, this)
}, this)

fs.writeFileSync('./R8/train/R8.train.corenlp.json', JSON.stringify(dataset, null, 4))


// var data_splited = _.groupBy(dataset_new, function(element, index){
// 	return index%15;
// })

// _.each(_.toArray(data_splited), function(data, key, list){
// 	console.log("writing "+key)
// 	fs.writeFileSync('./R8/train/R8.train.'+key+'.corenlp.json', JSON.stringify(data, null, 4))
// }, this)


