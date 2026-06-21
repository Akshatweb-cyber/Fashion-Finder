export default async function handler(req, res) {
    // CORS headers taaki request block na ho
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;
        const token = process.env.APIFY_TOKEN;

        if (!token) {
            return res.status(500).json({ error: 'Apify token missing in Vercel settings!' });
        }

        // Base64 image string se pure data extract karna
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // Apify ke "Google Lens Actor" ko direct base64 image data ke sath call karna
        const response = await fetch(`https://api.apify.com/v2/acts/apify~google-lens/run-sync?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "rawImageData": base64Data,
                "maxResults": 8,
                "language": "en"
            })
        });

        const data = await response.json();
        
        // Google Lens se shopping results nikalna
        const shoppingResults = data.output?.body?.shopping_results || data.output?.data?.shopping_results || [];
        
        return res.status(200).json({ results: shoppingResults });

    } catch (error) {
        return res.status(500).json({ error: 'AI Backend Error: ' + error.message });
    }
}

