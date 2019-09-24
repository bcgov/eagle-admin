This example demonstrates how to analyze a simple Java project with Gradle.

Prerequisites
=============
* [SonarQube](http://www.sonarqube.org/downloads/) 6.7+
* [Gradle](http://www.gradle.org/) 2.1 or higher

Usage
=====
* Analyze the project with SonarQube using Gradle:

        ../gradlew sonarqube -Dsonar.host.url=... -Dsonar.verbose=true --stacktrace --info

You can run this scan using the SonarQube server on OpenShift or by hosting your own SonarQube server locally.

For SonarQube setup instructions on OpenShift see: https://github.com/BCDevOps/sonarqube

Local Install
=============
To install SonarQube locally do the following:
* Download the version for your OS from [SonarQube](http://www.sonarqube.org/downloads/)
* Install locally following the directions
* Run server: http://localhost:9000
* Review your build.gradle, you need to add the following property: ```property "sonar.host.url", "http://localhost:9000"```
* run ./gradlew sonarqube from this directory
* Go to web browser and review result
