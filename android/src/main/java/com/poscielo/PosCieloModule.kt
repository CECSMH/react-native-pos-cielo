package com.poscielo

import com.facebook.react.bridge.ReactApplicationContext

class PosCieloModule(reactContext: ReactApplicationContext) :
  NativePosCieloSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativePosCieloSpec.NAME
  }
}
