const multer = require("multer")
// const multerStorage = multer.diskStorage({
//     // destination: function (req, file, cb) {
//     //     // console.log(file,"?????????///////////////////");
//     //   cb(null, "./public/images/product-images");
//     // },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '-' + file.originalname)
//     }
//   })

//   // const uploadMultiple = multer({ storage: multerStorage }).fields([{ name: 'Image1', maxCount: 1 },{name:'Image2',maxCount:1},{name:'Image3',maxCount:1},{name:'Image4',maxCount:1}])




// const storage = multer.diskStorage({
//   filename: function (request, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname)
//   },
// })
const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).fields([{ name: 'Image1', maxCount: 1 },{name:'Image2',maxCount:1},{name:'Image3',maxCount:1},{name:'Image4',maxCount:1}])
const upload1 = multer({ storage: storage }).single('banner1')
const upload2 = multer({ storage: storage }).single('banner2')
const upload3 = multer({ storage: storage }).single('banner3')



  module.exports={upload,upload1,upload2,upload3}