var mySql
var pool

exports.initialize = function(mySqlModule)
{
	mySql = mySqlModule
	pool = mySql.createPool(
		{
			connectionLimit : 100, //important < lol find out why
			host     : process.env.db_host,
			user     : process.env.db_username,
			password : process.env.db_password,
			database : process.env.db_starlog,
			debug    : false
		}
	);
}

exports.query = function(query, callback) 
{
	pool.getConnection(
		function(error, connection)
		{
			if (error) 
			{
				if (connection != null) connection.release()
				callback({'code' : 100, 'status' : 'Error in connection database'})
				return
			}   

			console.log('connected as id ' + connection.threadId)
			
			connection.query(
				query,
				function(error, rows) 
				{
					connection.release()
					callback(error, rows)
				}
			)

			connection.on(
				'error', 
				function(error) 
				{      
					callback({'code' : 100, 'status' : 'Error in connection database'})
					return
				}
			)
		}
	)
}

exports.getStarlog = function(hash, callback)
{
	query(
		'SELECT * FROM star_logs WHERE hash = ? LIMIT 1', 
		function(error, rows)
		{
			if (error)
			{
				callback(error)
				return
			}
			if (rows) callback(null, rows[0])
			else callback(null, null)
		}
	)
}