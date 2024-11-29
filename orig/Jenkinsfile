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
          - name: docker
            image: docker:24.0.5
            command:
            - cat
            tty: true
            volumeMounts:
            - name: docker-socket
              mountPath: /var/run/docker.sock
          - name: sonarscanner
            image: sonarsource/sonar-scanner-cli
            command:
            - cat
            tty: true
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
        // SONAR_PROJECT_KEY = "rstask6"
        // SONAR_LOGIN = "sqp_nnn"
        // SONAR_HOST_URL = "http://3.80.253.45:9000"
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
        GITHUB_REPO = 'https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs'
        GITHUB_BRANCH = 'main'
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
              docker build -t nodejs-app:latest -f Dockerfile .
            '''
          }
        }
      }
    }
    
 
//         // stage('Build') {
//         //     steps {
//         //         script {
//         //             // docker build
//         //             echo "Build Docker image"

//         //             sh """
//         //             docker version
//         //             sh 'docker build -t nodejs-app .
//         //             docker images  # Verify it was built
//         //             """
//         //         }
//         //     }
//         // }

//         // stage('Run Image Locally') {
//         //     steps {
//         //         script {
//         //             echo "Running Docker image locally to test..."
//         //             sh """
//         //             docker run -d --name ${CONTAINER_NAME} ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}
//         //             sleep 5  
//         //             # curl http://localhost:8080  # Test the service locally (replace with your actual test)
//         //             docker ps  # Verify it's running
//         //             """
//         //         }
//         //     }
//         // }        
//         // stage('Test') {
//         //     steps {
//         //         script {
//         //             // get tests
//         //             sh 'npm test' 
//         //         }
//         //     }
//         // }
//         // stage('Security Check') {
//         //     steps {
//         //         script {
//         //             // Security Check SonarQube
//         //             sh 'sonar-scanner'
//         //         }
//         //     }
//         // }
//         stage('Build and Push Docker Image') {
//             steps {
//                 script {
//                     // Login to ECR
//                     sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 905418277051.dkr.ecr.us-east-1.amazonaws.com'
//                     // Push image to ECR
//                     sh 'docker tag nodejs-app:latest 905418277051.dkr.ecr.us-east-1.amazonaws.com/nodejs-app-repo:latest'
//                     sh 'docker push 905418277051.dkr.ecr.us-east-1.amazonaws.com/nodejs-app-repo:latest'
//                 }
//             }
//         }

//         stage('Deploy to K8s') {
//             steps {
//                 script {
//                     // Deployment to Kubernetes
//                     sh 'helm upgrade --install my-nodejs-app ./helm-chart'
//                 }
//             }
//         }
//     }
//     post {
//         success {
//             // Success Notifications
//             echo 'Pipeline succeeded!'
//         }
//         failure {
//             // Failure Notifications
//             echo 'Pipeline failed!'
//         }
//     }
}



// pipeline {
//     agent {
//         kubernetes {
//             label 'docker-build'
//             yaml """
// apiVersion: v1
// kind: Pod
// spec:
//   serviceAccountName: jenkins
//   containers:
//   - name: jenkins-agent
//     image: jenkins/inbound-agent:latest
//     command:
//     - cat
//     tty: true
//     securityContext:
//       privileged: true
//   - name: docker
//     image: docker:dind
//     securityContext:
//       privileged: true
//   - name: helm
//     image: alpine/helm:3.11.1  # Helm container
//     command: ['cat']
//     tty: true
// """
//         }
//     }
//     environment {
//         AWS_CREDENTIALS_ID = 'aws-ecr'
//         AWS_ACCOUNT_ID = '905418277051'
//         ECR_REPOSITORY = '905418277051.dkr.ecr.us-east-1.amazonaws.com/nodejs-app-repo'
//         IMAGE_TAG = "latest"
//         SONARQUBE_SCANNER = 'SonarQube Scanner'
//         AWS_REGION = 'us-east-1'
//         DOCKERFILE_REPO = 'https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs'
//         DOCKERFILE_BRANCH = 'main'
//         GIT_REPO = 'https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs.git' 
//         GITHUB_REPO = 'https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs'
//         GITHUB_BRANCH = 'main'
//         SONAR_HOST_URL = 'https://sonarcloud.io'
//         SONAR_PROJECT_KEY = 'rstask6'
//         SONAR_ORGANIZATION = 'rstask6khit'
//         SONAR_TOKEN = credentials('sonar-token')
//         SONAR_SCANNER_VERSION = '6.2.1.4610'
//         SONAR_SCANNER_HOME = "$HOME/.sonar/sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64"
//         WORKSPACE = "./"
//         JAVA_HOME = '/opt/java/openjdk'  // Make sure this points to your Java installation
//         PATH = "${JAVA_HOME}/bin:${PATH}"
//     }
//     stages {
//         stage('Checkout Dockerfile') {
//             steps {
//                 git url: "${GITHUB_REPO}", branch: "${GITHUB_BRANCH}"
//             }
//          }       
//         stage('Checkout Application Code') { 
//             steps {
//                git url: "${GIT_REPO}", branch: 'main'
//             }
//         }
//         stage('Prepare Docker') {
//             steps {
//                 container('docker') {
//                     sh 'dockerd-entrypoint.sh &>/dev/null &' // Start Docker daemon
//                     sh 'sleep 20'                            // Wait for Docker to initialize
//                     sh 'apk update && apk add --no-cache aws-cli kubectl'  // Install necessary tools
//                     sh 'aws --version'                       // Verify AWS CLI installation
//                     sh 'docker --version'                    // Verify Docker installation
//                     sh 'kubectl version --client'            // Verify kubectl installation
//                 }
//             }
//         }

//         stage('Prepare repo') {
//             steps {
//                 container('docker') {
//                    script {
//                        echo "Cloning repository..."
//                        sh '''
//                        git clone https://github.com/sergkhit/rsschool-devops-course-tasks-nodejs.git nodejs
//                        cd nodejs
//                        echo "cloning files:"
//                        ls -la
//                        '''
//                     }
//                 }
//             }
//         }                      

