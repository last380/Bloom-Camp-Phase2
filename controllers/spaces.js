const Space = require('../models/space');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res)=>{
	const spaces = await Space.find({});
	res.render("spaces/index",{spaces});
}


module.exports.renderNewForm = (req, res)=>{
	res.render('spaces/new');
}

module.exports.createSpace = async(req, res)=>{
	const geoData = await geocoder.forwardGeocode({
        query: req.body.space.location,
        limit: 1
    }).send()
	const space = new Space(req.body.space);
	space.geometry = geoData.body.features[0].geometry;
	space.images = req.files.map(f=>({url: f.path, filename: f.filename}));
	space.author = req.user._id;
	await space.save();
	req.flash('success', 'Successfully added your space!');
	res.redirect(`/spaces/${space._id}`);
}

module.exports.showSpace = async(req, res)=>{
	const space = await Space.findById(req.params.id).populate({
		path:'reviews',
		populate:{
			path: 'author'
		}
	}).populate('author');
	if(!space){
		req.flash('error','Space is not available!');
		return res.redirect('/spaces');
	}
	res.render('spaces/show',{space});
}


module.exports.renderEditForm = async(req,res)=>{
	const {id} = req.params;
	const space = await Space.findById(id);
	if(!space){
		req.flash('error', "Cannot find that campground!");
		return res.redirect('/spaces');
	}
	res.render('spaces/edit', {space});
}

module.exports.updateSpace = async(req, res)=>{
	const {id} = req.params;
	console.log(req.body);
	const space = await Space.findByIdAndUpdate(id, {...req.body.space});
	const imgs = req.files.map(f=>({url: f.path, filename: f.filename}));
	space.images.push(...imgs);
	await space.save();
	if(req.body.deleteImages){
		for(let filename of req.body.deleteImages){
			await cloudinary.uploader.destroy(filename);
		}
	   await space.updateOne({$pull:{images: {filename: {$in: req.body.deleteImages}}}});
		console.log(space);
	}
	req.flash('success','Successfully updated your space!');
	res.redirect(`/spaces/${space._id}`);
}

module.exports.deleteSpace = async(req, res)=>{
	const {id} = req.params;
	await Space.findByIdAndDelete(id);
	req.flash('success','Successfully deleted your space!');
	res.redirect('/spaces');
}
















