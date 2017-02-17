var mySql = require('./mysql')
var forge

exports.initialize = function(forgeModule)
{
	forge = forgeModule
}

exports.verifyStarlogFields = function(starlog, fieldName) 
{
	if (!starlog) throw fieldName+' null'
	if (!starlog.hash) throw fieldName+'.hash null'
	if (!starlog.log_header) throw fieldName+'.log_header null'
	if (isNaN(starlog.version)) throw fieldName+'.version invalid'
	if (!starlog.previous_hash) throw fieldName+'.previous_hash null'
	if (isNaN(starlog.difficulty)) throw fieldName+'.difficulty invalid'
	if (isNaN(starlog.nonce)) throw fieldName+'.nonce invalid'
	if (!starlog.time) throw fieldName+'.time null'
	if (!starlog.state_hash) throw fieldName+'.state_hash null'
	if (!starlog.state) throw fieldName+'.state null'

	verifyFieldIsHash(starlog.hash, fieldName+'.hash')
    verifyFieldIsHash(starlog.previous_hash, fieldName+'.previous_hash')
    verifyFieldIsHash(starlog.state_hash, fieldName+'.state_hash')

    if (!starlog.state.jumps) throw fieldName+'.state.jumps null'
    if (!starlog.state.star_systems) throw fieldName+'.state.star_systems null'

    for (i = 0; i < starlog.state.jumps.length; i++)
    {
    	verifyJumpFields(starlog.state.jumps[i], fieldName+'.state.jumps['+i+']')
    }
}

function verifyJumpFields(jump, fieldName)
{
	if (!jump.fleet) throw fieldName+'.fleet null'
	if (!jump.key) throw fieldName+'.key null'
	if (!jump.origin) throw fieldName+'.origin null'
	if (!jump.destination) throw fieldName+'.destination null'
	if (isNaN(jump.count)) throw fieldName+'.count invalid'
	if (!jump.signature) throw fieldName+'.signature null'

	if (jump.count <= 0) throw fieldName+'.count invalid range'
	verifyFieldIsHash(jump.origin, fieldName+'.origin')
	verifyFieldIsHash(jump.destination, fieldName+'.destination')
	
	if (jump.origin == jump.destination) throw fieldName+' identical origin and destination'

	hashed = hashSha1(jump.fleet+jump.key+jump.origin+jump.destination+jump.count)
	
	signatureError = null
	try
	{
		if (!verifySigned(hashed.bytes(), jump.fleet, forge.util.hexToBytes(jump.signature))) signatureError = fieldName+' is not a valid signature'
	}
	catch (exception)
	{
		console.log(exception)
		throw fieldName+' unable to verify signature'
	}
	if (signatureError) throw signatureError
}

function hashSha1(value)
{
	sha1 = forge.md.sha1.create();
	sha1.update(value, 'utf8');
	return sha1.digest()
}

function hashSha256(value)
{
	sha256 = forge.md.sha256.create();
	sha256.update(value);
	return sha256.digest()
}

function verifySigned(bytes, strippedPublicKey, signature)
{
	publicKey = forge.pki.publicKeyFromPem(formatPublicKey(strippedPublicKey));
	return publicKey.verify(bytes, signature);
}

function formatPublicKey(strippedPublicKey)
{
	return '-----BEGIN PUBLIC KEY-----'+strippedPublicKey+'-----END PUBLIC KEY-----'
}

function verifyFieldIsHash(hash, fieldName)
{
	if(!/^[A-Fa-f0-9]{64}$/g.test(hash)) throw fieldName+' is not a valid Sha256 hash'
}