//         stage('Unit Tests') {  
//             steps {
//                 git url: "${GITHUB_REPO}", branch: "${GITHUB_BRANCH}" // Checkout here as well
//                 container('docker') {
//                     // sh "docker build -t nodejs-builder -f Dockerfile --target builder ."  
//                     sh "docker build -t nodejs-app ."
//                     sh "docker run --rm nodejs-app go test -v ./..." 
//                 }
//             }
//         }
//         stage('SonarQube Analysis') {
//             steps {
//                 container('docker') {
//                     script {
//                     // Install OpenJDK 17 if necessary (already in the docker container)
//                     sh """
//                       apk add --no-cache -q openjdk17
//                       export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
//                       export PATH=\$JAVA_HOME/bin:\$PATH
//                       java -version
//                     """

//                     // Use SonarQubeScanner tool configured in Jenkins
//                     def scannerHome = tool 'SonarQubeScanner'

//                         // Run SonarQube analysis with appropriate parameters
//                         withSonarQubeEnv('SonarQube') {
//                           sh """
//                             ${scannerHome}/bin/sonar-scanner \
//                               -Dsonar.projectKey=rstask6 \
//                               -Dsonar.sources=. \
//                               -Dsonar.host.url=https://sonarcloud.io \
//                               -Dsonar.login=${SONAR_TOKEN} \
//                               -Dsonar.organization=${SONAR_ORGANIZATION}
//                           """
//                         }
//                     }
//                 }
//             }
//         }
//         stage('Application Build') {
//             steps {
//                 container('docker') {
//                     sh "docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} ."
//                 }
//             }
//         }
//         stage('Push Docker Image to ECR') {
//             when { expression { params.PUSH_TO_ECR == true } }
//             steps {
//                 script {
//                     if (currentBuild.result != 'FAILURE') {  //Capture success (or unstable)
//                         env.PUSH_SUCCESSFUL = true
//                     } else {
//                         env.PUSH_SUCCESSFUL = false // Explicitly set to false on failure
//                         }
//                     container('docker') {
//                         withCredentials([aws(credentialsId: "${AWS_CREDENTIALS_ID}")]) {
//                             // Log in to ECR
//                             sh """
//                             aws ecr get-login-password --region ${AWS_REGION} | docker login -u AWS --password-stdin ${ECR_REPOSITORY}
//                             """
//                         }
//                         // Push Docker image to ECR
//                         sh "docker push ${ECR_REPOSITORY}:${IMAGE_TAG}"
//                     }
//                 }
//             }
//         }
//         stage('Create ECR Secret') {
//             steps {
//                 container('docker') {
//                     withCredentials([aws(credentialsId: "${AWS_CREDENTIALS_ID}")]) {
//                         sh """
//                         aws ecr get-login-password --region \${AWS_REGION} | docker login --username AWS --password-stdin \${ECR_REPOSITORY}

//                         kubectl create secret generic ecr-secret --namespace=jenkins --from-file=.dockerconfigjson=\$HOME/.docker/config.json --dry-run=client -o json | kubectl apply -f -
//                         """
//                     }
//                 }
//             }
//         }
//         stage('Deploy to Kubernetes with Helm') {
//             when { expression { params.PUSH_TO_ECR == true } }
//             steps {
//                 container('helm') {
//                     sh """
//                     helm upgrade --install nodejs ./helm-chart \\
//                         --set image.repository=${ECR_REPOSITORY} \\
//                         --set image.tag=${IMAGE_TAG} \\
//                         -f ./helm-chart/values.yaml \\
//                         --namespace jenkins
//                     """
//                 }
//             }
//         }
//     }    
//     post {
//         always {
//             cleanWs()
//             mail to: 's.khitrovo@gmail.com',
//             subject: "Jenkins Build: ${currentBuild.result}",
//             body: "Job: ${env.JOB_NAME} \n Build Number: ${env.BUILD_NUMBER}"
//         }
//     }
// }