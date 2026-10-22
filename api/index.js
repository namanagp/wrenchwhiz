// Vercel Function entry: every /api/* request is rewritten here (see vercel.json).
// The Express app is exported as the default handler; Vercel calls it with (req, res).
import app from '../server/app.js';

export default app;
