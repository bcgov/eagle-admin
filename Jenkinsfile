def sonarqubePodLabel = "eagle-admin-${UUID.randomUUID().toString()}"
// podTemplate(label: sonarqubePodLabel, name: sonarqubePodLabel, serviceAccount: 'jenkins', cloud: 'openshift', containers: [])
def zapPodLabel = "esm-admin-owasp-zap-${UUID.randomUUID().toString()}"
// podTemplate(label: zapPodLabel, name: zapPodLabel, serviceAccount: 'jenkins', cloud: 'openshift', containers: [])

@NonCPS
import groovy.json.JsonOutput
/*
 * Sends a rocket chat notification
 */
def notifyRocketChat(text, url) {
    def rocketChatURL = url
    def payload = JsonOutput.toJson([
      "username":"Jenkins",
      "icon_url":"https://wiki.jenkins.io/download/attachments/2916393/headshot.png",
      "text": text
    ])

    sh("curl -X POST -H 'Content-Type: application/json' --data \'${payload}\' ${rocketChatURL}")
}

/*
 * Updates the global pastBuilds array: it will iterate recursively
 * and add all the builds prior to the current one that had a result
 * different than 'SUCCESS'.
 */
def buildsSinceLastSuccess(previousBuild, build) {
  if ((build != null) && (build.result != 'SUCCESS')) {
    pastBuilds.add(build)
    buildsSinceLastSuccess(pastBuilds, build.getPreviousBuild())
  }
}

/*
 * Generates a string containing all the commit messages from
 * the builds in pastBuilds.
 */
@NonCPS
def getChangeLog(pastBuilds) {
  def log = ""
  for (int x = 0; x < pastBuilds.size(); x++) {
    for (int i = 0; i < pastBuilds[x].changeSets.size(); i++) {
      def entries = pastBuilds[x].changeSets[i].items
      for (int j = 0; j < entries.length; j++) {
        def entry = entries[j]
        log += "* ${entry.msg} by ${entry.author} \n"
      }
    }
  }
  return log;
}

def nodejsLinter () {
  openshift.withCluster() {
    openshift.withProject() {
      podTemplate(label: 'node-linter', name: 'node-linter', serviceAccount: 'jenkins', cloud: 'openshift', containers: [
        containerTemplate(
          name: 'jnlp',
          image: 'registry.access.redhat.com/openshift3/jenkins-agent-nodejs-8-rhel7',
          resourceRequestCpu: '500m',
          resourceLimitCpu: '800m',
          resourceRequestMemory: '2Gi',
          resourceLimitMemory: '4Gi',
          activeDeadlineSeconds: '1200',
          workingDir: '/tmp',
          command: '',
          args: '${computer.jnlpmac} ${computer.name}',
        )
      ]) {
        node("node-linter") {
          checkout scm
          try {
            // install deps to get angular-cli
            sh '''
              cp lint-package.json package.json
              npm install
              npm run lint
            '''
          } finally {
            echo "Linting Passed"
          }
        }
      }
      return true
    }
  }
}

def nodejsTester () {
  openshift.withCluster() {
    openshift.withProject() {
      podTemplate(label: 'node-tester', name: 'node-tester', serviceAccount: 'jenkins', cloud: 'openshift', containers: [
        containerTemplate(
          name: 'jnlp',
          image: 'registry.access.redhat.com/openshift3/jenkins-agent-nodejs-8-rhel7',
          resourceRequestCpu: '500m',
          resourceLimitCpu: '800m',
          resourceRequestMemory: '2Gi',
          resourceLimitMemory: '4Gi',
          workingDir: '/tmp',
          command: '',
        )
      ]) {
        node("node-tester") {
          checkout scm
          try {
            sh 'npm run tests'
          } finally {
            echo "Unit Tests Passed"
          }
        }
      }
      return true
    }
  }
}

def CHANGELOG = "No new changes"
def IMAGE_HASH = "latest"

