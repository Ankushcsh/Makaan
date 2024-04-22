
const express = require("express")


const app = express()

const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const studentM = require("./models/students")
const propertyModel = require("./models/property")
const typeM = require("./models/types")
const catagoryM = require("./models/catagory")
const clientM = require("./models/clients")
const userM = require("./models/users")
const agentM = require("./models/agents")
const reactBlogModel = require("./models/blogsR")

var multer = require('multer')
var cors = require('cors')
var session = require('express-session')
var cookieParser = require('cookie-parser')
const nodemailer = require("nodemailer");
const agentModel = require("./models/agents")
const reactSignup = require("./models/reactsignup")

app.use(cors())
app.use(cookieParser())
app.use(session({ secret: "helloworld" }))


mongoose.connect("mongodb+srv://admin:admin@cluster0.08lzzzh.mongodb.net/makaan");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));





app.use(express.static('public'))
app.use("/image", express.static('frontuploads'))
app.use("/image", express.static('reactimg'))
app.set('view engine', 'ejs')
app.set("views", "./views")



app.use(function (req, res, next) {
    res.locals.userid = req.session.userid;
    res.locals.queryString = req.query
    res.locals.temp_fp=req.session.tempEmail
    res.locals.otp = req.session.otp
    res.locals.tempUID=req.session.tempUserId

    next();
});



// get types and catagory function
async function get_catagories() {
    let cname;
    await catagoryM.find().then((cn) => {
        cname = cn

    })
    return cname
}

async function get_types() {
    let property_type;
    await typeM.find().then((ty) => {
        property_type = ty

    })
    return property_type
}



//index

app.get('/', async (req, res) => {
    let cname;
    let finaldata = [];
    let agentdata;
    let proptype = await get_types();
    let propcatagory = await get_catagories();
    await propertyModel.find().then(async (data) => {
        for (let m of data) {
            await catagoryM.findOne({ _id: m.catagory }).then((cn) => {
                cname = cn.cat
                finaldata.push(cname)
            })
           

        }


        await agentM.find().then((ag) => {
            agentdata = ag
            res.render("index", {
                sdata: data,
                catM: finaldata,
                adata: agentdata,
                p_typ: proptype,
                p_cat: propcatagory
            })

        })
    })
})

app.post('/search',(res,req)=>{
let search = req.body.key
console.log(search)
    // propertyModel.find({"name":{$regex:".*"+search+".*"}}).then(async(data)=>{
    //     console.log(data)
    // })
})


app.get('/contact', (req, res) => {
    res.render("contact")
})

app.get('/about', (req, res) => {
    res.render("about")
})

app.get('/property-agent', (req, res) => {
    res.render("property-agent")
})

app.get('/property-list', (req, res) => {
    res.render("property-list")
})
app.get('/property-type', (req, res) => {
    res.render("property-type")
})
app.get('/testimonial', async (req, res) => {
    let client
    await clientM.find().then((cli) => {
        client = cli
    })
    await propertyModel.find().then((data) => {
        res.render("testimonial", { sdata: data, cdata: client })
    })


})

app.get('/404', (req, res) => {
    res.render("404")
})

app.get('/testDb', (req, res) => {
    res.render("testDb")
})

app.post('/createStudent', (req, res) => {
    let savS = new studentM(req.body)
    savS.save()
    res.send('created')
    res.redirect('/testDb')
})

app.get('/viewdetail', (req, res) => {
    studentM.find().sort({ _id: -1 }).then((data) => {
        res.render("viewdetail", { sdata: data })
    })
})

app.get('/update/:id', (req, res) => {
    studentM.find({ _id: req.params.id }).then((data) => {
        res.render('updatedetail', { sdata: data })
    })
})

app.post('/updatedetail/:sid', (req, res) => {
    studentM.findByIdAndUpdate({ _id: req.params.sid }, req.body).then(d => {
        res.redirect('/viewdetail')
    })
})

//  app.delete('/delete:id',function(req,req){
// studentM.findByIdAndDelete({_id:req.params.id},req.body).then((data)=>{

// })
// window.location.href='/viewdetail'
// res.redirect(303,'/viewdetail')
//  })




