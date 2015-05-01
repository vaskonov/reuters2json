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
	'NamedEntityTag':'ner'
}

function parseLine(input)
{
	var output = {}
	line = input.replace(/[\[\]]/g,'')
	line = line.split(" ")
	_.each(line, function(param, key, list){ 
		var pair = param.split("=")
		if (pair[0] in conversion)
			output[conversion[pair[0]]] = pair[1]
	}, this)
	return output
}


function replaceToken(json, id, type)
{
	var file = id + "." + type + ".out"
//	if (files.indexOf(file) == -1)
//	{
//		console.log("file " + file + " is not found in directory")
//		process.exit(0)
//	}

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
		// delete parse['sentences'][key]['basic-dependencies']
		delete parse['sentences'][key]['collapsed-dependencies']
		delete parse['sentences'][key]['collapsed-ccprocessed-dependencies']
	}, this)

	return parse
}

function collapse(input)
{

	_.each(input['sentences'], function(sen, keys, list){
		
		input['sentences'][keys]['collapsed-dependencies'] = JSON.parse(JSON.stringify(sen['basic-dependencies']))
		
		var buffer = {}
		// buffer['IN'] = 'going'
		_.each(sen['collapsed-dependencies'], function(value, keyd, list){ 

			if (value['dep'] == 'prep')
				{
				if (!(value['dependent'] in buffer))
						buffer[value['dependent']] = {}

					buffer[value['dependent']]['governor'] = value['governor']
					buffer[value['dependent']]['prep_dependent'] = value['dependentGloss']
					buffer[value['dependent']]['governor_record'] = keyd
					buffer[value['dependent']]['governorGloss'] = value['governorGloss']
				}

			if (value['dep'] == 'pobj')
				{
					if (!(value['governor'] in buffer))
						buffer[value['governor']] = {}

					buffer[value['governor']]['dependent'] = value['dependent']
					buffer[value['governor']]['dependentGloss'] = value['dependentGloss']
					buffer[value['governor']]['prep_governor'] = value['governorGloss']
					buffer[value['governor']]['dependent_record'] = keyd
				}
		 }, this)

		var tail = []
		_.each(buffer, function(value, key, list){ 
		 	if (('governor' in value) && ('dependent' in value))
				{
		 		input['sentences'][keys]['collapsed-dependencies'].splice(value['governor_record'], 1, undefined)
		 		input['sentences'][keys]['collapsed-dependencies'].splice(value['dependent_record'], 1, undefined)
		 		if (value['prep_dependent'] != value['prep_governor'])
					throw new Error("for some reason preps are not equal");

		 		tail.push({
		 			'dep': "prep:" + value['prep_dependent'].toLowerCase(),
		 			'governor': value['governor'],
		 			'dependent': value['dependent'],
		 			'governorGloss': value['governorGloss'],
		 			'dependentGloss': value['dependentGloss']
		 		})
		  		}
		}, this)

		input['sentences'][keys]['collapsed-dependencies'] = _.compact(input['sentences'][keys]['collapsed-dependencies'])
		input['sentences'][keys]['collapsed-dependencies'] = input['sentences'][keys]['collapsed-dependencies'].concat(tail) 
	
	}, this)

	return input
}

var types = ['BODY', 'TITLE']


_.each(dataset, function(value, key, list){ 

	if (key % 1000 == 0)
		console.log(key + " within "+dataset.length)

	var id = value['$']['NEWID']

	_.each(types, function(type, keyt, listt){ 
		
		var file = id+"."+type+".json"

		if (files.indexOf(file) != -1)
		{
		
			if (type in value['TEXT'])
			{
				var json = parse_filter(JSON.parse(fs.readFileSync(dir + file,'UTF-8')))
				json = replaceToken(json, id, type)
				json = collapse(json)

				dataset[key][type + "_CORENLP" ] = json	

				console.log(JSON.stringify(dataset[key], null, 4))
				console.log()
				process.exit(0)
			}
		}

	}, this)
}, this)

console.log('writing')
//fs.writeFileSync('./R8/test/R8.train.corenlp.json', JSON.stringify(dataset, null, 4))


 var data_splited = _.groupBy(dataset, function(element, index){
 	return index%5;
 })

 _.each(_.toArray(data_splited), function(data, key, list){
 	console.log("writing "+key)
 	fs.writeFileSync('./R8/test/R8.test.'+key+'.corenlp.json', JSON.stringify(data, null, 4))
 }, this)


