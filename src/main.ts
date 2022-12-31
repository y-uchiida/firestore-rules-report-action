import * as core from '@actions/core'
import * as github from '@actions/github'
import axios from 'axios'
import fs from 'fs'
import {CoverageReport} from './CoverageReport'

/**
 * Validate given argument string to be matched url pattern
 * @param url string to be validated
 * @returns return true if valid URL string, if not false
 */
const isValidUrl = (url: string): boolean => {
  const pattern = /^(http|https):\/\/[\w/:%#\\$&\\?\\(\\)~\\.=\\+\\-]+$/
  return pattern.test(url)
}

async function run(): Promise<void> {
  try {
    const reportUrl: string = core.getInput('report-url')
    core.setOutput('url', reportUrl)

    let data: CoverageReport
    if (isValidUrl(reportUrl)) {
      const result = await axios.get(reportUrl)
      data = result.data
    } else {
      const raw = await fs.promises.readFile(reportUrl, 'utf-8')
      data = JSON.parse(raw)
    }

    const output = []
    for (const report of data.report) {
      if (!('values' in report)) {
        const lineNumber = report.sourcePosition.line
        output.push({
          number: lineNumber,
          line: data.rules.files[0].content.split('\n')[lineNumber - 1]
        })
      }
    }
    const content = output
      .sort((a, b) => (a.number > b.number ? 1 : -1))
      .map(a => `${a.number} ${a.line}`)
      .join('\n')
    const comment =
      output.length > 0
        ? `:scream: Lack of test rule lines!\n\`\`\`\n${content}\n\`\`\``
        : ':tada: Security rule test is covered!'
    await fs.promises.writeFile(
      `${process.env.GITHUB_WORKSPACE}/pr_comment_body.txt`,
      `Firestore rules coverage report!\n${comment}`,
      'utf-8'
    )
  } catch (error) {
    core.setFailed(error as Error)
    core.setFailed(JSON.stringify(github.context, null, ' '))
    core.setFailed(core.getInput('report-url'))
  }
}

run()