//////////////LOGIN AND SHIIIII/////////////////////
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'frontuploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg")
    }
})
var upload = multer({ storage: storage });

// var auth = (req, res)=>{
//     req.session && req.session.userid === 
// }
const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
    auth: {
        user: 'makaan.rajinder@gmail.com',
        pass: 'tqvq qfwt khmc vbez',
    },
    secure: true,
});


app.get('/register', (req, res) => {
    res.render("registeration")
})



app.post("/registerform", upload.single('img'), (req, res) => {
    let somedata = req.body
    let alldata = { ...somedata, img: req.file.filename }
    let sav = new userM(alldata)
    sav.save()
        .then((data) => {

            req.session.userid = data._id
            const mailData = {
                from: 'makaan.rajinder@gmail.com',  // sender address
                to: req.body.email,   // list of receivers
                subject: 'Registration successfully at Makaan!',
                text: 'That was easy!',
                html: `<body style="font-family: Helvetica, sans-serif; -webkit-font
            smoothing: antialiased; font-size: 16px; line-height: 1.3; -ms-text-size-adjust: 
                               100%; -webkit-text-size-adjust: 100%; background-color: #f4f5f6; margin: 0; padding: 
                               0;"> <table role="presentation" border="0" cellpadding="0" cellspacing="0" 
                               class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table
                               rspace: 0pt; background-color: #f4f5f6; width: 100%;" width="100%" 
                               bgcolor="#f4f5f6"> <tr><td style="font-family: Helvetica, sans-serif; font-size: 
                               16px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: Helvetica, sans-serif; font
                               size: 16px; vertical-align: top; max-width: 600px; padding: 0; padding-top: 24px; 
                               width: 600px; margin: 0 auto;" width="600" valign="top">
              <div class="content" style="box-sizing: border-box; display: block; 
                               margin: 0 auto; max-width: 600px; padding: 0;">
    
                
                <span class="preheader" style="color: transparent; display: none; 
                               height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; 
                               visibility: hidden; width: 0;">This is preheader text. Some clients will show this 
                               text as a preview.</span>
                <table role="presentation" border="0" cellpadding="0" 
                               cellspacing="0" class="main" style="border-collapse: separate; mso-table-lspace: 
                               0pt; mso-table-rspace: 0pt; background: #ffffff; border: 1px solid #eaebed; border
                               radius: 16px; width: 100%;" width="100%">
    
                 
                  <tr>
                    <td class="wrapper" style="font-family: Helvetica, sans-serif; 
                               font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 24px;" 
                               valign="top">
                      <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                               font-weight: normal; margin: 0; margin-bottom: 16px;">Hi ${req.body.username}
                        </p>
                      <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                               font-weight: normal; margin: 0; margin-bottom: 16px;">Sometimes you just want to 
                               send a simple HTML email with a simple design and clear call to action. This is it.
                       </p>
                      <table role="presentation" border="0" cellpadding="0" 
                               cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table
                               lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%; min-width: 
                               100%;" width="100%">
                        <tbody>
                          <tr>
                            <td align="left" style="font-family: Helvetica, sans
                               serif; font-size: 16px; vertical-align: top; padding-bottom: 16px;" valign="top">
                              <table role="presentation" border="0" cellpadding="0" 
                               cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table
                               rspace: 0pt; width: auto;">
                                <tbody>
                                  <tr>
                                    <td style="font-family: Helvetica, sans-serif; 
                               font-size: 16px; vertical-align: top; border-radius: 4px; text-align: center; 
                               background-color: #0867ec;" valign="top" align="center" bgcolor="#0867ec"> <a 
                               href="http://htmlemail.io" target="_blank" style="border: solid 2px #0867ec; border
                               radius: 4px; box-sizing: border-box; cursor: pointer; display: inline-block; font
                               size: 16px; font-weight: bold; margin: 0; padding: 12px 24px; text-decoration: none; 
                               text-transform: capitalize; background-color: #0867ec; border-color: #0867ec; color: 
                               #ffffff;">Call To Action</a> </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                        </table>
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                                 font-weight: normal; margin: 0; margin-bottom: 16px;">This is a really simple email 
                                 template. It's sole purpose is to get the recipient to click the button with no 
                                 distractions.</p>
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                                 font-weight: normal; margin: 0; margin-bottom: 16px;">Good luck! Hope it works.</p>
                      </td>
                    </tr>
      
                   
                    </table>
      
                 
                  <div class="footer" style="clear: both; padding-top: 24px; text
                                 align: center; width: 100%;">
                    <table role="presentation" border="0" cellpadding="0" 
                                 cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table
                                 rspace: 0pt; width: 100%;" width="100%">
                      <tr>
                        <td class="content-block" style="font-family: Helvetica, sans
                                 serif; vertical-align: top; color: #9a9ea6; font-size: 16px; text-align: center;" 
                                 valign="top" align="center">
                          <span class="apple-link" style="color: #9a9ea6; font-size: 
                                 16px; text-align: center;">Company Inc, 7-11 Commercial Ct, Belfast BT1 2NB</span>
                          <br> Don't like these emails? <a 
                                 href="http://htmlemail.io/blog" style="text-decoration: underline; color: #9a9ea6; 
                                 font-size: 16px; text-align: center;">Unsubscribe</a>.
                        </td>
                      </tr>
                      <tr>
                        <td class="content-block powered-by" style="font-family: 
                                 Helvetica, sans-serif; vertical-align: top; color: #9a9ea6; font-size: 16px; text
                                 align: center;" valign="top" align="center">
                          Powered by <a href="http://htmlemail.io" style="color: 
                                 #9a9ea6; font-size: 16px; text-align: center; text-decoration: 
                                 none;">HTMLemail.io</a>
                        </td>
                      </tr>
                    </table>
                  </div>
      
                </div>
              </td>
              <td style="font-family: Helvetica, sans-serif; font-size: 16px; 
              vertical-align: top;" valign="top">&nbsp;</td>
            </tr>
          </table>
        </body>`,
            };
            transporter.sendMail(mailData, (error, info) => {
                if (error) {
                    return console.log(error)
                }
                //res.status(200).send({msg:"sent successfully", mid: info})

                res.redirect("/account")
            })

        })

})








