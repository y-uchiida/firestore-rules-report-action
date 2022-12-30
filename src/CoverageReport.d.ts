/* minimum type declaration for firestore security rules test coverage report */
export type CoverageReport = {
  rules: {
    files: {
      content: string
    }[]
  }
  report: {
    sourcePosition: {
      line: number
      values: {
        value: Object
      }[]
    }
  }[]
}
