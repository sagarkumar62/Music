import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    artist:{
        required:true,
        type:String,
    },
    poster:{
        type:String,
        default:"https://100pilabs.com/images/default_music_player_icon_512.png"
    },
    audio:{
        type:String,
        required:true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

const songModel = mongoose.model("song", songSchema);


export default songModel;   