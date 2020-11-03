//dotenv setup
if(process.env.NODE_ENV !== "production"){
	require('dotenv').config();
}


//required dependencies
const express 						= require('express');
const path 							= require('path');
const mongoose 						= require('mongoose');
const ejsMate 						= require('ejs-mate');
const session 						= require('express-session');
const flash 						= require('connect-flash');
const ExpressError					= require('./utils/ExpressError');
const methodOverride 				= require('method-override');
const passport 						= require('passport');
const LocalStrategy					= require('passport-local');
const spacesRoutes					= require('./routes/spaces');	
const reviewsRoutes 				= require('./routes/reviews');
const userRoutes					= require('./routes/users');
const dburl							= process.env.DB_URL;
const User							= require('./models/user');
const mongoSanitize					= require('express-mongo-sanitize');
const helmet 						= require('helmet');
const MongoDBStore 					= require("connect-mongo")(session);

/*================
basic setups
=================*/

//database conne ction
	//local db address: 'mongodb://localhost:27017/bc2'
mongoose.connect(dburl, {
	useNewUrlParser 	:true,
	useCreateIndex  	:true,
	useUnifiedTopology	:true,
	useFindAndModify	:false
	
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
	console.log("Database connected");
});

const app = express();

//ejs mate setup
app.engine('ejs', ejsMate);

//ejs setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

//body parser setup
app.use(express.urlencoded({extended: true}));

//method override setup
app.use(methodOverride('_method'));

//public directory setup
app.use(express.static(path.join(__dirname,'public')));

//express mongo sanitize
app.use(mongoSanitize());

//session setup
const secret = process.env.SECRET || 'rusty';

const store = new MongoDBStore({
    url: dburl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})



//session setup
const sesionConfig={
	store,
	name: 'bloomcamp-cookies',
	secret,
	resave: false,
	saveUninitialized: true,
	cookies: {
		httpOnly: true,
		//secure: true,
		expires	: Date.now() + 1000*60*60*24*7,
		maxAge	: 1000*60*60*24*7
	}
}
app.use(session(sesionConfig ));

//flash module
app.use(flash());
//helmet config
app.use(helmet());


//helmet content security policy setup
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "http://res.cloudinary.com/dsqqwjw7p/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
				"https://i.imgur.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//flash middleware setup
app.use((req,res,next)=>{
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

/*===========
router setup
===========*/

//landing route setup
app.get('/', (req, res)=>{
	res.render('home');
});

//space route setup
app.use('/spaces', spacesRoutes);

//review route setup
app.use('/spaces/:id/reviews', reviewsRoutes);

//register form route
app.use('/', userRoutes);



// basic 404 setup
app.all('*', (req, res, next)=>{
	next(new ExpressError('Page not found!', 404));
});

//error catch setup
app.use((err, req, res, next)=>{
	const {statusCode = 500, message = 'Something Went Wrong'} = err;
	if(!err.message){
		err.message="Something Went Wrong!";
	}
	res.status(statusCode).render('error', {err});
});

//app lauch setup
app.listen(3000, ()=>{
	console.log('Server Is ON!');
});