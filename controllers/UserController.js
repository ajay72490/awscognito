const router = Router()

router.post("/awsUrl", (req, res) => {
    UserModel.awsUrl(req.body, res.callback)
})
router.get("/createToken", (req, res) => {
    UserModel.createToken(req.query, res)
})
router.post("/getUserInfo", (req, res) => {
    UserModel.getUserInfo(req.body, res.callback)
})
router.post("/saveUser", (req, res) => {
    UserModel.saveUser(req.body, res.callback)
})
router.get("/logout", (req, res) => {
    UserModel.logout(req.body, res.callback)
})
router.get("/getUserName", (req, res) => {
    UserModel.getUserName(req.query, res.callback)
})