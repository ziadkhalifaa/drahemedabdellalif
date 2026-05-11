import server from '../apps/api/src/main';

export default async (req: any, res: any) => {
  try {
    const instance = await server(req, res);
    return instance;
  } catch (error) {
    console.error('CRITICAL BOOTSTRAP ERROR:', error);
    res.status(500).json({
      message: 'Internal Server Error during bootstrap',
      error: error.message,
      stack: error.stack
    });
  }
};
