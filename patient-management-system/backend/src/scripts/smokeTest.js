import 'dotenv/config';
const base = `http://localhost:${process.env.PORT || 3000}`;
const response = await fetch(`${base}/health`);
const body = await response.json();
console.log(response.status, body);
if (!response.ok || body.status !== 'ok') process.exit(1);
