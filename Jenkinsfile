// Jenkinsfile - Declarative Pipeline
//
// This pipeline builds the app, tests it, builds a Docker image, and pushes
// it to BOTH Docker Hub and ECR (separately controllable via parameters),
// then updates the GitOps repo so ArgoCD picks up the change.
//
// CREDENTIALS EXPECTED IN JENKINS (Manage Jenkins > Credentials):
//   - dockerhub-creds     : Username/Password type, your Docker Hub username + access token
//   - aws-ecr-creds       : AWS Credentials type (or Username/Password with access key/secret)
//   - github-pat          : Username/Password type, GitHub username + Personal Access Token
//
// PARAMETERS: choose which registry(ies) to push to per build - great for
// comparing DockerHub vs ECR auth behavior side by side.

pipeline {
    agent {label 'docker agent'}

    parameters {
        booleanParam(name: 'PUSH_TO_DOCKERHUB', defaultValue: true, description: 'Push image to Docker Hub')
        booleanParam(name: 'PUSH_TO_ECR', defaultValue: false, description: 'Push image to AWS ECR')
        booleanParam(name: 'UPDATE_GITOPS_REPO', defaultValue: false, description: 'Update GitOps repo (enable once Pillar 5)')
    }

    environment {
        // --- Fill these in once you provision your registries ---
        DOCKERHUB_USERNAME   = 'your-dockerhub-username'
        DOCKERHUB_REPO       = 'your-dockerhub-username/jenkins-argocd-app'

        AWS_ACCOUNT_ID       = '123456789012'
        AWS_REGION           = 'ap-south-1'
        ECR_REPO             = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/jenkins-argocd-app"

        GITOPS_REPO_URL      = 'https://github.com/your-username/jenkins-argocd-gitops.git'

        // Short commit SHA used as the immutable image tag
        IMAGE_TAG            = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'local'}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build \
                        --build-arg APP_VERSION=${IMAGE_TAG} \
                        -t app-local:${IMAGE_TAG} .
                """
            }
        }

        stage('Push to Docker Hub') {
            when {
                expression { params.PUSH_TO_DOCKERHUB == true }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh """
                        echo "\$DH_PASS" | docker login -u "\$DH_USER" --password-stdin
                        docker tag app-local:${IMAGE_TAG} ${DOCKERHUB_REPO}:${IMAGE_TAG}
                        docker tag app-local:${IMAGE_TAG} ${DOCKERHUB_REPO}:latest
                        docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
                        docker push ${DOCKERHUB_REPO}:latest
                        docker logout
                    """
                }
            }
        }

        stage('Push to ECR') {
            when {
                expression { params.PUSH_TO_ECR == true }
            }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-ecr-creds'
                ]]) {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                        docker tag app-local:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}
                        docker tag app-local:${IMAGE_TAG} ${ECR_REPO}:latest
                        docker push ${ECR_REPO}:${IMAGE_TAG}
                        docker push ${ECR_REPO}:latest
                    """
                }
            }
        }

        stage('Update GitOps Repo') {
            when {
                expression { params.UPDATE_GITOPS_REPO == true }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-pat',
                    usernameVariable: 'GH_USER',
                    passwordVariable: 'GH_TOKEN'
                )]) {
                    sh """
                        rm -rf gitops-repo
                        git clone https://\$GH_USER:\$GH_TOKEN@${GITOPS_REPO_URL.replace('https://', '')} gitops-repo
                        cd gitops-repo

                        # This sed command bumps the image tag in your deployment manifest.
                        # Adjust the path/filename once GitOps repo structure is finalized.
                        sed -i "s|image:.*|image: ${DOCKERHUB_REPO}:${IMAGE_TAG}|" manifests/deployment.yaml

                        git config user.email "jenkins@ci.local"
                        git config user.name "Jenkins CI"
                        git add manifests/deployment.yaml
                        git commit -m "Update image to ${IMAGE_TAG} [ci skip]"
                        git push origin main
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
        success {
            echo "Build ${IMAGE_TAG} completed successfully."
        }
        failure {
            echo "Build failed - check stage logs above."
        }
    }
}
