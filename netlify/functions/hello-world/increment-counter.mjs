const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: 'fnAF052Bb5AAQE9uLkcHmk7Es7xlve2WGD_c0Vn7', // Your Fauna Server Key
    domain: 'db.us.fauna.com', // Adjust if you are not in us region
    scheme: 'https',
});

exports.handler = async (event, context) => {
    try {
        // 1. Find the counter document
        const result = await client.query(
            q.Get(q.Match(q.Index('counters_by_site'), 'my-website')) // Assuming you have an index
        );

        const counter = result.data;
        const ref = result.ref;

        // 2. Increment the counter
        const updatedCounter = await client.query(
            q.Update(ref, {
                data: {
                    count: counter.count + 1,
                },
            })
        );

        // 3. Return the updated count
        return {
            statusCode: 200,
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