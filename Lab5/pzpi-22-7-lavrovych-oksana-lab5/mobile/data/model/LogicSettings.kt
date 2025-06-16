package com.example.safezonetracker.data.model

data class LogicSettings(
    val weights: Weights,
    val thresholds: Thresholds
)

data class Weights(
    val temperature: Float,
    val gas: Float,
    val smoke: Float,
    val humidity: Float
)

data class Thresholds(
    val fireTemp: Float,
    val gasLeakPpm: Float,
    val overheatingTemp: Float
)