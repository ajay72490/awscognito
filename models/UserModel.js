import md5 from "md5"
import User from "../mongooseModel/User"
import { callbackify } from "util"
import RelationManagerModel from "./RelationManagerModel"

var isTesting = false
var plainText
var encodeText
export default {
    /**
     * This function return AWS login URL
     * @param {data} redirect_uri
     */

    awsUrl: (data, callback) => {
        console.log("awsUrl awsUrl", data)
        request(
            {
                uri: loginUrl,
                path: "",
                method: "GET",
                qs: {
                    client_id: ClientId,
                    redirect_uri,
                    response_type: "code"
                }
            },
            function (err, response, body) {
                console.log(
                    "response.request.href",
                    response.request.href,
                    ClientId,
                    redirect_uri
                )
                callback(err, response.request.href)
            }
        )
    },

    /**
     *1. This function generate accessToken, idToken and refreshToken
     *2. return userInfo based on accessToken
     *3. Save userData (email,accessToken,idToken,refreshToken and verified )fields on dataBase
     * @param {data} code after successful login aws redirect to the createToken function with code which is present
     * in the query parameter, redirect_uri(after function execution it will redirect to redirect_uri)
     */
    createToken: (data, callback) => {
        console.log("createToken-------", data, ClientId, redirect_uri)
        var tokenData = {}
        if (!isTesting) {
            request(
                {
                    uri: getTokenUrl,
                    path: "",
                    method: "POST",
                    form: {
                        grant_type: "authorization_code",
                        client_id: ClientId,
                        code: data.code,
                        redirect_uri: redirect_uri
                    }
                },
                function (err, response, body) {
                    console.log("cretae Token Output----------", body)
                    var errorData = JSON.parse(body)
                    if (err) {
                        callback(err)
                    } else if (errorData.error) {
                        callback(errorData.error)
                    } else {
                        var userData = JSON.parse(body)
                        console.log("userData userData", userData)
                        var data = {}
                        data.token = userData.access_token
                        tokenData.idToken = userData.id_token
                        tokenData.refreshToken = userData.refresh_token
                        tokenData.accessToken = userData.access_token
                        tokenData.lastLoggedInTime = new Date()
                        UserModel.getUserInfo(data, tokenData, callback)
                    }
                }
            )
        }
    },

    getUserInfo: (data, tokenData, callback) => {
        console.log("getUserInfo", data, tokenData)
        request(
            {
                uri: userInfoUrl,
                path: "",
                method: "GET",
                headers: {
                    Authorization: "Bearer " + data.token
                }
            },
            function (err, response, body) {
                console.log("getUserInfo out put", body)
                var errorData = JSON.parse(body)
                if (err) {
                    callback(err)
                } else if (errorData.error) {
                    callback(errorData.error)
                } else {
                    var data = JSON.parse(body)
                    UserModel.saveUser(data, tokenData, callback)
                }
            }
        )
    },
    saveUser: (user, tokenData, callback) => {
        console.log("saveUser saveUser", user, tokenData)
        tokenData.verified = true
        tokenData.email = user.email
        // if (user && !user.name) {
        //     let avtarUrl, splitName
        //     splitName = user.email.split("@")
        //     avtarUrl = `https://ui-avatars.com/api/?name=${splitName[0]}&&size=512`
        //     tokenData.avtarName = avtarUrl
        //     tokenData.name = splitName[0]
        // }
        // tokenData.name = user.name
        tokenData.loggedInTime = new Date()
        tokenData.userName = user.username
        tokenData.cognitoId = user.sub
        async.waterfall(
            [
                (callback) => {
                    User.findOne({ email: user.email }).exec((err, data) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, data)
                        }
                    })
                },
                (userData, callback) => {
                    if (_.isEmpty(userData)) {
                        UserModel.userSave(tokenData, callback)
                    } else {
                        UserModel.updateUser(tokenData, callback)
                    }
                }
            ],
            (err, resultData) => {
                if (err) {
                    callback(err)
                } else {
                    plainText = tokenData.accessToken
                    encodeText = base64.encode(plainText)
                    callback.redirect(reDirectUrl + '' + encodeText)
                }
            }
        )
    },

    userSave: (saveUserData, callback) => {
        console.log("saveUserData saveUserData", saveUserData)
        let avtarUrl, splitName
        if (saveUserData && !saveUserData.name) {
            splitName = saveUserData.email.split("@")
            // saveUserData.avtarName = `${uiAvatarsUrl}${splitName[0]}&&size=512`
            saveUserData.name = splitName[0]
        }
        let userObj = new User(saveUserData)
        userObj.save((err, saveData) => {
            if (err) {
                callback(err)
            } else {
                RelationManagerModel.assignRelationManagerPerUser({ userId: saveData._id })
                WalletModel.createWalletsPerCurrency(saveData)
                callback(null, "User Save Successfully")
            }
        })
    },
    updateUser: (updateData, callback) => {
        console.log("updateData updateData", updateData)
        User.updateOne(
            {
                email: updateData.email
            },
            {
                $set: updateData
            },
            {
                new: true
            }
        ).exec((err, updatedUser) => {
            if (err) {
                callback(err)
            } else {
                callback(null, "Update User Successfully")
            }
        })
    },
    /**
     * This function logout user from AWS
     *  @param  {data} logout_uri(after logout it will redirect to logout_uri)
     */
    logout: (data, callback) => {
        request(
            {
                uri: logoutUrl,
                path: "",
                method: "GET",
                qs: {
                    client_id: ClientId,
                    logout_uri: data.url
                }
            },
            function (err, response, body) {
                callback(err, response.request.href)
            }
        )
    },
}