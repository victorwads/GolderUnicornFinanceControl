// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    val detektVersion = "1.23.1"

    dependencies {
        classpath("com.google.gms:google-services:4.4.3")
        classpath("com.google.firebase:perf-plugin:2.0.1")
        classpath("io.gitlab.arturbosch.detekt:detekt-gradle-plugin:$detektVersion")
    }
}

plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.1.0" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.0" apply false
    id("com.google.gms.google-services") version "4.4.3" apply false
    id("com.google.firebase.crashlytics") version "3.0.6" apply false
}
