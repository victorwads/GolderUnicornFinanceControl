/* eslint-disable no-extend-native */
declare global {
  interface Number {
    localeCompare(other: number): -1 | 0 | 1;
  }
  interface String {
    prepareCompare(): string
  }
  interface Date {
    localCompare(other: Date): -1 | 0 | 1;
  }
}

Number.prototype.localeCompare = function (this: number, other: number): -1 | 0 | 1 {
  if (this < other) {
    return -1
  } else if (this > other) {
    return 1
  } else {
    return 0
  }
};

String.prototype.prepareCompare = function () {
  return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase()
}

Date.prototype.localCompare = function (this: Date, other: Date): -1 | 0 | 1 {
  const thisTime = this.getTime()
  const otherTime = other.getTime()
  if (thisTime < otherTime) {
    return -1
  } else if (thisTime > otherTime) {
    return 1
  } else {
    return 0
  }
}

export {}