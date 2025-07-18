import express from 'express';
import rateLimiter from 'express-rate-limit';

import NodeCache from 'node-cache';

import validator from 'express-validator';

const RateLimiter = async () => {
  const app = express();

  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // in 15min
    max: 100, // max 100 request allowed
    message: 'Too many requests from this IP, try again later.'
  });

  app.use(limiter);

  app.get('/', (req, res) => {
    res.send('Rate limited route');
  });

  app.listen(3000);
}
// RateLimiter();

const CachingWithExpress = async() => {
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
}
// CachingWithExpress();

const Validation = async() => {
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
      return res.status(400).json({ errors: errors.array() });
      // errors.array() gives a list of all failed validation fields.
    }
    res.send('User is valid');
    // If there are no errors, continue to execute main logic
  })
  
  app.listen(5000);
}
// Validation();

const ErrorHandling = async() => {
  const app = express();

  app.use((req, res, next) => {
    return res.status(400).json({ message: 'Not found' });
  });
  // 404 not found middleware

  app.use((err: any, req: any, res: any, next: any) => { console.log(err.stack) 
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal Server Error'
    });
  });
  // global error handler

  app.listen(6000)
}
// ErrorHandling();