# 1. Rate Limiting
- Prevent abuse in example: DDos attacks, API Spamming
- Tool used: `express-rate-limit`

``` js
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();

// Allow max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, try again later.'
});

app.use(limiter);

app.get('/', (req, res) => {
  res.send('Rate limited route');
});

app.listen(3000);
```

# 2. Caching
- Reduce response time and server load
- Tool used: `node-cache`

``` js
import NodeCache from 'node-cache';
import express from 'express';

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // 60 seconds TTL

app.get('/data', (req, res) => {
  const cachedData = cache.get('data');

  if (cachedData) {
    return res.json({ fromCache: true, data: cachedData });
  }

  const newData = { value: Math.random() }; // Simulated DB/API response
  cache.set('data', newData);

  res.json({ fromCache: false, data: newData });
});

app.listen(3000);

```