# jenkins-argocd-app

Sample application repo for the Jenkins + ArgoCD learning pipeline.

## Structure
- `app.js` / `package.json` / `test.js` - minimal Node.js app with a `/` endpoint
  showing a version string (bump this to visually confirm deployments)
- `Dockerfile` - builds the app into a container image
- `Jenkinsfile` - CI pipeline: checkout -> install -> test -> build image ->
  push to Docker Hub and/or ECR -> update GitOps repo

## Local test (before wiring into Jenkins)
```bash
npm install
npm test
npm start
# visit http://localhost:3000
```

## Docker build test
```bash
docker build --build-arg APP_VERSION=v1.0.0 -t app-local:v1.0.0 .
docker run -p 3000:3000 app-local:v1.0.0
```

## Jenkins credentials required
| Credential ID     | Type                          | Used for              |
|--------------------|-------------------------------|------------------------|
| `dockerhub-creds`  | Username/Password             | Docker Hub push        |
| `aws-ecr-creds`    | AWS Credentials                | ECR push                |
| `github-pat`       | Username/Password (PAT as pw) | Updating GitOps repo    |

## Before first real Jenkins run
Update the `environment {}` block in the Jenkinsfile:
- `DOCKERHUB_USERNAME` / `DOCKERHUB_REPO`
- `AWS_ACCOUNT_ID` / `AWS_REGION` / `ECR_REPO`
- `GITOPS_REPO_URL`
