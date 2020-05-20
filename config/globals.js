/**
 * Define Global Variables Here
 * global._ = require("lodash")
 */
global.ClientId = "**************"
global.redirect_uri = "http://localhost:3000/User/createToken"
global.signUpUrl =
    "https://kingsmarketplace.auth.eu-west-2.amazoncognito.com/signup"
global.loginUrl =
    "https://kingsmarketplace.auth.eu-west-2.amazoncognito.com/login"
global.getTokenUrl =
    "https://kingsmarketplace.auth.eu-west-2.amazoncognito.com/oauth2/token"
global.userInfoUrl =
    "https://kingsmarketplace.auth.eu-west-2.amazoncognito.com/oauth2/userInfo"
global.logoutUrl =
    "https://kingsmarketplace.auth.eu-west-2.amazoncognito.com/logout"
global.reDirectUrl = "http://localhost:8080/#/authorize?encodeText="
global.mongoose = require("mongoose")
global.ObjectId = mongoose.Types.ObjectId
global.uiAvatarsUrl = process.env.uiAvatarsUrl || env.uiAvatarsUrl
global.base64 = require("base-64")

global.jwtDecode = require('jwt-decode')
