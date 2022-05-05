const shell = require("shelljs");
const inquirer = require('inquirer')

var questions = [
  {
    type: 'input',
    name: 'message',
    message: "请输入本次版本提交的内容"
  }
]

inquirer.prompt(questions).then(answers => {
  shell.exec('git add .')
  shell.exec(`git commit -m "${answers['message']}"`)
  shell.exec(`git pull`)
  shell.exec('git push')
})