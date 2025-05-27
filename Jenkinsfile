pipeline {
    agent any

    environment {
        APP_NAME = 'user-ms'
        REPO_URL = 'https://github.com/Nest-Microservices-Product/user-ms'
        SSH_CRED_ID = 'ssh-key-ec2'
        SSH_CRED_ID_DIEGO = 'ssh-key-ec2-diego'
        EC2_USER = 'ubuntu'
        REMOTE_PATH = '/home/ubuntu/user-ms'
        K8S_REMOTE_PATH = '/home/ubuntu/nest-microservices/k8s/store-ms/templates/user-ms/'
        IMAGE_NAME = 'fernandoflores07081/user-ms-prod'
    }

    stages {
        stage('Setup Environment') {
            steps {
                script {
                    def branch = env.GIT_BRANCH
                    if (!branch) {
                        env.DEPLOY_ENV = 'none'
                        echo "No se detectó rama, no se desplegará."
                        return
                    }
                    branch = branch.replaceAll('origin/', '')
                    echo "Rama detectada: ${branch}"

                    switch(branch) {
                        case 'main':
                            env.DEPLOY_ENV = 'production'
                            env.NODE_ENV = 'production'
                            env.DOCKER_TAG = "${env.BUILD_NUMBER}"
                            break
                        case 'qa':
                            env.DEPLOY_ENV = 'qa'
                            env.EC2_IP = '34.194.76.73'
                            env.NODE_ENV = 'qa'
                            env.NATS_SERVERS = 'nats://3.230.217.180:4222'
                            break
                        case 'dev':
                            env.DEPLOY_ENV = 'development'
                            env.EC2_IP = '54.159.216.48'
                            env.NODE_ENV = 'development'
                            env.NATS_SERVERS = 'nats://52.200.251.120:4222'
                            break
                        default:
                            env.DEPLOY_ENV = 'none'
                            echo "No hay despliegue configurado para esta rama: ${branch}"
                    }
                }
            }
        }

        stage('Checkout') {
            when {
                expression { env.DEPLOY_ENV != 'none' }
            }
            steps {
                git branch: env.GIT_BRANCH.replaceAll('origin/', ''), url: "${REPO_URL}"
            }
        }

        stage('Build Docker Image - Production') {
            when {
                expression { env.DEPLOY_ENV == 'production' && env.DEPLOY_ENV != 'none' }
            }
            steps {
                script {
                    sh "docker build -f dockerfile.prod -t ${IMAGE_NAME}:${env.DOCKER_TAG} -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Push Docker Image - Production') {
            when {
                expression { env.DEPLOY_ENV == 'production' && env.DEPLOY_ENV != 'none' }
            }
            steps {
                script {
                    sh "docker push ${IMAGE_NAME}:${env.DOCKER_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy to GKE - Production') {
            when {
                expression { env.DEPLOY_ENV == 'production' && env.DEPLOY_ENV != 'none' }
            }
            steps {
                script {
                    def k8sConfigFile = "${K8S_REMOTE_PATH}deployment.yml"
                    sh "kubectl apply -f ${k8sConfigFile} --namespace=default"
                    
                    sh "kubectl set image deployment/user-ms user-ms-prod=${IMAGE_NAME}:${env.DOCKER_TAG} --namespace=default"

                    // Verificar que el despliegue se complete exitosamente
                    sh "kubectl rollout status deployment/user-ms --namespace=default"
                }
            }
        }

        stage('Build - Development and QA') {
            when {
                expression { env.DEPLOY_ENV != 'none' && env.DEPLOY_ENV != 'production' }
            }
            steps {
                sh 'rm -rf node_modules'
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Deploy - Development and QA') {
            when {
                expression { env.DEPLOY_ENV != 'none' && env.DEPLOY_ENV != 'production' }
            }
            steps {
                script {
                    def envSuffix = env.DEPLOY_ENV
                    def sshKeyId = env.DEPLOY_ENV == 'development' ? SSH_CRED_ID_DIEGO : SSH_CRED_ID
                    def dbUrl = "db-auth-url-${envSuffix}"

                    withCredentials([
                        sshUserPrivateKey(credentialsId: sshKeyId, keyFileVariable: 'SSH_KEY'),
                        string(credentialsId: dbUrl, variable: 'DATABASE_URL')
                    ]) {
                        sh 'chmod +x ./deploy.sh'    
                        def branchName = env.GIT_BRANCH.replaceAll('origin/', '')
                        sh """
                        SSH_KEY=\$SSH_KEY \
                        EC2_USER=\$EC2_USER \
                        EC2_IP=\$EC2_IP \
                        REMOTE_PATH=\$REMOTE_PATH \
                        REPO_URL=\$REPO_URL \
                        APP_NAME=\$APP_NAME \
                        NODE_ENV=\$NODE_ENV \
                        GIT_BRANCH=${branchName} \
                        NATS_SERVERS=\$NATS_SERVERS \
                        DATABASE_URL=\$DATABASE_URL \
                        ./deploy.sh
                        """
                    }
                    
                }
            }
        }

        stage('Cleanup Docker - Production') {
            when {
                expression { env.DEPLOY_ENV == 'production' }
            }
            steps {
                sh "docker rmi ${IMAGE_NAME}:${env.DOCKER_TAG} || true"
                sh "docker rmi ${IMAGE_NAME}:latest || true"
                sh "docker system prune -f || true"
            }
        }
    }

    post {
        success {
            echo "Despliegue exitoso en ${env.DEPLOY_ENV}"
        }
        failure {
            echo "El despliegue en ${env.DEPLOY_ENV} ha fallado"
        }
    }
}
