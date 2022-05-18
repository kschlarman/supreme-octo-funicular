const axios = require('axios')
const {exec} = require('child_process')
const fs = require('fs/promises')
const {resolve} = require('path')
const {stringify} = require('qs')
module.exports = {
  onError: ({inputs}) => {
    if (inputs.pastebinApiKey) {
      return new Promise((resolve, reject) => {
        exec('npm config get cache', (error, stdout) => {
          if (error) {
            reject(error)
          } else {
            resolve(stdout)
          }
        })
      }).then(npm => {
        const logPath = `${npm.toString().slice(0, -1)}/_logs`
        return fs.readdir(resolve(logPath)).then(logFiles => {
          const logFile = logFiles[logFiles.length - 1]
          return fs.readFile(resolve(`${logPath}/${logFile}`)).then(log => {
            return axios({
              data: stringify({
                api_dev_key: inputs.pastebinApiKey,
                api_paste_code: log.toString('utf-8'),
                api_paste_expire_date: '1D',
                api_paste_private: 1,
                api_paste_name: logFile,
                api_option: 'paste'
              }),
              method: 'post',
              url: 'https://pastebin.com/api/api_post.php'
            }).then(postResponse => {
              console.log(`Log file successfully posted: ${postResponse.data}`)
            }).catch(postError => {
              console.error(`An error occurred while posting to Pastebin: ${postError}`)
            })
          }).catch(fileReadError => {
            console.error(`An error occurred while trying to read the log file: ${fileReadError}`)
          })
        }).catch(dirReadError => {
          console.error(`An error occurred while trying to read the log directory: ${dirReadError}`)
        })
      }).catch(execError => {
        console.error(`An error occurred while executing the command: ${execError}`)
      })
    } else {
     console.error('Please provide the API Key required to post to Pastebin. You can obtain one from here: https://pastebin.com/doc_api#1')
    }
  }
}