app.get('/login', (req, res) => {

    res.render("login")
})

app.post('/loginform', async(req, res) => {

    
   
  await agentModel.findOne({ email:req.body.email, password: req.body.password}).then((adata) => {
   



       
  userM.findOne({ email:req.body.email, password: req.body.password}).then((data) => {

        if (data!= null || adata!= null ) {
            req.session.userid = data ? data._id : adata._id;
            res.redirect('/account')
        } else {
            res.redirect('/login?msg=invaliddetails')
        }


    })

})
})


    
    app.get('/account', async(req, res) => {

        await userM.findOne({ _id: req.session.userid }).then((data) => {
         agentModel.findOne({ _id: req.session.userid}).then((adata) => {
         

            if (data!=null || adata!=null ){
                res.render("account", { userdata: data?data:adata })
               
            }
            else {
                
                res.redirect('/login?mgs=account')
            }


        })

    })


})
app.get('/logout', (req, res) => {

    req.session.destroy()
    res.redirect("/login")
})

app.get('/resetpass', (req, res) => {
   req.session.destroy()
    res.render('FP_verifyEmail.ejs')
})

app.post('/resetpass', (req, res) => {
     
    userM.findOne({ email:req.body.email }).then((data) => {

        if(data==null){
            res.redirect('/resetpass?msg=invalidEmail')
          
        }
        else{

           let otp = Math.floor(100000 + Math.random() * 900000);
           req.session.tempEmail=data.email
           req.session.tempUID=data._id
           req.session.otp=otp 
           console.log(otp)
           const mailData = {
            from: 'makaan.rajinder@gmail.com',  // sender address
            to: data.email,   // list of receivers
            subject: 'Registration successfully at Makaan!',
            text: 'That was easy!',
            html: `<body style="font-family: Helvetica, sans-serif; -webkit-font
        smoothing: antialiased; font-size: 16px; line-height: 1.3; -ms-text-size-adjust: 
                           100%; -webkit-text-size-adjust: 100%; background-color: #f4f5f6; margin: 0; padding: 
                           0;"> <table role="presentation" border="0" cellpadding="0" cellspacing="0" 
                           class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table
                           rspace: 0pt; background-color: #f4f5f6; width: 100%;" width="100%" 
                           bgcolor="#f4f5f6"> <tr><td style="font-family: Helvetica, sans-serif; font-size: 
                           16px; vertical-align: top;" valign="top">&nbsp;</td>
        <td class="container" style="font-family: Helvetica, sans-serif; font
                           size: 16px; vertical-align: top; max-width: 600px; padding: 0; padding-top: 24px; 
                           width: 600px; margin: 0 auto;" width="600" valign="top">
          <div class="content" style="box-sizing: border-box; display: block; 
                           margin: 0 auto; max-width: 600px; padding: 0;">

            
            <span class="preheader" style="color: transparent; display: none; 
                           height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; 
                           visibility: hidden; width: 0;">This is preheader text. Some clients will show this 
                           text as a preview.</span>
            <table role="presentation" border="0" cellpadding="0" 
                           cellspacing="0" class="main" style="border-collapse: separate; mso-table-lspace: 
                           0pt; mso-table-rspace: 0pt; background: #ffffff; border: 1px solid #eaebed; border
                           radius: 16px; width: 100%;" width="100%">

             
              <tr>
                <td class="wrapper" style="font-family: Helvetica, sans-serif; 
                           font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 24px;" 
                           valign="top">
                  <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                           font-weight: normal; margin: 0; margin-bottom: 16px;">Hi ${data.username}
                    </p>
                  <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                           font-weight: normal; margin: 0; margin-bottom: 16px;">here is your otp.
                   </p>
                  <table role="presentation" border="0" cellpadding="0" 
                           cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table
                           lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%; min-width: 
                           100%;" width="100%">
                    <tbody>
                      <tr>
                        <td align="left" style="font-family: Helvetica, sans
                           serif; font-size: 16px; vertical-align: top; padding-bottom: 16px;" valign="top">
                          <table role="presentation" border="0" cellpadding="0" 
                           cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table
                           rspace: 0pt; width: auto;">
                            <tbody>
                              <tr>
                                <td style="font-family: Helvetica, sans-serif; 
                           font-size: 16px; vertical-align: top; border-radius: 4px; text-align: center; 
                           background-color: #0867ec;" valign="top" align="center" bgcolor="#0867ec"> <p 
                        style="border: solid 2px #0867ec; border
                           radius: 4px; box-sizing: border-box; cursor: pointer; display: inline-block; font
                           size: 16px; font-weight: bold; margin: 0; padding: 12px 24px; text-decoration: none; 
                           text-transform: capitalize; background-color: #0867ec; border-color: #0867ec; color: 
                           #ffffff;">${otp}</p> </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                    </table>
                    <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                             font-weight: normal; margin: 0; margin-bottom: 16px;">Do not Share with anyone</p>
                    <p style="font-family: Helvetica, sans-serif; font-size: 16px; 
                             font-weight: normal; margin: 0; margin-bottom: 16px;">Good luck! Hope it works.</p>
                  </td>
                </tr>
  
               
                </table>
  
             
              <div class="footer" style="clear: both; padding-top: 24px; text
                             align: center; width: 100%;">
                <table role="presentation" border="0" cellpadding="0" 
                             cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table
                             rspace: 0pt; width: 100%;" width="100%">
                  <tr>
                    <td class="content-block" style="font-family: Helvetica, sans
                             serif; vertical-align: top; color: #9a9ea6; font-size: 16px; text-align: center;" 
                             valign="top" align="center">
                      <span class="apple-link" style="color: #9a9ea6; font-size: 
                             16px; text-align: center;">Company Inc, 7-11 Commercial Ct, Belfast BT1 2NB</span>
                      <br> Don't like these emails? <a 
                             href="http://htmlemail.io/blog" style="text-decoration: underline; color: #9a9ea6; 
                             font-size: 16px; text-align: center;">Unsubscribe</a>.
                    </td>
                  </tr>
                  <tr>
                    <td class="content-block powered-by" style="font-family: 
                             Helvetica, sans-serif; vertical-align: top; color: #9a9ea6; font-size: 16px; text
                             align: center;" valign="top" align="center">
                      Powered by <a href="http://htmlemail.io" style="color: 
                             #9a9ea6; font-size: 16px; text-align: center; text-decoration: 
                             none;">HTMLemail.io</a>
                    </td>
                  </tr>
                </table>
              </div>
  
            </div>
          </td>
          <td style="font-family: Helvetica, sans-serif; font-size: 16px; 
          vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </table>
    </body>`,
        };
        transporter.sendMail(mailData, (error, info) => {
            if (error) {
                return console.log(error)
            }
            //res.status(200).send({msg:"sent successfully", mid: info})

            res.redirect("/resetpass")
        })
           

        }
       
    })


});

