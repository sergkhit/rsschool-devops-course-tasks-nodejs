pipeline {
  agent {
    kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          labels:
            some-label: some-label-value
        spec:
          containers:
          - name: node
            image: timbru31/node-alpine-git
            command:
            - cat
            tty: true
            resources:
              requests:
                memory: "256Mi"
                ephemeral-storage: "512Mi"
                cpu: "500m"
              limits:
                memory: "512Mi"
                cpu: "1"
      ephemeral-storage: "1Gi"
          - name: docker
            image: docker:24.0.5
            command:
            - cat
            tty: true
            resources:
              requests:
                memory: "256Mi"
                ephemeral-storage: "512Mi"
                cpu: "500m"
              limits:
                memory: "512Mi"
                cpu: "1"          
            volumeMounts:
            - name: docker-socket
              mountPath: /var/run/docker.sock
          - name: sonarscanner
            image: sonarsource/sonar-scanner-cli
            command:
            - cat
            tty: true
            resources:
              requests:
                memory: "256Mi"
                ephemeral-storage: "512Mi"
                cpu: "500m"
              limits:
                memory: "512Mi"
                cpu: "1"
          volumes:
          - name: docker-socket
            hostPath:
              path: /var/run/docker.sock
      '''
      retries 2
    }
  }
    parameters {
    booleanParam(name: 'SHOULD_PUSH_TO_ECR', defaultValue: false, description: 'chnange on true for push Docker image to ECR')
  }
  triggers {
    GenericTrigger(
      causeString: 'Triggered by GitHub Push',
      token: 'my-git-token', 
      printPostContent: true,   
      printContributedVariables: true, 
      silentResponse: false
    )
  }

    environment {
        ECR_REGISTRY = "905418277051.dkr.ecr.us-east-1.amazonaws.com"
        ECR_REPO = "nodejs-app-repo"
        CONTAINER_NAME = "nodejs-app"
        IMAGE_TAG = "latest"
        NAMESPACE = "default"
        GITHUB_REPO = "https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs.git"
        GITHUB_BRANCH = "main"
        K3S_NAMESPACE = "jenkins"
        HELM_CHART_DIR = "helm-chart"
        AWS_REGION = "us-east-1"
        WORKSPACE = "./"
        JAVA_HOME = '/opt/java/openjdk'  // Make sure this points to your Java installation
        PATH = "${JAVA_HOME}/bin:${PATH}"

        AWS_CREDENTIALS_ID = 'aws-ecr'
        AWS_ACCOUNT_ID = '905418277051'
        ECR_REPOSITORY = '905418277051.dkr.ecr.us-east-1.amazonaws.com/nodejs-app-repo'
        SONARQUBE_SCANNER = 'SonarQube Scanner'
        DOCKERFILE_REPO = 'https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs'
        DOCKERFILE_BRANCH = 'main'
        GIT_REPO = 'https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs.git' 
        SONAR_HOST_URL = 'https://sonarcloud.io'
        SONAR_PROJECT_KEY = 'rstask6'
        SONAR_ORGANIZATION = 'rstask6khit'
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_SCANNER_VERSION = '6.2.1.4610'
        SONAR_SCANNER_HOME = "$HOME/.sonar/sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64"
    }


    stages {

    // stage('Install Docker') {
    //         steps {
    //             sh 'apt-get update && apt-get install -y docker.io'
    //         }
    //     }


        stage('Prepare') {
            steps {
                container('node') {
                   script {
                       echo "Cloning repository..."
                       sh '''
                       git clone https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs.git nodejs
                       cd nodejs
                       echo "cloning files:"
                       ls -la
                       '''
                    }
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install curl to the Docker container') {
            steps {
                container('node') {  // Убедитесь, что команды выполняются в контейнере 'node'
                    script {
                        echo "Installing curl and OpenJDK..."
                        sh '''
                        apk add --no-cache curl
                        apk add --no-cache openjdk17
                        echo "Curl version:"
                        curl --version
                        echo "Java version:"
                        java -version
                        '''
                    }
                }
            }
        }

        // stage('SonarQube check') {
        //     environment {
        //         scannerHome = tool 'SonarQube';
        //     }
        //     steps {
        //         withSonarQubeEnv(credentialsId: 'SonarQube', installationName: 'SonarQube') {
        //             sh """
        //             ${scannerHome}/bin/sonar-scanner \
        //             -Dsonar.sources=$WORKSPACE
        //             """
        //         }
        //     }
        // }

        stage('Install Dependencies') {
            steps {
                container('node') {
                    script {
                       echo "Installing dependencies..."
                       sh '''
                       cd nodejs/app
                       pwd
                       npm install
                       '''
                    }
                }
            }
        }   
        stage('Run Tests') {
            steps {
                container('node') {
                    script {
                       echo "Running tests..."
                       sh '''
                      cd nodejs/app
                      pwd
                      npm test -- --clearCache
                      npm test
                      '''
                    }
                }
            }
        }   

        // stage('Security Check SonarQube') {
        //     steps {
        //         container('sonarscanner') {
        //             script {
        //             echo "SonarQube test"
        //             sh '''
        //             sh 'curl -f -s -o /dev/null http://54.198.181.116:9000/api/server/version'
        //             sonar-scanner \
        //             -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
        //             -Dsonar.sources=. \
        //             -Dsonar.host.url=${SONAR_HOST_URL} \
        //             -Dsonar.login=${SONAR_LOGIN}
        //             '''
        //             }
        //         }
        //     }
        // }   

        // stage('SonarQube Analysis') {
        //     steps {
        //         container('docker') {
        //             script {
        //             // Install OpenJDK 17 if necessary (already in the docker container)
        //             sh """
        //               apk add --no-cache -q openjdk17
        //               export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
        //               export PATH=\$JAVA_HOME/bin:\$PATH
        //               java -version
        //             """

        //             // Use SonarQubeScanner tool configured in Jenkins
        //             def scannerHome = tool 'SonarQubeScanner'

        //                 // Run SonarQube analysis with appropriate parameters
        //                 withSonarQubeEnv('SonarQube') {
        //                   sh """
        //                     ${scannerHome}/bin/sonar-scanner \
        //                       -Dsonar.projectKey=rstask6 \
        //                       -Dsonar.sources=. \
        //                       -Dsonar.host.url=https://sonarcloud.io \
        //                       -Dsonar.login=${SONAR_TOKEN} \
        //                       -Dsonar.organization=${SONAR_ORGANIZATION}
        //                   """
        //                 }
        //             }
        //         }
        //     }
        // }

        stage('Install AWS CLI') {
            steps {
                container('docker') {
                    script {
                        echo "Installing AWS CLI..."
                        sh '''
                        apk add --no-cache python3 py3-pip
                        pip3 install awscli
                        aws --version
                        '''
                    }
                }
            }
        }   

    stage('Build Docker Image') {
      steps {
        container('docker') {
          script {
            echo "Building Docker image..."
            sh '''
              cd app
              pwd
              docker build -t goals-app:latest -f Dockerfile .
            '''
          }
        }
      }
    }
    
 
        // stage('Build') {
        //     steps {
        //         script {
        //             // docker build
        //             echo "Build Docker image"

        //             sh """
        //             docker version
        //             sh 'docker build -t nodejs-app .
        //             docker images  # Verify it was built
        //             """
        //         }
        //     }
        // }

        // stage('Run Image Locally') {
        //     steps {
        //         script {
        //             echo "Running Docker image locally to test..."
        //             sh """
        //             docker run -d --name ${CONTAINER_NAME} ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}
        //             sleep 5  
        //             # curl http://localhost:8080  # Test the service locally (replace with your actual test)
        //             docker ps  # Verify it's running
        //             """
        //         }
        //     }
        // }        
        // stage('Test') {
        //     steps {
        //         script {
        //             // get tests
        //             sh 'npm test' 
        //         }
        //     }
        // }
        // stage('Security Check') {
        //     steps {
        //         script {
        //             // Security Check SonarQube
        //             sh 'sonar-scanner'
        //         }
        //     }
        // }
        stage('Build and Push Docker Image') {
            steps {
                script {
                    // Login to ECR
                    sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 905418277051.dkr.ecr.us-east-1.amazonaws.com'
                    // Push image to ECR
                    sh 'docker tag nodejs-app:latest 905418277051.dkr.ecr.us-east-1.amazonaws.com/nodejs-app-repo:latest'
                    sh 'docker push 905418277051.dkr.ecr.us-east-1.amazonaws.com/nodejs-app-repo:latest'
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                script {
                    // Deployment to Kubernetes
                    sh 'helm upgrade --install my-nodejs-app ./helm-chart'
                }
            }
        }
    }
    post {
        success {
            // Success Notifications
            echo 'Pipeline succeeded!'
        }
        failure {
            // Failure Notifications
            echo 'Pipeline failed!'
        }
    }
}
