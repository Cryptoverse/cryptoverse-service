// verify.js
// ========
exports.verifyStarlog = function(starlog) 
{
	//return /^[A-Fa-f0-9]{64}$/g.test(starlog.hash)
	 try {
        if (!verifyFields(starlog)) return false
    } catch (e) {
        return false;
    }

    if (!verifyHashField(starlog.hash)) return false
    if (!verifyHashField(starlog.previous_hash)) return false
    if (!verifyHashField(starlog.state_hash)) return false

    return true;
}

function verifyFields(starlog)
{
	if (!starlog) return false;
	if (!starlog.hash) return false;
	if (!starlog.log_header) return false;
	if (isNaN(starlog.version)) return false;
	if (!starlog.previous_hash) return false;
	if (isNaN(starlog.difficulty)) return false;
	if (isNaN(starlog.nonce)) return false;
	if (!starlog.time) return false;
	if (!starlog.state_hash) return false;
	if (!starlog.state) return false;

	return true;
}

function verifyHashField(hash)
{
	return /^[A-Fa-f0-9]{64}$/g.test(hash)
}