'use strict'

const fs = require('fs')
const path = require('path')

const mustache = require('mustache')

function CordovaConfigPlugin(options) {
  const o = {
    title: '',
    author: {
      name: '',
      email: '',
      url: ''
    },
    source: 'index.html',
  }

  const templatePath = options.template || path.join(__dirname, 'default-config.xml')

  this.destPath = options.path
  this.options = Object.assign(o, options)
  this.template = fs.readFileSync(templatePath, 'UTF-8')
}

CordovaConfigPlugin.prototype.apply = function (compiler) {
  compiler.plugin('emit', (compilation, cb) => {
    const buildFor = Object.keys(compilation.options.entry).filter((e) => e.indexOf(this.destPath) > -1)
    buildFor.forEach((configPath) => {
      let destFile = path.join(compilation.compiler.outputPath, configPath.split('/')[0], 'config.xml')

      fs.access(destFile, fs.constants.F_OK, (err) => {
        if (!err) {
          console.log(`webpack-cordova-config-plugin: ${destFile} already exists, skipping`)
          return cb(err)
        }

        console.log(`webpack-cordova-config-plugin: Generating Cordova ${destFile}`)
        destFile = path.relative(compilation.compiler.outputPath, destFile)

        const config = mustache.render(this.template, this.options)
        compilation.assets[destFile] =  {
          source: () => config,
          size: () => config.length
        }

        cb()
      })
    })
  })
}

module.exports = CordovaConfigPlugin
