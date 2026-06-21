export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;
        const token = process.env.APIFY_TOKEN;

        // Apify Google Lens Actor ko call karna
        const response = await fetch(`https://api.apify.com/v2/acts/apify~google-lens/run-sync?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "imageUrl": image,
                "maxResults": 6
            })
        });

        const data = await response.json();
        
        // Shopping results extract karna
        const shoppingResults = data.output?.data?.shopping_results || [];
        return res.status(200).json({ results: shoppingResults });

    } catch (error) {
        return res.status(500).json({ error: 'AI Error: ' + error.message });
    }
}
