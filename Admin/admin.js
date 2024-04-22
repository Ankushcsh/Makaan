const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const propertyD = require('./models/property.js')
const agentM = require('./models/agent.js')
const adminM = require('./models/admin.js')
const catagoryM = require('./models/catagory.js')
const typeM = require('./models/types.js')
const clientM = require('./models/client.js')
var multer = require('multer')
const path = require('path')
var session = require('express-session')
var cookieParser = require('cookie-parser')
const { runInNewContext } = require("vm")


const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use('*/css', express.static('assets/css'));
app.use('*/js', express.static('assets/js'));
app.use('*/img', express.static('assets/img'));
app.use('*/fonts', express.static('assets/fonts'));
app.use(cookieParser())
app.use(session({ secret: "myhelloworld" }))

app.use("/images", express.static('uploads'));

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

app.use((req,res, next)=>{
res.locals.querystring = req.query 
return next();
})

var auth = (req, res, next) => {
    let userObject = adminM.findOne({ _id: req.session.adminid })
        .then((data) => {
            userObject = data
            if (userObject) {
                return next();
            } else {
                return res.redirect("/login");
            }
        })
};

app.get('/', auth, (req, res) => {
    res.render("index")
})
// selecting catagory and types of property
// adding property
app.get('/addprop', async (req, res) => {
    var Ptype, Pcatagory;
    await catagoryM.find().then((cat) => {
        Pcatagory = cat
    })
    await typeM.find().then((typ) => {
        Ptype = typ
    })
    agentM.find().then((data) => {
        res.render("add_properties", {
            sucess:
            {
                pcat: Pcatagory,
                ptyp: Ptype,
                adata: data

            }
        })
    })

})



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg")
    }
})
var upload = multer({ storage: storage });


app.get('/showprop', (req, res) => {
    propertyD.find().then((data) => {
        res.render("Show_properties", { sd: data })

    })
})
app.get('/viewprop/:id', (req, res) => {
    propertyD.find({ _id: req.params.id }).then((data) => {
        res.render("view_single_prop", { sd: data })

    })
})



//property update

app.get('/updateprop/:id', (req, res) => {
    propertyD.find({ _id: req.params.id }).then(async (data) => {
        var Ptype, Pcatagory;
        await catagoryM.find().then((cat) => {
            Pcatagory = cat
        })
        await typeM.find().then((typ) => {
            Ptype = typ
        })
        agentM.find().then((dat) => {
            res.render('update', {
                sdata:
                {
                    pcat: Pcatagory,
                    ptyp: Ptype,
                    adata: dat,
                    pdata: data

                }
            })
        })
        // res.render('update', { sdata: data })
    })
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg")
    }
})
var uploadpropertyimg = multer({ storage: storage });



app.post('/update/:sid', uploadpropertyimg.single('image'), (req, res) => {
    let propdetail = req.body;
    let finalpropdetail;
    if (!req.file) {
        finalpropdetail = { ...propdetail, image: req.body.cimg }
    }
    else {
        finalpropdetail = { ...propdetail, image: req.file.filename }
    }
    propertyD.findByIdAndUpdate({ _id: req.params.sid }, finalpropdetail).then(d => {
        res.redirect("/")
    })
})





app.get('/addagent', (req, res) => {
    res.render("add_seller")
})

//working
app.post("/addagentform", upload.single('img'), (req, res) => {
    let somedata = req.body
    let alldata = { ...somedata, img: req.file.filename }
    let sav = new agentM(alldata)

    sav.save()

    res.redirect('/')
})

app.get("/showagent", (req, res) => {
    agentM.find().then((data) => {
        res.render("show_seller", { sdata: data })

    })
})
app.get("/addcatagory", (req, res) => {
    res.render('catagories')
})
app.get("/addtype", (req, res) => {
    res.render('types')
})
//add catagory forms
app.post("/addcatagoryform", (req, res) => {
    // let somedata = req.body
    // let alldata ={...somedata, img:req.file.filename}
    let sav = new catagoryM(req.body)
    sav.save()
    res.redirect("/addcatagory")
})

//addTYpes
app.post("/addtypeform", (req, res) => {
    // let somedata = req.body
    // let alldata ={...somedata, img:req.file.filename}
    let sav = new typeM(req.body)
    sav.save()
    res.redirect('/')
})

//not working
app.post('/add_property', upload.single('image'), (req, res) => {
    let propdata = req.body
    let alldata = { ...propdata, image: req.file.filename }
    let savA = new propertyD(alldata)
    savA.save()
    res.redirect('/')
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg")
    }
})
var uploadagentimg = multer({ storage: storage });


app.get('/updateagent/:id', (req, res) => {
    agentM.find({ _id: req.params.id }).then((data) => {
        res.render('update_agent', { sdata: data })
    })
})
app.post('/updateagentdata/:sid', uploadagentimg.single('img'), (req, res, next) => {
    let agentdetail = req.body;
    let finaldetail;
    if (!req.file) {
        finaldetail = { ...agentdetail, img: req.body.cimg }
    }
    else {
        finaldetail = { ...agentdetail, img: req.file.filename }
    }
    agentM.findByIdAndUpdate({ _id: req.params.sid }, finaldetail).then(d => {
        res.redirect('/')
    })
})


//    client form or Testimonials
app.get("/clientform", (req, res) => {
    res.render('add_client_data')
})
app.post("/addclientform", upload.single('cimage'), (req, res) => {
    let propdata = req.body
    let alldata = { ...propdata, cimage: req.file.filename }
    let savC = new clientM(alldata)
    savC.save()
    res.redirect('/')
})


/////////// LOGIN VICE VERSA


app.get('/login', (req, res) => {
    res.render('login')
})
app.post("/loginform", (req, res) => {
    adminM.findOne({ email: req.body.email, password: req.body.password }).then((data) => {
       
        if (data !== null) {
            req.session.adminid = data._id
            console.log(req.session.adminid)
            res.redirect("/")

        } else {
            res.redirect("/login?msg=invalid")
        }
    })
})



app.get("/adminsignup",auth, (req, res) => {
    res.render('add_admin')
})
app.post("/addadmin", (req, res) => {
    let savC = new adminM(req.body)
    savC.save()
    res.redirect('/')

})
app.get("/logout",auth, (req, res) => {
   req.session.destroy()
   res.redirect('/')
})



//"/adminsignup"

app.listen(4000)