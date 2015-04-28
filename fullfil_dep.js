var fs = require('fs');
var _ = require('underscore')._;

var dir = __dirname+'/full/full.json.parse/'

var files = fs.readdirSync(dir)

var dataset = JSON.parse(fs.readFileSync('./R8/R8.test.json','UTF-8'))

var dataset_hash = {}

// collapsed-ccprocessed-dependencies only

// to delete
// basic-dependencies
// collapsed-dependencies
// tokens
function parse_filter(parse)
{
	_.each(parse['sentences'], function(value, key, list){ 
		delete parse['sentences'][key]['basic-dependencies']
		delete parse['sentences'][key]['collapsed-dependencies']
	}, this)

	return parse
}

_.each(dataset, function(value, key, list){ 
	dataset_hash[(value['$']['NEWID'])] = value
}, this)

_.each(files, function(file, key, list){ 

	if (key % 1000 == 0)
		console.log(key + " from " + files.length)

	if (file == "README")
		return

	var names = file.split(".")

	var id = names[0].toString()

	if (id in dataset_hash)
	{
		dataset_hash[names[0]][names[1] + "_CORENLP" ] = parse_filter(JSON.parse(fs.readFileSync(dir + file,'UTF-8')))
	}
}, this)

var dataset_new = []

// body_dep
// title_dep

console.log("Organaize hash in array")

var len = Object.keys(dataset_hash).length

_.each(dataset_hash, function(value, key, list){ 

	if (key % 1000 == 0)
		console.log(key + " from " + len)

	// if (!('body_dep' in value))
	// {
		// console.log(value['$']['NEWID']+" no body_dep")
		// process.exit(0)
	// }
// 
	// if (!('title_dep' in value))
	// {
		// console.log(value['$']['NEWID']+" no title_dep")
		// process.exit(0)
	// }

	dataset_new.push(value)
}, this)



var dataset_new1 = dataset_new.slice(0,Math.floor(dataset_new.length/2))

console.log("writing 1")
fs.writeFileSync('./R8/R8.test1.corenlp.json', JSON.stringify(dataset_new1, null, 4))
console.log("writing 2")
fs.writeFileSync('./R8/R8.test2.corenlp.json', JSON.stringify(dataset_new, null, 4))
console.log("new data is added")



