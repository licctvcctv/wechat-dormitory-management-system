import http from 'http'
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
app.server = http.createServer(app)

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

	// 启动服务器，监听所有网络接口，支持真机调试
app.server.listen(8080, '0.0.0.0', () => {
  console.log('服务器已启动在 http://0.0.0.0:8080');
  console.log('可以通过 http://10.225.121.5:8080 访问（真机调试）');
})
})

export default app
