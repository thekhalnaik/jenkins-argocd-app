const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// This VERSION value is what you'll bump to visually confirm
// that Jenkins -> ECR/DockerHub -> ArgoCD -> k3s pipeline actually worked.
const VERSION = process.env.APP_VERSION || 'v1.0.0';

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from the Jenkins + ArgoCD learning pipeline!',
    version: VERSION,
    hostname: require('os').hostname(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}, version ${VERSION}`);
});
