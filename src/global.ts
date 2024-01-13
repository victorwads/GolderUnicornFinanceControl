import React from "react"

declare global {
  interface Number {
    localeCompare(other: number): -1 | 0 | 1;
  }
  interface String {
    prepareCompare(): string
  }
}

Number.prototype.localeCompare = function(this: number, other: number): -1 | 0 | 1 {
  if (this < other) {
      return -1
  } else if (this > other) {
      return 1
  } else {
      return 0
  }
};

String.prototype.prepareCompare = function() {
  return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase()
}