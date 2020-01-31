import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import java.util.regex.Pattern

@NonCPS
String getUrlFromRoute(String routeName, String projectNameSpace = '') {

  def nameSpaceFlag = ''
  if(projectNameSpace?.trim()) {
    nameSpaceFlag = "-n ${projectNameSpace}"
  }

  def url = sh (
    script: "oc get routes ${nameSpaceFlag} -o wide --no-headers | awk \'/${routeName}/{ print match(\$0,/edge/) ?  \"https://\"\$2 : \"http://\"\$2 }\'",
    returnStdout: true
  ).trim()

  return url
}

/*
 * Sends a rocket chat notification
 */
def notifyRocketChat(text, url) {
    def rocketChatURL = url
    def message = text.replaceAll(~/\'/, "")
    def payload = JsonOutput.toJson([
      "username":"Jenkins",
      "icon_url":"https://wiki.jenkins.io/download/attachments/2916393/headshot.png",
      "text": message
    ])

    sh("curl -X POST -H 'Content-Type: application/json' --data \'${payload}\' ${rocketChatURL}")
}


/*
 * takes in a sonarqube status json payload
 * and returns the status string
 */
def sonarGetStatus (jsonPayload) {
  def jsonSlurper = new JsonSlurper()
  return jsonSlurper.parseText(jsonPayload).projectStatus.status
}

/*
 * takes in a sonarqube status json payload
 * and returns the date string
 */
def sonarGetDate (jsonPayload) {
  def jsonSlurper = new JsonSlurper()
  return jsonSlurper.parseText(jsonPayload).projectStatus.periods[0].date
}

boolean imageTaggingComplete ( String sourceTag, String destinationTag, String action, def iterations = 6 ) {
  def sourceImageName = sh returnStdout: true, script: "oc describe istag/eagle-admin:${sourceTag} | head -n 1".trim()
  def destinationImageName = sh returnStdout: true, script: "oc describe istag/eagle-admin:${destinationTag} | head -n 1".trim()
  int delay = 0

  for (int i=0; i<iterations; i++){
    echo "waiting to ${action}, iterator is: ${i}, the max iterator is: ${iterations} \n ${sourceTag}: ${sourceImageName} ${destinationTag}: ${destinationImageName}"

    if(sourceImageName == destinationImageName){
      echo "${action} complete"
      return true
    } else {
      delay = (1<<i) // exponential backoff
      sleep(delay)
      destinationImageName = sh returnStdout: true, script: "oc describe istag/eagle-admin:${destinationTag} | head -n 1".trim()
    }
  }
  return false
}

boolean sonarqubeReportComplete ( String oldDate, String sonarqubeStatusUrl, def iterations = 6 ) {
  def oldSonarqubeReportDate = oldDate
  def newSonarqubeReportDate = sonarGetDate ( sh ( returnStdout: true, script: "curl -w '%{http_code}' '${sonarqubeStatusUrl}'" ) )
  int delay = 0

  for (int i=0; i<iterations; i++) {
    echo "waiting for sonarqube report, iterator is: ${i}, max iterator is: ${iterations} \n Old Date: ${oldSonarqubeReportDate} \n New Date: ${newSonarqubeReportDate}"
    if (oldSonarqubeReportDate != newSonarqubeReportDate) {
      echo "sonarqube report complete"
      return true
    } else {
      delay = (1<<i) // exponential backoff
      sleep(delay)
      newSonarqubeReportDate = sonarGetDate ( sh ( returnStdout: true, script: "curl -w '%{http_code}' '${sonarqubeStatusUrl}'" ) )
    }
  }
  return false
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

def nodejsTester () {
  openshift.withCluster() {
    openshift.withProject() {
      podTemplate(
        label: 'node-tester',
        name: 'node-tester',
        serviceAccount: 'jenkins',
        cloud: 'openshift',
        slaveConnectTimeout: 300,
        containers: [
          containerTemplate(
            name: 'jnlp',
            image: 'registry.access.redhat.com/openshift3/jenkins-agent-nodejs-8-rhel7:v3.11.161',
            resourceRequestCpu: '500m',
            resourceLimitCpu: '800m',
            resourceRequestMemory: '2Gi',
            resourceLimitMemory: '4Gi',
            workingDir: '/tmp',
            command: '',
          )
        ]
      ) {
        // node("node-tester") {
        //   checkout scm
        //   try {
        //     sh 'npm i'
        //     sh 'npm run tests-ci'
        //   } finally {
        //     echo "Unit Tests Passed"
        //   }
        // }
      }
      return true
    }
  }
}

def nodejsLinter () {
  openshift.withCluster() {
    openshift.withProject() {
      podTemplate(
        label: 'node-linter',
        name: 'node-linter',
        serviceAccount: 'jenkins',
        cloud: 'openshift',
        slaveConnectTimeout: 300,
        containers: [
          containerTemplate(
            name: 'jnlp',
            image: 'registry.access.redhat.com/openshift3/jenkins-agent-nodejs-8-rhel7:v3.11.161',
            resourceRequestCpu: '500m',
            resourceLimitCpu: '800m',
            resourceRequestMemory: '2Gi',
            resourceLimitMemory: '4Gi',
            activeDeadlineSeconds: '1200',
            workingDir: '/tmp',
            command: '',
            args: '${computer.jnlpmac} ${computer.name}',
          )
        ]
      ) {
        node("node-linter") {
          checkout scm
          try {
            // install deps to get angular-cli
            sh '''
              npm install @angular/compiler @angular/core @angular/cli @angular-devkit/build-angular codelyzer rxjs tslint
              npm run lint
            '''
          } finally {
            echo "Linting Done"
          }
        }
      }
      return true
    }
  }
}

// todo templates can be pulled from a repository, instead of declared here
def nodejsSonarqube () {
  openshift.withCluster() {
    openshift.withProject() {
      podTemplate(
        label: 'node-sonarqube',
        name: 'node-sonarqube',
        serviceAccount: 'jenkins',
        cloud: 'openshift',
        slaveConnectTimeout: 300,
        containers: [
          containerTemplate(
            name: 'jnlp',
            image: 'registry.access.redhat.com/openshift3/jenkins-agent-nodejs-8-rhel7:v3.11.161',
            resourceRequestCpu: '500m',
            resourceLimitCpu: '1000m',
            resourceRequestMemory: '2Gi',
            resourceLimitMemory: '4Gi',
            workingDir: '/tmp',
            command: '',
            args: '${computer.jnlpmac} ${computer.name}',
          )
        ]
      ) {
        node("node-sonarqube") {
          checkout scm
          dir('sonar-runner') {
            try {
              // get sonarqube url
              def SONARQUBE_URL = getUrlFromRoute('sonarqube').trim()
              echo "${SONARQUBE_URL}"

              // sonarqube report link
              def SONARQUBE_STATUS_URL = "${SONARQUBE_URL}/api/qualitygates/project_status?projectKey=org.sonarqube:eagle-admin"

              boolean firstScan = false;

              def OLD_SONAR_DATE

              try {
                // get old sonar report date
                def OLD_SONAR_DATE_JSON = sh(returnStdout: true, script: "curl -w '%{http_code}' '${SONARQUBE_STATUS_URL}'")
                OLD_SONAR_DATE = sonarGetDate (OLD_SONAR_DATE_JSON)
              } catch (error) {
                firstScan = true
              }

              // run scan
              sh "npm install typescript"
              sh returnStdout: true, script: "./gradlew sonarqube -Dsonar.host.url=${SONARQUBE_URL} -Dsonar. -Dsonar.verbose=true --stacktrace --info"

              if ( !firstScan ) {
                // wiat for report to be updated
                if ( !sonarqubeReportComplete ( OLD_SONAR_DATE, SONARQUBE_STATUS_URL ) ) {
                  echo "sonarqube report failed to complete, or timed out"

                  notifyRocketChat(
                    "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n sonarqube report failed to complete, or timed out : ${SONARQUBE_URL}",
                    ROCKET_DEPLOY_WEBHOOK
                  )

                  currentBuild.result = "FAILURE"
                  exit 1
                }
              } else {
                sleep (30)
              }

              // check if sonarqube passed
              sh("oc extract secret/sonarqube-status-urls --to=${env.WORKSPACE}/sonar-runner --confirm")

              SONARQUBE_STATUS_JSON = sh(returnStdout: true, script: "curl -w '%{http_code}' '${SONARQUBE_STATUS_URL}'")
              SONARQUBE_STATUS = sonarGetStatus (SONARQUBE_STATUS_JSON)

              if ( "${SONARQUBE_STATUS}" == "ERROR") {
                echo "Scan Failed"

                notifyRocketChat(
                  "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n Sonarqube scan failed: : ${SONARQUBE_URL}",
                  ROCKET_DEPLOY_WEBHOOK
                )

                echo "Sonarqube Scan Failed"
                currentBuild.result = 'FAILURE'
                exit 1
              } else {
                echo "Sonarqube Scan Passed"
              }

            } catch (error) {
              notifyRocketChat(
                "@all The latest build of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n ${error.message}",
                ROCKET_DEPLOY_WEBHOOK
              )
              throw error
            } finally {
              echo "Sonarqube Scan Complete"
            }
          }
        }
      }
      return true
    }
  }
}

def zapScanner () {
  openshift.withCluster() {
    openshift.withProject() {
      // The jenkins-slave-zap image has been purpose built for supporting ZAP scanning.
      podTemplate(
        label: 'owasp-zap',
        name: 'owasp-zap',
        serviceAccount: 'jenkins',
        cloud: 'openshift',
        slaveConnectTimeout: 300,
        containers: [
          containerTemplate(
            name: 'jnlp',
            image: '172.50.0.2:5000/bcgov/jenkins-slave-zap:stable',
            resourceRequestCpu: '500m',
            resourceLimitCpu: '1500m',
            resourceRequestMemory: '3Gi',
            resourceLimitMemory: '4Gi',
            workingDir: '/home/jenkins',
            command: '',
            args: '${computer.jnlpmac} ${computer.name}'
          )
        ]
      ){
        node('owasp-zap') {
          // The name  of the ZAP report
          def ZAP_REPORT_NAME = "zap-report.xml"

          // The location of the ZAP reports
          def ZAP_REPORT_PATH = "/zap/wrk/${ZAP_REPORT_NAME}"

          // The name of the "stash" containing the ZAP report
          def ZAP_REPORT_STASH = "zap-report"

          // Dynamicaly determine the target URL for the ZAP scan ...
          def TARGET_URL = getUrlFromRoute('eagle-admin', 'esm-dev').trim()

          echo "Target URL: ${TARGET_URL}"

          dir('zap') {
            try {
              // The ZAP scripts are installed on the root of the jenkins-slave-zap image.
              // When running ZAP from there the reports will be created in /zap/wrk/ by default.
              // ZAP has problems with creating the reports directly in the Jenkins
              // working directory, so they have to be copied over after the fact.
              def retVal = sh (
                returnStatus: true,
                script: "/zap/zap-baseline.py -x ${ZAP_REPORT_NAME} -t ${TARGET_URL}"
              )
              echo "Return value is: ${retVal}"

              // Copy the ZAP report into the Jenkins working directory so the Jenkins tools can access it.
              sh (
                returnStdout: true,
                script: "mkdir -p ./wrk/ && cp /zap/wrk/${ZAP_REPORT_NAME} ./wrk/"
              )
            } catch (error) {
              // revert dev from backup
              echo "Reverting dev image form backup..."
              openshiftTag destStream: 'eagle-admin', verbose: 'false', destTag: 'dev', srcStream: 'eagle-admin', srcTag: 'dev-backup'

              // wait for revert to complete
              if(!imageTaggingComplete ('dev-backup', 'dev', 'revert')) {
                echo "Failed to revert dev image after Zap scan failed, please revert the dev image manually from dev-backup"

                notifyRocketChat(
                  "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n Zap scan failed: ${SONARQUBE_URL} \n Automatic revert of the deployment also failed, please revert the dev image manually from dev-backup",
                  ROCKET_DEPLOY_WEBHOOK
                )

                currentBuild.result = "FAILURE"
                exit 1
              }

              notifyRocketChat(
                "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n Zap scan failed: ${SONARQUBE_URL} \n dev mage was reverted",
                ROCKET_DEPLOY_WEBHOOK
              )

              currentBuild.result = "FAILURE"
              exit 1
            }
          }
          // Stash the ZAP report for publishing in a different stage (which will run on a different pod).
          echo "Stash the report for the publishing stage ..."
          stash name: "${ZAP_REPORT_STASH}", includes: "zap/wrk/*.xml"
        }
      }
    }
  }
}

def postZapToSonar () {
  openshift.withCluster() {
    openshift.withProject() {
      // The jenkins-python3nodejs template has been purpose built for supporting SonarQube scanning.
      podTemplate(
        label: 'jenkins-python3nodejs',
        name: 'jenkins-python3nodejs',
        serviceAccount: 'jenkins',
        cloud: 'openshift',
        slaveConnectTimeout: 300,
        containers: [
          containerTemplate(
            name: 'jnlp',
            image: '172.50.0.2:5000/openshift/jenkins-slave-python3nodejs',
            resourceRequestCpu: '1000m',
            resourceLimitCpu: '2000m',
            resourceRequestMemory: '2Gi',
            resourceLimitMemory: '4Gi',
            workingDir: '/tmp',
            command: '',
            args: '${computer.jnlpmac} ${computer.name}'
          )
        ]
      ){
        node('jenkins-python3nodejs') {
          // The name  of the ZAP report
          def ZAP_REPORT_NAME = "zap-report.xml"

          // The location of the ZAP reports
          def ZAP_REPORT_PATH = "/zap/wrk/${ZAP_REPORT_NAME}"

          // The name of the "stash" containing the ZAP report
          def ZAP_REPORT_STASH = "zap-report"

          // get sonarqube url
          def SONARQUBE_URL = getUrlFromRoute('sonarqube').trim()

          // url for the sonarqube report
          def SONARQUBE_STATUS_URL = "${SONARQUBE_URL}/api/qualitygates/project_status?projectKey=org.sonarqube:eagle-admin-zap-scan"

          boolean firstScan = false

          def OLD_ZAP_DATE

          try {
            // get old sonar report date
            def OLD_ZAP_DATE_JSON = sh(returnStdout: true, script: "curl -w '%{http_code}' '${SONARQUBE_STATUS_URL}'")
            OLD_ZAP_DATE = sonarGetDate (OLD_ZAP_DATE_JSON)
          } catch (error) {
            firstScan = true
          }

          echo "Checking out the sonar-runner folder ..."
          checkout scm

          echo "Preparing the report for the publishing ..."
          unstash name: "${ZAP_REPORT_STASH}"

          echo "Publishing the report ..."
          dir('sonar-runner') {
            sh (
              // 'sonar.zaproxy.reportPath' must be set to the absolute path of the xml formatted ZAP report.
              // Exclude the report from being scanned as an xml file.  We only care about the results of the ZAP scan.
              returnStdout: true,
              script: "./gradlew sonarqube --stacktrace --info \
                -Dsonar.verbose=true \
                -Dsonar.host.url=${SONARQUBE_URL} \
                -Dsonar.projectName='eagle-admin-zap-scan'\
                -Dsonar.projectKey='org.sonarqube:eagle-admin-zap-scan' \
                -Dsonar.projectBaseDir='../' \
                -Dsonar.sources='./src/app' \
                -Dsonar.zaproxy.reportPath=${WORKSPACE}${ZAP_REPORT_PATH} \
                -Dsonar.exclusions=**/*.xml"
            )

            if ( !firstScan ) {
              // wiat for report to be updated
              if(!sonarqubeReportComplete ( OLD_ZAP_DATE, SONARQUBE_STATUS_URL)) {
                echo "Zap report failed to complete, or timed out"

                notifyRocketChat(
                  "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n sonarqube report failed to complete, or timed out : ${SONARQUBE_URL}",
                  ROCKET_DEPLOY_WEBHOOK
                )

                currentBuild.result = "FAILURE"
                exit 1
              }
            } else {
              sleep(30)
            }

            // check if zap passed
            ZAP_STATUS_JSON = sh(returnStdout: true, script: "curl -w '%{http_code}' '${SONARQUBE_STATUS_URL}'")
            ZAP_STATUS = sonarGetStatus (ZAP_STATUS_JSON)

            if ( "${ZAP_STATUS}" == "ERROR" ) {
              echo "ZAP scan failed"

              // revert dev from backup
              echo "Reverting dev image form backup..."
              openshiftTag destStream: 'eagle-admin', verbose: 'false', destTag: 'dev', srcStream: 'eagle-admin', srcTag: 'dev-backup'

              // wait for revert to complete
              if(!imageTaggingComplete ('dev-backup', 'dev', 'revert')) {
                echo "Failed to revert dev image after Zap scan failed, please revert the dev image manually from dev-backup"

                notifyRocketChat(
                  "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n Zap scan failed: ${SONARQUBE_URL} \n Automatic revert of the deployment also failed, please revert the dev image manually from dev-backup",
                  ROCKET_DEPLOY_WEBHOOK
                )

                currentBuild.result = "FAILURE"
                exit 1
              }

              notifyRocketChat(
                "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n Zap scan failed: ${SONARQUBE_URL} \n dev image has been reverted",
                ROCKET_DEPLOY_WEBHOOK
              )

              echo "Zap scan Failed"
              echo "Reverted dev deployment from backup"
              currentBuild.result = 'FAILURE'
              exit 1
            } else {
              echo "ZAP Scan Passed"
            }
          }
        }
      }
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
                  "@all The build ${env.BUILD_DISPLAY_NAME} of eagle-admin, seems to be broken.\n ${env.BUILD_URL}\n Error: \n ${error.message}",
                  ROCKET_QA_WEBHOOK
                )
                throw error
              }
            }
          }
        }

         stage('Unit Tests') {
          steps {
            script {
              echo "Running unit tests"
              def results = nodejsTester()
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

        stage('Sonarqube') {
          steps {
            script {
              echo "Running Sonarqube"
              def result = nodejsSonarqube()
            }
          }
        }
      }
    }

    stage('Deploy to dev'){
      steps {
        script {
          try {
            // backup
            echo "Backing up dev image..."
            openshiftTag destStream: 'eagle-admin', verbose: 'false', destTag: 'dev-backup', srcStream: 'eagle-admin', srcTag: 'dev'

            // wait for backup to complete
            if( !imageTaggingComplete ('dev', 'dev-backup', 'backup')) {
              echo "Dev image backup failed"

              notifyRocketChat(
                "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n Dev image backup failed",
                ROCKET_DEPLOY_WEBHOOK
              )

              currentBuild.result = "FAILURE"
              exit 1
            }

            // deploy
            echo "Deploying to dev..."
            openshiftTag destStream: 'eagle-admin', verbose: 'false', destTag: 'dev', srcStream: 'eagle-admin', srcTag: "${IMAGE_HASH}"

            // wait for deployment to complete
            if ( CHANGELOG && CHANGELOG != "No new changes" && !imageTaggingComplete ('latest', 'dev', 'deploy')) {
              echo "Dev image deployment failed"

              notifyRocketChat(
                "@all The latest build, ${env.BUILD_DISPLAY_NAME} of eagle-admin seems to be broken. \n ${env.BUILD_URL}\n Error: \n Dev image deployment failed",
                ROCKET_DEPLOY_WEBHOOK
              )

              currentBuild.result = "FAILURE"
              exit 1
            } else {
              sleep (5)
            }

            openshiftVerifyDeployment depCfg: 'eagle-admin', namespace: 'esm-dev', replicaCount: 1, verbose: 'false', verifyReplicaCount: 'false', waitTime: 600000
            echo ">>>> Deployment Complete"

          } catch (error) {
            notifyRocketChat(
              "@all The build ${env.BUILD_DISPLAY_NAME} of eagle-admin, seems to be broken.\n ${env.BUILD_URL}\n Error: ${error.message}",
              ROCKET_DEPLOY_WEBHOOK
            )
            currentBuild.result = "FAILURE"
            throw new Exception("Deploy failed")
          }
        }
      }
    }

    stage('Zap') {
      steps {
        script {
          echo "Running Zap Scan"
          def result = zapScanner()
        }
      }
    }


    stage('Zap to Sonarqube') {
      steps {
        script {
          echo "Posting Zap Scan to Sonarqube Report"
          def result = postZapToSonar()
        }
      }
    }


    // stage('BDD Tests') {
    //   agent { label: bddPodLabel }
    //   steps{
    //     echo "checking out source"
    //     echo "Build: ${BUILD_ID}"
    //     checkout scm
    //     // todo determine how to call improved BDD Stack
    //   }
    // }

    stage('Success Notifications') {
      steps {
        script {
          notifyRocketChat(
            "A new version of eagle-admin is now in Dev, build ${env.BUILD_DISPLAY_NAME} \n Changes: \n ${CHANGELOG}",
            ROCKET_DEPLOY_WEBHOOK
          )

          notifyRocketChat(
            "@all A new version of eagle-admin is now in Dev and ready for QA. \n Changes to Dev: \n ${CHANGELOG}",
            ROCKET_QA_WEBHOOK
          )
        }
      }
    }
  }
}
