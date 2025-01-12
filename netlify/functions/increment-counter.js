const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: 'fnAF052Bb5AAQE9uLkcHmk7Es7xlve2WGD_c0Vn7', // Your Fauna Server Key from environment variable
    domain: 'db.us.fauna.com',
    scheme: 'https',
});

exports.handler = async (event, context) => {
    try {
        const result = await client.query(
            q.Get(q.Match(q.Index('counters_by_site'), 'my-website'))
        );

        const counter = result.data;
        const ref = result.ref;

        const updatedCounter = await client.query(
            q.Update(ref, {
                data: {
                    count: counter.count + 1,
                },
            })
        );

        return {
            statusCode: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            body: JSON.stringify({ count: updatedCounter.data.count }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};