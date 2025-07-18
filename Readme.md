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
const cache = new NodeCache({ stdTTL: 60 })
// the cache expires in 60 seconds
// after 60 seconds the cache will automatically clear, by node-cache

app.get('/data', async (req, res) => {
  const cachedData = cache.get('data');

  if(cachedData) {
    return res.json({ fromCache: true, data: cachedData });
    // check if data is avail in the node-cache, then return cachedData in data object
  }

  const response = await fetch('https://jsonplaceholder.typicode.com/todos');
  // else request to the database and get the data from backend api
  
  const newData = await response.json();
  cache.set('data', newData);
  // after getting the data from backend api, store newData as data in node-cache

  return res.json({
    fromCache: false,
    data: newData
  });
  // after storing the newData, return the newData from database
});

app.listen(4000);
```
- Note: Prefer **Redis** for production use

# 3. Validation
- Ensure incoming data is correct and secure
- Tool used: `express-validator`

``` js
import validator from 'express-validator';

const app = express();
app.use(express.json());

app.post('/user', [
  validator.body('email').isEmail(),
  // checks if email exists and is in valid email format.

  validator.body('password').isLength({ min: 6 })
  // checks if password has at least 5 characters.

], (req: any, res: any) => {
  const errors = validator.validationResult(req);
  // Function to collect the result of validation and check for errors.
  // gathers all validation errors (if any) from the previous middlewares.

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
    // errors.array() gives a list of all failed validation fields.
  }
  res.send('User is valid');
  // If there are no errors, continue to execute main logic
})
 
app.listen(3000);
```

# 4. Error Handling
- Centralize error logic and avoid crashes

``` js
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  throw new Error('Unexpected Error!');
});

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

app.listen(3000);
```
- Good practice: Create a CustomError class and pass it to the global handler.