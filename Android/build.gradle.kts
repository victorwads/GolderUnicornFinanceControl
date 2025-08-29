// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    val detektVersion = "1.23.1"

    dependencies {
        classpath("com.google.gms:google-services:4.4.0")
        classpath("com.google.firebase:perf-plugin:1.4.2")
        classpath("io.gitlab.arturbosch.detekt:detekt-gradle-plugin:$detektVersion")
    }
}

plugins {
    id("com.android.application") version "8.2.1" apply false
    id("org.jetbrains.kotlin.android") version "1.9.0" apply false
    id("com.google.gms.google-services") version "4.4.0" apply false
    id("com.google.firebase.crashlytics") version "2.9.9" apply false
}