pipeline {
  agent any
  options {
    disableResume()
  }
  stages {
    stage('Parallel Build Steps') {
      failFast true
      parallel {
        stage('Build') {
          agent any
          steps {
            script {
              pastBuilds = []
              buildsSinceLastSuccess(pastBuilds, currentBuild);
              CHANGELOG = getChangeLog(pastBuilds);

              echo ">>>>>>Changelog: \n ${CHANGELOG}"

              try {
                sh("oc extract secret/rocket-chat-secrets --to=${env.WORKSPACE} --confirm")
                ROCKET_DEPLOY_WEBHOOK = sh(returnStdout: true, script: 'cat rocket-deploy-webhook')
                ROCKET_QA_WEBHOOK = sh(returnStdout: true, script: 'cat rocket-qa-webhook')

                echo "Building eagle-admin develop branch"
                openshiftBuild bldCfg: 'eagle-admin-angular', showBuildLogs: 'true'
                openshiftBuild bldCfg: 'eagle-admin-build', showBuildLogs: 'true'
                echo "Build done"

                echo ">>> Get Image Hash"
                // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                // Tag the images for deployment based on the image's hash
                IMAGE_HASH = sh (
                  script: """oc get istag eagle-admin:latest -o template --template=\"{{.image.dockerImageReference}}\"|awk -F \":\" \'{print \$3}\'""",
                  returnStdout: true).trim()
                echo ">> IMAGE_HASH: ${IMAGE_HASH}"
              } catch (error) {
                notifyRocketChat(
                  "@all The latest build of eagle-admin seems to be broken. \n Error: \n ${error}",
                  ROCKET_QA_WEBHOOK
                )
                throw error
              }
            }
          }
        }

        stage('Linting') {
          steps {
            script {
              echo "Running linter"
              def results = nodejsLinter()
            }
          }
        }

        // stage('Unit Tests') {
        //   steps {
        //     script {
        //       echo "Running unit tests"
        //       def results = nodejsTester()
        //     }
        //   }
        // }

        // stage('exeucte sonar') {
        //   agent { label 'sonarqubePodLabel' }
        //   environment {
        //     // set to whatever the secret name is
        //     SONARQUBE_URL = credentials('url')
        //   }
        //   steps {
        //     checkout scm
        //     dir('sonar-runner') {
        //       try {
        //         // todo update url
        //         sh './gradlew sonarqube -Dsonar.host.url=${SONARQUBE_URL} -Dsonar.verbose=true --stacktrace --info'
        //       } finally {
        //         echo "Scan complete"
        //       }
        //     }
        //   }
        // }
      }
    }

    stage('Deploy to dev'){
      steps {
        script {
          try {
            echo "Deploying to dev..."
            openshiftTag destStream: 'eagle-admin', verbose: 'false', destTag: 'dev', srcStream: 'eagle-admin', srcTag: "${IMAGE_HASH}"
            sleep 5

            openshiftVerifyDeployment depCfg: 'eagle-admin', namespace: 'esm-dev', replicaCount: 1, verbose: 'false', verifyReplicaCount: 'false', waitTime: 600000
            echo ">>>> Deployment Complete"

            notifyRocketChat(
              "@all A new version of eagle-admin is now in Dev. \n Changes: \n ${CHANGELOG}",
              ROCKET_DEPLOY_WEBHOOK
            )

            notifyRocketChat(
              "@all A new version of eagle-admin is now in Dev and ready for QA. \n Changes to Dev: \n ${CHANGELOG}",
              ROCKET_QA_WEBHOOK
            )
          } catch (error) {
            notifyRocketChat(
              "@all The latest deployment of eagle-admin to Dev seems to have failed\n'${error.message}'",
              ROCKET_DEPLOY_WEBHOOK
            )
            currentBuild.result = "FAILURE"
            throw new Exception("Deploy failed")
          }
        }
      }
    }

    // stage('ZAP Security Scan') {
    //   agent{ label: zapPodLabel }
    //   steps {
    //     //the checkout is mandatory
    //     echo "checking out source"
    //     echo "Build: ${BUILD_ID}"
    //     checkout scm
    //     dir('zap') {
    //       def retVal = sh returnStatus: true, script: './runzap.sh'
    //       publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true, reportDir: '/zap/wrk', reportFiles: 'index.html', reportName: 'ZAP Full Scan', reportTitles: 'ZAP Full Scan'])
    //       echo "Return value is: ${retVal}"
    //     }
    //   }
    // }

    // stage('BDD Tests') {
    //   agent { label: bddPodLabel }
    //   steps{
    //     echo "checking out source"
    //     echo "Build: ${BUILD_ID}"
    //     checkout scm
    //     // todo determine how to call improved BDD Stack
    //   }
    // }
  }
}