app.post('/checkotp',(req,res)=>{
if(req.body.otp==req.session.otp){
res.redirect('/changepassword')
}
else{
    res.redirect('/resetpass?msg=invalidotp')  
}

})
app.get('/changepassword',(req,res)=>{

    res.render('reset_password')
})

app.post("/changepassword",(req,res)=>{

   userM.findByIdAndUpdate({_id:req.session.tempUID},{password:req.body.password}).then((data)=>{
    if(data!=null){
        req.session.destroy()
        res.redirect('/login')
    }else{
        res.redirect('/changepassword?msg=fail')
    }
   })
})


//after searching

app.get('/searched',(req,res)=>{
    let finaldata = [];
    propertyModel.find().then(async (data) => {
        for (let m of data) {
            await catagoryM.findOne({ _id: m.catagory }).then((cn) => {
                cname = cn.cat
                finaldata.push(cname)
            })
           

        }

    res.render('get_properties',{sdata: data, catM:finaldata})
})
})



app.get('/singleprop/:sid',(req,res)=>{
    propertyModel.find({ _id: req.params.sid }).then((data) => {
        res.render("single_prop", { k: data })

    })
})



app.get("/forreact",(req,res)=>{

    userM.find().then((data)=>{
      res.json(data)
    })
 })


 var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'reactimg')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg")
    }
})
var uploads = multer({ storage: storage });
//, uploads.single('img')
// let somedata = req.body
// let alldata = { ...somedata, img: req.file.filename }

 app.post("/submitreactform",(req,res)=>{
    console.log(req.file)
    console.log(req.body)
   
   
    let sav = new reactSignup(req.body)
    sav.save()

 })

 app.get("/getusers",(req,res)=>{
    reactSignup.find().then((data)=>{
        console.log(data)
        res.json(data)
    })
   
 })
 app.post('/login',(req,res)=>{
    console.log(req.body)
    
    reactSignup.findOne({email:req.body.email, password:req.body.password})
    .then((data)=>{
        if(data!==null){
            // console.log(data)
            res.json(data)
        }

        else{
            // console.log(data)
          //  res.status(500)
            res.json(data)
           
        }

    })
 })



//  app.get("/reactaccount/:id", (req, res) => {
//     const id = req.params.id;
//     console.log(`Fetching data for ID: ${id}`);

//     // Validate the ID format
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         console.log("Invalid ID format");
//         return res.status(400).send("Invalid ID format");
//     }

//     reactSignup.findOne({ _id: id }).then((data) => {
//         if (data == null) {
//             console.log("Document not found for ID:", id);
//             return res.status(404).send("Document not found");
//         } else {
//             console.log("Document found:", data);
//             res.json(data);
//         }
//     }).catch((error) => {
//         console.error("Error fetching document:", error);
//         res.status(500).send("Internal Server Error");
//     });
// });


 app.get("/reactaccount/:id",(req,res)=>{
    reactSignup.findOne({ _id: req.params.id }).then((data) => {
        if(data==null){
            console.log("null bruo")
        }
        else{
            res.json(data)
          
        }
      

    })

 })
 app.post("/getblog",(req,res)=>{
    console.log(req.body)
    
   let sav = new reactBlogModel(req.body)
    sav.save()
 })







// app.get("/test", (req, res) => {
//     res.send("hii res")
// })



app.listen(5555, console.log("server running.."))


