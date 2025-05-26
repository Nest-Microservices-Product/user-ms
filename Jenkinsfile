pipeline {
    agent any

    environment {
        APP_NAME = 'user-ms'
        REPO_URL = 'https://github.com/Nest-Microservices-Product/user-ms'
        SSH_CRED_ID = 'ssh-key-ec2'
        SSH_CRED_ID_DIEGO = 'ssh-key-ec2-diego'
        EC2_USER = 'ubuntu'
        REMOTE_PATH = '/home/ubuntu/user-ms'
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

        stage('Build') {
            when {
                expression { env.DEPLOY_ENV != 'none' }
            }
            steps {
                sh 'rm -rf node_modules'
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                expression { env.DEPLOY_ENV != 'none' }
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
