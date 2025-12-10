// api/personalAccounts.js

import crypto from 'crypto';

// ✅ Use the hash that works in Postman for the full tree
const ROOT_PERSONAL_ACCOUNTS_HASH = '72b0281beffbca4ebeec87c4fdd6f70f';

export default async function handler(req, res) {
  try {
    const { user, apikey, username, accounthash } = req.query;

    const url = new URL('https://gmin.onegrindersguild.com/api.get.user.accounts.php');

    if (user)   url.searchParams.set('user', user);
    if (apikey) url.searchParams.set('apikey', apikey);

    let hashToSend = accounthash;

    // If no explicit hash was provided, derive it
    if (!hashToSend) {
      if (username) {
        // ✅ Correct MD5 usage
        hashToSend = crypto.createHash('md5').update(username).digest('hex');
      } else {
        // ✅ Fall back to the root tree hash
        hashToSend = ROOT_PERSONAL_ACCOUNTS_HASH;
      }
    }

    url.searchParams.set('accounthash', hashToSend);

    console.log('[Vercel] Calling PERSONAL ACCOUNTS upstream:', url.toString());

    const response = await fetch(url.toString());
    const text = await response.text();

    console.log(
      '[Vercel] PERSONAL ACCOUNTS upstream status:',
      response.status,
      'length:',
      text.length
    );

    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).send(text);
  } catch (err) {
    console.error('Vercel /api/personalAccounts failed:', err);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}
