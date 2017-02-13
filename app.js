var express = require('express')
var mysql = require('mysql');
var bodyParser = require('body-parser')
var async = require('async')
var cryptoverseVerify = require('./lib/cryptoverse/verify.js')
var app = express()

var pool = mysql.createPool(
{
	connectionLimit : 100, //important < lol find out why
	host     : process.env.db_host,
	user     : process.env.db_username,
	password : process.env.db_password,
	database : process.env.db_starlog,
	debug    : false
});

app.use(bodyParser.json());

function queryStarlog(query, callback) 
{
	pool.getConnection(function(err, connection)
	{
		if (err) 
		{
			if (connection != null) connection.release()
			res.json({"code" : 100, "status" : "Error in connection database"})
			return
		}   

		console.log('connected as id ' + connection.threadId)
		// "select * from star_logs"
		connection.query(query,function(err, rows) 
		{
			connection.release()
			callback(err, rows)
		})

		connection.on('error', function(err) 
		{      
			res.json({"code" : 100, "status" : "Error in connection database"})
			return
		})
	})
}

app.post('/star-logs', function (req, res) 
{
	console.log(req.body)
	cryptoverseVerify.verifyStarlog(req.body[0])
	res.send("todo: everything")
})

app.get('/star-logs', function (req, res) 
{
	async.waterfall(
	[
		function(callback) 
		{
			queryStarlog("SELECT * FROM star_logs LIMIT 5", callback)
		}
	], 
		function (err, rows) {
			if (err)
			{
				console.log(err)
				res.json({"code" : 200, "status" : "Error"})
				return
			}
			res.send(rows)
		}
	);
})

app.listen(3000, function () 
{
	console.log('Cryptoverse service listening on port 3000!')
})