// DEVELOPMENT ENVIRONMENT
// apiUrl points to the local Nginx load balancer running via docker-compose.
// To run without Docker, change port 8080 → 5001.
export const environment = {
  production: false,
  // apiUrl points directly to the backend since Nginx load balancer is not running
  apiUrl: 'http://localhost:5001/api/v1',
  googleClientId: '344907331936-s3r6nq9vb28brtim1pml4qob36bvoh9h.apps.googleusercontent.com',
};
