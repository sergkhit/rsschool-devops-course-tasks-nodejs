pipeline {
    agent {
        kubernetes {
            label 'docker-build'
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              serviceAccountName: jenkins
              containers:
              - name: node
                image: timbru31/node-alpine-git
                command:
                - cat
                tty: true
                resources:
                    requests:
                        ephemeral-storage: "100Mi"
                    limits:
                        ephemeral-storage: "500Mi"                
              - name: docker
                image: docker:dind
                securityContext:
                  privileged: true
                resources:
                    requests:
                        ephemeral-storage: "1Gi"
                    limits:
                        ephemeral-storage: "2Gi"                   
              - name: helm
                image: alpine/helm:3.11.1  # Helm container
                command: ['cat']            
                tty: true       
                resources:
                    requests:
                        ephemeral-storage: "100Mi"
                    limits:
                        ephemeral-storage: "200Mi"             
            '''
            retries 2
        }
    }



    parameters {
        booleanParam(name: 'SHOULD_PUSH_TO_ECR', defaultValue: true, description: 'change on true for push Docker image to ECR')
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
        SONAR_ORGANIZATION = 'rstask6'
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_SCANNER_VERSION = '6.2.1.4610'
        SONAR_SCANNER_HOME = "$HOME/.sonar/sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64"
    }


    stages {

        stage('Checkout Dockerfile') {
            steps {
                git url: "${GITHUB_REPO}", branch: "${GITHUB_BRANCH}"
            }
         } 

        stage('Checkout Application Code') { 
            steps {
               git url: "${GIT_REPO}", branch: 'main'
            }
        }

        stage('Prepare Docker') {
            steps {
                container('docker') {
                    sh 'dockerd-entrypoint.sh &>/dev/null &' // Start Docker daemon
                    sh 'sleep 20'                            // Wait for Docker to initialize
                    sh 'apk update && apk add --no-cache aws-cli kubectl'  // Install necessary tools
                    sh 'aws --version'                       // Verify AWS CLI installation
                    sh 'docker --version'                    // Verify Docker installation
                    sh 'kubectl version --client'            // Verify kubectl installation
                }
            }
        }

        stage('Unit Tests') {  
            steps {
                git url: "${GITHUB_REPO}", branch: "${GITHUB_BRANCH}" // Checkout here as well
                container('docker') {
                    // sh "docker build -t rs-task6-builder -f Dockerfile --target builder ."  
                    // sh "docker run --rm rs-task6-builder go test -v ./..." 
                    sh "pwd"
                    sh "ls -lha"
                    sh "ls -lha /home/jenkins/agent/workspace/rs-task6/app"
                    // sh "docker build -t rs-task6-builder -f nodejs/Dockerfile --target builder nodejs"
                    sh "docker build -t rs-task6-builder -f Dockerfile --target builder ."
                    sh "docker run --rm rs-task6-builder npm test"
                }
            }
        }

        // stage('SonarQube Analysis') {
        //     steps {
        //         container('docker') {
        //             script {
        //                 // Ensure SonarQube Scanner is configured
        //                 def scannerHome = tool 'SonarQubeScanner'

        //                 // Run SonarQube analysis
        //                 withSonarQubeEnv('SonarQube') {
        //                     sh """
        //                       apk add --no-cache -q openjdk17
        //                       export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
        //                       export PATH=$JAVA_HOME/bin:$PATH
        //                       ls -l \$JAVA_HOME/bin
        //                       java -version
        //                       ${scannerHome}/bin/sonar-scanner \
        //                         -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
        //                         -Dsonar.sources=. \
        //                         -Dsonar.host.url=${SONAR_HOST_URL} \
        //                         -Dsonar.organization=${SONAR_ORGANIZATION} \
        //                         -Dsonar.login=${SONAR_TOKEN}
        //                     """
        //                 }
        //             }
        //         }
        //     }
        // }


        stage('Application Build and test run') {
            steps {
                container('docker') {
                    sh "docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} ."
                    sh 'docker images'
                    // sh 'apk add --no-cache curl'
                    // // Запуск контейнера в фоновом режиме (с флагом -d)
                    // script {
                    //     def containerId = sh(script: "docker run -d -p 3000:3000 ${ECR_REPOSITORY}:${IMAGE_TAG}", returnStdout: true).trim()
                    //     echo "Запущен контейнер с ID: ${containerId}"
                    //     sh 'sleep 10'  // Подождите пару секунд, чтобы приложение успело запуститься
                    //     sh 'curl http://localhost:3000'    // Запрос к приложению
                    //     sh "docker stop ${containerId}"    // Остановка и удаление контейнера
                    // }
                }
            }
        }


		stage('Push Image to ECR'){
		    steps {
		        script {
		            MANUAL_STEP_APPROVED = input(
                        message: 'Do you want to proceed with pushing to AWS ECR',
                        parameters: [booleanParam(defaultValue: false, description: '', name: 'Push to AWS ECR')]
                    )
                        container('docker') {
                            withCredentials([aws(credentialsId: "${AWS_CREDENTIALS_ID}")]) {
                                // Логин в ECR
                                sh """
                                aws ecr get-login-password --region ${AWS_REGION} | docker login -u AWS --password-stdin ${ECR_REPOSITORY}
                                """
                            }
                            // Push Docker image to ECR
                            sh "docker push ${ECR_REPOSITORY}:${IMAGE_TAG}"
                }
            }
        }
    }



        // stage('Push Docker Image to ECR') {
        //     steps {
        //         script {
        //             // Выводим текущее значение параметра
        //             echo "PUSH_TO_ECR Value: ${params.SHOULD_PUSH_TO_ECR}"

        //             if (params.SHOULD_PUSH_TO_ECR == true) {
        //                 // Проверка текущего состояния сборки
        //                 if (currentBuild.result != 'FAILURE') {
        //                     env.PUSH_SUCCESSFUL = true // Захватываем успешность
        //                 } else {
        //                     env.PUSH_SUCCESSFUL = false // Устанавливаем в false на неудаче
        //                 }

        //                 container('docker') {
        //                     withCredentials([aws(credentialsId: "${AWS_CREDENTIALS_ID}")]) {
        //                         // Логин в ECR
        //                         sh """
        //                         aws ecr get-login-password --region ${AWS_REGION} | docker login -u AWS --password-stdin ${ECR_REPOSITORY}
        //                         """
        //                     }
        //                     // Push Docker image to ECR
        //                     sh "docker push ${ECR_REPOSITORY}:${IMAGE_TAG}"
                            
        //                 }
        //             } else {
        //                 echo "Пуш в ECR пропущен, так как SHOULD_PUSH_TO_ECR установлено в false."
        //             }
        //         }
        //     }
        // }         

        stage('Create ECR Secret') {
            steps {
                container('docker') {
                    withCredentials([aws(credentialsId: "${AWS_CREDENTIALS_ID}")]) {
                        sh """
                        aws ecr get-login-password --region \${AWS_REGION} | docker login --username AWS --password-stdin \${ECR_REPOSITORY}

                        kubectl create secret generic ecr-secret --namespace=jenkins --from-file=.dockerconfigjson=\$HOME/.docker/config.json --dry-run=client -o json | kubectl apply -f -
                        """
                    }
                }
            }
        }




        stage('Deploy to Kubernetes with Helm') {
            steps {
                script {
		            MANUAL_STEP_APPROVED = input(
                        message: 'Do you want to proceed with pushing to AWS ECR',
                        parameters: [booleanParam(defaultValue: false, description: '', name: 'Push to AWS ECR')]
                    )
                container('helm') {
                    sh """
                    helm upgrade --install nodejs-app ./helm-chart \\
                        --set image.repository=${ECR_REPOSITORY} \\
                        --set image.tag=${IMAGE_TAG} \\
                        -f ./helm-chart/values.yaml \\
                        --namespace jenkins
                    """
                    sh 'apk add --no-cache curl'
                    sh 'sleep 20 && curl http://localhost:3000'
                    }
                }
            }
        }


        // stage('Deploy to Kubernetes with Helm') {
        //     when { expression { params.PUSH_TO_ECR == true } }
        //     steps {
        //         container('helm') {
        //             sh """
        //             helm upgrade --install nodejs-app ./helm-chart \\
        //                 --set image.repository=${ECR_REPOSITORY} \\
        //                 --set image.tag=${IMAGE_TAG} \\
        //                 -f ./helm-chart/values.yaml \\
        //                 --namespace jenkins
        //             """
        //         }
        //     }
        // }
        
        // post {
        // always {
        //     cleanWs()
        //     mail to: 's.khitrovo@gmail.com',
        //     subject: "Jenkins Build: ${currentBuild.result}",
        //     body: "Job: ${env.JOB_NAME} \n Build Number: ${env.BUILD_NUMBER}"
        // }
 
    }
}