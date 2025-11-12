import 'babel-polyfill'
import http from 'http'
import https from 'https'
import fs from 'fs'
import path from 'path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import expressSession from 'express-session'
import expressJWT from 'express-jwt'
import initializeDb from './db'
import middleware from './middleware'
import api from './api'
import config from './config.json'
import util from './lib/util'

let app = express()

// 配置 HTTPS（如果证书文件存在）
const USE_HTTPS = process.env.USE_HTTPS === 'true' || false
const HTTPS_PORT = process.env.HTTPS_PORT || 8443
const HTTP_PORT = process.env.HTTP_PORT || 8080

let server
if (USE_HTTPS) {
	try {
		const sslOptions = {
			key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
			cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'))
		}
		server = https.createServer(sslOptions, app)
		console.log('✅ HTTPS 模式已启用')
	} catch (err) {
		console.warn('⚠️ SSL 证书加载失败，回退到 HTTP 模式')
		console.warn('错误信息:', err.message)
		server = http.createServer(app)
	}
} else {
	server = http.createServer(app)
}

app.server = server

// app.use(morgan('dev'))

app.use(cors({
	exposedHeaders: config.corsHeaders
}))

app.use(bodyParser.json({
	limit : config.bodyLimit
}))

app.use(expressSession({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true
}))

app.use('/' + config.projectName, express.static(path.join(__dirname, 'views')))

app.use(expressJWT({
	secret: config.jwtSecret,
	algorithms: ["HS256"],
	credentialsRequired: true,
	getToken (req) {
		
		return util.isNothing(req.headers.token) ? null : req.headers.token
	},
	requestProperty: 'xiezn'
}).unless({
	path: [
		{
			url: /.*\/(login|register|upload|download|resetPass|autoSort|list|sendemail|notify)$/,
			methods: ['GET', 'POST']
		},
		{
			url: /.*\/(config|option|follow|sh|remind|cal|group|value|news|info|detail|forum)\/.*/,
			methods: ['GET', 'POST']
		}
	]
}))

app.use((err, req, res, next) => {

	if (err.name === 'UnauthorizedError') {
		res.status(200).json({
			code: 401,
			msg: '您的权限不够！'
		})
	}
})

initializeDb( db => {

	app.use(middleware({ config, db }))

	app.use('/' + config.projectName, api({ config, db }))

	// 获取本机局域网 IP 地址
	function getLocalIP() {
		const os = require('os')
		const interfaces = os.networkInterfaces()

		for (const name of Object.keys(interfaces)) {
			for (const iface of interfaces[name]) {
				// 跳过内部地址和非 IPv4 地址
				if (iface.family === 'IPv4' && !iface.internal) {
					return iface.address
				}
			}
		}

		return 'localhost'
	}

	// 启动服务器，监听所有网络接口，支持真机调试
	const port = USE_HTTPS ? HTTPS_PORT : HTTP_PORT
	const protocol = USE_HTTPS ? 'https' : 'http'
	const localIP = getLocalIP()

	app.server.listen(port, '0.0.0.0', () => {
		console.log('========================================')
		console.log('🚀 服务器启动成功！')
		console.log('========================================')
		console.log(`协议: ${protocol.toUpperCase()}`)
		console.log(`端口: ${port}`)
		console.log(`本地访问: ${protocol}://localhost:${port}`)
		console.log(`局域网访问: ${protocol}://${localIP}:${port}`)
		console.log('========================================')
		if (USE_HTTPS) {
			console.log('✅ HTTPS 已启用 - 适用于真机调试')
			console.log('⚠️  使用自签名证书，浏览器可能提示不安全（正常现象）')
		} else {
			console.log('ℹ️  HTTP 模式 - 仅适用于开发环境')
			console.log('💡 真机调试需要 HTTPS，请设置环境变量: USE_HTTPS=true')
		}
		console.log('========================================')
		console.log(`📱 微信小程序配置地址: ${protocol}://${localIP}:${port}/nodejsn73cv/`)
		console.log('========================================')
	})
})

export default app
