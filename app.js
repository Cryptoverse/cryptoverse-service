var express = require('express')
var mySqlModule = require('mysql')
var bodyParser = require('body-parser')
var async = require('async')
var forge = require('node-forge')
var mySql = require('./lib/cryptoverse/mysql')
var verify = require('./lib/cryptoverse/verify')
var app = express()

app.use(bodyParser.json()) 

mySql.initialize(mySqlModule)
verify.initialize(forge)

app.post('/star-logs', function (req, res) 
{
	async.waterfall(
	[
		function(callback)
		{
			try
			{
				for (i = 0; i < req.body.length; i++) 
				{
					verify.verifyStarlogFields(req.body[i], 'star_log['+i+']')
	    		}
    		}
    		catch (exception)
    		{
    			callback(exception)
    			return
    		}
    		callback(null)
		}
	], 
		function (error) {
			if (error)
			{
				console.log(error)
				res.json({'code' : 200, 'status' : process.env.debug ? error : 'error'})
				return
			}
			res.send("Is valid true")
		}
	);
})

app.get('/star-logs', function (req, res) 
{
	async.waterfall(
	[
		function(callback) 
		{
			mySql.query("SELECT * FROM star_logs LIMIT 5", callback)
		}
	], 
		function (error, rows) {
			if (error)
			{
				console.log(error)
				res.json({'code' : 200, 'status' : process.env.debug ? error : 'error'})
				return
			}
			res.send(rows)
		}
	);
})

app.listen(3000, function () 
{
	if (process.env.debug) console.log('Debug cryptoverse service listening on port 3000')
	else console.log('Cryptoverse service listening on port 3000')
})